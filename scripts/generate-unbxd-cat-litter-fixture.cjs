/**
 * Generates src/fixtures/unbxd-search-response.json — multi-category commerce catalog
 * (cat litter + fencing/hardware query 164) for search + get-product mocks.
 *
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

function variantBase(extra) {
  return {
    isDiscontinued: 'false',
    variantSalePrice: 0,
    score: 1,
    weightUnit: 'LB',
    ...extra,
  };
}

// --- Cat litter (5) — same as before ---
const inv7877a = [
  [1, 13], [2, 11], [3, 26], [4, 15], [5, 2], [6, 6], [7, 13], [8, 0], [9, 10], [10, 22],
  [11, 15], [12, 13], [13, 7], [14, 0], [15, 16], [16, 13], [17, 14], [18, 1], [19, 18],
  [20, 4], [21, 7], [22, 12], [23, 14], [24, 6], [25, 11], [26, 15], [27, 7], [28, 12],
  [29, 0], [90, 0], [99, 730],
];
const inv7877b = [
  [1, 18], [2, 10], [3, 33], [4, 25], [5, 19], [6, 25], [7, 44], [8, 12], [9, 13], [10, 24],
  [11, 28], [12, 25], [13, 30], [14, 0], [15, 23], [16, 13], [17, 26], [18, 16], [19, 17],
  [20, 16], [21, 15], [22, 33], [23, 15], [24, 8], [25, 8], [26, 24], [27, 23], [28, 18],
  [29, 0], [90, 0], [99, 1286],
];
const inv6660 = [
  [1, 10], [2, 7], [3, 10], [4, 9], [5, 10], [6, 10], [7, 11], [8, 8], [9, 9], [10, 10],
  [11, 9], [12, 10], [13, 9], [14, 0], [15, 12], [16, 10], [17, 10], [18, 11], [19, 8],
  [20, 7], [21, 8], [22, 10], [23, 7], [24, 10], [25, 9], [26, 10], [27, 9], [28, 6],
  [29, 0], [90, 0], [99, 0],
];
const inv4584 = [
  [1, 4], [2, 2], [3, 3], [4, 4], [5, 3], [6, 4], [7, 3], [8, 3], [9, 6], [10, 1],
  [11, 2], [12, 3], [13, 3], [14, 0], [15, 3], [16, 4], [17, 4], [18, 3], [19, 3],
  [20, 4], [21, 4], [22, 5], [23, 4], [24, 5], [25, 3], [26, 2], [27, 4], [28, 0],
  [29, 0], [90, 0], [99, 0],
];

const catLitterProducts = [
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
      "<p class=\"MsoNormal\"><span>Our Comfort&#10;Care&#8482; formula is a naturally safe and sustainable tight-clumping litter with a&#10;soft texture that&#8217;s gentle on those precious paws and flushable* for easy&#10;cleanup.</span></p>",
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

// --- Fencing / hardware cloth (query 164) — inventories from network capture ---
const inv9498 = [
  [1, 9], [2, 13], [3, 12], [4, 8], [5, 4], [6, 16], [7, 23], [8, 3], [9, 4], [10, 10],
  [11, 4], [12, 3], [13, 11], [14, 0], [15, 9], [16, 8], [17, 8], [18, 15], [19, 16],
  [20, 7], [21, 5], [22, 14], [23, 21], [24, 15], [25, 18], [26, 6], [27, 6], [28, 15],
  [29, 0], [90, 0], [99, 232],
];
const inv9394 = [
  [1, 2], [2, 2], [3, 3], [4, 3], [5, 3], [6, 4], [7, 2], [8, 1], [9, 1], [10, -1],
  [11, 0], [12, 3], [13, 2], [14, 0], [15, 3], [16, 3], [17, 2], [18, 3], [19, 1],
  [20, 2], [21, 2], [22, 3], [23, 3], [24, 3], [25, 1], [26, 2], [27, 2], [28, 3],
  [29, 0], [90, 0], [99, 0],
];
const inv9384 = [
  [1, 0], [2, 4], [3, 2], [4, 3], [5, 2], [6, 4], [7, 2], [8, 3], [9, 3], [10, 2],
  [11, 3], [12, 0], [13, 0], [14, 0], [15, 0], [16, 1], [17, 3], [18, 4], [19, 1],
  [20, 4], [21, 2], [22, 2], [23, 3], [24, 3], [25, 3], [26, 2], [27, 6], [28, 0],
  [29, 0], [90, 0], [99, 40],
];
const inv9381 = [
  [1, 2], [2, 3], [3, 11], [4, 3], [5, 11], [6, 11], [7, 8], [8, 2], [9, 6], [10, 4],
  [11, 0], [12, 5], [13, 6], [14, 0], [15, 0], [16, 1], [17, 5], [18, 5], [19, 2],
  [20, 5], [21, 6], [22, 5], [23, 5], [24, 7], [25, 6], [26, 4], [27, 4], [28, 0],
  [29, 0], [90, 0], [99, 22],
];
const inv9378 = [
  [1, 6], [2, 3], [3, 7], [4, 11], [5, 5], [6, 7], [7, 11], [8, 8], [9, 5], [10, 12],
  [11, 7], [12, 5], [13, 2], [14, 0], [15, 7], [16, 16], [17, 8], [18, 6], [19, 8],
  [20, 6], [21, 4], [22, 9], [23, 12], [24, 8], [25, 7], [26, 6], [27, 10], [28, 9],
  [29, 0], [90, 0], [99, 518],
];
const inv9375 = [
  [1, 8], [2, 6], [3, 5], [4, 4], [5, 7], [6, 9], [7, 3], [8, 2], [9, 4], [10, 5],
  [11, 4], [12, 3], [13, 2], [14, 0], [15, 4], [16, 5], [17, 6], [18, 4], [19, 3],
  [20, 2], [21, 3], [22, 4], [23, 5], [24, 4], [25, 3], [26, 2], [27, 3], [28, 2],
  [29, 0], [90, 0], [99, 44],
];
const inv9372 = [
  [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0],
  [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 41], [17, 0], [18, 0], [19, 0],
  [20, 0], [21, 0], [22, 0], [23, 22], [24, 0], [25, 0], [26, 84], [27, 0], [28, 0],
  [29, 0], [90, 0], [99, 0],
];
const inv8417 = [
  [1, 13], [2, 7], [3, 10], [4, 7], [5, 5], [6, 6], [7, 12], [8, 12], [9, 8], [10, 11],
  [11, 11], [12, 10], [13, 12], [14, 0], [15, 6], [16, 11], [17, 7], [18, 7], [19, 7],
  [20, 8], [21, 11], [22, 5], [23, 3], [24, 4], [25, 19], [26, 10], [27, 10], [28, 6],
  [29, 0], [90, 0], [99, 24],
];

const fencingProductsFull = [
  {
    uniqueId: '9498',
    medusaId: 'prod_01K06D4K7N4C76TYRD2GJVA1T3',
    title: 'Galvanized Mesh Hardware Cloth, 24 in. X 10 ft.',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/hardware-cloth/galvanized-mesh-hardware-cloth-24-in-x-10-ft-9498',
    imageUrl: ['https://media.farmstore.com/20181016221324/167976_1.jpg'],
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
        variantMedusaId: 'variant_01KEGBPG5AA1N20MSFGYZ5AV4T',
        variantSku: '5167976',
        variantRetailPrice: 14.99,
        weight: 4,
        width: 3.25,
        length: 3.25,
        height: 24,
        ...stores(inv9498),
      }),
    ],
  },
  {
    uniqueId: '9394',
    medusaId: 'prod_01K06D4JZ91A09H5DKRXMSTERH',
    title: 'Hillman Single Coil Galvanized Wire, 14 ga., 100 ft.',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/smooth-wire/hillman-single-coil-galvanized-wire-14-ga-100-ft-9394',
    imageUrl: ['https://media.farmstore.com/20181016221324/150946_1.jpg'],
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
        variantMedusaId: 'variant_01KEGBPDDQDZ5NHZHBCPR6ZE2S',
        variantSku: '5150946',
        variantRetailPrice: 15.99,
        weight: 1.55,
        width: 9.5,
        length: 2,
        height: 9.5,
        ...stores(inv9394),
      }),
    ],
  },
  {
    uniqueId: '9384',
    medusaId: 'prod_01K06D4JXAH9AV48XD1WYBHNYM',
    title: '60 in X 50 ft Galvanized Welded Wire Mesh Fence, 14 GA',
    description: 'Ideal for protecting gardens from rabbits and other critters.',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/weldwire/60-in-x-50-ft-galvanized-welded-wire-mesh-fence-14-ga-9384',
    imageUrl: ['https://media.farmstore.com/20181016221324/145508_1.jpg'],
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
        variantMedusaId: 'variant_01KEGBPBH1FG9N3EW9FXKPBA10',
        variantSku: '5145508',
        variantRetailPrice: 99.99,
        weight: 33.9,
        width: 10,
        length: 10,
        height: 60,
        ...stores(inv9384),
      }),
    ],
  },
  {
    uniqueId: '9381',
    medusaId: 'prod_01K06D4JX2QZBF0EMTKE6J8VSJ',
    title: '48 in X 50 ft Galvanized Welded Wire Mesh Fence, 14 GA',
    description: 'Ideal for protecting gardens from rabbits and other critters.',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/weldwire/48-in-x-50-ft-galvanized-welded-wire-mesh-fence-14-ga-9381',
    imageUrl: ['https://media.farmstore.com/20191025160741/4378469_HR-510x510.jpg'],
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
        variantMedusaId: 'variant_01KEGBPBEHCKTZ5D8P4J3TXG0X',
        variantSku: '5144154',
        variantRetailPrice: 89.99,
        weight: 27.3,
        width: 10,
        length: 10,
        height: 48,
        ...stores(inv9381),
      }),
    ],
  },
  {
    uniqueId: '9378',
    medusaId: 'prod_01K06D4JW6BFQP0P9V06C2GX7K',
    title: 'Galvanized Welded Hardware Cloth, 24 in. X 5 ft.',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/hardware-cloth/galvanized-welded-hardware-cloth-24-in-x-5-ft-9378',
    imageUrl: ['https://media.farmstore.com/20181016221323/1121846_1.jpg'],
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
        variantMedusaId: 'variant_01KEGBPBEB3HRSDM9FRV2ZPT5S',
        variantSku: '1121846',
        variantRetailPrice: 13.99,
        weight: 2.5,
        width: 2.25,
        length: 2.25,
        height: 24,
        ...stores(inv9378),
      }),
    ],
  },
  {
    uniqueId: '9375',
    medusaId: 'prod_01K06D4JVVJEY06QFBY8JVT7RK',
    title: 'Grip Rite, 36 in x 20 ft Galvanized Welded Hardware Cloth, 19 GA',
    description: '',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/hardware-cloth/grip-rite-36-in-x-20-ft-galvanized-welded-hardware-cloth-19-ga-9375',
    imageUrl: ['https://media.farmstore.com/20250314082346/1116996-510x577.jpg'],
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
        variantMedusaId: 'variant_01KEGBPBC29WVSHBA01ZGZ683Z',
        variantSku: '1116996',
        variantRetailPrice: 39.99,
        weight: 5.9,
        width: 36,
        length: 4,
        height: 4,
        ...stores(inv9375),
      }),
    ],
  },
  {
    uniqueId: '9372',
    medusaId: 'prod_01K06D4JVTF3FT035C3AP4WS97',
    title: 'Hutchison Western 2 Part Barbed Wire, 1,320 ft.',
    description:
      ' Barbed wire is available in 2 or 4-point barbs in round or flat styles with 4 in., 5 in. or 6 in. barb spacing in a selection of wire gauges and galvanizing grades. Reverse twist wire keeps barbs firmly in place. Smooth, galvanized double-strand barbless',
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/barbed-wire/hutchison-western-2-part-barbed-wire-1320-ft-9372',
    imageUrl: ['https://media.farmstore.com/20181016221325/1083818_1.jpg'],
    notSoldOnline: 'false',
    hidePricingOnline: 'false',
    strictImap: 'false',
    isNew: 'false',
    pickupOnly: 'true',
    limitedStockQuantity: 1,
    excludedStates: [],
    score: 0.25,
    variantCount: 1,
    variantTotal: 1,
    variants: [
      variantBase({
        variantMedusaId: 'variant_01KEGBPB7ET1QT5MPDAP5M5PX8',
        variantSku: '1083818',
        variantRetailPrice: 134.99,
        weight: 79,
        width: 11.3,
        length: 11.3,
        height: 13.7,
        ...stores(inv9372),
      }),
    ],
  },
  {
    uniqueId: '8417',
    medusaId: 'prod_01K06D4GNVF1JS93RS5DNEV0H9',
    title: 'Bekaert, 2" Fence Staples, 8 lb',
    description:
      "Bekaert's Fence Staples are 8G Bezinal coated. Single or double barbs to hold securely in the post and feature sharp right hand cut tips for easy driving. Comes in an eazy to transport bucket.",
    productUrl:
      'https://farmstore-modern.us/product/fencing/wire-fencing-accessories/fence-staples/bekaert-2-fence-staples-8-lb-8417',
    imageUrl: ['https://media.farmstore.com/20240206134933/210360-1-510x577.jpg'],
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
        variantMedusaId: 'variant_01KEGBNPEXE1F6GY725K759DE3',
        variantSku: '5210362',
        variantRetailPrice: 29.99,
        weight: 8,
        width: 6.5,
        length: 6.5,
        height: 6.5,
        ...stores(inv8417),
      }),
    ],
  },
];

function fencingStub(uniqueId, medusaId, title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return {
    uniqueId: String(uniqueId),
    medusaId,
    title,
    description: '',
    productUrl: `https://farmstore-modern.us/product/fencing/wire-fencing-accessories/other/${slug}-${uniqueId}`,
    imageUrl: ['https://media.farmstore.com/20181016221324/167976_1.jpg'],
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
        variantMedusaId: `variant_01KEGBSTUB${uniqueId}V01`,
        variantSku: `FNC-${uniqueId}`,
        variantRetailPrice: 16.99,
        weight: 2,
        width: 4,
        length: 4,
        height: 4,
        ...stores([[1, 6], [99, 30]]),
      }),
    ],
  };
}

const fencingStubs = [
  fencingStub(
    '8409',
    'prod_01K06D4GN6ESMGG4KSKY329T2N',
    'Fencing accessory wire roll 8409',
  ),
  fencingStub(
    '8396',
    'prod_01K06D4GNZRK4QEQA124AD7ZZR',
    'Fencing accessory wire roll 8396',
  ),
  fencingStub(
    '7913',
    'prod_01K06D4FDW6M1VGCXZ89D2RKH3',
    'Fencing accessory hardware 7913',
  ),
  fencingStub(
    '7721',
    'prod_01K06D4EW6GAZ87DVW4M9W31X2',
    'Fencing accessory hardware 7721',
  ),
];

const products = [
  ...catLitterProducts,
  ...fencingProductsFull,
  ...fencingStubs,
];

const VARIANT_FIELDS =
  'isDiscontinued,variantSalePrice,variantRetailPrice,lowestDisplayPrice,width,weight,length,height,weightUnit,variantSku,variantMedusaId,storeAvailability_1_unx_d,storeAvailability_2_unx_d,storeAvailability_3_unx_d,storeAvailability_4_unx_d,storeAvailability_5_unx_d,storeAvailability_6_unx_d,storeAvailability_7_unx_d,storeAvailability_8_unx_d,storeAvailability_9_unx_d,storeAvailability_10_unx_d,storeAvailability_11_unx_d,storeAvailability_12_unx_d,storeAvailability_13_unx_d,storeAvailability_14_unx_d,storeAvailability_15_unx_d,storeAvailability_16_unx_d,storeAvailability_17_unx_d,storeAvailability_18_unx_d,storeAvailability_19_unx_d,storeAvailability_20_unx_d,storeAvailability_21_unx_d,storeAvailability_22_unx_d,storeAvailability_23_unx_d,storeAvailability_24_unx_d,storeAvailability_25_unx_d,storeAvailability_26_unx_d,storeAvailability_27_unx_d,storeAvailability_28_unx_d,storeAvailability_29_unx_d,storeAvailability_90_unx_d,storeAvailability_99_unx_d';

const PRODUCT_FIELDS =
  'medusaId,title,description,imageUrl,notSoldOnline,hidePricingOnline,strictImap,isNew,limitedStockQuantity,pickupOnly,productUrl,excludedStates';

const fixture = {
  searchMetaData: {
    status: 0,
    queryTime: 48,
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
      uid: 'mock-multi-category-catalog',
      'user.behaviour': 'true',
      'variants.count': '100',
      'variants.fields': VARIANT_FIELDS,
    },
  },
  response: {
    numberOfProducts: 97,
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
          values: [
            'Hillman',
            4,
            'Bekaert',
            3,
            'Grip Rite',
            2,
            'Fresh & Natural',
            3,
            'Tidy Cat',
            2,
            "World's Best",
            2,
            'Swheat Scoop',
            1,
          ],
        },
        {
          facetName: 'priceSelector_uFilter',
          filterField: 'priceSelector_uFilter',
          displayName: 'Price',
          position: 6,
          values: [
            'Under $24.99',
            38,
            '$25.00 to $49.99',
            24,
            '$50.00 to $99.99',
            10,
            '$100.00 to $199.99',
            6,
            '$200 and above',
            2,
          ],
        },
        {
          facetName: 'pickupAvailability_uFilter',
          filterField: 'pickupAvailability_uFilter',
          displayName: 'Pickup',
          position: 7,
          values: ['true', 90, 'false', 7],
        },
        {
          facetName: 'shipAvailability_uFilter',
          filterField: 'shipAvailability_uFilter',
          displayName: 'Ship',
          position: 8,
          values: ['true', 65, 'false', 30],
        },
        {
          facetName: 'category_uFilter',
          filterField: 'category_uFilter',
          displayName: 'Nav Cat',
          position: 13,
          values: ['Hardware Cloth', 12, 'Cat Litter', 5, 'Barbed Wire', 1],
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
          values: [
            { count: 28, name: '174' },
            { count: 24, name: '1269' },
            { count: 22, name: '209' },
            { count: 15, name: '173' },
            { count: 15, name: '205' },
            { count: 14, name: '180' },
            { count: 5, name: '1068' },
            { count: 4, name: '165' },
            { count: 4, name: '198' },
          ],
        },
      ],
    },
  },
  redirect: { value: null },
};

const out = path.join(__dirname, '..', 'src', 'fixtures', 'unbxd-search-response.json');
fs.writeFileSync(out, JSON.stringify(fixture, null, 2) + '\n', 'utf8');
console.log('Wrote', out, 'products:', products.length);
