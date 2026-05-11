import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const upsRouter = Router();

upsRouter.post('/security/v1/oauth/token', (_req, res) => {
  res.json({
    access_token: 'mock_ups_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
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

upsRouter.post('/api/addressvalidation/v2/3', (req, res) => {
  const postcode = String(
    req.body?.XAVRequest?.AddressKeyFormat?.PostcodePrimaryLow ?? '',
  );
  const suffix = postcode.slice(-2);

  if (suffix === '33') {
    return res.json({
      XAVResponse: {
        Response: {
          ResponseStatus: {
            Code: '1',
            Description: 'Success',
          },
        },
        NoCandidatesIndicator: 'Y',
      },
    });
  }

  if (suffix === '22') {
    return res.json({
      XAVResponse: {
        Response: {
          ResponseStatus: {
            Code: '1',
            Description: 'Success',
          },
        },
        AmbiguousAddressIndicator: 'Y',
        Candidate: [
          {
            AddressClassification: {
              Code: '1',
              Description: 'Commercial',
            },
            AddressKeyFormat: {
              AddressLine: ['123 MAIN ST'],
              PoliticalDivision2: 'MCMINNVILLE',
              PoliticalDivision1: 'OR',
              PostcodePrimaryLow: '97128',
              PostcodeExtendedLow: '1234',
              CountryCode: 'US',
            },
          },
          {
            AddressClassification: {
              Code: '2',
              Description: 'Residential',
            },
            AddressKeyFormat: {
              AddressLine: ['123 MAIN STREET'],
              PoliticalDivision2: 'MCMINNVILLE',
              PoliticalDivision1: 'OR',
              PostcodePrimaryLow: '97128',
              PostcodeExtendedLow: '1234',
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
      ValidAddressIndicator: 'Y',
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
    '/api/addressvalidation/v2/3',
    'Returns mock UPS XAV response chosen by PostcodePrimaryLow suffix.',
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
