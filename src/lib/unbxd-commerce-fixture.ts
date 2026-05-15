import type { Request } from 'express';
import poultryFixture from '../fixtures/unbxd-search-poultry.json';
import fencingFixture from '../fixtures/unbxd-search-fencing.json';
import catLitterFixture from '../fixtures/unbxd-search-cat-litter.json';

export type UnbxdCommerceSearchFixture = typeof poultryFixture | typeof fencingFixture | typeof catLitterFixture;

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Every Unbxd row used by search mocks — for `get-product` resolution. */
export function getAllUnbxdCommerceCatalogProducts(): unknown[] {
  return [
    ...poultryFixture.response.products,
    ...fencingFixture.response.products,
    ...catLitterFixture.response.products,
  ];
}

function mergeCommerceSearchFixtures(
  a: UnbxdCommerceSearchFixture,
  b: UnbxdCommerceSearchFixture,
  c: UnbxdCommerceSearchFixture
): UnbxdCommerceSearchFixture {
  const out = deepClone(a);
  out.response.products = [
    ...a.response.products,
    ...b.response.products,
    ...c.response.products,
  ];
  const n = out.response.products.length;
  out.response.numberOfProducts = n;

  const ml = out.facets?.multilevel?.list?.[0];
  const bml = b.facets?.multilevel?.list?.[0];
  const cml = c.facets?.multilevel?.list?.[0];
  if (ml?.values && bml?.values && cml?.values) {
    const seen = new Set(ml.values.map((v: { name: string }) => String(v.name)));
    for (const v of bml.values as { name: string; count: number }[]) {
      if (!seen.has(String(v.name))) {
        ml.values.push({ ...v });
        seen.add(String(v.name));
      }
    }
    for (const v of cml.values as { name: string; count: number }[]) {
      if (!seen.has(String(v.name))) {
        ml.values.push({ ...v });
        seen.add(String(v.name));
      }
    }
  }

  out.searchMetaData = {
    ...a.searchMetaData,
    queryParams: {
      ...(a.searchMetaData?.queryParams && typeof a.searchMetaData.queryParams === 'object'
        ? { ...a.searchMetaData.queryParams }
        : {}),
      q: 'merged-catalog',
      uid: 'mock-merged-poultry-fencing-cat-litter',
    } as typeof a.searchMetaData.queryParams,
  };
  return out as UnbxdCommerceSearchFixture;
}

const mergedFixture: UnbxdCommerceSearchFixture = mergeCommerceSearchFixtures(
  poultryFixture,
  fencingFixture,
  catLitterFixture
);

function requestHaystack(req: Request): string {
  const q = req.query as Record<string, unknown>;
  const parts: string[] = [];
  for (const [key, val] of Object.entries(q)) {
    parts.push(key.toLowerCase());
    if (Array.isArray(val)) {
      for (const v of val) parts.push(String(v).toLowerCase());
    } else if (val !== undefined && val !== null) {
      parts.push(String(val).toLowerCase());
    }
  }
  parts.push((req.path ?? '').toLowerCase());
  parts.push((req.originalUrl ?? '').toLowerCase());
  return parts.join('\u0001');
}

function matchesPoultry(h: string): boolean {
  return (
    /\b1126\b/.test(h) ||
    /\b1125\b/.test(h) ||
    h.includes('poultry-feed') ||
    h.includes('poultry/poultry-feed') ||
    h.includes('poultry%2fpoultry-feed') ||
    h.includes('poultry%2fpoultry%2ffeed')
  );
}

function matchesFencing(h: string): boolean {
  return (
    /\b164\b/.test(h) ||
    /\b174\b/.test(h) ||
    /\b173\b/.test(h) ||
    /\b1269\b/.test(h) ||
    h.includes('wire-fencing') ||
    h.includes('wire_fencing') ||
    h.includes('/fencing/') ||
    h.includes('%2ffencing%2f') ||
    h.includes('hardware-cloth') ||
    h.includes('barbed-wire')
  );
}

function matchesCatLitter(h: string): boolean {
  return (
    /\b1067\b/.test(h) ||
    /\b1068\b/.test(h) ||
    h.includes('cat-litter') ||
    h.includes('cat_litter') ||
    h.includes('/pet/cat') ||
    h.includes('%2fpet%2fcat') ||
    h.includes('cat%20litter')
  );
}

/**
 * Picks Unbxd commerce JSON by request signals (q, p, fq, path) or `UNBXD_SEARCH_CATALOG`.
 * `UNBXD_SEARCH_CATALOG=poultry|fencing|cat_litter|merged` forces a profile (merged = all three).
 * When nothing matches, returns **merged** poultry + fencing + cat litter (generic search / tests).
 */
export function resolveCommerceSearchFixture(req: Request): UnbxdCommerceSearchFixture {
  const forced = process.env.UNBXD_SEARCH_CATALOG?.trim().toLowerCase();
  if (forced === 'poultry') return deepClone(poultryFixture);
  if (forced === 'fencing') return deepClone(fencingFixture);
  if (forced === 'cat_litter' || forced === 'catlitter') return deepClone(catLitterFixture);
  if (forced === 'merged' || forced === 'all') return deepClone(mergedFixture);

  const h = requestHaystack(req);
  if (matchesPoultry(h)) return deepClone(poultryFixture);
  if (matchesFencing(h)) return deepClone(fencingFixture);
  if (matchesCatLitter(h)) return deepClone(catLitterFixture);
  return deepClone(mergedFixture);
}
