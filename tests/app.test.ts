import request from 'supertest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';

const app = createApp();

describe('Wilco mock service', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('reports health', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('reports UPS base path health', async () => {
    const response = await request(app).get('/ups').expect(200);

    expect(response.body).toEqual({
      provider: 'ups',
      status: 'ok',
      message: 'Use /ups/* UPS mock routes.',
    });
  });

  it('reports Kount, Avalara, and Authorize.Net base path health', async () => {
    const kount = await request(app).get('/kount').expect(200);
    expect(kount.body).toEqual({
      provider: 'kount',
      status: 'ok',
      message: 'Use /kount/* Kount mock routes.',
    });

    const avalara = await request(app).get('/avalara').expect(200);
    expect(avalara.body).toEqual({
      provider: 'avalara',
      status: 'ok',
      message: 'Use /avalara/* Avatax mock routes.',
    });

    const authnet = await request(app).get('/authnet').expect(200);
    expect(authnet.body).toEqual({
      provider: 'authnet',
      status: 'ok',
      message: 'Use /authnet/* Authorize.Net mock routes.',
    });
  });

  it('lists registered mock routes', async () => {
    const response = await request(app).get('/__mock/routes').expect(200);

    expect(response.body.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/avalara/transactions/create-or-adjust' }),
        expect.objectContaining({ path: '/authnet/xml/v1/request.api' }),
        expect.objectContaining({ path: '/authnet/get-transaction-details' }),
        expect.objectContaining({ path: '/ups/security/v1/oauth/token' }),
        expect.objectContaining({ path: '/kount/v1/token' }),
        expect.objectContaining({ path: '/kount-oauth/v1/token' }),
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

  it('returns CONFIRM_ADD_SUBPREMISES when address2 repeats address1', async () => {
    const response = await request(app)
      .post('/commerce/validateBillingAddress')
      .send([
        {
          ecomAddress: {
            address1: '3031 tisch way',
            address2: '3031 tisch way',
            city: 'San Jose',
            state: 'CA',
            zip: '95128',
            firstName: 'Aamir Bohra',
            lastName: 'Bohra',
            phone: '(877) 888-8888',
            id: null,
            shippingNote: null,
          },
        },
      ])
      .expect(200);

    expect(response.body.possibleNextAction).toBe('CONFIRM_ADD_SUBPREMISES');
    expect(response.body.exact[0].address1).toBe('3031 Tisch Way');
    expect(response.body.exact[0].address2).toBe('3031 tisch way');
    expect(response.body.exact[0].id).toBeNull();
    expect(response.body.exact[0].shippingNote).toBeNull();
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

    expect(token.body.access_token).toBe('mock_ups_access_token');

    const validation = await request(app)
      .post('/api/addressvalidation/v2/3')
      .send({ XAVRequest: { AddressKeyFormat: { PostcodePrimaryLow: '97122' } } })
      .expect(200);

    expect(validation.body.XAVResponse.AmbiguousAddressIndicator).toBe('Y');
    expect(validation.body.XAVResponse.Candidate[0].AddressKeyFormat.CountryCode).toBe('US');
  });

  it('serves UPS and Kount mocks under /ups and /kount path prefixes', async () => {
    const upsToken = await request(app)
      .post('/ups/security/v1/oauth/token')
      .type('form')
      .send({ grant_type: 'client_credentials' })
      .expect(200);
    expect(upsToken.body.access_token).toBe('mock_ups_access_token');

    const kountOrder = await request(app)
      .post('/kount/commerce/v2/orders?riskInquiry=true')
      .send({ merchantOrderId: 'ORDER123A' })
      .expect(200);
    expect(kountOrder.body.order.riskInquiry.decision).toBe('APPROVE');
    expect(kountOrder.body.order.riskInquiry.omniscore).toBe(780);
    expect(kountOrder.body.order.riskInquiry.segmentExecuted.policiesExecuted[0].name).toBe(
      'mock-load-test-approve',
    );

    const kountToken = await request(app)
      .post('/kount/v1/token')
      .type('form')
      .send({ grant_type: 'client_credentials', scope: 'k1_integration_api' })
      .expect(200);
    expect(kountToken.body.access_token).toBe('mock-kount-access-token');
    expect(kountToken.body.expires_in).toBe(3600);

    const issuerToken = await request(app)
      .post('/kount-oauth/v1/token')
      .type('form')
      .send({ grant_type: 'client_credentials', scope: 'k1_integration_api' })
      .expect(200);
    expect(issuerToken.body).toEqual(kountToken.body);
  });

  it('returns mock Avatax and Authorize.Net responses under /avalara and /authnet', async () => {
    const tax = await request(app)
      .post('/avalara/transactions/create-or-adjust')
      .send({})
      .expect(200);
    expect(tax.body.summary[0].taxCalculated).toBe(1.87);
    expect(tax.body.summary[1].taxCalculated).toBe(0.43);

    const authXml = await request(app).post('/authnet/xml/v1/request.api').send({}).expect(200);
    expect(authXml.body.createTransactionResponse.messages.resultCode).toBe('Ok');
    expect(authXml.body.createTransactionResponse.transactionResponse.responseCode).toBe('1');
    expect(authXml.body.createTransactionResponse.transactionResponse.transId).toBe('60123456789');

    const authHosted = await request(app)
      .post('/authnet/xml/v1/request.api')
      .send({ getHostedPaymentPageRequest: { hostedPaymentSettings: {} } })
      .expect(200);
    expect(authHosted.body.getHostedPaymentPageResponse.token).toBe('MOCK_HOSTED_PAYMENT_TOKEN_12345');

    const authRest = await request(app).post('/authnet/rest/v1/transactions').send({}).expect(200);
    expect(authRest.body.createTransactionResponse.transactionResponse.transId).toBe('60123456789');

    const hostedPage = await request(app).post('/authnet/get-hosted-payment-page').send({}).expect(200);
    expect(hostedPage.body.token).toBe('MOCK_HOSTED_PAYMENT_TOKEN_12345');
  });

  it('returns mock provider responses for simple env-driven services', async () => {
    const google = await request(app).post('/v1:validateAddress').send({}).expect(200);
    const kount = await request(app).post('/commerce/v2/orders').send({}).expect(200);
    const unbxd = await request(app).get('/autosuggest?q=dog').expect(200);

    expect(google.body.result.verdict.possibleNextAction).toBe('ACCEPT');
    expect(kount.body.order.riskInquiry.decision).toBe('APPROVE');
    expect(unbxd.body.response.products[0].sku).toBe('1038510');
  });

  it('returns full Unbxd commerce facets by default for path-shaped search', async () => {
    const res = await request(app).get('/any-api-key/any-site-key/search?q=test').expect(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(Array.isArray(res.body.facets.text.list)).toBe(true);
    expect(res.body.facets.text.list.length).toBeGreaterThan(0);
    const brandFacet = res.body.facets.text.list.find(
      (f: { displayName?: string }) => f.displayName === 'Brands',
    );
    expect(brandFacet.facetName).toBe('brand_uFilter');
    expect(Array.isArray(brandFacet.values)).toBe(true);
    expect(typeof brandFacet.values[0]).toBe('string');
    expect(typeof brandFacet.values[1]).toBe('number');
    const catFacet = res.body.facets.multilevel.list[0];
    expect(catFacet.displayName).toBe('Category');
    const catNames = catFacet.values.map((v: { name: string }) => v.name);
    expect(catNames).toContain('1068');
    expect(catNames).toContain('174');
    expect(catFacet.values.length).toBeGreaterThanOrEqual(6);
    expect(res.body.response.numberOfProducts).toBe(102);
    expect(res.body.response.products).toHaveLength(22);
  });

  it('returns minimal commerce JSON when UNBXD_MINIMAL_COMMERCE_RESPONSE is enabled', async () => {
    vi.stubEnv('UNBXD_MINIMAL_COMMERCE_RESPONSE', 'true');
    const minimalApp = createApp();

    const search = await request(minimalApp)
      .get('/myApiKey/mySiteKey/search?q=ignored&rows=50')
      .expect(200);
    expect(search.body.facets.text.list.length).toBeGreaterThan(0);
    expect(search.body.facets.multilevel.list.length).toBeGreaterThan(0);
    expect(search.body.response.numberOfProducts).toBe(1);
    expect(search.body.response.products).toHaveLength(1);
    expect(search.body.response.products[0].variants).toHaveLength(1);
    expect(search.body.response.products[0].uniqueId).toBe('900001');

    const category = await request(minimalApp)
      .get('/myApiKey/mySiteKey/category?p=ignored')
      .expect(200);
    expect(category.body.response.products[0].uniqueId).toBe('900001');
  });

  it('returns Medusa-shaped get-product keyed by Unbxd uniqueId (display id)', async () => {
    const r = await request(app).get('/store/get-product?id=4584').expect(200);
    expect(r.body.product).toBeDefined();
    expect(r.body.product.status).toBe('published');
    expect(r.body.product.variants.length).toBeGreaterThan(0);
    expect(r.body.product.variants.every((v: { status: string }) => v.status === 'published')).toBe(
      true,
    );
    expect(r.body.product.id).toBe('prod_01K06D46MAWFMT5AA21AQ6118P');
    expect(r.body.product.external_id).toBe('4584');
    expect(r.body.product.metadata.display_id).toBe('4584');
    expect(r.body.product.title).toContain('Swheat Scoop');
    expect(r.body.product.notSoldOnline).toBe(false);
  });

  it('maps excludedStates from Unbxd hit on get-product', async () => {
    const r = await request(app).get('/store/get-product?id=6660').expect(200);
    expect(r.body.product.notSoldOnline).toBe(false);
    expect(r.body.product.pickupOnly).toBe(false);
    expect(r.body.product.excludedStates).toEqual(['CA']);
  });

  it('returns get-product for fencing hardware cloth (display id 9498)', async () => {
    const r = await request(app).get('/store/get-product?id=9498').expect(200);
    expect(r.body.product.id).toBe('prod_01K06D4K7N4C76TYRD2GJVA1T3');
    expect(r.body.product.external_id).toBe('9498');
    expect(r.body.product.title).toContain('Hardware Cloth');
    expect(r.body.product.excludedStates).toEqual(['CA']);
  });

  it('maps pickupOnly from Unbxd hit (barbed wire)', async () => {
    const r = await request(app).get('/store/get-product?id=9372').expect(200);
    expect(r.body.product.pickupOnly).toBe(true);
    expect(r.body.product.title).toContain('Barbed Wire');
  });

  it('returns 404 for unknown get-product id', async () => {
    await request(app).get('/store/get-product?id=999999').expect(404);
  });

  it('returns 501 for unimplemented /store routes', async () => {
    const r = await request(app).get('/store/regions').expect(501);
    expect(r.body.error).toBe('store_route_not_mocked');
  });

  it('returns get-product for minimal fixture display id 900001', async () => {
    const r = await request(app).get('/store/get-product?id=900001').expect(200);
    expect(r.body.product.external_id).toBe('900001');
    expect(r.body.product.variants[0].status).toBe('published');
  });

  it('uses FIXTURES_DIR get-product-<id>.json when present', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wilco-mock-fix-'));
    try {
      fs.writeFileSync(
        path.join(dir, 'get-product-777001.json'),
        JSON.stringify({
          product: {
            id: 'prod_override_777',
            external_id: '777001',
            title: 'Fixture Override Product',
            handle: 'fixture-override-777001',
            description: '',
            status: 'published',
            thumbnail: null,
            images: [],
            options: [],
            variants: [
              {
                id: 'var_override_1',
                title: 'Default',
                sku: 'OVERRIDE-SKU',
                status: 'published',
                inventory_quantity: 1,
                prices: [{ currency_code: 'usd', amount: 100, id: 'p1' }],
              },
            ],
            categories: [],
            metadata: {},
          },
        })
      );
      vi.stubEnv('FIXTURES_DIR', dir);
      const appWithDir = createApp();
      const res = await request(appWithDir).get('/store/get-product?id=777001').expect(200);
      expect(res.body.product.title).toBe('Fixture Override Product');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
