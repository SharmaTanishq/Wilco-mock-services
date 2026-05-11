import { type Request, Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const authorizeNetRouter = Router();

/** JSON shape commonly returned by Authorize.Net APIs for an approved sale/auth. */
function sendApprovedTransaction(
  req: Request,
  res: { json: (b: unknown) => void },
) {
  const amount =
    req.body?.createTransactionRequest?.transactionRequest?.amount ??
    req.body?.transactionRequest?.amount ??
    req.body?.amount ??
    '24.99';
  const orderDescription =
    req.body?.createTransactionRequest?.transactionRequest?.order?.description ??
    req.body?.transactionRequest?.order?.description ??
    req.body?.orderDescription ??
    'mock-cart';
  res.json({
    messages: {
      resultCode: 'Ok',
      message: [{ code: 'I00001', text: 'Successful.' }],
    },
    transactionResponse: {
      responseCode: '1',
      authCode: 'MOCKAUTH',
      avsResultCode: 'Y',
      cvvResultCode: 'P',
      cavvResultCode: '2',
      transId: '60123456789',
      transactionId: '60123456789',
      refTransID: '',
      transHash: 'mock-hash',
      testRequest: '0',
      accountNumber: 'XXXX1111',
      accountType: 'Visa',
      authorization: 'MDQJE3',
      totalAmount: String(amount),
      dateTime: '5/11/2026 8:52:38 AM',
      orderDescription,
      billTo: {
        firstName: 'Aamir',
        lastName: 'Bohra',
        address: '3031 Tisch Way #31',
        city: 'San Jose',
        state: 'CA',
        zip: '95128-2541',
        country: 'US',
      },
      messages: [{ code: '1', description: 'This transaction has been approved.' }],
    },
  });
}

/** Classic JSON/XML gateway endpoint name used by many SDKs. */
authorizeNetRouter.post('/xml/v1/request.api', (_req, res) => {
  sendApprovedTransaction(_req, res);
});

/** REST-style transaction create (sandbox/production host path pattern). */
authorizeNetRouter.post('/rest/v1/transactions', (_req, res) => {
  sendApprovedTransaction(_req, res);
});

[
  [
    'POST',
    '/authnet/xml/v1/request.api',
    'Returns a mock approved Authorize.Net transactionResponse (AUTHNET_BASE_URL ending with /authnet).',
  ],
  [
    'POST',
    '/authnet/rest/v1/transactions',
    'Same mock approved response for REST-style Authorize.Net posts.',
  ],
].forEach(([method, path, description]) => registerRoute({ method, path, description }));
