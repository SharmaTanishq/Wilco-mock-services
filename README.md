# Wilco Mock Services

Standalone TypeScript + Express mock API for Wilco development environments. The service returns deterministic static responses so local/staging workflows can avoid calling cost-bearing third-party APIs.

## Run Locally

```sh
npm install
npm run dev
```

The server defaults to `http://localhost:3000`.

Load-test / Unbxd + Medusa PDP wiring: see [LOAD_TEST_MOCK.md](./LOAD_TEST_MOCK.md). Optional: `FIXTURES_DIR` for per-id `get-product-<id>.json` overrides; bash smoke script `scripts/load-test-mock-smoke.sh`.

```sh
curl http://localhost:3000/health
curl http://localhost:3000/__mock/routes
```

## Scripts

- `npm run dev` starts the service with `tsx watch`.
- `npm run build` compiles TypeScript into `dist`.
- `npm start` runs the compiled server.
- `npm test` runs smoke tests.

## Core Commerce Routes

These routes are backed by fixtures extracted from `mockresponses.md`:

- `POST /commerce/addShippingMethod`
- `POST /commerce/validateBillingAddress`
- `POST /commerce/selectPaymentSession`

`selectPaymentSession` only returns the captured app-facing checkout cart response. It does not mock the Authorize.Net hosted iframe or gateway flow.

## Third-Party Mock Routes

The first-pass provider mocks cover the easiest env-driven services:

- UPS: `/security/v1/oauth/token`, `/api/rating/:version/Rate`, `/api/addressvalidation/:version/:requestOption`, `/api/shipments/:version/ship`
- Google Address Validation: `/v1:validateAddress`
- Google Translate: `/language/translate/v2`, `/translate/v2`
- Kount: `/v1/token`, `/commerce/v2/orders`
- Unbxd: `/autosuggest`, `/search`, `/api/:siteKey/upload/catalog/full`
- Integrator: `/integrator`, `/webhooks/integrator`

Some routes support a `scenario` query parameter for simple alternate behavior, for example:

```sh
curl -X POST "http://localhost:3000/api/addressvalidation/v2/3?scenario=inexact"
curl -X POST "http://localhost:3000/api/addressvalidation/v2/3?scenario=fix"
curl -X POST "http://localhost:3000/v1:validateAddress?scenario=fix"
```

## Consumer Env Examples

No changes are required in `wilco-farmer-monorepo` if the consuming base URLs can be pointed at this service:

```env
UPS_ENDPOINT=http://localhost:3000
KOUNT_API_URL=http://localhost:3000
SEARCH_URL=http://localhost:3000
INTEGRATOR_URL=http://localhost:3000/integrator
```

For commerce route testing, point the commerce middleware/API base URL at this service so calls to `/commerce/*` resolve here.

For **load-test** mocks (same host as Unbxd + `GET /store/get-product`), see [LOAD_TEST_MOCK.md](./LOAD_TEST_MOCK.md). Example:

```env
UNBXD_COMMERCE_SEARCH_BASE_URL=https://your-mock.up.railway.app/<UNBXD_API_KEY>/<UNBXD_SITE_KEY>
ECOM_BACKEND_INTERNAL_URL=https://your-mock.up.railway.app
# Optional:
# UNBXD_MINIMAL_COMMERCE_RESPONSE=true
# FIXTURES_DIR=/path/to/get-product-json-overrides
```

## Railway

Railway provides `PORT`; the server reads it automatically. This repo includes `railway.toml` (Railpack builder, `/health` check). No Dockerfile required.

```sh
npm run build
npm start
```

Keep the checked-in `src/fixtures/*.json` files with the deployment because the compiled server loads those static fixtures at runtime.
