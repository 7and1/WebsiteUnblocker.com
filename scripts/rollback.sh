#!/usr/bin/env bash
#
# WebsiteUnblocker.com - Rollback Script
#
# Usage:
#   ./scripts/rollback.sh [environment] [options]
#   ./scripts/rollback.sh production
#   ./scripts/rollback.sh staging --deployment-id abc123
#
# Options:
#   --deployment-id ID    Rollback to specific deployment ID
#   --list               List recent deployments without rolling back
#   --force              Skip confirmation prompt
#   --dry-run            Show what would be done without executing
#
# Description:
#   Rolls back to the previous successful deployment on Cloudflare Pages
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
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "${CYAN}==>${NC} $*"; }

# Parse arguments
ENVIRONMENT="production"
DEPLOYMENT_ID=""
LIST_ONLY="false"
FORCE="false"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        --deployment-id)
            DEPLOYMENT_ID="$2"
            shift 2
            ;;
        --list|-l)
            LIST_ONLY="true"
            shift
            ;;
        --force|-f)
            FORCE="true"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

PROJECT_NAME="websiteunblocker"
ROLLBACK_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Validate environment
validate_environment() {
    local env="$1"
    if [[ "$env" != "staging" && "$env" != "production" ]]; then
        log_error "Invalid environment: $env"
        log_info "Valid environments: staging, production"
        exit 1
    fi
    log_info "Environment: $env"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    if ! command -v wrangler &> /dev/null; then
        log_error "Wrangler not found. Install with: npm install -g wrangler"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install with: brew install jq (macOS) or apt install jq (Linux)"
        exit 1
    fi

    if ! wrangler whoami &> /dev/null; then
        log_error "Wrangler not authenticated. Run: wrangler login"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# List recent deployments with formatted output
list_deployments() {
    log_step "Fetching recent deployments..."

    local deployments
    deployments=$(wrangler pages deployment list \
        --project-name="$PROJECT_NAME" \
        --json 2>/dev/null || echo "[]")

    if [[ "$deployments" == "[]" || -z "$deployments" ]]; then
        log_error "No deployments found for project: $PROJECT_NAME"
        exit 1
    fi

    echo ""
    echo "Recent deployments for $PROJECT_NAME:"
    echo "--------------------------------------------------------------------------------"
    printf "%-24s | %-36s | %-10s | %s\n" "DATE" "DEPLOYMENT ID" "STATUS" "BRANCH"
    echo "--------------------------------------------------------------------------------"

    echo "$deployments" | jq -r '.[] | "\(.created_on) | \(.id) | \(.latest_stage.name) | \(.deployment_trigger.metadata.branch // "unknown")"' | head -n 15 | while IFS='|' read -r date id status branch; do
        # Trim whitespace
        date=$(echo "$date" | xargs)
        id=$(echo "$id" | xargs)
        status=$(echo "$status" | xargs)
        branch=$(echo "$branch" | xargs)

        # Color code status
        local status_color="$NC"
        case "$status" in
            success) status_color="$GREEN" ;;
            failure) status_color="$RED" ;;
            *) status_color="$YELLOW" ;;
        esac

        printf "%-24s | %-36s | ${status_color}%-10s${NC} | %s\n" "$date" "$id" "$status" "$branch"
    done

    echo "--------------------------------------------------------------------------------"
    echo ""

    # Return the deployments for further processing
    echo "$deployments"
}

# Get previous successful deployment
get_previous_deployment() {
    local deployments="$1"
    local skip_count="${2:-1}"

    # Get the Nth successful deployment (skip_count = 1 means get the 2nd successful one)
    local deployment_id
    deployment_id=$(echo "$deployments" | jq -r "[.[] | select(.latest_stage.name == \"success\")] | .[$skip_count].id // empty")

    if [[ -z "$deployment_id" || "$deployment_id" == "null" ]]; then
        return 1
    fi

    echo "$deployment_id"
}

# Rollback to specific deployment
rollback_deployment() {
    local target_deployment="$1"

    log_step "Initiating rollback..."
    log_info "Target deployment: $target_deployment"

    # Get deployment details
    local deployments
    deployments=$(wrangler pages deployment list \
        --project-name="$PROJECT_NAME" \
        --json 2>/dev/null || echo "[]")

    local deployment_info
    deployment_info=$(echo "$deployments" | jq -r ".[] | select(.id == \"$target_deployment\")")

    if [[ -z "$deployment_info" ]]; then
        log_error "Deployment not found: $target_deployment"
        exit 1
    fi

    local deployment_date
    local deployment_branch
    deployment_date=$(echo "$deployment_info" | jq -r '.created_on')
    deployment_branch=$(echo "$deployment_info" | jq -r '.deployment_trigger.metadata.branch // "unknown"')

    echo ""
    log_info "Rollback target details:"
    echo "  Deployment ID: $target_deployment"
    echo "  Created: $deployment_date"
    echo "  Branch: $deployment_branch"
    echo ""

    # Confirm rollback unless --force is specified
    if [[ "$FORCE" != "true" && "$DRY_RUN" != "true" ]]; then
        echo -e "${YELLOW}WARNING: This will rollback the $ENVIRONMENT environment.${NC}"
        read -p "Are you sure you want to rollback? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_warning "Rollback cancelled"
            exit 0
        fi
    fi

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would execute rollback to $target_deployment"
        log_info "DRY RUN: Would run health check after rollback"
        return 0
    fi

    # Perform rollback
    log_info "Executing rollback..."
    if wrangler pages deployment rollback \
        --project-name="$PROJECT_NAME" \
        --deployment-id="$target_deployment" 2>&1; then
        log_success "Rollback command executed successfully"
    else
        log_error "Rollback command failed"
        exit 1
    fi
}

# Database rollback instructions
rollback_database() {
    log_step "Database Rollback Information"
    log_warning "Database rollback requires manual intervention"
    echo ""
    echo "To restore from backup:"
    echo ""
    echo "1. List available backups:"
    echo "   wrangler r2 object list ${PROJECT_NAME}-media/backups --env=$ENVIRONMENT"
    echo ""
    echo "2. Download the backup you want to restore:"
    echo "   wrangler r2 object get ${PROJECT_NAME}-media/backups/backup_FILE.sql \\"
    echo "     --file=restore.sql --env=$ENVIRONMENT"
    echo ""
    echo "3. Restore options:"
    echo ""
    echo "   Option A - Via Cloudflare Dashboard:"
    echo "   D1 > websiteunblocker-db > Settings > Restore from backup"
    echo ""
    echo "   Option B - Via Time Travel (point-in-time recovery):"
    echo "   wrangler d1 time-travel info D1 --env=$ENVIRONMENT"
    echo "   wrangler d1 time-travel restore D1 --timestamp=2025-01-17T12:00:00Z --env=$ENVIRONMENT"
    echo ""
    echo "   Option C - Manual SQL restore:"
    echo "   wrangler d1 execute D1 --env=$ENVIRONMENT --remote --file=restore.sql"
    echo ""
}

# Health check after rollback
health_check() {
    log_step "Running health check after rollback..."

    local base_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        base_url="https://websiteunblocker.com"
    else
        base_url="https://staging.websiteunblocker.com"
    fi

    local max_attempts=10
    local attempt=1
    local wait_time=5

    log_info "Waiting for deployment to propagate..."

    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."

        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$base_url/api/health" 2>/dev/null || echo "000")

        if [[ "$status_code" == "200" ]]; then
            log_success "Health check passed (HTTP $status_code)"
            return 0
        fi

        log_info "Status: HTTP $status_code - retrying in ${wait_time}s..."
        sleep "$wait_time"

        # Exponential backoff
        wait_time=$((wait_time + 5))
        if [[ $wait_time -gt 30 ]]; then
            wait_time=30
        fi

        ((attempt++))
    done

    log_warning "Health check failed after $max_attempts attempts"
    log_info "The rollback may still be propagating. Run manual verification:"
    log_info "  ./scripts/health-check.sh $ENVIRONMENT"
    return 1
}

# Verify rollback success
verify_rollback() {
    log_step "Verifying rollback success..."

    local base_url
    if [[ "$ENVIRONMENT" == "production" ]]; then
        base_url="https://websiteunblocker.com"
    else
        base_url="https://staging.websiteunblocker.com"
    fi

    local checks_passed=0
    local checks_total=3

    # Check 1: Homepage
    local homepage_status
    homepage_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$base_url" 2>/dev/null || echo "000")
    if [[ "$homepage_status" == "200" ]]; then
        log_success "Homepage: HTTP $homepage_status"
        ((checks_passed++))
    else
        log_error "Homepage: HTTP $homepage_status"
    fi

    # Check 2: API health
    local api_status
    api_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$base_url/api/health" 2>/dev/null || echo "000")
    if [[ "$api_status" == "200" ]]; then
        log_success "API Health: HTTP $api_status"
        ((checks_passed++))
    else
        log_error "API Health: HTTP $api_status"
    fi

    # Check 3: Admin panel
    local admin_status
    admin_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$base_url/admin" 2>/dev/null || echo "000")
    if [[ "$admin_status" == "200" || "$admin_status" == "302" ]]; then
        log_success "Admin Panel: HTTP $admin_status"
        ((checks_passed++))
    else
        log_warning "Admin Panel: HTTP $admin_status"
    fi

    echo ""
    log_info "Verification: $checks_passed/$checks_total checks passed"

    if [[ $checks_passed -eq $checks_total ]]; then
        log_success "Rollback verification passed"
        return 0
    elif [[ $checks_passed -gt 0 ]]; then
        log_warning "Rollback partially verified - some checks failed"
        return 0
    else
        log_error "Rollback verification failed"
        return 1
    fi
}

# Main rollback flow
main() {
    log_step "WebsiteUnblocker.com Rollback"
    log_info "Timestamp: $ROLLBACK_TIMESTAMP"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "DRY RUN MODE - No changes will be made"
    fi
    echo ""

    validate_environment "$ENVIRONMENT"
    check_prerequisites

    # Fetch deployments
    local deployments
    deployments=$(wrangler pages deployment list \
        --project-name="$PROJECT_NAME" \
        --json 2>/dev/null || echo "[]")

    # If --list flag, just show deployments and exit
    if [[ "$LIST_ONLY" == "true" ]]; then
        list_deployments
        exit 0
    fi

    # Determine target deployment
    local target_deployment
    if [[ -n "$DEPLOYMENT_ID" ]]; then
        target_deployment="$DEPLOYMENT_ID"
        log_info "Using specified deployment ID: $target_deployment"
    else
        # Get the previous successful deployment (not the current one)
        target_deployment=$(get_previous_deployment "$deployments" 1)
        if [[ -z "$target_deployment" ]]; then
            log_error "No previous successful deployment found to rollback to"
            log_info "Use --list to see available deployments"
            log_info "Use --deployment-id ID to specify a specific deployment"
            exit 1
        fi
        log_info "Auto-selected previous successful deployment: $target_deployment"
    fi

    echo ""
    log_warning "ROLLBACK OPERATIONS:"
    echo "  1) Application deployment (automatic)"
    echo "  2) Database (manual - instructions provided)"
    echo ""

    rollback_deployment "$target_deployment"

    if [[ "$DRY_RUN" != "true" ]]; then
        echo ""
        health_check
        echo ""
        verify_rollback
        echo ""
        rollback_database
    fi

    echo ""
    log_success "Rollback process completed!"
    log_warning "Please verify the application is working correctly"
    log_info "Run full health check: ./scripts/health-check.sh $ENVIRONMENT"
}

# Run main function
main
