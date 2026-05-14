import { Router, Request, Response } from 'express';
import searchFixture from '../../fixtures/unbxd-search-response.json';
import commerceMinimalFixture from '../../fixtures/unbxd-commerce-search-minimal.json';
import { registerRoute } from '../../mock-registry';
import { buildMedusaStoreProductFromUnbxd, type UnbxdSearchProduct } from '../../lib/unbxd-to-medusa-store-product';
import { loadGetProductFixtureOverride } from '../../lib/medusa-fixture-override';

/** Nested under `app.use(..., medusaStoreRouter)` at `/store`. */
const storeRouter = Router();

function allUnbxdCatalogProducts(): unknown[] {
  return [...searchFixture.response.products, ...commerceMinimalFixture.response.products];
}

function findUnbxdProductByDisplayId(id: string): unknown | undefined {
  return allUnbxdCatalogProducts().find((p) => String((p as { uniqueId: string }).uniqueId) === id);
}

storeRouter.get('/get-product', (req: Request, res: Response) => {
  const id = String(req.query.id ?? '').trim();
  if (!id) {
    res.status(400).json({ type: 'invalid_data', message: 'Missing id query parameter' });
    return;
  }

  const fixturesDir = process.env.FIXTURES_DIR?.trim();
  if (fixturesDir) {
    const override = loadGetProductFixtureOverride(fixturesDir, id);
    if (override) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.json(override);
      return;
    }
  }

  const hit = findUnbxdProductByDisplayId(id);
  if (!hit) {
    res.status(404).json({ type: 'not_found', message: `Product not found for id=${id}` });
    return;
  }

  const product = buildMedusaStoreProductFromUnbxd(hit as UnbxdSearchProduct);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({ product });
});

storeRouter.use((req: Request, res: Response) => {
  res.status(501).json({
    error: 'store_route_not_mocked',
    message: `This load-test mock only implements GET /store/get-product. Received ${req.method} ${req.originalUrl}.`,
    hint: 'Use a reverse proxy so only /store/get-product hits this service, or add routes to src/routes/store/medusa-store.ts.',
  });
});

export const medusaStoreRouter = Router();
medusaStoreRouter.use('/store', storeRouter);

registerRoute({
  method: 'GET',
  path: '/store/get-product',
  description: 'Medusa-shaped store product for PDP (matches Unbxd search uniqueIds; optional FIXTURES_DIR override)',
});

registerRoute({
  method: '*',
  path: '/store/*',
  description: 'Unimplemented /store/* returns 501 JSON (stub template for narrow load tests)',
});
