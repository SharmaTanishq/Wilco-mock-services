import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const kountRouter = Router();

kountRouter.post('/v1/token', (_req, res) => {
  res.json({
    access_token: 'mock_kount_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
  });
});

kountRouter.post('/commerce/v2/orders', (req, res) => {
  const merchantOrderId = String(
    req.body?.merchantOrderId ?? req.body?.order?.merchantOrderId ?? '',
  );
  const suffix = merchantOrderId.slice(-1).toUpperCase();
  const decision =
    suffix === 'R' ? 'REVIEW' : suffix === 'D' ? 'DECLINE' : 'APPROVE';
  const omniscore = decision === 'APPROVE' ? 12 : decision === 'REVIEW' ? 64 : 95;
  const policy =
    decision === 'APPROVE'
      ? 'Mock policy approve'
      : decision === 'REVIEW'
        ? 'Mock policy review'
        : 'Mock policy decline';

  res.json({
    order: {
      riskInquiry: {
        decision,
        omniscore,
        segmentExecuted: {
          policiesExecuted: [{ name: policy }],
        },
      },
    },
    data: {
      order: {
        riskInquiry: {
          decision,
          score: omniscore,
          segmentExecuted: {
            policiesExecuted: [{ name: policy }],
          },
          warnings: [],
          rulesTriggered: [],
          transactionId: `mock-kount-${decision.toLowerCase()}`,
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
    description: 'Returns mock Kount risk inquiry decision by merchantOrderId suffix.',
  },
].forEach((route) => {
  registerRoute(route);
  registerRoute({
    ...route,
    path: `/kount${route.path}`,
    description: `${route.description} (when KOUNT_API_URL base ends with /kount).`,
  });
});
