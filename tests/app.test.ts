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
      .send({ ecomAddress: { address1: '625 C St' } })
      .expect(200);

    expect(response.body.possibleNextAction).toBe('ACCEPT');
    expect(response.body.exact[0].city).toBe('Oregon City');
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
