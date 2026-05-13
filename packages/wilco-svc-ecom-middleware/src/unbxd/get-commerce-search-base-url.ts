/**
 * Intended for the real `wilco-svc-ecom-middleware` package: copy this file into that
 * package and use it wherever the Unbxd commerce-search base URL is built.
 *
 * `UNBXD_COMMERCE_SEARCH_BASE_URL` — full base URL with scheme, host, path including
 * API key and site key segments, **no trailing slash** (e.g.
 * `https://your-app.up.railway.app/yourApiKey/yourSiteKey`).
 *
 * When unset, matches current production behavior:
 * `https://search.unbxd.io/<UNBXD_API_KEY>/<UNBXD_SITE_KEY>`.
 */
export function getUnbxdCommerceSearchBaseUrl(): string {
  const raw = process.env.UNBXD_COMMERCE_SEARCH_BASE_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, '');
  }
  const apiKey = process.env.UNBXD_API_KEY ?? '';
  const siteKey = process.env.UNBXD_SITE_KEY ?? '';
  if (!apiKey || !siteKey) {
    throw new Error(
      'UNBXD_COMMERCE_SEARCH_BASE_URL is unset; set it or provide UNBXD_API_KEY and UNBXD_SITE_KEY for the default search.unbxd.io base'
    );
  }
  return `https://search.unbxd.io/${apiKey}/${siteKey}`;
}
