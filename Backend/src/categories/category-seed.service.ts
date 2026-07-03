import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { DEFAULT_CATEGORY_TREE } from './category.seed';
import { Category } from './category.entity';

const LEGACY_HOODIE_CHILD_NAMES = ['Zip-up', 'Non Zip', 'Limited Edition'] as const;

@Injectable()
export class CategorySeedService implements OnModuleInit {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.categories.count();
    if (count === 0) {
      await this.seedFreshTree();
      this.logger.log('Seeded default category tree');
      return;
    }
    await this.ensureHoodieParentForLegacyRows();
    await this.ensureDefaultRootsExist();
  }

  private async seedFreshTree(): Promise<void> {
    for (const root of DEFAULT_CATEGORY_TREE) {
      const rootRow = this.categories.create({
        id: randomUUID(),
        name: root.name,
        sortOrder: root.sortOrder,
        parentId: null,
      });
      await this.categories.save(rootRow);
      for (const child of root.children) {
        await this.categories.save(
          this.categories.create({
            id: randomUUID(),
            name: child.name,
            sortOrder: child.sortOrder,
            parentId: rootRow.id,
          }),
        );
      }
    }
  }

  /**
   * If the DB was created with a flat list (Zip-up, Non Zip, Limited Edition as roots),
   * create a "Hoodie" parent and attach those rows. Idempotent.
   */
  private async ensureHoodieParentForLegacyRows(): Promise<void> {
    const hoodie = await this.categories.findOne({
      where: { name: 'Hoodie' },
    });
    if (hoodie) {
      return;
    }
    const legacyChildren: Category[] = [];
    for (const name of LEGACY_HOODIE_CHILD_NAMES) {
      const row = await this.categories.findOne({ where: { name } });
      if (row && row.parentId === null) {
        legacyChildren.push(row);
      }
    }
    if (legacyChildren.length === 0) {
      return;
    }
    const parent = this.categories.create({
      id: randomUUID(),
      name: 'Hoodie',
      sortOrder: Math.min(...legacyChildren.map((c) => c.sortOrder), 1),
      parentId: null,
    });
    await this.categories.save(parent);
    for (const child of legacyChildren) {
      child.parentId = parent.id;
      await this.categories.save(child);
    }
    this.logger.log(
      `Attached ${legacyChildren.length} legacy categories under "Hoodie"`,
    );
  }

  /**
   * Adds any root (and its children) from `DEFAULT_CATEGORY_TREE` that doesn't exist
   * yet, without touching existing rows. Lets us introduce new default categories
   * (e.g. an upcoming product line) that automatically appear on already-seeded
   * databases the next time the backend restarts.
   */
  private async ensureDefaultRootsExist(): Promise<void> {
    for (const root of DEFAULT_CATEGORY_TREE) {
      const existing = await this.categories.findOne({
        where: { name: root.name },
      });
      if (existing) {
        continue;
      }
      const rootRow = this.categories.create({
        id: randomUUID(),
        name: root.name,
        sortOrder: root.sortOrder,
        parentId: null,
      });
      await this.categories.save(rootRow);
      for (const child of root.children) {
        await this.categories.save(
          this.categories.create({
            id: randomUUID(),
            name: child.name,
            sortOrder: child.sortOrder,
            parentId: rootRow.id,
          }),
        );
      }
      this.logger.log(`Added new default root category "${root.name}"`);
    }
  }
}
