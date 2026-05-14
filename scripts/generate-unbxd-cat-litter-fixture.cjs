/**
 * One-off generator: Unbxd commerce search fixture for cat litter PLP (category 1067/1068).
 * Run: node scripts/generate-unbxd-cat-litter-fixture.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

function stores(pairs) {
  const o = {};
  for (const [storeNumber, quantity] of pairs) {
    const q = quantity == null || quantity === '' ? 0 : quantity;
    o[`storeAvailability_${storeNumber}_unx_d`] = q;
  }
  return o;
}

// Product 7877 — variant 1238708 (from network capture)
const inv7877a = [
  [1, 13],
  [2, 11],
  [3, 26],
  [4, 15],
  [5, 2],
  [6, 6],
  [7, 13],
  [8, 0],
  [9, 10],
  [10, 22],
  [11, 15],
  [12, 13],
  [13, 7],
  [14, 0],
  [15, 16],
  [16, 13],
  [17, 14],
  [18, 1],
  [19, 18],
  [20, 4],
  [21, 7],
  [22, 12],
  [23, 14],
  [24, 6],
  [25, 11],
  [26, 15],
  [27, 7],
  [28, 12],
  [29, 0],
  [90, 0],
  [99, 730],
];

// Product 7877 — variant 1238710
const inv7877b = [
  [1, 18],
  [2, 10],
  [3, 33],
  [4, 25],
  [5, 19],
  [6, 25],
  [7, 44],
  [8, 12],
  [9, 13],
  [10, 24],
  [11, 28],
  [12, 25],
  [13, 30],
  [14, 0],
  [15, 23],
  [16, 13],
  [17, 26],
  [18, 16],
  [19, 17],
  [20, 16],
  [21, 15],
  [22, 33],
  [23, 15],
  [24, 8],
  [25, 8],
  [26, 24],
  [27, 23],
  [28, 18],
  [29, 0],
  [90, 0],
  [99, 1286],
];

// Product 6660 — variant 5182266
const inv6660 = [
  [1, 10],
  [2, 7],
  [3, 10],
  [4, 9],
  [5, 10],
  [6, 10],
  [7, 11],
  [8, 8],
  [9, 9],
  [10, 10],
  [11, 9],
  [12, 10],
  [13, 9],
  [14, 0],
  [15, 12],
  [16, 10],
  [17, 10],
  [18, 11],
  [19, 8],
  [20, 7],
  [21, 8],
  [22, 10],
  [23, 7],
  [24, 10],
  [25, 9],
  [26, 10],
  [27, 9],
  [28, 6],
  [29, 0],
  [90, 0],
  [99, 0],
];

// Product 4584 — Swheat (from get-product capture; DC hub 99 = 0 in that snapshot)
const inv4584 = [
  [1, 4],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 3],
  [6, 4],
  [7, 3],
  [8, 3],
  [9, 6],
  [10, 1],
  [11, 2],
  [12, 3],
  [13, 3],
  [14, 0],
  [15, 3],
  [16, 4],
  [17, 4],
  [18, 3],
  [19, 3],
  [20, 4],
  [21, 4],
  [22, 5],
  [23, 4],
  [24, 5],
  [25, 3],
  [26, 2],
  [27, 4],
  [28, 0],
  [29, 0],
  [90, 0],
  [99, 0],
];

function variantBase(extra) {
  return {
    isDiscontinued: 'false',
    variantSalePrice: 0,
    score: 1,
    weightUnit: 'LB',
    ...extra,
  };
}

const products = [
  {
    uniqueId: '7877',
    medusaId: 'prod_01K06D4FBZAXYCF64DQVAEKY6S',
    title: 'Fresh & Natural, Unscented Scoopable Cat Litter',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/pet/cat-litter/litter/fresh-natural-unscented-scoopable-cat-litter-7877',
    imageUrl: ['https://media.farmstore.com/20181016221041/1167690_1.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'false',
    limitedStockQuantity: 1,
    excludedStates: [],
    score: 0.25,
    variantCount: 2,
    variantTotal: 2,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBNA85H8JH6ANVA80VNH9D',
        variantSku: '1238708',
        variantRetailPrice: 9.99,
        width: 12,
        length: 2,
        height: 19,
        weight: 19,
        ...stores(inv7877a),
      }),
      variantBase({
        variantMedusaId: 'variant_01KEGBNA9KE68RC61S4TD4PMCY',
        variantSku: '1238710',
        variantRetailPrice: 17.99,
        width: 14.5,
        length: 3.5,
        height: 20,
        weight: 25,
        ...stores(inv7877b),
      }),
    ],
  },
  {
    uniqueId: '6660',
    medusaId: 'prod_01K06D4CDRMY3JE3Z2C14YMERC',
    title: 'Tidy Cat, Lightweight 24/7 Performance Clumping Cat Litter, 8.5 lb',
    description:
      'This lightweight litter has all the strength of traditional clumping litters for easy cleanup, but at half the weight, its a breeze to pour, carry and store. The powerful formula not only provides superior clumping, it works around the clock to defend you and your home against common litter box odors.',
    productUrl:
      'https://farmstore-modern.us/product/pet/cat-litter/litter/tidy-cat-lightweight-247-performance-clumping-cat-litter-85-lb-6660',
    imageUrl: ['https://media.farmstore.com/20181016211925/1127784_1-510x576.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'false',
    limitedStockQuantity: 1,
    excludedStates: ['CA'],
    score: 0.25,
    variantCount: 1,
    variantTotal: 1,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBM8RDSY1YX0XB9MW93X3G',
        variantSku: '5182266',
        variantRetailPrice: 19.99,
        weight: 8.5,
        width: 9.19,
        length: 6.6,
        height: 13.5,
        ...stores(inv6660),
      }),
    ],
  },
  {
    uniqueId: '4584',
    medusaId: 'prod_01K06D46MAWFMT5AA21AQ6118P',
    title: 'Swheat Scoop Original Natural Clumping Wheat Cat Litter, 25 lb bag',
    description:
      "New, improved Swheat Scoop Original Formula litter eliminates odors better, clumps faster and lasts longer than ever. No wonder why so many families are making Swheat Scoop their natural clumping brand! Unlike many clumping litters, Swheat Scoop contains no silica dust, sodium bentonite or chemicals of any kind. That's why it's even recommended by veterinarians for kittens and post-surgical cats. Since Swheat Scoop litter absorbs moisture faster than ordinary clumping litter brands, the rest of the litter stays clean and fresh. Which means it can last longer between litter box changes, saving you significant time and money.",
    productUrl:
      'https://farmstore-modern.us/product/pet/cat-litter/litter/swheat-scoop-original-natural-clumping-wheat-cat-litter-25-lb-bag-4584',
    imageUrl: ['https://media.farmstore.com/20181016220213/9246812_1.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'false',
    limitedStockQuantity: 1,
    excludedStates: [],
    score: 0.25,
    variantCount: 1,
    variantTotal: 1,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBM846MAWFMT5AA2118PA',
        variantSku: '9246812',
        variantRetailPrice: 29.99,
        weight: 25,
        width: 13,
        length: 6,
        height: 23,
        ...stores(inv4584),
      }),
    ],
  },
  {
    uniqueId: '44213',
    medusaId: 'prod_01K06D8ED0KH8DN4PP2CV97NRJ',
    title: 'Fresh & Natural, Advanced Odor Control Clumping Cat Litter',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/pet/cat-litter/litter/fresh-natural-advanced-odor-control-clumping-cat-litter-44213',
    imageUrl: ['https://media.farmstore.com/20181016221041/1167690_1.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'false',
    limitedStockQuantity: 1,
    excludedStates: [],
    score: 0.25,
    variantCount: 1,
    variantTotal: 1,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBM8R44213FRESHNAT01',
        variantSku: '44213-SKU',
        variantRetailPrice: 18.99,
        weight: 20,
        width: 12,
        length: 8,
        height: 16,
        ...stores([[1, 8], [99, 40]]),
      }),
    ],
  },
  {
    uniqueId: '43059',
    medusaId: 'prod_01K06D86MFVJE40S7GVNC4TTA6',
    title: "World's Best Cat Litter, Comfort Care Unscented Cat Litter, 15 lb",
    description:
      "<p class=\"MsoNormal\"><span>Our Comfort&#10;Care&#8482; formula is a naturally safe and sustainable tight-clumping litter with a&#10;soft texture that&#8217;s gentle on those precious paws and flushable* for easy&#10;cleanup. And because it&#8217;s made from whole-kernel corn, our Comfort Care&#8482;&#10;formula lasts 2X longer than the leading U.S. brand. No harmful chemicals, no&#10;artificial perfumes, and no clay dust. That&#8217;s the power of corn.</span><span></span></p><p class=\"MsoNormal\"><span><b>Previously know as the Original Unscented&#160;</b></span></p>",
    productUrl:
      'https://farmstore-modern.us/product/pet/cat-litter/litter/worlds-best-cat-litter-comfort-care-unscented-cat-litter-15-lb-43059',
    imageUrl: ['https://media.farmstore.com/20181016220213/worlds-best-43059.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'false',
    limitedStockQuantity: 1,
    excludedStates: [],
    score: 0.25,
    variantCount: 1,
    variantTotal: 1,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBM8R43059WORLDSB01',
        variantSku: '43059-SKU',
        variantRetailPrice: 21.99,
        weight: 15,
        width: 12,
        length: 10,
        height: 14,
        ...stores([[1, 20], [99, 100]]),
      }),
    ],
  },
];

const VARIANT_FIELDS =
  'isDiscontinued,variantSalePrice,variantRetailPrice,lowestDisplayPrice,width,weight,length,height,weightUnit,variantSku,variantMedusaId,storeAvailability_1_unx_d,storeAvailability_2_unx_d,storeAvailability_3_unx_d,storeAvailability_4_unx_d,storeAvailability_5_unx_d,storeAvailability_6_unx_d,storeAvailability_7_unx_d,storeAvailability_8_unx_d,storeAvailability_9_unx_d,storeAvailability_10_unx_d,storeAvailability_11_unx_d,storeAvailability_12_unx_d,storeAvailability_13_unx_d,storeAvailability_14_unx_d,storeAvailability_15_unx_d,storeAvailability_16_unx_d,storeAvailability_17_unx_d,storeAvailability_18_unx_d,storeAvailability_19_unx_d,storeAvailability_20_unx_d,storeAvailability_21_unx_d,storeAvailability_22_unx_d,storeAvailability_23_unx_d,storeAvailability_24_unx_d,storeAvailability_25_unx_d,storeAvailability_26_unx_d,storeAvailability_27_unx_d,storeAvailability_28_unx_d,storeAvailability_29_unx_d,storeAvailability_90_unx_d,storeAvailability_99_unx_d';

const PRODUCT_FIELDS =
  'medusaId,title,description,imageUrl,notSoldOnline,hidePricingOnline,strictImap,isNew,limitedStockQuantity,pickupOnly,productUrl,excludedStates';

const fixture = {
  searchMetaData: {
    status: 0,
    queryTime: 42,
    queryParams: {
      apiKey: 'e601249d527ca92a5779172e2b0443f1',
      'dd.tag': 'mimir.search',
      enablePf: 'false',
      enablePopularity: 'true',
      enableTaxonomy: 'false',
      fields: PRODUCT_FIELDS,
      'log.response': 'false',
      'module.exclude': 'personalization',
      'promotion.version': 'V3',
      q: 'dog food',
      'q.op': 'AND',
      'req.rm.asterix': 'false',
      'req.rm.promotionEngine': 'false',
      rows: '50',
      spellcheck: 'true',
      start: '0',
      uid: 'mock-cat-litter-catalog',
      'user.behaviour': 'true',
      'variants.count': '100',
      'variants.fields': VARIANT_FIELDS,
    },
  },
  response: {
    numberOfProducts: 26,
    start: 0,
    products,
  },
  facets: {
    text: {
      list: [
        {
          facetName: 'brand_uFilter',
          filterField: 'brand_uFilter',
          displayName: 'Brands',
          position: 2,
          values: ['Fresh & Natural', 3, 'Tidy Cat', 2, "World's Best", 2, 'Swheat Scoop', 1],
        },
        {
          facetName: 'priceSelector_uFilter',
          filterField: 'priceSelector_uFilter',
          displayName: 'Price',
          position: 6,
          values: ['Under $24.99', 17, '$25.00 to $49.99', 9],
        },
        {
          facetName: 'pickupAvailability_uFilter',
          filterField: 'pickupAvailability_uFilter',
          displayName: 'Pickup',
          position: 7,
          values: ['true', 24, 'false', 2],
        },
        {
          facetName: 'shipAvailability_uFilter',
          filterField: 'shipAvailability_uFilter',
          displayName: 'Ship',
          position: 8,
          values: ['true', 18, 'false', 8],
        },
      ],
    },
    multilevel: {
      list: [
        {
          breadcrumb: {},
          displayName: 'Category',
          filterField: 'categoryIdPath',
          level: 1,
          position: 1,
          values: [{ count: 26, name: '1068' }],
        },
      ],
    },
  },
  redirect: { value: null },
};

const out = path.join(__dirname, '..', 'src', 'fixtures', 'unbxd-search-response.json');
fs.writeFileSync(out, JSON.stringify(fixture, null, 2) + '\n', 'utf8');
console.log('Wrote', out);
