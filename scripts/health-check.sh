#!/usr/bin/env bash
#
# WebsiteUnblocker.com - Health Check Script
#
# Usage:
#   ./scripts/health-check.sh [environment]
#   ./scripts/health-check.sh production
#   ./scripts/health-check.sh staging
#
# Options:
#   --json    Output results in JSON format
#   --quiet   Only output failures
#   --timeout Set request timeout in seconds (default: 10)
#
# Description:
#   Performs comprehensive health checks on the deployed application
#

set -euo pipefail

# Colors for output
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

log_info() { [[ "$QUIET" != "true" ]] && echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[FAIL]${NC} $*"; }
log_step() { [[ "$QUIET" != "true" ]] && echo -e "${CYAN}==>${NC} $*"; }

# Parse arguments
ENVIRONMENT="production"
JSON_OUTPUT="false"
QUIET="false"
TIMEOUT=10

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT="true"
            shift
            ;;
        --quiet|-q)
            QUIET="true"
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
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

# Determine base URL
if [[ "$ENVIRONMENT" == "production" ]]; then
    BASE_URL="https://websiteunblocker.com"
    DOMAIN="websiteunblocker.com"
else
    BASE_URL="https://staging.websiteunblocker.com"
    DOMAIN="staging.websiteunblocker.com"
fi

# Track results
FAILED_CHECKS=0
PASSED_CHECKS=0
WARNED_CHECKS=0
RESULTS=()

# Add result to tracking
add_result() {
    local name="$1"
    local status="$2"
    local details="${3:-}"
    local response_time="${4:-0}"

    RESULTS+=("{\"name\":\"$name\",\"status\":\"$status\",\"details\":\"$details\",\"response_time_ms\":$response_time}")
}

# Check with colored output
check() {
    local name="$1"
    local command="$2"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name"

    if eval "$command" > /dev/null 2>&1; then
        [[ "$QUIET" != "true" ]] && log_success "$name"
        ((PASSED_CHECKS++))
        add_result "$name" "pass" ""
        return 0
    else
        log_error "$name"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" ""
        return 1
    fi
}

# Check HTTP endpoint with response time
check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name ($url)"

    local start_time
    start_time=$(date +%s%3N 2>/dev/null || date +%s000)

    local status_code
    local response_time
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")

    local end_time
    end_time=$(date +%s%3N 2>/dev/null || date +%s000)
    response_time=$((end_time - start_time))

    if [[ "$status_code" == "$expected_code" ]]; then
        if [[ "$QUIET" != "true" ]]; then
            if [[ $response_time -lt 500 ]]; then
                log_success "$name (HTTP $status_code, ${response_time}ms)"
            elif [[ $response_time -lt 2000 ]]; then
                log_success "$name (HTTP $status_code, ${response_time}ms - acceptable)"
            else
                log_warning "$name (HTTP $status_code, ${response_time}ms - slow)"
                ((WARNED_CHECKS++))
            fi
        fi
        ((PASSED_CHECKS++))
        add_result "$name" "pass" "HTTP $status_code" "$response_time"
        return 0
    else
        log_error "$name (HTTP $status_code, expected $expected_code)"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" "HTTP $status_code, expected $expected_code" "$response_time"
        return 1
    fi
}

# Check JSON response with specific field
check_json() {
    local name="$1"
    local url="$2"
    local field="$3"
    local expected_value="${4:-}"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name"

    local start_time
    start_time=$(date +%s%3N 2>/dev/null || date +%s000)

    local response
    response=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "")

    local end_time
    end_time=$(date +%s%3N 2>/dev/null || date +%s000)
    local response_time=$((end_time - start_time))

    if [[ -z "$response" ]]; then
        log_error "$name - no response"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" "No response" "$response_time"
        return 1
    fi

    local value
    value=$(echo "$response" | jq -r ".$field // empty" 2>/dev/null || echo "")

    if [[ -n "$value" ]]; then
        if [[ -z "$expected_value" || "$value" == "$expected_value" ]]; then
            [[ "$QUIET" != "true" ]] && log_success "$name ($field: $value)"
            ((PASSED_CHECKS++))
            add_result "$name" "pass" "$field: $value" "$response_time"
            return 0
        else
            log_error "$name ($field: $value, expected: $expected_value)"
            ((FAILED_CHECKS++))
            add_result "$name" "fail" "$field: $value, expected: $expected_value" "$response_time"
            return 1
        fi
    else
        log_error "$name - field '$field' not found in response"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" "Field not found: $field" "$response_time"
        return 1
    fi
}

# DNS check
check_dns() {
    local name="$1"
    local domain="$2"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name"

    local ips
    ips=$(dig +short "$domain" 2>/dev/null | grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' || echo "")

    if [[ -n "$ips" ]]; then
        local ip_count
        ip_count=$(echo "$ips" | wc -l | tr -d ' ')
        [[ "$QUIET" != "true" ]] && log_success "$name - DNS resolves ($ip_count IPs)"
        ((PASSED_CHECKS++))
        add_result "$name" "pass" "Resolves to $ip_count IPs"
        return 0
    else
        log_error "$name - DNS does not resolve"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" "DNS resolution failed"
        return 1
    fi
}

# SSL check with expiry warning
check_ssl() {
    local name="$1"
    local domain="$2"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name"

    local expiry
    expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
        openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

    if [[ -n "$expiry" ]]; then
        local expiry_date now days_left

        # Cross-platform date parsing
        if date -j -f "%b %d %T %Y %Z" "$expiry" +%s &>/dev/null; then
            # macOS
            expiry_date=$(date -j -f "%b %d %T %Y %Z" "$expiry" +%s 2>/dev/null)
        else
            # Linux
            expiry_date=$(date -d "$expiry" +%s 2>/dev/null)
        fi

        now=$(date +%s)
        days_left=$(( (expiry_date - now) / 86400 ))

        if [[ $days_left -gt 30 ]]; then
            [[ "$QUIET" != "true" ]] && log_success "$name - SSL valid ($days_left days remaining)"
            ((PASSED_CHECKS++))
            add_result "$name" "pass" "$days_left days remaining"
            return 0
        elif [[ $days_left -gt 7 ]]; then
            log_warning "$name - SSL expires soon ($days_left days)"
            ((WARNED_CHECKS++))
            ((PASSED_CHECKS++))
            add_result "$name" "warn" "$days_left days remaining"
            return 0
        else
            log_error "$name - SSL expires in $days_left days!"
            ((FAILED_CHECKS++))
            add_result "$name" "fail" "Expires in $days_left days"
            return 1
        fi
    else
        log_error "$name - SSL check failed"
        ((FAILED_CHECKS++))
        add_result "$name" "fail" "Could not retrieve certificate"
        return 1
    fi
}

# Check response time threshold
check_response_time() {
    local name="$1"
    local url="$2"
    local threshold_ms="${3:-2000}"

    [[ "$QUIET" != "true" ]] && log_info "Checking: $name"

    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "999")
    local response_ms
    response_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "0")
    response_ms=${response_ms%.*}

    if [[ $response_ms -lt $threshold_ms ]]; then
        [[ "$QUIET" != "true" ]] && log_success "$name - ${response_ms}ms (threshold: ${threshold_ms}ms)"
        ((PASSED_CHECKS++))
        add_result "$name" "pass" "${response_ms}ms" "$response_ms"
        return 0
    else
        log_warning "$name - ${response_ms}ms exceeds threshold (${threshold_ms}ms)"
        ((WARNED_CHECKS++))
        add_result "$name" "warn" "${response_ms}ms exceeds ${threshold_ms}ms" "$response_ms"
        return 0
    fi
}

# Print summary
print_summary() {
    echo ""
    if [[ "$JSON_OUTPUT" == "true" ]]; then
        # Output JSON format
        local results_json
        results_json=$(printf '%s\n' "${RESULTS[@]}" | jq -s '.')

        jq -n \
            --arg env "$ENVIRONMENT" \
            --arg url "$BASE_URL" \
            --argjson passed "$PASSED_CHECKS" \
            --argjson failed "$FAILED_CHECKS" \
            --argjson warned "$WARNED_CHECKS" \
            --argjson results "$results_json" \
            '{
                environment: $env,
                base_url: $url,
                summary: {
                    passed: $passed,
                    failed: $failed,
                    warned: $warned,
                    total: ($passed + $failed)
                },
                status: (if $failed > 0 then "unhealthy" elif $warned > 0 then "degraded" else "healthy" end),
                checks: $results,
                timestamp: now | strftime("%Y-%m-%dT%H:%M:%SZ")
            }'
        return $([[ $FAILED_CHECKS -eq 0 ]] && echo 0 || echo 1)
    fi

    log_step "Health Check Summary"
    echo ""
    echo "  Environment: $ENVIRONMENT"
    echo "  Base URL: $BASE_URL"
    echo "  Passed: $PASSED_CHECKS"
    echo "  Warned: $WARNED_CHECKS"
    echo "  Failed: $FAILED_CHECKS"
    echo ""

    if [[ $FAILED_CHECKS -eq 0 ]]; then
        if [[ $WARNED_CHECKS -gt 0 ]]; then
            log_warning "Health check passed with warnings"
        else
            log_success "All health checks passed!"
        fi
        return 0
    else
        log_error "Some health checks failed!"
        return 1
    fi
}

# Main health check flow
main() {
    [[ "$JSON_OUTPUT" != "true" ]] && log_step "WebsiteUnblocker.com Health Check"
    [[ "$JSON_OUTPUT" != "true" ]] && log_info "Environment: $ENVIRONMENT"
    [[ "$JSON_OUTPUT" != "true" ]] && log_info "Base URL: $BASE_URL"
    [[ "$JSON_OUTPUT" != "true" ]] && log_info "Timeout: ${TIMEOUT}s"
    [[ "$JSON_OUTPUT" != "true" ]] && echo ""

    # DNS checks
    [[ "$JSON_OUTPUT" != "true" ]] && log_step "DNS Checks"
    check_dns "DNS Resolution" "$DOMAIN"
    check_dns "WWW DNS Resolution" "www.$DOMAIN"

    # SSL check
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "SSL/TLS Checks"
    check_ssl "SSL Certificate" "$DOMAIN"

    # Response time checks
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "Response Time Checks"
    check_response_time "Homepage Response Time" "$BASE_URL" 2000
    check_response_time "API Response Time" "$BASE_URL/api/health" 1000

    # HTTP endpoints - Critical
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "Critical Endpoints"
    check_endpoint "Homepage" "$BASE_URL" "200"
    check_endpoint "Admin Panel" "$BASE_URL/admin" "200"

    # API endpoints
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "API Endpoints"
    check_endpoint "Health API" "$BASE_URL/api/health" "200"
    check_json "Health Status" "$BASE_URL/api/health" "status"
    check_endpoint "IP API" "$BASE_URL/api/ip" "200"
    check_endpoint "Sitemap" "$BASE_URL/sitemap.xml" "200"
    check_endpoint "Robots.txt" "$BASE_URL/robots.txt" "200"

    # Content pages
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "Content Pages"
    check_endpoint "Blog Page" "$BASE_URL/blog" "200"
    check_endpoint "Tools Page" "$BASE_URL/tools" "200"
    check_endpoint "VPN Page" "$BASE_URL/vpn" "200"

    # API features
    [[ "$JSON_OUTPUT" != "true" ]] && echo "" && log_step "Feature APIs"
    check_endpoint "Proxy List API" "$BASE_URL/api/proxies" "200"

    print_summary
}

# Run main function
main
