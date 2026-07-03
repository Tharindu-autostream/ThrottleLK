import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DEFAULT_PRODUCT_DESCRIPTION,
  DEFAULT_PRODUCT_SPECIFICATIONS,
  DEFAULT_PRODUCT_SIZES,
  DEFAULT_PRODUCT_STOCK,
} from './product-defaults';
import { Product } from './product.entity';
import { buildProductSlug } from './slug.util';

export const MAX_PRODUCT_IMAGES = 5;

/** Product plus a computed, non-persisted SEO-friendly slug. */
export type ProductWithSlug = Product & { slug: string };

export type ProductUpsertFields = Pick<
  Product,
  | 'name'
  | 'price'
  | 'category'
  | 'colors'
  | 'image'
  | 'images'
  | 'description'
  | 'specifications'
  | 'sizes'
  | 'stock'
  | 'discountPercent'
>;

function resolveProductImages(data: {
  image?: string;
  images?: string[] | null;
}): { image: string; images: string[] } {
  const fromImages = Array.isArray(data.images)
    ? data.images.map((u) => u.trim()).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES)
    : [];
  const cover = (data.image ?? '').trim() || fromImages[0] || '';
  const images =
    fromImages.length > 0
      ? fromImages
      : cover
        ? [cover]
        : [];
  if (!cover || images.length < 1) {
    throw new Error('At least one product image is required');
  }
  return { image: cover, images };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  private normalize(p: Product): ProductWithSlug {
    const images =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images.filter((u) => typeof u === 'string' && u.trim().length > 0)
        : p.image
          ? [p.image]
          : [];
    const image = (p.image?.trim() || images[0] || '').trim();
    return {
      ...p,
      slug: buildProductSlug(p.name, p.id),
      image,
      images: images.length > 0 ? images : image ? [image] : [],
      description:
        typeof p.description === 'string' && p.description.trim().length > 0
          ? p.description
          : DEFAULT_PRODUCT_DESCRIPTION,
      specifications:
        Array.isArray(p.specifications) && p.specifications.length > 0
          ? p.specifications
          : [...DEFAULT_PRODUCT_SPECIFICATIONS],
      sizes:
        Array.isArray(p.sizes) && p.sizes.length > 0
          ? p.sizes
          : [...DEFAULT_PRODUCT_SIZES],
      stock:
        typeof p.stock === 'number' && Number.isFinite(p.stock) && p.stock >= 0
          ? Math.floor(p.stock)
          : 0,
      discountPercent:
        typeof p.discountPercent === 'number' &&
        p.discountPercent > 0 &&
        p.discountPercent <= 99
          ? Math.floor(p.discountPercent)
          : null,
    };
  }

  findAll(): Promise<ProductWithSlug[]> {
    return this.products
      .find({ order: { id: 'ASC' } })
      .then((rows) => rows.map((r) => this.normalize(r)));
  }

  async findOne(id: string): Promise<ProductWithSlug | null> {
    const row = await this.products.findOne({ where: { id } });
    return row ? this.normalize(row) : null;
  }

  /** Looks up a product by its computed slug (see `slug.util.ts`). */
  async findBySlug(slug: string): Promise<ProductWithSlug | null> {
    const rows = await this.products.find();
    const match = rows.find((r) => buildProductSlug(r.name, r.id) === slug);
    return match ? this.normalize(match) : null;
  }

  countByCategory(category: string): Promise<number> {
    return this.products.count({ where: { category } });
  }

  async renameCategory(from: string, to: string): Promise<void> {
    if (from === to) return;
    await this.products.update({ category: from }, { category: to });
  }

  create(data: Partial<ProductUpsertFields>): Promise<ProductWithSlug> {
    const id = randomUUID();
    const description = (data.description ?? '').trim();
    const specifications =
      (data.specifications?.length ?? 0) > 0
        ? data.specifications!
        : [...DEFAULT_PRODUCT_SPECIFICATIONS];
    const sizes =
      (data.sizes?.length ?? 0) > 0 ? data.sizes! : [...DEFAULT_PRODUCT_SIZES];
    const stock =
      typeof data.stock === 'number' && data.stock >= 0
        ? Math.floor(data.stock)
        : DEFAULT_PRODUCT_STOCK;

    const { image, images } = resolveProductImages(data);

    const discountPercent =
      typeof data.discountPercent === 'number' &&
      data.discountPercent > 0 &&
      data.discountPercent <= 99
        ? Math.floor(data.discountPercent)
        : null;

    const row = this.products.create({
      id,
      name: data.name!,
      price: data.price!,
      category: data.category!,
      colors: data.colors!,
      image,
      images,
      description:
        description.length > 0 ? description : DEFAULT_PRODUCT_DESCRIPTION,
      specifications,
      sizes,
      stock,
      discountPercent,
    });
    return this.products.save(row).then((saved) => this.normalize(saved));
  }

  async update(
    id: string,
    patch: Partial<ProductUpsertFields>,
  ): Promise<ProductWithSlug | null> {
    const existing = await this.products.findOne({ where: { id } });
    if (!existing) {
      return null;
    }
    if (patch.image !== undefined || patch.images !== undefined) {
      const resolved = resolveProductImages({
        image: patch.image ?? existing.image,
        images: patch.images ?? existing.images,
      });
      existing.image = resolved.image;
      existing.images = resolved.images;
    }
    const { image: _img, images: _imgs, discountPercent: _dp, ...rest } = patch;
    Object.assign(existing, rest);
    if (_dp !== undefined) {
      existing.discountPercent =
        typeof _dp === 'number' && _dp > 0 && _dp <= 99
          ? Math.floor(_dp)
          : null;
    }
    if (patch.description !== undefined) {
      const d = (patch.description ?? '').trim();
      existing.description =
        d.length > 0 ? d : DEFAULT_PRODUCT_DESCRIPTION;
    }
    if (patch.specifications !== undefined) {
      const specs = patch.specifications ?? [];
      existing.specifications =
        specs.length > 0 ? specs : [...DEFAULT_PRODUCT_SPECIFICATIONS];
    }
    if (patch.sizes !== undefined) {
      const sz = patch.sizes ?? [];
      existing.sizes =
        sz.length > 0 ? sz : [...DEFAULT_PRODUCT_SIZES];
    }
    const saved = await this.products.save(existing);
    return this.normalize(saved);
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.products.delete({ id });
    return (res.affected ?? 0) > 0;
  }
}
