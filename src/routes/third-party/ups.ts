import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const upsRouter = Router();

upsRouter.post('/security/v1/oauth/token', (_req, res) => {
  res.json({
    token_type: 'Bearer',
    issued_at: String(Date.now()),
    client_id: 'wilco-mock-client',
    access_token: 'mock-ups-access-token',
    expires_in: 3600,
    status: 'approved',
  });
});

upsRouter.post('/api/rating/:version/Rate', (_req, res) => {
  res.json({
    RateResponse: {
      Response: {
        ResponseStatus: {
          Code: '1',
          Description: 'Success',
        },
      },
      RatedShipment: [
        {
          Service: {
            Code: '03',
            Description: 'Ground',
          },
          TotalCharges: {
            CurrencyCode: 'USD',
            MonetaryValue: '11.08',
          },
        },
      ],
    },
  });
});

upsRouter.post('/api/addressvalidation/:version/:requestOption', (req, res) => {
  const scenario = String(req.query.scenario ?? 'exact');

  if (scenario === 'fix') {
    return res.json({
      XAVResponse: {
        Response: {
          ResponseStatus: {
            Code: '1',
            Description: 'Success',
          },
        },
        NoCandidatesIndicator: '',
      },
    });
  }

  if (scenario === 'inexact') {
    return res.json({
      XAVResponse: {
        Response: {
          ResponseStatus: {
            Code: '1',
            Description: 'Success',
          },
        },
        AmbiguousAddressIndicator: '',
        Candidate: [
          {
            AddressClassification: {
              Code: '2',
              Description: 'Residential',
            },
            AddressKeyFormat: {
              AddressLine: ['625 C St', '#4'],
              PoliticalDivision2: 'Oregon City',
              PoliticalDivision1: 'OR',
              PostcodePrimaryLow: '97045',
              PostcodeExtendedLow: '2210',
              CountryCode: 'US',
            },
          },
        ],
      },
    });
  }

  return res.json({
    XAVResponse: {
      Response: {
        ResponseStatus: {
          Code: '1',
          Description: 'Success',
        },
      },
      ValidAddressIndicator: '',
    },
  });
});

upsRouter.post('/api/shipments/:version/ship', (_req, res) => {
  res.json({
    ShipmentResponse: {
      Response: {
        ResponseStatus: {
          Code: '1',
          Description: 'Success',
        },
      },
      ShipmentResults: {
        ShipmentIdentificationNumber: '1ZMOCK000000000001',
        PackageResults: {
          TrackingNumber: '1ZMOCK000000000001',
          ShippingLabel: {
            ImageFormat: {
              Code: 'GIF',
            },
            GraphicImage: '',
          },
        },
      },
    },
  });
});

upsRouter.delete('/api/shipments/:version/void/cancel', (_req, res) => {
  res.type('text/plain').send('mock cancellation accepted');
});

[
  ['POST', '/security/v1/oauth/token', 'Returns a mock UPS OAuth token.'],
  ['POST', '/api/rating/:version/Rate', 'Returns a mock UPS Ground rate.'],
  [
    'POST',
    '/api/addressvalidation/:version/:requestOption',
    'Returns mock UPS XAV exact, inexact, or fix responses.',
  ],
  ['POST', '/api/shipments/:version/ship', 'Returns a mock UPS shipment.'],
  [
    'DELETE',
    '/api/shipments/:version/void/cancel',
    'Returns a mock UPS shipment cancellation acknowledgement.',
  ],
].forEach(([method, path, description]) => {
  registerRoute({ method, path, description });
  registerRoute({
    method,
    path: `/ups${path}`,
    description: `${description} (when UPS_ENDPOINT base ends with /ups).`,
  });
});
