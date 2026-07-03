/** Mirrors Backend/src/products/slug.util.ts — must stay in sync. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Deterministic, storage-free product slug: `<name-slug>-<first-8-hex-of-id>`. */
export function buildProductSlug(name: string, id: string): string {
  const base = slugify(name) || 'product';
  const shortId = id.replace(/-/g, '').slice(0, 8);
  return `${base}-${shortId}`;
}
