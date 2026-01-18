#!/usr/bin/env bash
#
# WebsiteUnblocker.com - Database Backup Script
#
# Usage:
#   ./scripts/backup.sh [environment]
#   ./scripts/backup.sh production
#   ./scripts/backup.sh staging
#

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $*"; }

# Configuration
ENVIRONMENT="${1:-production}"
PROJECT_NAME="websiteunblocker"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info "Starting backup for: $ENVIRONMENT"

# Export database
BACKUP_FILE="backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

log_info "Exporting D1 database..."
wrangler d1 export D1 \
    --env="$ENVIRONMENT" \
    --remote \
    --output="$BACKUP_FILE"

log_success "Database exported: $BACKUP_FILE"

# Upload to R2
log_info "Uploading to R2..."
wrangler r2 object put \
    "${PROJECT_NAME}-media/backups/$BACKUP_FILE" \
    --file="$BACKUP_FILE" \
    --env="$ENVIRONMENT"

log_success "Backup uploaded to R2: backups/$BACKUP_FILE"

# Cleanup local file
rm "$BACKUP_FILE"
log_info "Local backup file removed"

# List recent backups
log_info "Recent backups in R2:"
wrangler r2 object list "${PROJECT_NAME}-media/backups" --env="$ENVIRONMENT" | \
    jq -r '.objects[] | "\(.key): \(.size) bytes"' | \
    tail -n 5

log_success "Backup completed successfully!"
