import { randomUUID } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export type CategoryUpsertFields = Pick<
  Category,
  'name' | 'sortOrder' | 'parentId'
>;

export type PublicCategoryChild = {
  id: string;
  name: string;
  sortOrder: number;
};

export type PublicCategoryGroup = {
  id: string;
  name: string;
  sortOrder: number;
  children: PublicCategoryChild[];
};

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categories.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  findOne(id: string): Promise<Category | null> {
    return this.categories.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Category | null> {
    return this.categories.findOne({ where: { name } });
  }

  async countChildren(parentId: string): Promise<number> {
    return this.categories.count({ where: { parentId } });
  }

  /** Categories that can be assigned to products (no sub-rows under this name). */
  async listLeafCategoryNames(): Promise<string[]> {
    const all = await this.findAll();
    const idsWithChildren = new Set<string>();
    for (const c of all) {
      if (c.parentId) {
        idsWithChildren.add(c.parentId);
      }
    }
    return all
      .filter((c) => !idsWithChildren.has(c.id))
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b));
  }

  async getPublicTree(): Promise<PublicCategoryGroup[]> {
    const all = await this.findAll();
    const byParent = new Map<string | null, Category[]>();
    for (const c of all) {
      const key = c.parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }
    const sortFn = (a: Category, b: Category) =>
      a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    const roots = (byParent.get(null) ?? []).sort(sortFn);
    return roots.map((root) => ({
      id: root.id,
      name: root.name,
      sortOrder: root.sortOrder,
      children: (byParent.get(root.id) ?? [])
        .sort(sortFn)
        .map((ch) => ({
          id: ch.id,
          name: ch.name,
          sortOrder: ch.sortOrder,
        })),
    }));
  }

  private async assertValidParent(
    parentId: string | null,
    excludeCategoryId?: string,
  ): Promise<void> {
    if (parentId === null || parentId === undefined) {
      return;
    }
    const parent = await this.findOne(parentId);
    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
    if (parent.parentId) {
      throw new BadRequestException(
        'Only one level of nesting is allowed — pick a top-level category as parent',
      );
    }
    if (excludeCategoryId && parent.id === excludeCategoryId) {
      throw new BadRequestException('A category cannot be its own parent');
    }
  }

  async create(data: CategoryUpsertFields): Promise<Category> {
    const name = data.name.trim();
    const existing = await this.findByName(name);
    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
    const parentId = data.parentId ?? null;
    await this.assertValidParent(parentId);
    const row = this.categories.create({
      id: randomUUID(),
      name,
      sortOrder: data.sortOrder ?? 0,
      parentId,
    });
    return this.categories.save(row);
  }

  async update(
    id: string,
    patch: Partial<Pick<Category, 'name' | 'sortOrder' | 'parentId'>>,
  ): Promise<Category> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    if (patch.parentId !== undefined) {
      const nextParent = patch.parentId;
      if (nextParent === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      await this.assertValidParent(nextParent, id);
      const childCount = await this.countChildren(id);
      if (childCount > 0 && nextParent !== null) {
        throw new BadRequestException(
          'Cannot assign a parent to a category that already has sub-categories — move or delete sub-categories first',
        );
      }
      existing.parentId = nextParent;
    }
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      const dup = await this.findByName(name);
      if (dup && dup.id !== id) {
        throw new ConflictException(`Category "${name}" already exists`);
      }
      existing.name = name;
    }
    if (patch.sortOrder !== undefined) {
      existing.sortOrder = patch.sortOrder;
    }
    return this.categories.save(existing);
  }

  async remove(id: string): Promise<void> {
    const childCount = await this.countChildren(id);
    if (childCount > 0) {
      throw new ConflictException(
        `Cannot delete this category — ${childCount} sub-categor(y/ies) still use it`,
      );
    }
    const res = await this.categories.delete({ id });
    if ((res.affected ?? 0) === 0) {
      throw new NotFoundException(`Category ${id} not found`);
    }
  }
}
