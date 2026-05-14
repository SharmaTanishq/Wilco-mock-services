/**
 * Builds a Medusa-like `{ product }` body for `GET /store/get-product?id=<display_id>`
 * from an Unbxd-shaped search hit so PLP uniqueIds match PDP without duplicating catalog JSON.
 */

type UnbxdVariant = {
  variantMedusaId: string;
  variantSku: string;
  isDiscontinued: string;
  variantSalePrice: number;
  variantRetailPrice: number;
  lowestDisplayPrice?: number;
  weight?: number;
  width?: number;
  length?: number;
  height?: number;
  weightUnit?: string;
  storeAvailability_1_unx_d?: number;
};

export type UnbxdSearchProduct = {
  uniqueId: string;
  medusaId: string;
  title: string;
  description: string;
  handle: string;
  productUrl: string;
  imageUrl: string[];
  brand?: string;
  categories?: string[];
  variants: UnbxdVariant[];
  notSoldOnline?: string;
  hidePricingOnline?: string;
  strictImap?: string;
  isNew?: string;
  pickupOnly?: string;
  limitedStockQuantity?: number | null;
  excludedStates?: string[];
};

function unbxdStringBool(v: unknown): boolean {
  if (v === true) return true;
  if (v === 1) return true;
  const s = String(v ?? '').toLowerCase();
  return s === 'true' || s === '1';
}

function slug(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildMedusaStoreProductFromUnbxd(p: UnbxdSearchProduct) {
  const displayId = String(p.uniqueId);
  const productId = `prod_mock_${displayId}`;

  const variants = (p.variants ?? []).map((v, idx) => {
    const qty = typeof v.storeAvailability_1_unx_d === 'number' ? v.storeAvailability_1_unx_d : 10;
    const sale = Number(v.variantSalePrice);
    const amountCents = Number.isFinite(sale) ? Math.round(sale * 100) : 999;
    return {
      id: String(v.variantMedusaId),
      title: `Variant ${idx + 1}`,
      sku: String(v.variantSku),
      barcode: null,
      ean: null,
      upc: null,
      allow_backorder: false,
      manage_inventory: true,
      inventory_quantity: Math.max(0, qty),
      hs_code: null,
      origin_country: null,
      mid_code: null,
      material: null,
      weight: v.weight ?? null,
      length: v.length ?? null,
      height: v.height ?? null,
      width: v.width ?? null,
      metadata: {},
      variant_rank: idx,
      product_id: productId,
      status: 'published',
      prices: [
        {
          id: `price_${displayId}_${idx}`,
          currency_code: 'usd',
          amount: amountCents,
          min_quantity: null,
          max_quantity: null,
        },
      ],
    };
  });

  const images = (p.imageUrl ?? []).map((url, i) => ({
    id: `img_${displayId}_${i}`,
    url,
    rank: i,
    metadata: {},
  }));

  const categories = (p.categories ?? []).map((name, i) => ({
    id: `pcat_${displayId}_${i}`,
    name,
    handle: slug(name),
    description: null,
  }));

  const excluded = Array.isArray(p.excludedStates) ? p.excludedStates : [];
  const limited = p.limitedStockQuantity;

  return {
    id: productId,
    external_id: displayId,
    title: p.title,
    handle: p.handle,
    description: p.description ?? '',
    subtitle: null,
    status: 'published' as const,
    thumbnail: p.imageUrl?.[0] ?? null,
    weight: null,
    length: null,
    height: null,
    width: null,
    origin_country: null,
    hs_code: null,
    mid_code: null,
    material: null,
    discountable: true,
    is_giftcard: false,
    notSoldOnline: unbxdStringBool(p.notSoldOnline),
    hidePricingOnline: unbxdStringBool(p.hidePricingOnline),
    strictImap: unbxdStringBool(p.strictImap),
    isNew: unbxdStringBool(p.isNew),
    pickupOnly: unbxdStringBool(p.pickupOnly),
    limitedStockQuantity: limited === undefined ? null : limited,
    excludedStates: excluded,
    metadata: {
      display_id: displayId,
      brand: p.brand ?? null,
      not_sold_online: unbxdStringBool(p.notSoldOnline),
      pickup_only: unbxdStringBool(p.pickupOnly),
      hide_pricing_online: unbxdStringBool(p.hidePricingOnline),
      strict_imap: unbxdStringBool(p.strictImap),
      is_new: unbxdStringBool(p.isNew),
    },
    images,
    options: [],
    variants,
    categories,
    type_id: null,
    collection_id: null,
    tags: [],
  };
}
