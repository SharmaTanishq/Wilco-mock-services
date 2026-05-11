import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const avalaraRouter = Router();

avalaraRouter.post('/transactions/create-or-adjust', (req, res) => {
  const lines = Array.isArray(req.body?.lines) ? req.body.lines : [];
  const nonTaxable = lines.length > 0 && lines.every((line: { taxCode?: unknown }) => line?.taxCode === 'NT');

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
});

[
  [
    'POST',
    '/avalara/transactions/create-or-adjust',
    'Returns mock Avatax summary tax payload; supports non-taxable NT scenario.',
  ],
].forEach(([method, path, description]) => registerRoute({ method, path, description }));
