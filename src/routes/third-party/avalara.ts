import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const avalaraRouter = Router();

function sendAvalaraSummary(req: { body?: any }, res: { json: (b: unknown) => void }) {
  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const nonTaxable =
    lines.length > 0 &&
    lines.every((line: { taxCode?: unknown }) => line?.taxCode === 'NT');

  if (nonTaxable) {
    return res.json({
      id: 1000002,
      code: 'mock-cart-code-nt',
      summary: [
        {
          jurisdictionType: 'STATE',
          taxCalculated: 0,
        },
      ],
    });
  }

  return res.json({
    id: 1000001,
    code: 'mock-cart-code',
    status: 'Saved',
    totalTax: 2.3,
    totalTaxCalculated: 2.3,
    summary: [
      {
        jurisdictionType: 'STATE',
        taxCalculated: 1.87,
      },
      {
        jurisdictionType: 'COUNTY',
        taxCalculated: 0.43,
      },
    ],
  });
}

avalaraRouter.post('/transactions/create-or-adjust', (req, res) => {
  sendAvalaraSummary(req, res);
});
avalaraRouter.post('/api/v2/transactions/create', (req, res) => {
  sendAvalaraSummary(req, res);
});
avalaraRouter.post('/api/v2/companies/:companyId/transactions/create', (req, res) => {
  sendAvalaraSummary(req, res);
});

[
  [
    'POST',
    '/avalara/transactions/create-or-adjust',
    'Returns mock Avatax summary tax payload; supports non-taxable NT scenario.',
  ],
  [
    'POST',
    '/avalara/api/v2/transactions/create',
    'Legacy Avatax create transaction route supported for staging compatibility.',
  ],
  [
    'POST',
    '/avalara/api/v2/companies/:companyId/transactions/create',
    'Legacy company-scoped Avatax create route supported for staging compatibility.',
  ],
].forEach(([method, path, description]) => registerRoute({ method, path, description }));
