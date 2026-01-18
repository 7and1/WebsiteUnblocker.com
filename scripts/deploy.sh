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
#

set -euo pipefail

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

    # Check D1 database exists
    if ! wrangler d1 list --json 2>/dev/null | jq -e ".[] | select(.name == \"$PROJECT_NAME-db${env:+-$env}\")" &> /dev/null; then
        log_warning "D1 database '$PROJECT_NAME-db${env:+-$env}' not found"
        log_info "Create it with: wrangler d1 create $PROJECT_NAME-db${env:+-$env}"
    fi

    # Check R2 bucket exists
    if ! wrangler r2 bucket list --json 2>/dev/null | jq -e ".[] | select(.name == \"$PROJECT_NAME-media${env:+-$env}\")" &> /dev/null; then
        log_warning "R2 bucket '$PROJECT_NAME-media${env:+-$env}' not found"
        log_info "Create it with: wrangler r2 bucket create $PROJECT_NAME-media${env:+-$env}"
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
        wrangler.jsonc \
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
    CLOUDFLARE_ENV="$ENVIRONMENT" \
        NODE_ENV=production \
        PAYLOAD_SECRET=ignore \
        pnpm payload migrate

    # Optimize database
    wrangler d1 execute D1 \
        --command "PRAGMA optimize" \
        --env="$ENVIRONMENT" \
        --remote

    log_success "Database migrations deployed"
}

# Build application
build_application() {
    log_step "Building application..."

    cd "$PROJECT_ROOT"

    # Generate types first
    log_info "Generating types..."
    pnpm run generate:types

    # Build with OpenNext
    log_info "Building with OpenNext..."
    CLOUDFLARE_ENV="$ENVIRONMENT" \
        NODE_OPTIONS="--no-deprecation --max-old-space-size=8000" \
        opennextjs-cloudflare build

    log_success "Application built successfully"
}

# Deploy to Cloudflare
deploy_application() {
    log_step "Deploying to Cloudflare Pages..."

    cd "$PROJECT_ROOT"

    CLOUDFLARE_ENV="$ENVIRONMENT" \
        opennextjs-cloudflare deploy

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
    local max_attempts=5
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."

        if curl -sf "$base_url/api/health" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi

        sleep 5
        ((attempt++))
    done

    log_warning "Health check failed (this may be normal for new deployments)"
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
    echo

    # Set trap for cleanup on error
    trap rollback ERR

    # Execute deployment steps
    validate_environment "$ENVIRONMENT"
    check_prerequisites
    validate_cloudflare_resources "$ENVIRONMENT"
    run_tests
    create_backup
    deploy_database
    build_application
    deploy_application
    health_check

    # Clear trap on success
    trap - ERR

    echo
    log_success "Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "URL: ${ENVIRONMENT == 'production' ? 'https://websiteunblocker.com' : 'https://staging.websiteunblocker.com'}"
}

# Run main function
main "$@"
