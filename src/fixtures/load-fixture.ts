import { readFileSync } from 'node:fs';
import path from 'node:path';

const fixturesDir = path.resolve(process.cwd(), 'src', 'fixtures');

export function loadFixture<T = unknown>(fixtureName: string): T {
  const fixturePath = path.join(fixturesDir, fixtureName);
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as T;
}
