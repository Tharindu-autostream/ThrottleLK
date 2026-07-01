import type { Product } from '../app/components/CartContext';

/** Storefront defaults when a product omits rich fields (matches legacy ProductDetail copy). */
export const DEFAULT_PRODUCT_DESCRIPTION =
  'Premium quality streetwear hoodie crafted from heavyweight cotton blend. ' +
  'Features oversized fit, reinforced stitching, and a bold design that makes a statement. ' +
  'Perfect for those who refuse to blend in.';

export const DEFAULT_PRODUCT_SPECIFICATIONS: readonly string[] = [
  'Material: 80% Cotton, 20% Polyester',
  'Weight: 400 GSM heavyweight fabric',
  'Fit: Oversized streetwear fit',
  'Origin: Made in Sri Lanka',
  'Care: Machine wash cold, hang dry',
];

export const DEFAULT_PRODUCT_SIZES: readonly string[] = [
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

export const DEFAULT_PRODUCT_STOCK = 10;

export const PRODUCT_LIST_DEFAULTS = {
  description: DEFAULT_PRODUCT_DESCRIPTION,
  specifications: [...DEFAULT_PRODUCT_SPECIFICATIONS],
  sizes: [...DEFAULT_PRODUCT_SIZES],
  stock: DEFAULT_PRODUCT_STOCK,
} as const;

/** Ensures API / legacy payloads include description, specs, and sizes for the storefront. */
export function mergeProductListItem(
  p: Pick<Product, 'id' | 'name' | 'price' | 'category' | 'colors' | 'image'> &
    Partial<Pick<Product, 'images' | 'description' | 'specifications' | 'sizes' | 'stock'>>,
): Product {
  const desc = p.description?.trim() ?? '';
  const images =
    (p.images?.length ?? 0) > 0
      ? [...p.images!]
      : p.image
        ? [p.image]
        : [];
  return {
    ...PRODUCT_LIST_DEFAULTS,
    ...p,
    image: p.image || images[0] || '',
    images,
    description:
      desc.length > 0 ? desc : PRODUCT_LIST_DEFAULTS.description,
    specifications:
      (p.specifications?.length ?? 0) > 0
        ? [...p.specifications!]
        : [...PRODUCT_LIST_DEFAULTS.specifications],
    sizes:
      (p.sizes?.length ?? 0) > 0
        ? [...p.sizes!]
        : [...PRODUCT_LIST_DEFAULTS.sizes],
    stock:
      typeof p.stock === 'number' && p.stock >= 0
        ? Math.floor(p.stock)
        : PRODUCT_LIST_DEFAULTS.stock,
  };
}

type ApiProductRow = Pick<Product, 'id' | 'name' | 'price' | 'category' | 'colors' | 'image'> &
  Partial<Pick<Product, 'description' | 'specifications' | 'sizes' | 'stock' | 'discountPercent'>>;

/**
 * Coerces one `/products` or `/admin/products` JSON row into a full `Product`
 * (same shape as cart + product detail). Use after `JSON.parse` / `res.json()`.
 */
export function parseProductFromApi(row: unknown): Product | null {
  if (!row || typeof row !== 'object') {
    return null;
  }
  const r = row as Record<string, unknown>;
  const id = String(r.id ?? '').trim();
  const name = String(r.name ?? '').trim();
  if (!id || !name) {
    return null;
  }
  const rawPrice = r.price;
  const price =
    typeof rawPrice === 'number' && Number.isFinite(rawPrice)
      ? Math.max(0, Math.round(rawPrice))
      : Math.max(0, Math.round(Number(rawPrice ?? 0)));
  const category = String(r.category ?? '').trim();
  const colorsRaw = r.colors;
  const colors = Array.isArray(colorsRaw)
    ? (colorsRaw as unknown[]).map((c) => String(c).trim()).filter(Boolean)
    : [];
  const image = String(r.image ?? '').trim();
  const imagesRaw = r.images;
  const imagesFromApi = Array.isArray(imagesRaw)
    ? (imagesRaw as unknown[]).map((u) => String(u).trim()).filter(Boolean)
    : [];
  const images =
    imagesFromApi.length > 0 ? imagesFromApi : image ? [image] : [];
  const cover = image || images[0] || '';
  const desc = r.description;
  const description =
    desc == null ? undefined : String(desc);
  const specsRaw = r.specifications;
  const specifications = Array.isArray(specsRaw)
    ? (specsRaw as unknown[]).map((s) => String(s).trim()).filter(Boolean)
    : undefined;
  const sizesRaw = r.sizes;
  const sizes = Array.isArray(sizesRaw)
    ? (sizesRaw as unknown[]).map((s) => String(s).trim()).filter(Boolean)
    : undefined;
  const rawStock = r.stock;
  const stock =
    typeof rawStock === 'number' && Number.isFinite(rawStock)
      ? Math.max(0, Math.floor(rawStock))
      : Math.max(0, Math.floor(Number(rawStock ?? DEFAULT_PRODUCT_STOCK)));

  const rawDiscount = r.discountPercent;
  const discountPercent =
    typeof rawDiscount === 'number' &&
    Number.isFinite(rawDiscount) &&
    rawDiscount > 0 &&
    rawDiscount <= 99
      ? Math.floor(rawDiscount)
      : undefined;

  const base: ApiProductRow = {
    id,
    name,
    price,
    category,
    colors: colors.length > 0 ? colors : ['#0A0A0A'],
    image: cover,
    images: images.length > 0 ? images : cover ? [cover] : [],
    description,
    specifications,
    sizes,
    stock,
    discountPercent,
  };
  return mergeProductListItem(base);
}
