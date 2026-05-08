import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();

describe('Wilco mock service', () => {
  it('reports health', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('lists registered mock routes', async () => {
    const response = await request(app).get('/__mock/routes').expect(200);

    expect(response.body.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/commerce/addShippingMethod' }),
        expect.objectContaining({ path: '/commerce/validateBillingAddress' }),
        expect.objectContaining({ path: '/commerce/selectPaymentSession' }),
        expect.objectContaining({ path: '/commerce/completeCart' }),
        expect.objectContaining({ path: '/commerce/updatePaymentSession' }),
        expect.objectContaining({ path: '/commerce/createPaymentProfile' }),
        expect.objectContaining({ path: '/commerce/getCart' }),
        expect.objectContaining({ path: '/commerce/updateCart' }),
        expect.objectContaining({ path: '/commerce/addItem' }),
        expect.objectContaining({ path: '/commerce/getReviews' }),
        expect.objectContaining({ path: '/commerce/provideValidationFeedback' }),
        expect.objectContaining({ path: '/commerce/updateCustomer' }),
        expect.objectContaining({ path: '/commerce/getAcceptPaymentPage' }),
      ]),
    );
  });

  it('returns the captured addShippingMethod cart fixture', async () => {
    const response = await request(app)
      .post('/commerce/addShippingMethod')
      .send({ id: 'cart_123', option_id: 'so_123' })
      .expect(200);

    expect(response.body.id).toBe('cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH');
    expect(response.body.shippingMethods[0].shipping_option.provider_id).toBe(
      'ups-fulfillment',
    );
  });

  it('returns the captured validateBillingAddress fixture', async () => {
    const response = await request(app)
      .post('/commerce/validateBillingAddress')
      .send([
        {
          ecomAddress: {
            address1: '3031 Tisch Way',
            address2: '31',
            city: 'San Jose',
            state: 'CA',
            zip: '95128',
            firstName: 'Aamir',
            lastName: 'Bohra',
            phone: '(065) 555-5555',
            id: 'addr_01KK98XPTK4QNW4385Y1NEK223',
          },
        },
      ])
      .expect(200);

    expect(response.body.possibleNextAction).toBe('ACCEPT');
    expect(response.body.exact[0].city).toBe('San Jose');
    expect(response.body.exact[0].address1).toBe('3031 Tisch Way #31');
    expect(response.body.exact[0].zip).toBe('95128-2541');
  });

  it('returns the captured selectPaymentSession cart fixture', async () => {
    const response = await request(app)
      .post('/commerce/selectPaymentSession')
      .send({
        cartId: 'cart_123',
        providerId: 'wilco-acceptjs-payment',
        kountSessionId: 'mock-kount-session',
      })
      .expect(200);

    expect(response.body.paymentSession.status).toBe('authorized');
    expect(response.body.taxTotal).toBe(4.86);
  });

  it('returns getCart, payment page, profile, and updated payment session responses', async () => {
    const cartId = 'cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH';

    const cart = await request(app).post('/commerce/getCart').send({ cartId }).expect(200);
    expect(cart.body.id).toBe(cartId);

    const page = await request(app)
      .post('/commerce/getAcceptPaymentPage')
      .send({ cartId })
      .expect(200);
    expect(page.body.cartId).toBe(cartId);
    expect(page.body.paymentPageUrl).toContain('accept.authorize.net');

    const profile = await request(app)
      .post('/commerce/createPaymentProfile')
      .send({ cartId, customerId: 'cus_mock_123' })
      .expect(200);
    expect(profile.body.status).toBe('created');

    const updatedSession = await request(app)
      .post('/commerce/updatePaymentSession')
      .send({ cartId, providerId: 'wilco-acceptjs-payment', data: { transId: 'mock-123' } })
      .expect(200);
    expect(updatedSession.body.paymentSession.status).toBe('authorized');
  });

  it('returns a successful completeCart response for the known cart ID', async () => {
    const response = await request(app)
      .post('/commerce/completeCart')
      .send({ cartId: 'cart_01KR16Q0FEVDERKS3CCGBYPAKC' })
      .expect(200);

    expect(response.body.type).toBe('order');
    expect(response.body.result.orderNumber).toBe('E-260507-1056');
  });

  it('returns the captured cart payload for the legacy completeCart ID', async () => {
    const response = await request(app)
      .post('/commerce/completeCart')
      .send({ cartId: 'cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH' })
      .expect(200);

    expect(response.body.id).toBe('cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH');
    expect(response.body.shippingTotal).toBe(11.08);
  });

  it('returns a deterministic failed completeCart response', async () => {
    const response = await request(app)
      .post('/commerce/completeCart?scenario=fail')
      .send({ cartId: 'cart_01KR16Q0FEVDERKS3CCGBYPAKC' })
      .expect(402);

    expect(response.body.type).toBe('order_error');
    expect(response.body.error.code).toBe('PAYMENT_DECLINED');
  });

  it('returns a deterministic updatePaymentSession failure when requested', async () => {
    const failed = await request(app)
      .post('/commerce/updatePaymentSession?scenario=fail')
      .send({ cartId: 'cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH' })
      .expect(402);

    expect(failed.body.error.code).toBe('PAYMENT_DECLINED');
  });

  it('updates cart and keeps firstName as Trupti in addresses', async () => {
    const cartId = 'cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH';
    const updated = await request(app)
      .post('/commerce/updateCart')
      .send([
        {
          cartId,
          cart: {
            billingAddress: {
              address1: '3031 Tisch Way',
              city: 'San Jose',
              state: 'CA',
              zip: '95128',
            },
            shippingAddress: {
              address1: '3031 Tisch Way',
              city: 'San Jose',
              state: 'CA',
              zip: '95128',
            },
          },
        },
      ])
      .expect(200);

    expect(updated.body.id).toBe(cartId);
    expect(updated.body.billingAddress.firstName).toBe('Trupti');
    expect(updated.body.shippingAddress.firstName).toBe('Trupti');
  });

  it('adds item using addItem payload style', async () => {
    const response = await request(app)
      .post('/commerce/addItem')
      .send([
        {
          cartId: 'cart_01KR1ECFCD7AAE59GT5E2QMWBK',
          variantId: 'variant_01KEGD3Q9M1GJQFCV4EF426CS9',
          quantity: 1,
          title: 'Five Point, Premium Universal Trans-Hydraulic Fluid, 5 gal ',
          metadata: {
            image: 'https://media.farmstore.com/20250530120139/1388740-510x685.jpg',
            retailPrice: 69.99,
            salePrice: 0,
            sku: '1388740',
            fulfillment: 'Pickup',
            storeNumber: 1,
            storeName: 'McMinnville',
          },
        },
      ])
      .expect(200);

    expect(response.body.id).toBe('cart_01KR1ECFCD7AAE59GT5E2QMWBK');
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].variantId).toBe('variant_01KEGD3Q9M1GJQFCV4EF426CS9');
  });

  it('returns empty reviews payload for getReviews', async () => {
    const response = await request(app)
      .post('/commerce/getReviews')
      .send([{ id: 46481, pageNumber: 0, pageSize: 10, sortBy: 'Newest' }])
      .expect(200);

    expect(response.body).toEqual({
      pageData: null,
      metadata: null,
      reviews: [],
    });
  });

  it('accepts provideValidationFeedback payload and returns empty object', async () => {
    const response = await request(app)
      .post('/commerce/provideValidationFeedback')
      .send([
        {
          responseId: '315ab9fe-7814-470d-aca6-cbdf6c31f915',
          conclusion: 'VALIDATED_VERSION_USED',
        },
      ])
      .expect(200);

    expect(response.body).toEqual({});
  });

  it('updates customer using billing_address payload shape', async () => {
    const response = await request(app)
      .post('/commerce/updateCustomer')
      .send([
        {
          billing_address: {
            address1: '3031 Tisch Way #31',
            address2: '31',
            city: 'San Jose',
            state: 'CA',
            zip: '95128-2541',
            id: 'addr_01KK98XPTK4QNW4385Y1NEK223',
            firstName: 'Aamir',
            lastName: 'Bohra',
            country: 'US',
            phone: '(065) 555-5555',
            preferred: false,
            shippingNote: '',
            validated: true,
          },
        },
      ])
      .expect(200);

    expect(response.body.id).toBe('cus_01KK97J5F0X7W1QRMEHRJYK5XM');
    expect(response.body.billingAddress.address1).toBe('3031 Tisch Way #31');
    expect(response.body.billingAddress.city).toBe('San Jose');
  });

  it('returns mock UPS OAuth and address validation responses', async () => {
    const token = await request(app)
      .post('/security/v1/oauth/token')
      .type('form')
      .send({ grant_type: 'client_credentials' })
      .expect(200);

    expect(token.body.access_token).toBe('mock-ups-access-token');

    const validation = await request(app)
      .post('/api/addressvalidation/v2/3?scenario=inexact')
      .send({})
      .expect(200);

    expect(validation.body.XAVResponse.Candidate[0].AddressKeyFormat.CountryCode).toBe(
      'US',
    );
  });

  it('returns mock provider responses for simple env-driven services', async () => {
    const google = await request(app).post('/v1:validateAddress').send({}).expect(200);
    const kount = await request(app).post('/commerce/v2/orders').send({}).expect(200);
    const unbxd = await request(app).get('/autosuggest?q=dog').expect(200);

    expect(google.body.result.verdict.possibleNextAction).toBe('ACCEPT');
    expect(kount.body.data.order.riskInquiry.decision).toBe('APPROVE');
    expect(unbxd.body.response.products[0].sku).toBe('1038510');
  });
});
