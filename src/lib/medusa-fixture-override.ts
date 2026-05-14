import fs from 'node:fs';
import path from 'node:path';

/**
 * Optional `FIXTURES_DIR/get-product-<displayId>.json` files must contain
 * `{ "product": { ... } }` (full body as returned by GET /store/get-product).
 */
export function loadGetProductFixtureOverride(
  fixturesDir: string,
  displayId: string
): { product: unknown } | null {
  const dir = path.resolve(fixturesDir);
  const file = path.join(dir, `get-product-${displayId}.json`);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return null;
  }
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'product' in parsed &&
      typeof (parsed as { product: unknown }).product === 'object' &&
      (parsed as { product: unknown }).product !== null
    ) {
      return parsed as { product: unknown };
    }
    return null;
  } catch {
    return null;
  }
}
