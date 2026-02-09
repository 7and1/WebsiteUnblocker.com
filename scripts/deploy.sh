#!/usr/bin/env bash
#
# WebsiteUnblocker.com - Production Deployment Script
#
# Usage:
#   ./scripts/deploy.sh [environment]
#   ./scripts/deploy.sh staging
#   ./scripts/deploy.sh production
#
# Environment variables:
#   CLOUDFLARE_ENV - Override environment (staging|production)
#   SKIP_TESTS     - Skip running tests (true|false)
#   SKIP_BACKUP    - Skip backup creation (true|false)
#   DRY_RUN        - Show what would be done without executing (true|false)
#   SKIP_AUDIT     - Skip post-deployment audit (true|false)
#   AUDIT_TIMEOUT  - Post-deploy audit timeout in seconds (default: 20)
#   FAIL_ON_AUDIT  - Fail deployment if audit fails (true|false, default: true)
#

set -euo pipefail

# Avoid NO_COLOR/FORCE_COLOR conflict warnings in child Node.js processes
unset NO_COLOR || true

# Enable debug mode if DEBUG=true
[[ "${DEBUG:-false}" == "true" ]] && set -x

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "${BLUE}==>${NC} $*"; }

# Configuration
ENVIRONMENT="${CLOUDFLARE_ENV:-${1:-production}}"
PROJECT_NAME="websiteunblocker"
BACKUP_DIR="$PROJECT_ROOT/.deploy-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DRY_RUN="${DRY_RUN:-false}"
DEPLOYMENT_START_TIME=$(date +%s)

# Error tracking
ERRORS=()
WARNINGS=()

# Trap for cleanup
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed with exit code: $exit_code"
        if [[ ${#ERRORS[@]} -gt 0 ]]; then
            log_error "Errors encountered:"
            for err in "${ERRORS[@]}"; do
                echo -e "  ${RED}-${NC} $err"
            done
        fi
    fi
    # Calculate deployment duration
    local end_time=$(date +%s)
    local duration=$((end_time - DEPLOYMENT_START_TIME))
    log_info "Total deployment time: ${duration}s"
}
trap cleanup EXIT

# Add error to tracking
add_error() {
    ERRORS+=("$1")
}

# Add warning to tracking
add_warning() {
    WARNINGS+=("$1")
}

# Validate environment
validate_environment() {
    local env="$1"
    if [[ "$env" != "staging" && "$env" != "production" ]]; then
        log_error "Invalid environment: $env"
        log_info "Valid environments: staging, production"
        exit 1
    fi
    log_success "Environment validated: $env"
}

# Pre-deployment checklist
pre_deployment_checklist() {
    log_step "Running pre-deployment checklist..."

    local checklist_passed=true

    # Check 1: Git status - ensure no uncommitted changes
    if [[ -n "$(git -C "$PROJECT_ROOT" status --porcelain 2>/dev/null)" ]]; then
        log_warning "Uncommitted changes detected in repository"
        add_warning "Uncommitted changes may not be deployed"
    fi

    # Check 2: Verify current branch
    local current_branch
    current_branch=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    if [[ "$ENVIRONMENT" == "production" && "$current_branch" != "main" ]]; then
        log_warning "Deploying to production from non-main branch: $current_branch"
        add_warning "Production deployment from branch: $current_branch"
    fi
    log_info "Current branch: $current_branch"

    # Check 3: Verify required files exist
    local required_files=(
        "wrangler.toml"
        "package.json"
        "next.config.ts"
    )
    for file in "${required_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            log_error "Required file missing: $file"
            add_error "Missing required file: $file"
            checklist_passed=false
        fi
    done

    # Check 4: Verify .dev.vars exists for secrets
    if [[ ! -f "$PROJECT_ROOT/.dev.vars" ]]; then
        log_warning ".dev.vars file not found (may be using remote secrets)"
    fi

    # Check 5: Check disk space (at least 1GB free)
    local free_space
    free_space=$(df -k "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $free_space -lt 1048576 ]]; then
        log_warning "Low disk space: $(( free_space / 1024 ))MB free"
        add_warning "Low disk space may cause build failures"
    fi

    # Check 6: Verify package-lock is in sync
    if [[ -f "$PROJECT_ROOT/pnpm-lock.yaml" ]]; then
        log_info "Lock file: pnpm-lock.yaml present"
    else
        log_warning "No pnpm-lock.yaml found - dependencies may not be reproducible"
    fi

    if [[ "$checklist_passed" == "false" ]]; then
        log_error "Pre-deployment checklist failed"
        exit 1
    fi

    log_success "Pre-deployment checklist passed"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    local missing=()
    local required_commands=(
        "node"
        "pnpm"
        "wrangler"
    )

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing[*]}"
        log_info "Install missing dependencies:"
        log_info "  npm install -g pnpm wrangler"
        exit 1
    fi

    # Check Node.js version
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 18 ]]; then
        log_error "Node.js 18+ required, found: $(node -v)"
        exit 1
    fi

    # Check wrangler authentication
    if ! wrangler whoami &> /dev/null; then
        log_error "Wrangler not authenticated. Run: wrangler login"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Validate Cloudflare resources
validate_cloudflare_resources() {
    log_step "Validating Cloudflare resources..."

    local env="$1"
    local suffix=""

    if [[ "$env" != "production" ]]; then
        suffix="-$env"
    fi

    local d1_name="$PROJECT_NAME-db$suffix"
    local r2_name="$PROJECT_NAME-media$suffix"

    # Check D1 database exists
    if ! wrangler d1 list --json 2>/dev/null | jq -e ".[] | select(.name == \"$d1_name\")" &> /dev/null; then
        log_warning "D1 database '$d1_name' not found"
        log_info "Create it with: wrangler d1 create $d1_name"
    fi

    # Check R2 bucket exists
    if ! wrangler r2 bucket info "$r2_name" > /dev/null 2>&1; then
        log_warning "R2 bucket '$r2_name' not found"
        log_info "Create it with: wrangler r2 bucket create $r2_name"
    fi

    log_success "Cloudflare resources validated"
}

# Run tests
run_tests() {
    if [[ "${SKIP_TESTS:-false}" == "true" ]]; then
        log_warning "Skipping tests (SKIP_TESTS=true)"
        return 0
    fi

    log_step "Running tests..."

    cd "$PROJECT_ROOT"

    # Run unit tests
    if pnpm run test:unit -- --run 2>&1; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi

    log_success "All tests passed"
}

# Create backup
create_backup() {
    if [[ "${SKIP_BACKUP:-false}" == "true" ]]; then
        log_warning "Skipping backup (SKIP_BACKUP=true)"
        return 0
    fi

    log_step "Creating deployment backup..."

    mkdir -p "$BACKUP_DIR"

    local backup_file="$BACKUP_DIR/backup_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"

    # Backup critical files
    tar -czf "$backup_file" \
        .wrangler/ \
        wrangler.toml \
        .dev.vars 2>/dev/null || true

    log_success "Backup created: $backup_file"

    # Keep only last 10 backups
    ls -t "$BACKUP_DIR"/backup_${ENVIRONMENT}_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
}

# Deploy database migrations
deploy_database() {
    log_step "Deploying database migrations..."

    cd "$PROJECT_ROOT"

    # Run migrations with proper environment
    if [[ "$ENVIRONMENT" == "production" ]]; then
        NODE_ENV=production \
            PAYLOAD_SECRET=ignore \
            pnpm payload migrate
    else
        CLOUDFLARE_ENV="$ENVIRONMENT" \
            NODE_ENV=production \
            PAYLOAD_SECRET=ignore \
            pnpm payload migrate
    fi

    # Optimize database
    if [[ "$ENVIRONMENT" == "production" ]]; then
        wrangler d1 execute D1 \
            --command "PRAGMA optimize" \
            --remote
    else
        wrangler d1 execute D1 \
            --command "PRAGMA optimize" \
            --env="$ENVIRONMENT" \
            --remote
    fi

    log_success "Database migrations deployed"
}

# Build application
build_application() {
    log_step "Building application..."

    cd "$PROJECT_ROOT"

    log_info "Cleaning previous build artifacts..."
    node -e "const fs=require('node:fs'); for (const p of ['.next','.open-next']) { fs.rmSync(p,{recursive:true,force:true,maxRetries:10,retryDelay:200}); }"

    # Generate required app types first (Payload)
    # Cloudflare runtime types are optional for deployment and can conflict
    # with manually maintained cloudflare-env.d.ts.
    log_info "Generating Payload types..."
    pnpm run generate:types:payload

    # Optional Cloudflare type regeneration (disabled by default)
    if [[ "${GENERATE_CLOUDFLARE_TYPES:-false}" == "true" ]]; then
        log_info "Generating Cloudflare runtime types (optional)..."
        pnpm run generate:types:cloudflare
    else
        log_info "Skipping Cloudflare runtime type generation during deploy"
    fi

    # Build with OpenNext
    log_info "Building with OpenNext..."
    if [[ "$ENVIRONMENT" == "production" ]]; then
        env -u CLOUDFLARE_ENV NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" \
            pnpm exec opennextjs-cloudflare build
    else
        CLOUDFLARE_ENV="$ENVIRONMENT" \
            NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" \
            pnpm exec opennextjs-cloudflare build
    fi

    log_success "Application built successfully"
}

# Deploy to Cloudflare
deploy_application() {
    log_step "Deploying to Cloudflare Pages..."

    cd "$PROJECT_ROOT"

    if [[ "$ENVIRONMENT" == "production" ]]; then
        env -u CLOUDFLARE_ENV pnpm exec opennextjs-cloudflare deploy
    else
        CLOUDFLARE_ENV="$ENVIRONMENT" \
            pnpm exec opennextjs-cloudflare deploy
    fi

    log_success "Deployment completed"
}

# Health check
health_check() {
    log_step "Running health check..."

    local base_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        base_url="https://websiteunblocker.com"
    else
        base_url="https://staging.websiteunblocker.com"
    fi

    # Check API health endpoint
    local max_attempts=10
    local attempt=1
    local wait_time=5

    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."

        local response
        response=$(curl -sf "$base_url/api/health" 2>/dev/null || echo "")

        if [[ -n "$response" ]]; then
            local status
            status=$(echo "$response" | jq -r '.status // empty' 2>/dev/null || echo "")

            if [[ "$status" == "healthy" || "$status" == "degraded" ]]; then
                log_success "Health check passed (status: $status)"
                return 0
            fi
        fi

        if [[ $attempt -lt $max_attempts ]]; then
            sleep "$wait_time"
            # Exponential backoff for subsequent attempts
            wait_time=$((wait_time * 2))
            if [[ $wait_time -gt 30 ]]; then
                wait_time=30
            fi
        fi
        ((attempt++))
    done

    log_warning "Health check completed with status: unknown (deployment may still be propagating)"
    log_info "Run './scripts/health-check.sh $ENVIRONMENT' for detailed checks"
    return 0
}

# Post-deployment verification
post_deployment_verification() {
    log_step "Running post-deployment verification..."

    local base_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        base_url="https://websiteunblocker.com"
    else
        base_url="https://staging.websiteunblocker.com"
    fi

    local verification_passed=true
    local checks_passed=0
    local checks_total=0

    # Verification 1: Homepage loads
    ((checks_total++))
    local homepage_status
    homepage_status=$(curl -s -o /dev/null -w "%{http_code}" "$base_url" 2>/dev/null || echo "000")
    if [[ "$homepage_status" == "200" ]]; then
        log_success "Homepage: HTTP $homepage_status"
        ((checks_passed++))
    else
        log_error "Homepage: HTTP $homepage_status (expected 200)"
        add_error "Homepage returned HTTP $homepage_status"
        verification_passed=false
    fi

    # Verification 2: Admin panel accessible
    ((checks_total++))
    local admin_status
    admin_status=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/admin" 2>/dev/null || echo "000")
    if [[ "$admin_status" == "200" || "$admin_status" == "302" ]]; then
        log_success "Admin panel: HTTP $admin_status"
        ((checks_passed++))
    else
        log_warning "Admin panel: HTTP $admin_status"
        add_warning "Admin panel returned HTTP $admin_status"
    fi

    # Verification 3: API health endpoint
    ((checks_total++))
    local api_status
    api_status=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/api/health" 2>/dev/null || echo "000")
    if [[ "$api_status" == "200" ]]; then
        log_success "API health: HTTP $api_status"
        ((checks_passed++))
    else
        log_error "API health: HTTP $api_status (expected 200)"
        add_error "API health returned HTTP $api_status"
        verification_passed=false
    fi

    # Verification 4: Response time check
    ((checks_total++))
    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$base_url" 2>/dev/null || echo "0")
    local response_ms
    response_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "0")
    if (( $(echo "$response_time < 3" | bc -l 2>/dev/null || echo 0) )); then
        log_success "Response time: ${response_ms%.*}ms"
        ((checks_passed++))
    else
        log_warning "Response time: ${response_ms%.*}ms (slow)"
        add_warning "Slow response time: ${response_ms%.*}ms"
    fi

    # Verification 5: SSL certificate check
    ((checks_total++))
    local domain
    if [[ "$ENVIRONMENT" == "production" ]]; then
        domain="websiteunblocker.com"
    else
        domain="staging.websiteunblocker.com"
    fi
    if curl -sI "https://$domain" 2>/dev/null | grep -q "HTTP"; then
        log_success "SSL certificate: valid"
        ((checks_passed++))
    else
        log_warning "SSL certificate: could not verify"
    fi

    echo ""
    log_info "Verification summary: $checks_passed/$checks_total checks passed"

    if [[ "$verification_passed" == "false" ]]; then
        log_error "Post-deployment verification failed"
        log_info "Consider running rollback: ./scripts/rollback.sh $ENVIRONMENT"
        return 1
    fi

    log_success "Post-deployment verification passed"
    return 0
}

# Post-deployment audit
run_post_deploy_audit() {
    if [[ "${SKIP_AUDIT:-false}" == "true" ]]; then
        log_warning "Skipping post-deployment audit (SKIP_AUDIT=true)"
        return 0
    fi

    local audit_script="$PROJECT_ROOT/scripts/post-deploy-audit.sh"
    if [[ ! -x "$audit_script" ]]; then
        log_warning "Post-deploy audit script not found or not executable: $audit_script"
        add_warning "Post-deploy audit script missing"
        return 0
    fi

    local audit_timeout="${AUDIT_TIMEOUT:-20}"
    log_step "Running post-deployment audit..."

    if "$audit_script" "$ENVIRONMENT" --timeout "$audit_timeout"; then
        log_success "Post-deployment audit passed"
        return 0
    fi

    log_error "Post-deployment audit failed"
    add_error "Post-deployment audit failed"

    if [[ "${FAIL_ON_AUDIT:-true}" == "true" ]]; then
        return 1
    fi

    add_warning "Post-deployment audit failed (ignored with FAIL_ON_AUDIT=false)"
    return 0
}

# Rollback
rollback() {
    log_error "Deployment failed, initiating rollback..."

    local latest_backup
    latest_backup=$(ls -t "$BACKUP_DIR"/backup_${ENVIRONMENT}_*.tar.gz 2>/dev/null | head -n1)

    if [[ -z "$latest_backup" ]]; then
        log_error "No backup found for rollback"
        exit 1
    fi

    log_info "Restoring from: $latest_backup"

    # Extract backup
    tar -xzf "$latest_backup" -C "$PROJECT_ROOT"

    log_warning "Rollback complete. Please verify manually."
}

# Main deployment flow
main() {
    log_info "Starting deployment for: $ENVIRONMENT"
    log_info "Timestamp: $TIMESTAMP"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "DRY RUN MODE - No changes will be made"
    fi
    echo

    # Set trap for cleanup on error
    trap rollback ERR

    # Execute deployment steps
    validate_environment "$ENVIRONMENT"
    pre_deployment_checklist
    check_prerequisites
    validate_cloudflare_resources "$ENVIRONMENT"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would run tests"
        log_info "DRY RUN: Would create backup"
        log_info "DRY RUN: Would deploy database migrations"
        log_info "DRY RUN: Would build application"
        log_info "DRY RUN: Would deploy to Cloudflare"
        log_info "DRY RUN: Would run post-deployment audit"
        log_success "DRY RUN completed - no changes made"
        return 0
    fi

    run_tests
    create_backup
    deploy_database
    build_application
    deploy_application
    health_check
    post_deployment_verification
    run_post_deploy_audit

    # Clear trap on success
    trap - ERR

    # Print warnings if any
    if [[ ${#WARNINGS[@]} -gt 0 ]]; then
        echo ""
        log_warning "Deployment completed with warnings:"
        for warn in "${WARNINGS[@]}"; do
            echo -e "  ${YELLOW}-${NC} $warn"
        done
    fi

    echo ""
    log_success "Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"

    local deploy_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_url="https://websiteunblocker.com"
    else
        deploy_url="https://staging.websiteunblocker.com"
    fi
    log_info "URL: $deploy_url"
    log_info "Verify deployment: ./scripts/health-check.sh $ENVIRONMENT"
    log_info "Post-deploy audit: ./scripts/post-deploy-audit.sh $ENVIRONMENT"
}

# Run main function
main "$@"
