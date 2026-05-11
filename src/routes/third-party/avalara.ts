import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const avalaraRouter = Router();

function sendMockCreateTransaction(res: { json: (b: unknown) => void }) {
  res.json({
    id: 0,
    code: 'MOCK_INVOICE',
    companyId: 0,
    date: new Date().toISOString().slice(0, 10),
    paymentDate: new Date().toISOString().slice(0, 10),
    status: 'Saved',
    type: 'SalesOrder',
    batchCode: '',
    currencyCode: 'USD',
    exchangeRateCurrencyCode: 'USD',
    customerUsageType: '',
    entityUseCode: '',
    totalAmount: 100,
    totalExempt: 0,
    totalDiscount: 0,
    totalTax: 4.86,
    totalTaxable: 95.14,
    totalTaxCalculated: 4.86,
    lines: [],
    addresses: [],
    summary: [
      {
        jurisType: 'State',
        jurisName: 'OREGON',
        taxType: 'Sales',
        tax: 0,
        rate: 0,
        taxCalculated: 0,
      },
    ],
  });
}

/** Minimal CreateTransaction-style success used when middleware calls Avatax REST. */
avalaraRouter.post('/api/v2/transactions/create', (_req, res) => {
  sendMockCreateTransaction(res);
});

/** Company-scoped create URL used by some Avatax clients. */
avalaraRouter.post('/api/v2/companies/:companyId/transactions/create', (_req, res) => {
  sendMockCreateTransaction(res);
});

[
  [
    'POST',
    '/avalara/api/v2/transactions/create',
    'Returns a mock Avatax create-transaction payload (AVATAX_BASE_URL ending with /avalara).',
  ],
  [
    'POST',
    '/avalara/api/v2/companies/:companyId/transactions/create',
    'Same mock create-transaction payload for company-scoped Avatax URL.',
  ],
].forEach(([method, path, description]) => registerRoute({ method, path, description }));
