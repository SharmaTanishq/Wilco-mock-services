import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const kountRouter = Router();

kountRouter.post('/v1/token', (_req, res) => {
  res.json({
    access_token: 'mock-kount-access-token',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'k1_integration_api',
  });
});

kountRouter.post('/commerce/v2/orders', (_req, res) => {
  res.json({
    data: {
      order: {
        riskInquiry: {
          decision: 'APPROVE',
          score: 12,
          transactionId: 'mock-kount-transaction',
          warnings: [],
          rulesTriggered: [],
        },
      },
    },
  });
});

[
  {
    method: 'POST',
    path: '/v1/token',
    description: 'Returns a mock Kount bearer token.',
  },
  {
    method: 'POST',
    path: '/commerce/v2/orders',
    description: 'Returns a mock Kount risk inquiry approval.',
  },
].forEach((route) => {
  registerRoute(route);
  registerRoute({
    ...route,
    path: `/kount${route.path}`,
    description: `${route.description} (when KOUNT_API_URL base ends with /kount).`,
  });
});
