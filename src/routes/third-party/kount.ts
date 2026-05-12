import { Router } from 'express';
import type { Request, Response } from 'express';
import { registerRoute } from '../../mock-registry';

/** OmniAPI `_getBearerToken` reads only access_token, expires_in from JSON body. */
function sendKountOAuthToken(_req: Request, res: Response) {
  res.json({
    access_token: 'mock-kount-access-token',
    expires_in: 3600,
    token_type: 'Bearer',
  });
}

/**
 * OmniAPI maps AntiFraud risk inquiry and reads HTTP body as axios `response.data`:
 * `response.data.order.riskInquiry` → decision APPROVE | DECLINE | REVIEW
 */
function sendKountRiskInquiry(req: Request, res: Response) {
  const merchantOrderId = String(
    req.body?.merchantOrderId ?? req.body?.order?.merchantOrderId ?? '',
  );
  const suffix = merchantOrderId.slice(-1).toUpperCase();

  let decision: 'APPROVE' | 'REVIEW' | 'DECLINE' = 'APPROVE';
  let omniscore = 780;
  let policyName = 'mock-load-test-approve';

  if (suffix === 'R') {
    decision = 'REVIEW';
    omniscore = 450;
    policyName = 'mock-review';
  } else if (suffix === 'D') {
    decision = 'DECLINE';
    omniscore = 210;
    policyName = 'mock-decline';
  }

  res.json({
    order: {
      riskInquiry: {
        decision,
        omniscore,
        segmentExecuted: {
          policiesExecuted: [{ name: policyName }],
        },
      },
    },
  });
}

/** Mounted at `/kount` and root — risk inquiry + token when base is KOUNT_API_URL. */
export const kountRouter = Router();

kountRouter.post('/v1/token', sendKountOAuthToken);
kountRouter.post('/commerce/v2/orders', sendKountRiskInquiry);

/**
 * Mounted at `/kount-oauth` — token only.
 * Use when `KOUNT_ISSUER=https://.../kount-oauth` (OmniAPI: POST {KOUNT_ISSUER}/v1/token).
 */
export const kountOAuthRouter = Router();

kountOAuthRouter.post('/v1/token', sendKountOAuthToken);

[
  {
    method: 'POST',
    path: '/v1/token',
    description: 'OmniAPI Kount OAuth — returns access_token for client_credentials.',
  },
  {
    method: 'POST',
    path: '/commerce/v2/orders',
    description:
      'OmniAPI Kount risk inquiry — order.riskInquiry.decision; suffix A/R/D on merchantOrderId.',
  },
].forEach((route) => {
  registerRoute(route);
  registerRoute({
    ...route,
    path: `/kount${route.path}`,
    description: `${route.description} (prefixed when KOUNT_API_URL ends with /kount).`,
  });
});

registerRoute({
  method: 'POST',
  path: '/kount-oauth/v1/token',
  description:
    'OmniAPI Kount OAuth when KOUNT_ISSUER base ends with /kount-oauth (same token as /kount/v1/token).',
});
