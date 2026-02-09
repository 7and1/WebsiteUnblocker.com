#!/usr/bin/env bash
#
# WebsiteUnblocker.com - Post-Deploy Audit
#
# Usage:
#   ./scripts/post-deploy-audit.sh [production|staging] [--json] [--timeout 15]
#

set -euo pipefail

readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly RED='\033[0;31m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { if [[ "$QUIET" != "true" ]]; then echo -e "${BLUE}[INFO]${NC} $*"; fi; }
log_success() { if [[ "$QUIET" != "true" ]]; then echo -e "${GREEN}[OK]${NC} $*"; fi; }
log_warn() { if [[ "$QUIET" != "true" ]]; then echo -e "${YELLOW}[WARN]${NC} $*"; fi; }
log_error() { if [[ "$QUIET" != "true" ]]; then echo -e "${RED}[FAIL]${NC} $*"; fi; }

now_ms() {
  local current
  current=$(date +%s%3N 2>/dev/null || true)
  if [[ "$current" =~ ^[0-9]+$ ]]; then
    echo "$current"
    return
  fi
  perl -MTime::HiRes=time -e 'printf("%.0f\n", time()*1000)'
}

ENVIRONMENT="production"
TIMEOUT=15
JSON_OUTPUT="false"
QUIET="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    production|staging)
      ENVIRONMENT="$1"
      shift
      ;;
    --json)
      JSON_OUTPUT="true"
      shift
      ;;
    --quiet|-q)
      QUIET="true"
      shift
      ;;
    --timeout)
      TIMEOUT="${2:-15}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ "$JSON_OUTPUT" == "true" ]]; then
  QUIET="true"
fi

if [[ "$ENVIRONMENT" == "production" ]]; then
  BASE_URL="https://websiteunblocker.com"
else
  BASE_URL="https://staging.websiteunblocker.com"
fi

PASSED=0
FAILED=0
WARNED=0
RESULTS=()

add_result() {
  local name="$1"
  local status="$2"
  local detail="$3"
  local status_code="$4"
  local latency_ms="$5"

  RESULTS+=("$(jq -cn --arg name "$name" --arg status "$status" --arg detail "$detail" --argjson code "$status_code" --argjson latency_ms "$latency_ms" '{name:$name,status:$status,detail:$detail,code:$code,latency_ms:$latency_ms}')")
}

run_check() {
  local name="$1"
  local path="$2"
  local expected_code="$3"
  local must_contain="${4:-}"
  local warn_threshold_ms="${5:-0}"

  local url="${BASE_URL}${path}"
  local tmp
  tmp=$(mktemp)

  local start_ms end_ms code elapsed_ms
  start_ms=$(now_ms)
  code=$(curl -sSL --max-time "$TIMEOUT" -o "$tmp" -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  end_ms=$(now_ms)
  elapsed_ms=$((end_ms - start_ms))

  if [[ "$code" != "$expected_code" ]]; then
    log_error "$name ($path) HTTP $code, expected $expected_code"
    ((FAILED++))
    add_result "$name" "fail" "HTTP $code, expected $expected_code" "$code" "$elapsed_ms"
    rm -f "$tmp"
    return 1
  fi

  if [[ -n "$must_contain" ]] && ! rg -q --fixed-strings "$must_contain" "$tmp"; then
    log_error "$name ($path) missing expected content: $must_contain"
    ((FAILED++))
    add_result "$name" "fail" "Missing content: $must_contain" "$code" "$elapsed_ms"
    rm -f "$tmp"
    return 1
  fi

  if [[ "$warn_threshold_ms" -gt 0 && "$elapsed_ms" -gt "$warn_threshold_ms" ]]; then
    log_warn "$name ($path) HTTP $code, ${elapsed_ms}ms > ${warn_threshold_ms}ms"
    ((WARNED++))
    ((PASSED++))
    add_result "$name" "warn" "Slow: ${elapsed_ms}ms" "$code" "$elapsed_ms"
    rm -f "$tmp"
    return 0
  fi

  log_success "$name ($path) HTTP $code, ${elapsed_ms}ms"
  ((PASSED++))
  add_result "$name" "pass" "HTTP $code" "$code" "$elapsed_ms"
  rm -f "$tmp"
  return 0
}

run_check_any() {
  local name="$1"
  local path="$2"
  local expected_code="$3"
  local option_a="$4"
  local option_b="$5"

  local url="${BASE_URL}${path}"
  local tmp
  tmp=$(mktemp)

  local start_ms end_ms code elapsed_ms
  start_ms=$(now_ms)
  code=$(curl -sSL --max-time "$TIMEOUT" -o "$tmp" -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  end_ms=$(now_ms)
  elapsed_ms=$((end_ms - start_ms))

  if [[ "$code" != "$expected_code" ]]; then
    log_error "$name ($path) HTTP $code, expected $expected_code"
    ((FAILED++))
    add_result "$name" "fail" "HTTP $code, expected $expected_code" "$code" "$elapsed_ms"
    rm -f "$tmp"
    return 1
  fi

  if rg -q --fixed-strings "$option_a" "$tmp" || rg -q --fixed-strings "$option_b" "$tmp"; then
    log_success "$name ($path) HTTP $code, ${elapsed_ms}ms"
    ((PASSED++))
    add_result "$name" "pass" "HTTP $code" "$code" "$elapsed_ms"
    rm -f "$tmp"
    return 0
  fi

  log_error "$name ($path) missing expected content: $option_a OR $option_b"
  ((FAILED++))
  add_result "$name" "fail" "Missing content markers" "$code" "$elapsed_ms"
  rm -f "$tmp"
  return 1
}

main() {
  log_info "Post-deploy audit: $ENVIRONMENT"
  log_info "Base URL: $BASE_URL"
  log_info "Timeout: ${TIMEOUT}s"

  run_check "Health API" "/api/health" "200" '"status":"healthy"' 1500 || true
  run_check "Homepage" "/" "200" "href=\"/guides\"" 3000 || true
  run_check "Guides" "/guides" "200" "Website Unblocker" 3000 || true
  run_check "Admin" "/admin" "200" "Payload" 4000 || true

  run_check_any "Sitemap Index" "/sitemap.xml" "200" "<sitemapindex" "<urlset" || true
  run_check "Blog Sitemap API" "/api/sitemap-blog.xml" "200" "<urlset" || true
  run_check "Static Sitemap API" "/api/sitemap-static.xml" "200" "<urlset" || true
  run_check "Unblock Sitemap API" "/api/sitemap-unblock.xml" "200" "<urlset" || true
  run_check "Robots" "/robots.txt" "200" "Sitemap: ${BASE_URL}/sitemap.xml" || true

  run_check "RSS Feed" "/feed.xml" "200" "<rss" || true
  run_check "Atom Feed" "/feed.atom" "200" "<feed" || true

  if [[ "$JSON_OUTPUT" == "true" ]]; then
    local results_json
    results_json=$(printf '%s\n' "${RESULTS[@]}" | jq -s '.')
    jq -n \
      --arg env "$ENVIRONMENT" \
      --arg url "$BASE_URL" \
      --argjson passed "$PASSED" \
      --argjson failed "$FAILED" \
      --argjson warned "$WARNED" \
      --argjson checks "$results_json" \
      '{environment:$env, base_url:$url, summary:{passed:$passed, failed:$failed, warned:$warned, total:($passed+$failed)}, status:(if $failed>0 then "failed" elif $warned>0 then "degraded" else "healthy" end), checks:$checks, timestamp:(now|strftime("%Y-%m-%dT%H:%M:%SZ"))}'
  else
    echo ""
    echo "Audit Summary: passed=${PASSED}, warned=${WARNED}, failed=${FAILED}"
    if [[ "$FAILED" -eq 0 ]]; then
      [[ "$WARNED" -gt 0 ]] && log_warn "Post-deploy audit passed with warnings" || log_success "Post-deploy audit passed"
    else
      log_error "Post-deploy audit failed"
    fi
  fi

  [[ "$FAILED" -eq 0 ]]
}

main
