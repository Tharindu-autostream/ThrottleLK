import { apiUrl } from './api';

export type CatalogCategory = {
  id: string;
  name: string;
  sortOrder: number;
  parentId: string | null;
};

export type CategoryGroup = {
  id: string;
  name: string;
  sortOrder: number;
  children: { id: string; name: string; sortOrder: number }[];
};

export const FALLBACK_CATEGORY_NAMES = [
  'Zip-up',
  'Non Zip',
  'Limited Edition',
] as const;

/** Used when the API is offline — matches default Hoodie + three subs (no Glous). */
export const FALLBACK_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'fallback-hoodie',
    name: 'Hoodie',
    sortOrder: 1,
    children: FALLBACK_CATEGORY_NAMES.map((name, i) => ({
      id: `fallback-${name}`,
      name,
      sortOrder: i + 1,
    })),
  },
];

function parseGroup(row: unknown): CategoryGroup | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const name = String(r.name ?? '').trim();
  const id = String(r.id ?? '').trim();
  if (!name || !id) return null;
  const sortOrder = Number(r.sortOrder ?? r.sort_order ?? 0);
  const rawChildren = r.children;
  const children: CategoryGroup['children'] = [];
  if (Array.isArray(rawChildren)) {
    for (const ch of rawChildren) {
      if (!ch || typeof ch !== 'object') continue;
      const c = ch as Record<string, unknown>;
      const cn = String(c.name ?? '').trim();
      const cid = String(c.id ?? '').trim();
      if (!cn || !cid) continue;
      children.push({
        id: cid,
        name: cn,
        sortOrder: Number(c.sortOrder ?? c.sort_order ?? 0),
      });
    }
  }
  children.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  return { id, name, sortOrder, children };
}

export async function fetchPublicCategoryGroups(): Promise<CategoryGroup[]> {
  const res = await fetch(apiUrl('/categories'));
  if (!res.ok) {
    throw new Error('Failed to load categories');
  }
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  const groups = raw
    .map(parseGroup)
    .filter((g): g is CategoryGroup => g !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return groups;
}

/** Flat list for admin tables (includes parentId). */
export function parseAdminCategory(row: unknown): CatalogCategory | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const name = String(r.name ?? '').trim();
  if (!name) return null;
  const pid = r.parentId ?? r.parent_id;
  const parentId =
    pid === null || pid === undefined || pid === ''
      ? null
      : String(pid);
  return {
    id: String(r.id ?? ''),
    name,
    sortOrder: Number(r.sortOrder ?? r.sort_order ?? 0),
    parentId,
  };
}

export function leafCategoryNamesFromFlatList(
  items: CatalogCategory[],
): string[] {
  const idsWithChildren = new Set<string>();
  for (const c of items) {
    if (c.parentId) {
      idsWithChildren.add(c.parentId);
    }
  }
  return items
    .filter((c) => !idsWithChildren.has(c.id))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((c) => c.name);
}

export function rootCategoriesForParentPicker(
  items: CatalogCategory[],
  editingId: string | null,
): CatalogCategory[] {
  return items
    .filter((c) => c.parentId === null && c.id !== editingId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
