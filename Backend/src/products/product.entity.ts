import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', unsigned: true })
  price: number;

  @Column({ type: 'varchar', length: 128 })
  category: string;

  @Column({ type: 'json' })
  colors: string[];

  @Column({ type: 'text' })
  image: string;

  /** Up to 5 product photos; first entry matches `image` for cards. */
  @Column({ type: 'json', nullable: true })
  images: string[] | null;

  /** MySQL does not allow DEFAULT on TEXT; use null + app defaults in ProductsService. */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  specifications: string[] | null;

  @Column({ type: 'json', nullable: true })
  sizes: string[] | null;

  /** Units available for purchase (0 = sold out on storefront). */
  @Column({ type: 'int', unsigned: true, default: 0 })
  stock: number;

  /** Discount percentage 1–99. Null / 0 means no discount. */
  @Column({ type: 'tinyint', unsigned: true, nullable: true, default: null })
  discountPercent: number | null;
}
