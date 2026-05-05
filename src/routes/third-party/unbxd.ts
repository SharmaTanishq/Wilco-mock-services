import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const unbxdRouter = Router();

const product = {
  uniqueId: '1038510',
  title: 'Natural Balance, Fish & Sweet Potato - 24 lb',
  productUrl:
    'https://staging.farmstore-modern.us/product/miscellaneous/natural-balance-fish-sweet-potato-236',
  imageUrl: 'https://media.farmstore.com/20221114163530/1038506-510x577.jpg',
  price: 59.99,
  sku: '1038510',
};

unbxdRouter.get('/autosuggest', (req, res) => {
  const query = String(req.query.q ?? '');

  res.json({
    searchMetaData: {
      queryParams: { q: query },
      status: 0,
    },
    response: {
      products: [product],
      suggestions: [
        {
          autosuggest: query || 'dog food',
          count: 1,
        },
      ],
    },
  });
});

unbxdRouter.get('/search', (req, res) => {
  const query = String(req.query.q ?? req.query.query ?? '');

  res.json({
    searchMetaData: {
      queryParams: { q: query },
      status: 0,
    },
    response: {
      numberOfProducts: 1,
      products: [product],
    },
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
  path: '/autosuggest',
  description: 'Returns mock Unbxd autosuggest data.',
});

registerRoute({
  method: 'GET',
  path: '/search',
  description: 'Returns mock Unbxd search results.',
});

registerRoute({
  method: 'POST',
  path: '/api/:siteKey/upload/catalog/full',
  description: 'Accepts mock Unbxd catalog feed uploads.',
});
