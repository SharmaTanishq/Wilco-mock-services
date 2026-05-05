# Wilco Mock Services

Standalone TypeScript + Express mock API for Wilco development environments. The service returns deterministic static responses so local/staging workflows can avoid calling cost-bearing third-party APIs.

## Run Locally

```sh
npm install
npm run dev
```

The server defaults to `http://localhost:3000`.

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

## Railway

Railway provides `PORT`; the server reads it automatically.

```sh
npm run build
npm start
```

Keep the checked-in `src/fixtures/*.json` files with the deployment because the compiled server loads those static fixtures at runtime.
