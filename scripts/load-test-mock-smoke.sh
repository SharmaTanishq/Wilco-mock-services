#!/usr/bin/env bash
# Smoke checks: Unbxd-shaped search + Medusa get-product (same display ids).
# Usage: BASE_URL=http://localhost:3000 API_KEY=key SITE_KEY=site ./scripts/load-test-mock-smoke.sh
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-test-api-key}"
SITE_KEY="${SITE_KEY:-test-site-key}"

echo "== GET $BASE_URL/health"
curl -sS -f "$BASE_URL/health" | head -c 200
echo ""

echo "== GET search"
curl -sS -f "$BASE_URL/$API_KEY/$SITE_KEY/search?q=dog&start=0&rows=50" | head -c 400
echo ""
echo "..."

echo "== GET get-product 100001"
curl -sS -f "$BASE_URL/store/get-product?id=100001" | head -c 400
echo ""
echo "..."

echo "== GET get-product 900001 (minimal-catalog id when minimal fixture merged)"
curl -sS -f "$BASE_URL/store/get-product?id=900001" | head -c 200
echo ""

echo "== GET /store/regions (expect 501)"
code=$(curl -sS -o /tmp/wilco-smoke-body.json -w "%{http_code}" "$BASE_URL/store/regions")
echo "HTTP $code"
test "$code" = "501"
grep -q store_route_not_mocked /tmp/wilco-smoke-body.json
echo "OK"
