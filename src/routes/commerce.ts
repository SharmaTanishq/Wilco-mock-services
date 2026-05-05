import { Router } from 'express';
import { loadFixture } from '../fixtures/load-fixture';
import { registerRoute } from '../mock-registry';

export const commerceRouter = Router();

const addShippingMethodCart = loadFixture('commerce-add-shipping-method.json');
const validateBillingAddress = loadFixture('commerce-validate-billing-address.json');
const selectPaymentSessionCart = loadFixture('commerce-select-payment-session.json');

commerceRouter.post('/addShippingMethod', (_req, res) => {
  res.json(addShippingMethodCart);
});

commerceRouter.post('/validateBillingAddress', (_req, res) => {
  res.json(validateBillingAddress);
});

commerceRouter.post('/selectPaymentSession', (_req, res) => {
  res.json(selectPaymentSessionCart);
});

registerRoute({
  method: 'POST',
  path: '/commerce/addShippingMethod',
  description: 'Returns a captured cart after adding a UPS shipping method.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/validateBillingAddress',
  description: 'Returns a captured billing address validation result.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/selectPaymentSession',
  description:
    'Returns a captured checkout cart after payment session selection; does not mock the Authorize.Net iframe.',
});
