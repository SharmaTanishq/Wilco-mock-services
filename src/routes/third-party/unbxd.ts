import { Router, Request, Response } from 'express';
import { registerRoute } from '../../mock-registry';
import searchFixture from '../../fixtures/unbxd-search-response.json';
import commerceMinimalFixture from '../../fixtures/unbxd-commerce-search-minimal.json';
import autosuggestFixture from '../../fixtures/unbxd-autosuggest-response.json';

export const unbxdRouter = Router();

const commerceSearchFixture = () => {
  const v = process.env.UNBXD_MINIMAL_COMMERCE_RESPONSE?.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') {
    return commerceMinimalFixture;
  }
  return searchFixture;
};

const sendCommerceJson = (res: Response, body: unknown) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(body);
};

/**
 * Helper to get pagination parameters from request
 */
const getPaginationParams = (req: Request) => {
  const start = Math.max(0, parseInt(String(req.query.start ?? '0'), 10));
  const rows = Math.min(100, parseInt(String(req.query.rows ?? '50'), 10));
  return { start, rows };
};

/**
 * Helper to slice product results for pagination
 */
const paginateProducts = (products: any[], start: number, rows: number) => {
  return {
    products: products.slice(start, start + rows),
    start,
    rows,
    numberOfProducts: products.length,
  };
};

/**
 * GET /:apiKey/:siteKey/search
 * Search endpoint for keyword search queries
 * Query params: q, start, rows, fields, sort, filters, etc.
 */
unbxdRouter.get('/:apiKey/:siteKey/search', (req: Request, res: Response) => {
  if (process.env.DEBUG_UNBXD === '1') {
    console.log('unbxd mock commerce search', req.originalUrl, req.query);
  }
  const query = String(req.query.q ?? req.query.query ?? '');
  const { start, rows } = getPaginationParams(req);
  const fixture = commerceSearchFixture();

  const paginatedResponse = paginateProducts(fixture.response.products, start, rows);

  sendCommerceJson(res, {
    response: {
      numberOfProducts: paginatedResponse.numberOfProducts,
      products: paginatedResponse.products,
      start: paginatedResponse.start,
      rows: paginatedResponse.rows,
      pageSize: rows,
    },
    facets: fixture.facets,
    searchMetaData: {
      ...fixture.searchMetaData,
      queryParams: {
        q: query,
        start,
        rows,
      },
      status: 0,
    },
    redirect: fixture.redirect,
  });
});

/**
 * GET /:apiKey/:siteKey/category
 * Category browse endpoint
 * Query params: p (path filters), start, rows, sort, filters, etc.
 */
unbxdRouter.get('/:apiKey/:siteKey/category', (req: Request, res: Response) => {
  if (process.env.DEBUG_UNBXD === '1') {
    console.log('unbxd mock commerce category', req.originalUrl, req.query);
  }
  const categoryPath = String(req.query.p ?? '');
  const { start, rows } = getPaginationParams(req);
  const fixture = commerceSearchFixture();

  const paginatedResponse = paginateProducts(fixture.response.products, start, rows);

  sendCommerceJson(res, {
    response: {
      numberOfProducts: paginatedResponse.numberOfProducts,
      products: paginatedResponse.products,
      start: paginatedResponse.start,
      rows: paginatedResponse.rows,
      pageSize: rows,
    },
    facets: fixture.facets,
    searchMetaData: {
      ...fixture.searchMetaData,
      queryParams: {
        p: categoryPath,
        start,
        rows,
      },
      status: 0,
    },
    redirect: fixture.redirect,
  });
});

/**
 * GET /:apiKey/:siteKey/autosuggest
 * Autosuggest endpoint for search suggestions
 * Query params: q, keywordSuggestions.count, fields, version, etc.
 */
unbxdRouter.get('/:apiKey/:siteKey/autosuggest', (req: Request, res: Response) => {
  const query = String(req.query.q ?? '');
  const suggestionCount = Math.min(
    10,
    parseInt(String(req.query['keywordSuggestions.count'] ?? '6'), 10)
  );

  // Filter suggestions based on query
  const filteredSuggestions = autosuggestFixture.response.products
    .filter(
      (product) =>
        query === '' ||
        product.autosuggest.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, suggestionCount);

  res.json({
    response: {
      products: filteredSuggestions,
    },
    searchMetaData: {
      queryParams: {
        q: query,
        keywordSuggestions: {
          count: suggestionCount,
        },
      },
      status: 0,
    },
  });
});

/**
 * Backward compatibility: GET /autosuggest
 * Legacy autosuggest without API key/site key in path
 */
unbxdRouter.get('/autosuggest', (req: Request, res: Response) => {
  const query = String(req.query.q ?? '');

  res.json({
    searchMetaData: {
      queryParams: { q: query },
      status: 0,
    },
    response: {
      products: [
        {
          doctype: 'KEYWORD_SUGGESTION',
          autosuggest: query || 'dog food',
          prank: 100,
          uniqueId: 's1',
          sku: '1038510',
        },
      ],
    },
  });
});

/**
 * Backward compatibility: GET /search
 * Legacy search without API key/site key in path
 */
unbxdRouter.get('/search', (req: Request, res: Response) => {
  const query = String(req.query.q ?? req.query.query ?? '');
  const { start, rows } = getPaginationParams(req);

  const paginatedResponse = paginateProducts(
    searchFixture.response.products,
    start,
    rows
  );

  res.json({
    searchMetaData: {
      queryParams: { q: query, start, rows },
      status: 0,
    },
    response: {
      numberOfProducts: paginatedResponse.numberOfProducts,
      products: paginatedResponse.products,
      start: paginatedResponse.start,
      rows: paginatedResponse.rows,
    },
    facets: searchFixture.facets,
  });
});

unbxdRouter.post('/api/:siteKey/upload/catalog/full', (_req, res) => {
  res.json({
    status: 'ACCEPTED',
    message: 'Mock Unbxd catalog upload accepted.',
    uploadId: 'mock-unbxd-upload',
  });
});

registerRoute({
  method: 'GET',
  path: '/:apiKey/:siteKey/search',
  description: 'Search products by keyword with pagination support',
});

registerRoute({
  method: 'GET',
  path: '/:apiKey/:siteKey/category',
  description: 'Browse products by category with pagination support',
});

registerRoute({
  method: 'GET',
  path: '/:apiKey/:siteKey/autosuggest',
  description: 'Get search suggestions with filtering',
});

registerRoute({
  method: 'GET',
  path: '/autosuggest',
  description: 'Returns mock Unbxd autosuggest data (legacy)',
});

registerRoute({
  method: 'GET',
  path: '/search',
  description: 'Returns mock Unbxd search results (legacy)',
});

registerRoute({
  method: 'POST',
  path: '/api/:siteKey/upload/catalog/full',
  description: 'Accepts mock Unbxd catalog feed uploads.',
});
