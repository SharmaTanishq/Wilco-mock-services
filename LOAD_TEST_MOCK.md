# Load-test mock: Unbxd search + Medusa `get-product`

This service (e.g. on Railway) can satisfy **both** Wilco ecom middleware traffic shapes **without** changing the Wilco monorepo:

1. **Unbxd-shaped** `GET /:apiKey/:siteKey/search` and `GET /:apiKey/:siteKey/category`
2. **Medusa-shaped** `GET /store/get-product?id=<DISPLAY_ID>`

`get-product` bodies are **generated** from the same Unbxd catalog rows in `src/fixtures/unbxd-search-response.json` and `unbxd-commerce-search-minimal.json`, so every `uniqueId` in search has a matching PDP payload. See `src/fixtures/examples/medusa-get-product-100001.example.json` for a static example of the response shape.

---

## Ecom middleware env (load-test pod)

| Variable | Example | Purpose |
|----------|---------|---------|
| `UNBXD_COMMERCE_SEARCH_BASE_URL` | `https://<MOCK_HOST>/<UNBXD_API_KEY>/<UNBXD_SITE_KEY>` | No trailing slash. Same path prefix as real Unbxd. |
| `ECOM_BACKEND_INTERNAL_URL` | `https://<MOCK_HOST>` | Point internal Medusa base at this mock so `GET /store/get-product` hits the same host. If you must keep real Medusa for cart, use a **reverse proxy** and route only `/store/get-product` to the mock. |

Optional:

- `UNBXD_MINIMAL_COMMERCE_RESPONSE=true` — tiny search payload + facets (still flat text + Category multilevel).
- `FIXTURES_DIR` — absolute or relative path to a directory of **`get-product-<displayId>.json`** files. Each file must be a full JSON body `{ "product": { ... } }`. When present for a given `id`, it overrides the generated Medusa product (useful after capturing real `curl` responses from dev Medusa).

**`PORT`** — listen port (default `3000`). Railway sets this automatically.

### Other `/store/*` routes

Only **`GET /store/get-product`** is implemented. Any other **`/store/...`** request returns **`501`** with JSON `{ "error": "store_route_not_mocked", ... }` so load-test scripts fail loudly if `ECOM_BACKEND_INTERNAL_URL` points the whole Medusa client at this mock without a proxy.

### CORS

Middleware → mock is server-to-server; CORS is unchanged. If a browser calls the mock directly in dev, `src/app.ts` already uses the `cors()` middleware permissively.

### Example `.env` (local or docs only — set real values in Railway / k8s)

```env
PORT=3000
# UNBXD_MINIMAL_COMMERCE_RESPONSE=true
# FIXTURES_DIR=/path/to/custom/get-product-json
```

**Ecom middleware (load-test):**

```env
UNBXD_COMMERCE_SEARCH_BASE_URL=https://<MOCK_HOST>/<UNBXD_API_KEY>/<UNBXD_SITE_KEY>
# Narrow PDP-only mock at same host:
ECOM_BACKEND_INTERNAL_URL=https://<MOCK_HOST>
```

If the middleware also calls **`/store/carts`**, **`/store/customers`**, etc., either put a **reverse proxy** in front so only `/store/get-product` hits this service, or extend this repo with more routes.

---

## Example curl

Replace `MOCK`, `API_KEY`, `SITE_KEY`, and display id as needed.

```bash
MOCK=https://your-mock.up.railway.app
API_KEY=your_unbxd_api_key
SITE_KEY=your_unbxd_site_key

curl -sS "$MOCK/health"

curl -sS "$MOCK/$API_KEY/$SITE_KEY/search?q=dog&start=0&rows=50"

curl -sS "$MOCK/$API_KEY/$SITE_KEY/category?p=u_categoryPathId%3A%22cat1037%22&start=0&rows=50"

curl -sS "$MOCK/store/get-product?id=100001"
curl -sS "$MOCK/store/get-product?id=900001"

curl -sS -o /dev/null -w "%{http_code}\n" "$MOCK/store/regions"
```

Shell smoke script (from repo root, Git Bash / Linux / macOS):

```bash
BASE_URL=http://localhost:3000 API_KEY=myKey SITE_KEY=mySite bash scripts/load-test-mock-smoke.sh
```

---

## Fixture rules (implemented)

Your sample response (flat `Brands` / `Price` values, `Category` multilevel with numeric `name`, products ending in `-<uniqueId>`) matches this spec.

- **PLP products:** `uniqueId` numeric string; `handle` / `productUrl` end with `-<uniqueId>` (Nuxt PDP regex).
- **Text facets:** `values` are flat `[ "label", count, ... ]` only. Brand facet `displayName` is **`Brands`**. Price facet `displayName` is **`Price`** with bucket strings: `Under $24.99`, `$25.00 to $49.99`, `$50.00 to $99.99`, `$100.00 to $199.99`, `$200 and above`.
- **Multilevel category facet:** `displayName` **`Category`**; each `values[]` entry has **`name`** = numeric category id (string), **`displayName`** human label, **`count`**.
- **PDP:** `product.status` and each `variants[].status` are **`published`**.

---

## Code map

| Area | Path |
|------|------|
| Unbxd routes | `src/routes/third-party/unbxd.ts` |
| Search/category JSON | `src/fixtures/unbxd-search-response.json`, `unbxd-commerce-search-minimal.json` |
| Medusa route | `src/routes/store/medusa-store.ts` |
| Unbxd → Medusa mapping | `src/lib/unbxd-to-medusa-store-product.ts` |
| Optional PDP overrides | `src/lib/medusa-fixture-override.ts` (`FIXTURES_DIR`) |
| Example Medusa JSON | `src/fixtures/examples/medusa-get-product-100001.example.json` |
| curl smoke | `scripts/load-test-mock-smoke.sh` |
