import { type Request, Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const authorizeNetRouter = Router();

const okMessages = {
  resultCode: 'Ok' as const,
  message: [{ code: 'I00001', text: 'Successful.' }],
};

function createTransactionCaptureResponse(transId = '60118533179') {
  return {
    createTransactionResponse: {
      messages: {
        resultCode: 'Ok',
        message: [{ code: 'I00001', text: 'This transaction has been approved.' }],
      },
      transactionResponse: {
        responseCode: '1',
        authCode: 'ABC123',
        transId,
        accountNumber: 'XXXX1111',
      },
    },
  };
}

function createTransactionVoidResponse(transId = '60118533179') {
  return createTransactionCaptureResponse(transId);
}

function createTransactionRefundResponse(transId = '60118533180') {
  return {
    createTransactionResponse: {
      messages: {
        resultCode: 'Ok',
        message: [{ code: 'I00001', text: 'Successful.' }],
      },
      transactionResponse: {
        responseCode: '1',
        transId,
        messages: {
          message: [{ code: '1', text: 'This transaction has been approved.' }],
        },
      },
    },
  };
}

/**
 * Authorize.Net JSON API: POST body top-level key selects operation (SDK ctrl pattern).
 * @see packages/wilco-svc-ecom-middleware/.../authorizenet.connector.ts
 */
function handleAuthorizeNetJsonApi(req: Request, res: { json: (b: unknown) => void }) {
  const body = req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {};
  const op = Object.keys(body)[0];
  const scenario = String(req.query.scenario ?? '').toLowerCase();

  switch (op) {
    case 'createCustomerProfileRequest': {
      if (scenario === 'duplicate') {
        return res.json({
          createCustomerProfileResponse: {
            messages: {
              resultCode: 'Error',
              message: [
                {
                  code: 'E00039',
                  text: 'A duplicate record with ID 905318804 already exists.',
                },
              ],
            },
          },
        });
      }
      return res.json({
        createCustomerProfileResponse: {
          messages: okMessages,
          customerProfileId: '905318804',
          customerPaymentProfileIdList: ['905372684'],
        },
      });
    }
    case 'createCustomerPaymentProfileRequest':
      return res.json({
        createCustomerPaymentProfileResponse: {
          messages: okMessages,
          customerPaymentProfileId: '905372684',
        },
      });
    case 'deleteCustomerPaymentProfileRequest':
      return res.json({
        deleteCustomerPaymentProfileResponse: {
          messages: okMessages,
        },
      });
    case 'createCustomerProfileFromTransactionRequest':
      return res.json({
        createCustomerProfileResponse: {
          messages: okMessages,
          customerProfileId: '905318804',
          customerPaymentProfileIdList: ['905372684'],
        },
      });
    case 'getHostedPaymentPageRequest':
      return res.json({
        getHostedPaymentPageResponse: {
          messages: okMessages,
          token: 'MOCK_HOSTED_PAYMENT_TOKEN_12345',
        },
      });
    case 'getCustomerProfileRequest':
      return res.json({
        getCustomerProfileResponse: {
          messages: okMessages,
          profile: {
            merchantCustomerId: null,
            description: null,
            email: 'test@example.com',
            customerProfileId: '905318804',
            paymentProfiles: [],
          },
        },
      });
    case 'getTransactionDetailsRequest': {
      const transId =
        String(
          (body.getTransactionDetailsRequest as { transId?: string } | undefined)?.transId ??
            '60118533178',
        );
      return res.json({
        getTransactionDetailsResponse: {
          messages: okMessages,
          transaction: {
            transId,
            transactionStatus: 'capturedPendingSettlement',
            responseCode: '1',
            authAmount: '10.00',
            settleAmount: '10.00',
            order: { description: 'cart_test_001' },
            payment: {
              creditCard: { cardNumber: 'XXXX1111' },
            },
          },
        },
      });
    }
    case 'createTransactionRequest': {
      const txReq = (body.createTransactionRequest as { transactionRequest?: { transactionType?: string } })
        ?.transactionRequest;
      const transactionType = String(txReq?.transactionType ?? 'authCaptureTransaction');
      if (transactionType === 'refundTransaction') {
        return res.json(createTransactionRefundResponse());
      }
      if (transactionType === 'voidTransaction') {
        return res.json(createTransactionVoidResponse());
      }
      return res.json(createTransactionCaptureResponse());
    }
    default: {
      // Back-compat: empty/unknown body → prior-auth capture style (middleware smoke)
      return res.json(createTransactionCaptureResponse('60123456789'));
    }
  }
}

authorizeNetRouter.post('/xml/v1/request.api', (req, res) => {
  handleAuthorizeNetJsonApi(req, res);
});

authorizeNetRouter.post('/rest/v1/transactions', (req, res) => {
  handleAuthorizeNetJsonApi(req, res);
});

authorizeNetRouter.post('/get-hosted-payment-page', (_req, res) => {
  res.json({
    token: 'MOCK_HOSTED_PAYMENT_TOKEN_12345',
  });
});

authorizeNetRouter.post('/create-customer-profile', (_req, res) => {
  res.json({
    customerProfileId: '905318804',
  });
});

authorizeNetRouter.post('/get-customer-payment-profile', (_req, res) => {
  res.json({
    profile: {
      customerProfileId: '905318804',
      paymentProfiles: [
        {
          customerPaymentProfileId: '905372684',
          payment: {
            creditCard: {
              cardNumber: 'XXXX1111',
              expirationDate: 'XXXX',
            },
          },
        },
      ],
    },
  });
});

authorizeNetRouter.post('/get-transaction-details', (_req, res) => {
  res.json({
    transactionId: '60123456789',
    status: 'capturedPendingSettlement',
    authAmount: 45.67,
    settleAmount: 45.67,
    responseCode: 1,
    cartId: 'cart_01JXYZ',
    payment: {
      creditCard: {
        cardNumber: 'XXXX1111',
        expirationDate: 'XXXX',
        cardType: 'visa',
      },
    },
    refunds: [],
  });
});

authorizeNetRouter.post('/capture', (_req, res) => {
  res.json({
    success: true,
    transactionId: '60123456789',
    status: 'capturedPendingSettlement',
  });
});

authorizeNetRouter.post('/refund', (_req, res) => {
  res.json({
    success: true,
    refundTransactionId: '70123456789',
    status: 'refunded',
  });
});

authorizeNetRouter.post('/void', (_req, res) => {
  res.json({
    success: true,
    transactionId: '60123456789',
    status: 'voided',
  });
});

[
  [
    'POST',
    '/authnet/xml/v1/request.api',
    'Authorize.Net JSON API: dispatches by request body root key (SDK-compatible *Response).',
  ],
  [
    'POST',
    '/authnet/rest/v1/transactions',
    'Same dispatcher as xml/v1/request.api for REST-style posts.',
  ],
  [
    'POST',
    '/authnet/get-hosted-payment-page',
    'Returns mock Authorize.Net hosted payment token.',
  ],
  ['POST', '/authnet/create-customer-profile', 'Returns mock customer profile ID.'],
  [
    'POST',
    '/authnet/get-customer-payment-profile',
    'Returns mock customer payment profile details.',
  ],
  [
    'POST',
    '/authnet/get-transaction-details',
    'Returns mock Authorize.Net transaction details.',
  ],
  ['POST', '/authnet/capture', 'Returns mock successful capture response.'],
  ['POST', '/authnet/refund', 'Returns mock successful refund response.'],
  ['POST', '/authnet/void', 'Returns mock successful void response.'],
].forEach(([method, path, description]) => registerRoute({ method, path, description }));
