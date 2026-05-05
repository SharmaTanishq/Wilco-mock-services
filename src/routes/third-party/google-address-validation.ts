import { Router } from 'express';
import { registerRoute } from '../../mock-registry';

export const googleAddressValidationRouter = Router();

googleAddressValidationRouter.post(/^\/v1:validateAddress$/, (req, res) => {
  const scenario = String(req.query.scenario ?? 'exact');

  if (scenario === 'fix') {
    return res.json({
      responseId: 'mock-google-address-response-fix',
      result: {
        verdict: {
          inputGranularity: 'PREMISE',
          validationGranularity: 'OTHER',
          geocodeGranularity: 'OTHER',
          possibleNextAction: 'FIX',
        },
        address: {
          formattedAddress: '',
          postalAddress: {
            regionCode: 'US',
          },
          missingComponentTypes: ['street_number'],
          unconfirmedComponentTypes: ['route'],
        },
      },
    });
  }

  return res.json({
    responseId: 'mock-google-address-response-exact',
    result: {
      verdict: {
        inputGranularity: 'PREMISE',
        validationGranularity: 'PREMISE',
        geocodeGranularity: 'PREMISE',
        possibleNextAction: 'ACCEPT',
      },
      address: {
        formattedAddress: '625 C St #4, Oregon City, OR 97045-2210, USA',
        postalAddress: {
          regionCode: 'US',
          languageCode: 'en',
          postalCode: '97045-2210',
          administrativeArea: 'OR',
          locality: 'Oregon City',
          addressLines: ['625 C St #4'],
        },
        addressComponents: [
          {
            componentName: { text: '625' },
            componentType: 'street_number',
            confirmationLevel: 'CONFIRMED',
          },
          {
            componentName: { text: 'C Street' },
            componentType: 'route',
            confirmationLevel: 'CONFIRMED',
          },
        ],
      },
    },
  });
});

registerRoute({
  method: 'POST',
  path: '/v1:validateAddress',
  description:
    'Returns mock Google Address Validation REST responses; use ?scenario=fix for a fix-required verdict.',
});
