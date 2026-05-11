import { Router } from 'express';
import { loadFixture } from '../fixtures/load-fixture';
import { registerRoute } from '../mock-registry';

export const commerceRouter = Router();

type MockRecord = Record<string, any>;

const addShippingMethodCart = loadFixture(
  'commerce-add-shipping-method.json',
) as MockRecord;
const selectPaymentSessionCart = loadFixture(
  'commerce-select-payment-session.json',
) as MockRecord;
const completeCartCapturedCart = loadFixture(
  'commerce-add-shipping-method.json',
) as MockRecord;
const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const cartStore = new Map<string, MockRecord>([
  [addShippingMethodCart.id, deepClone(addShippingMethodCart)],
  [selectPaymentSessionCart.id, deepClone(selectPaymentSessionCart)],
]);
const completeCartSuccess = {
  type: 'order',
  result: {
    id: 'order_01KR16T9K24TZ9YK1WMZTPRHVV',
    type: 'online',
    displayId: 298,
    orderNumber: 'E-260507-1056',
    cartId: 'cart_01KR16Q0FEVDERKS3CCGBYPAKC',
    status: 'pending',
    fulfillmentStatus: 'not_fulfilled',
    items: [
      {
        id: 'item_01KR16QB2P2Z1TBW1XDRRM4E3G',
        variantId: 'variant_01K06D4HGC817DH94YB8MZHK4X',
        title: 'Horse Guard, Flaxen Flow, 3 Liter',
        quantity: 1,
        total: 24.99,
        unitPrice: 24.99,
      },
    ],
    payments: [
      {
        id: 'pay_01KR16T9CRKY0EZF889TK0Y6VE',
        provider: 'wilco-acceptjs-payment',
        amount: 249900,
        data: {
          responseCode: '1',
          accountType: 'Visa',
          totalAmount: '24.99',
          transactionId: '80054739780',
          orderDescription: 'cart_01KR16Q0FEVDERKS3CCGBYPAKC',
        },
      },
    ],
    subtotal: 24.99,
    total: 24.99,
    customerId: 'cus_01KK97J5F0X7W1QRMEHRJYK5XM',
    giftCards: [],
    discounts: [],
  },
};

const completeCartFailure = {
  type: 'order_error',
  error: {
    code: 'PAYMENT_DECLINED',
    message:
      'Unable to complete cart because the payment gateway declined the transaction.',
    retryable: true,
  },
};
const paymentProfileStore = new Map<string, MockRecord>();
const defaultAddItemCart = {
  id: 'cart_01KR1ECFCD7AAE59GT5E2QMWBK',
  email: 'aamir.bohra+21@skillnetinc.com',
  customerId: 'cus_01KK97J5F0X7W1QRMEHRJYK5XM',
  billingAddress: {
    preferred: false,
    shippingNote: '',
    validated: false,
    altPickupPersonFirstName: '',
    altPickupPersonLastName: '',
    altPickupPersonPhone: '',
    customerOverride: false,
    adminOverride: false,
  },
  shippingAddress: {
    address1: null,
    address2: null,
    city: null,
    state: null,
    zip: null,
    id: 'addr_01KR1ECFCDN3JWG4832YZXVV7A',
    firstName: null,
    lastName: null,
    preferred: false,
    shippingNote: '',
    country: 'us',
    phone: null,
    validated: false,
    altPickupPersonFirstName: '',
    altPickupPersonLastName: '',
    altPickupPersonPhone: '',
    customerOverride: false,
    adminOverride: false,
    createdAt: '2026-05-07T14:45:03.998Z',
    updatedAt: '2026-05-07T14:45:03.998Z',
  },
  items: [] as MockRecord[],
  region: addShippingMethodCart.region,
  discounts: [],
  giftCards: [],
  customer: null,
  paymentSessions: [],
  payment: null,
  shippingMethods: [],
  shippingTotal: 0,
  discountTotal: 0,
  itemTaxTotal: 0,
  shippingTaxTotal: 0,
  taxTotal: 0,
  total: 0,
  subtotal: 0,
  giftCardTotal: 0,
  giftCardTaxTotal: 0,
  createdAt: '2026-05-07T14:45:03.998Z',
  updatedAt: '2026-05-07T14:45:03.998Z',
  completedAt: null,
};
const resolveCart = (cartId: string): MockRecord | undefined => {
  const existing = cartStore.get(cartId);
  if (existing) {
    return existing;
  }

  if (cartId === defaultAddItemCart.id) {
    const seeded = deepClone(defaultAddItemCart);
    cartStore.set(cartId, seeded);
    return seeded;
  }

  return undefined;
};

commerceRouter.post('/addShippingMethod', (_req, res) => {
  res.json(addShippingMethodCart);
});

commerceRouter.post('/updatePaymentSession', (req, res) => {
  const scenario = String(req.query.scenario ?? '').toLowerCase();
  const cartId = String(req.body?.cartId ?? '');
  const cart = cartStore.get(cartId);

  if (!cart) {
    return res.status(404).json({
      type: 'payment_error',
      error: {
        code: 'CART_NOT_FOUND',
        message: `No mock cart found for cartId "${cartId}".`,
      },
    });
  }

  if (scenario === 'fail') {
    return res.status(402).json({
      type: 'payment_session_error',
      error: {
        code: 'PAYMENT_DECLINED',
        message: 'Mock payment session update failed for testing.',
        cartId,
      },
    });
  }

  const updatedCart = deepClone(cart);
  const updatedAt = new Date().toISOString();
  updatedCart.paymentSession = {
    id: `ps_auth_${cartId}`,
    provider_id: String(req.body?.providerId ?? 'wilco-acceptjs-payment'),
    status: 'authorized',
    amount: Math.round(Number(updatedCart.total ?? 0) * 100),
    payment_authorized_at: updatedAt,
    data: req.body?.data ?? {},
  };
  updatedCart.payment = {
    id: `pay_auth_${cartId}`,
    provider_id: updatedCart.paymentSession.provider_id,
    amount: updatedCart.paymentSession.amount,
    data: updatedCart.paymentSession.data,
  };
  updatedCart.updatedAt = updatedAt;
  cartStore.set(cartId, updatedCart);

  return res.json(updatedCart);
});

commerceRouter.post('/createPaymentProfile', (req, res) => {
  const cartId = String(req.body?.cartId ?? '');
  const customerId = String(req.body?.customerId ?? '');
  const profileId = `profile_${cartId || customerId || Date.now()}`;
  const createdAt = new Date().toISOString();
  const profile = {
    profileId,
    customerId,
    cartId,
    provider: 'wilco-acceptjs-payment',
    status: 'created',
    createdAt,
  };
  paymentProfileStore.set(profileId, profile);
  return res.json(profile);
});

commerceRouter.post('/getCart', (req, res) => {
  const cartId = String(req.body?.cartId ?? '');
  const cart = resolveCart(cartId);

  if (!cart) {
    return res.status(404).json({
      type: 'cart_error',
      error: {
        code: 'CART_NOT_FOUND',
        message: `No mock cart found for cartId "${cartId}".`,
      },
    });
  }

  return res.json(cart);
});

commerceRouter.post('/updateCart', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;
  const cartId = String(payload?.cartId ?? '');
  const incomingCart = (payload?.cart ?? {}) as MockRecord;
  const existing = resolveCart(cartId);

  if (!cartId || !existing) {
    return res.status(404).json({
      type: 'cart_error',
      error: {
        code: 'CART_NOT_FOUND',
        message: `No mock cart found for cartId "${cartId}".`,
      },
    });
  }

  const now = new Date().toISOString();
  const updatedCart = deepClone(existing);
  const mergedBillingAddress = {
    ...(updatedCart.billingAddress ?? {}),
    ...(incomingCart.billingAddress ?? {}),
    firstName: 'Trupti',
  };
  const mergedShippingAddress = {
    ...(updatedCart.shippingAddress ?? {}),
    ...(incomingCart.shippingAddress ?? {}),
    firstName: 'Trupti',
  };

  updatedCart.billingAddress = mergedBillingAddress;
  updatedCart.shippingAddress = mergedShippingAddress;

  if (Array.isArray(incomingCart.items)) {
    updatedCart.items = incomingCart.items;
  }
  if (incomingCart.region) {
    updatedCart.region = incomingCart.region;
  }
  if ('payment' in incomingCart) {
    updatedCart.payment = incomingCart.payment;
  }
  if (Array.isArray(incomingCart.paymentSessions)) {
    updatedCart.paymentSessions = incomingCart.paymentSessions;
  }
  if (Array.isArray(incomingCart.shippingMethods)) {
    updatedCart.shippingMethods = incomingCart.shippingMethods;
  }

  const numericFields = [
    'shippingTotal',
    'discountTotal',
    'itemTaxTotal',
    'shippingTaxTotal',
    'taxTotal',
    'total',
    'subtotal',
    'giftCardTotal',
    'giftCardTaxTotal',
  ];
  for (const field of numericFields) {
    if (field in incomingCart) {
      updatedCart[field] = incomingCart[field];
    }
  }

  updatedCart.updatedAt = now;
  cartStore.set(cartId, updatedCart);
  return res.json(updatedCart);
});

commerceRouter.post('/addItem', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;
  const cartId = String(payload?.cartId ?? '');
  const variantId = String(payload?.variantId ?? '');
  const metadata = (payload?.metadata ?? {}) as MockRecord;
  const quantity = Number(payload?.quantity ?? 1);

  if (!cartId || !variantId) {
    return res.status(400).json({
      type: 'cart_error',
      error: {
        code: 'INVALID_ADD_ITEM_REQUEST',
        message: 'cartId and variantId are required.',
      },
    });
  }

  const baseCart = deepClone(resolveCart(cartId) ?? defaultAddItemCart);
  baseCart.id = cartId;
  const price = Number(metadata.salePrice ?? metadata.retailPrice ?? 0);
  const total = Number((price * quantity).toFixed(2));
  const item = {
    id: `item_${Date.now()}`,
    variantId,
    variant: {
      id: variantId,
      variantId,
      productId: String(payload?.productId ?? 'prod_mock_add_item'),
      title: String(payload?.title ?? 'Mock Product'),
      sku: String(metadata.sku ?? 'mock-sku'),
      metadata: {
        image: metadata.image ?? null,
        quantityDiscounts: metadata.quantityDiscounts ?? [],
        isDiscontinued: metadata.isDiscontinued ?? false,
        inventory: metadata.inventory ?? [],
        retailPrice: metadata.retailPrice ?? 0,
        salePrice: metadata.salePrice ?? 0,
        lowestDisplayPrice: metadata.lowestDisplayPrice ?? null,
        weightUnit: metadata.weightUnit ?? 'LB',
        reviewPageId: metadata.reviewPageId ?? null,
        departmentName: metadata.departmentName ?? null,
        manufacturerName: metadata.manufacturerName ?? null,
        className: metadata.className ?? null,
      },
      product: payload?.product ?? null,
    },
    title: String(payload?.title ?? 'Mock Product'),
    thumbnail: metadata.image ?? null,
    quantity,
    total,
    metadata: {
      quantityDiscounts: metadata.quantityDiscounts ?? [],
      retailPrice: metadata.retailPrice ?? 0,
      salePrice: metadata.salePrice ?? 0,
      fulfillment: metadata.fulfillment ?? 'Pickup',
      sku: metadata.sku ?? 'mock-sku',
      storeNumber: metadata.storeNumber ?? 1,
      storeName: metadata.storeName ?? null,
      taxCalculated: metadata.taxCalculated ?? false,
    },
    unitPrice: price,
  };

  baseCart.items = [item];
  baseCart.subtotal = total;
  baseCart.total = total;
  baseCart.updatedAt = new Date().toISOString();
  cartStore.set(cartId, baseCart);
  return res.json(baseCart);
});

commerceRouter.post('/getReviews', (_req, res) => {
  return res.json({
    pageData: null,
    metadata: null,
    reviews: [],
  });
});

commerceRouter.post('/provideValidationFeedback', (_req, res) => {
  return res.json({});
});

commerceRouter.post('/updateCustomer', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;
  const billingAddressInput = (payload?.billing_address ?? {}) as MockRecord;

  return res.json({
    id: 'cus_01KK97J5F0X7W1QRMEHRJYK5XM',
    email: 'aamir.bohra+21@skillnetinc.com',
    firstName: 'ali',
    lastName: 'asgar',
    hasAccount: true,
    phone: '',
    billingAddress: {
      address1: String(billingAddressInput.address1 ?? '3031 Tisch Way #31'),
      address2: String(billingAddressInput.address2 ?? '31'),
      city: String(billingAddressInput.city ?? 'San Jose'),
      state: String(billingAddressInput.state ?? 'CA'),
      zip: String(billingAddressInput.zip ?? '95128-2541'),
      id: String(billingAddressInput.id ?? 'addr_01KK98XPTK4QNW4385Y1NEK223'),
      firstName: String(billingAddressInput.firstName ?? 'Aamir'),
      lastName: String(billingAddressInput.lastName ?? 'Bohra'),
      preferred: Boolean(billingAddressInput.preferred ?? false),
      shippingNote: String(billingAddressInput.shippingNote ?? ''),
      country: 'us',
      phone: String(billingAddressInput.phone ?? '(065) 555-5555'),
      validated: Boolean(billingAddressInput.validated ?? true),
      altPickupPersonFirstName: '',
      altPickupPersonLastName: '',
      altPickupPersonPhone: '',
      customerOverride: false,
      adminOverride: false,
      createdAt: '2026-03-09T12:25:03.564Z',
      updatedAt: '2026-05-07T15:10:54.202Z',
    },
    shippingAddresses: [],
    metadata: {
      linkedCustomer: null,
      displayFirstName: null,
      displayLastName: null,
    },
    createdAt: '2026-03-09T12:01:16.757Z',
    updatedAt: '2026-05-07T12:32:45.586Z',
  });
});

commerceRouter.post('/getAcceptPaymentPage', (req, res) => {
  const cartId = String(req.body?.cartId ?? '');
  const cart = cartStore.get(cartId);

  if (!cart) {
    return res.status(404).json({
      type: 'cart_error',
      error: {
        code: 'CART_NOT_FOUND',
        message: `No mock cart found for cartId "${cartId}".`,
      },
    });
  }

  return res.json({
    cartId,
    token: `mock_accept_token_${cartId}`,
    paymentPageUrl: 'https://accept.authorize.net/payment/payment',
    expiresIn: 900,
  });
});

commerceRouter.post('/validateBillingAddress', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body[0] : req.body;
  const inputAddress = (payload?.ecomAddress ?? {}) as MockRecord;
  const toTitleCase = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b([a-z])/g, (match) => match.toUpperCase());
  const address1 = String(inputAddress.address1 ?? '');
  const address2 = String(inputAddress.address2 ?? '');
  const city = String(inputAddress.city ?? '');
  const state = String(inputAddress.state ?? '');
  const zip = String(inputAddress.zip ?? '');
  const normalizedZip = zip === '95128' ? '95128-2541' : zip;
  const normalizedAddress1Base = toTitleCase(address1);
  const normalizedAddress1 =
    address1 && address2 && address1.trim().toLowerCase() !== address2.trim().toLowerCase()
      ? `${normalizedAddress1Base} #${address2}`
      : normalizedAddress1Base;
  const hasDuplicateSubpremise =
    Boolean(address1) &&
    Boolean(address2) &&
    address1.trim().toLowerCase() === address2.trim().toLowerCase();
  const shippingNote = inputAddress.shippingNote ?? null;
  const responseId =
    hasDuplicateSubpremise
      ? '5733dac1-b277-4872-a6fb-f4944a921977'
      : '315ab9fe-7814-470d-aca6-cbdf6c31f915';

  return res.json({
    exact: [
      {
        address1: normalizedAddress1,
        address2,
        city,
        state,
        zip: normalizedZip,
        id: inputAddress.id ?? null,
        firstName: String(inputAddress.firstName ?? 'Aamir'),
        lastName: String(inputAddress.lastName ?? 'Bohra'),
        country: 'US',
        phone: String(inputAddress.phone ?? '(065) 555-5555'),
        shippingNote,
        preferred: Boolean(inputAddress.preferred ?? false),
        validated: true,
      },
    ],
    inexact: null,
    possibleNextAction: hasDuplicateSubpremise ? 'CONFIRM_ADD_SUBPREMISES' : 'ACCEPT',
    unconfirmedComponentTypes: ['subpremise'],
    responseId,
  });
});

commerceRouter.post('/selectPaymentSession', (_req, res) => {
  res.json(selectPaymentSessionCart);
});

commerceRouter.post('/completeCart', (req, res) => {
  const scenario = String(req.query.scenario ?? '').toLowerCase();
  const cartId = String(req.body?.cartId ?? '');
  const shouldFail = scenario === 'fail' || cartId.startsWith('fail_');

  if (shouldFail) {
    return res.status(402).json({
      ...completeCartFailure,
      error: {
        ...completeCartFailure.error,
        cartId,
      },
    });
  }

  if (cartId === completeCartSuccess.result.cartId) {
    return res.json(completeCartSuccess);
  }

  if (cartId === 'cart_01KQ7H2PXCSSHSD78KSNFNQ2ZH') {
    return res.json(completeCartCapturedCart);
  }

  return res.status(404).json({
    type: 'order_error',
    error: {
      code: 'CART_NOT_FOUND',
      message: `No mock cart fixture found for cartId "${cartId}".`,
      retryable: false,
    },
  });
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

registerRoute({
  method: 'POST',
  path: '/commerce/completeCart',
  description:
    'Returns a mock completed order for known cart IDs; supports failures with ?scenario=fail.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/updatePaymentSession',
  description: 'Updates mock payment session data for a cart.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/createPaymentProfile',
  description: 'Creates a mock payment profile for checkout flows.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/getCart',
  description: 'Returns a mock cart by cartId in request body.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/updateCart',
  description: 'Updates a mock cart from request payload and returns cart snapshot.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/addItem',
  description: 'Adds or replaces cart item from payload and returns updated cart snapshot.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/getReviews',
  description: 'Returns empty reviews payload for requested product review page.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/provideValidationFeedback',
  description: 'Accepts validation feedback payload and returns an empty object.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/updateCustomer',
  description: 'Updates mock customer billing profile and returns customer snapshot.',
});

registerRoute({
  method: 'POST',
  path: '/commerce/getAcceptPaymentPage',
  description: 'Returns a mock Authorize.Net Accept payment page token and URL.',
});
