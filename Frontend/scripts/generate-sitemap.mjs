// Generates Frontend/public/sitemap.xml at build time (see the "prebuild" script
// in package.json). Fetches the live product catalog from the API so every
// product's `/product/:slug` URL is included, alongside the homepage.
//
// Note: since the storefront is static hosting + a separate live API, this
// sitemap only refreshes when the frontend is rebuilt/redeployed — not the
// instant a product is added in the admin panel. Redeploy (or trigger a
// periodic rebuild) to pick up newly added products.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendDir, '..');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    out[key] = value;
  }
  return out;
}

function pick(envs, keys) {
  for (const env of envs) {
    for (const key of keys) {
      if (env[key]) return env[key];
    }
  }
  return undefined;
}

// This script produces the *public* sitemap, so default to production env
// values unless explicitly told otherwise. Priority (highest first) mirrors
// Vite: Frontend dir over repo root, and mode-specific files over the base `.env`.
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const envFiles = [
  path.join(frontendDir, `.env.${mode}`),
  path.join(frontendDir, '.env'),
  path.join(repoRoot, `.env.${mode}`),
  path.join(repoRoot, '.env'),
].map(parseEnvFile);

const backendPath = (
  pick(envFiles, ['VITE_BACKEND_PATH', 'BACKEND_PATH', 'VITE_API_URL']) ||
  process.env.VITE_BACKEND_PATH ||
  'https://api.throttlelk.online'
).replace(/\/$/, '');

const frontendPath = (
  pick(envFiles, ['VITE_FRONTEND_PATH', 'FRONTEND_PATH']) ||
  process.env.VITE_FRONTEND_PATH ||
  'https://throttlelk.online'
).replace(/\/$/, '');

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function fetchProducts() {
  try {
    const res = await fetch(`${backendPath}/products`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`bad status ${res.status}`);
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.warn(
      `[generate-sitemap] Could not fetch products from ${backendPath}/products (${
        err instanceof Error ? err.message : String(err)
      }). Generating a sitemap with just the homepage.`,
    );
    return [];
  }
}

function urlEntry(loc, { changefreq = 'weekly', priority = '0.6' } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const products = await fetchProducts();

const urls = [
  urlEntry(`${frontendPath}/`, { changefreq: 'daily', priority: '1.0' }),
  ...products
    .filter((p) => p && typeof p.slug === 'string' && p.slug.length > 0)
    .map((p) =>
      urlEntry(`${frontendPath}/product/${p.slug}`, {
        changefreq: 'weekly',
        priority: '0.8',
      }),
    ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
  '\n',
)}\n</urlset>\n`;

const publicDir = path.join(frontendDir, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}
const outPath = path.join(publicDir, 'sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`[generate-sitemap] Wrote ${urls.length} URL(s) to ${outPath}`);
