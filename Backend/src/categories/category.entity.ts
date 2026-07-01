import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  name: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  /** Top-level categories use null; only one nesting level is supported (no sub-subcategories). */
  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId: string | null;
}
