import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../../lib/api';
import type { CatalogCategory } from '../../lib/categories';
import {
  parseAdminCategory,
  rootCategoriesForParentPicker,
} from '../../lib/categories';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { useAdminAuth } from './AdminAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

function formatCategoryDisplayName(
  c: CatalogCategory,
  items: CatalogCategory[],
): string {
  if (!c.parentId) return c.name;
  const p = items.find((x) => x.id === c.parentId);
  return p ? `${p.name} › ${c.name}` : c.name;
}

function hasSubcategories(id: string, items: CatalogCategory[]): boolean {
  return items.some((x) => x.parentId === id);
}

export default function AdminCategoriesPage() {
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategory | null>(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [parentId, setParentId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/categories', { token });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load categories');
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('Invalid response');
      setItems(
        raw
          .map(parseAdminCategory)
          .filter((c): c is CatalogCategory => c !== null)
          .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
      );
    } catch {
      toast.error('Could not load categories');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setName('');
    setParentId('');
    setSortOrder(String(items.length + 1));
    setDialogOpen(true);
  }

  function openEdit(c: CatalogCategory) {
    setEditing(c);
    setName(c.name);
    setSortOrder(String(c.sortOrder));
    setParentId(c.parentId ?? '');
    setDialogOpen(true);
  }

  async function saveCategory() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Category name is required');
      return;
    }
    const orderNum = Number(sortOrder);
    if (!Number.isInteger(orderNum) || orderNum < 0) {
      toast.error('Sort order must be a non-negative whole number');
      return;
    }
    const body = {
      name: trimmed,
      sortOrder: orderNum,
      parentId: parentId || null,
    };
    try {
      const path = editing
        ? `/admin/categories/${editing.id}`
        : '/admin/categories';
      const res = await apiFetch(path, {
        method: editing ? 'PATCH' : 'POST',
        token,
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string | string[];
        };
        const msg = Array.isArray(err.message)
          ? err.message.join(', ')
          : err.message;
        throw new Error(msg || 'Save failed');
      }
      toast.success(editing ? 'Category updated' : 'Category created');
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/admin/categories/${deleteTarget.id}`, {
        method: 'DELETE',
        token,
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string | string[];
        };
        const msg = Array.isArray(err.message)
          ? err.message.join(', ')
          : err.message;
        throw new Error(msg || 'Delete failed');
      }
      toast.success('Category deleted');
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete category');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-4xl tracking-wider text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Categories
          </h1>
          <p className="text-[#F0EDE8]/60 text-sm">
            Top-level groups (e.g. Hoodie, Glous) appear as main shop filters. Put
            types like Zip-up under a group using &quot;Under group&quot;. Renaming
            updates products that use that label.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
        >
          <Plus className="w-4 h-4" />
          Add category
        </Button>
      </div>

      <div className="rounded-lg border border-[#2C2C2C] bg-[#141414]/80 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">
            No categories yet. Add your first category.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2C2C2C] hover:bg-transparent">
                <TableHead className="text-[#F0EDE8]">Name</TableHead>
                <TableHead className="text-[#F0EDE8] hidden sm:table-cell">
                  Placement
                </TableHead>
                <TableHead className="text-[#F0EDE8] text-right">Sort order</TableHead>
                <TableHead className="text-[#F0EDE8] w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id} className="border-[#2C2C2C]">
                  <TableCell className="font-medium text-[#F0EDE8]">
                    {formatCategoryDisplayName(c, items)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-[#F0EDE8]/60 text-sm">
                    {c.parentId ? 'Sub-category' : 'Main filter'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#F0EDE8]/80">
                    {c.sortOrder}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-[#F0EDE8] hover:bg-[#C0392B]/20"
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-[#C0392B] hover:bg-[#C0392B]/15"
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141414] border-[#2C2C2C] text-[#F0EDE8] sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {editing ? 'Edit category' : 'New category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                placeholder="e.g. Hoodies"
              />
            </div>
            <div className="space-y-2">
              <Label>Under group (optional)</Label>
              <select
                className="w-full h-9 rounded-md border border-[#2C2C2C] bg-[#0A0A0A] px-3 text-sm text-[#F0EDE8] disabled:opacity-50"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={!!editing && hasSubcategories(editing.id, items)}
              >
                <option value="">Top-level (separate main filter)</option>
                {rootCategoriesForParentPicker(items, editing?.id ?? null).map(
                  (r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ),
                )}
              </select>
              {editing && hasSubcategories(editing.id, items) ? (
                <p className="text-xs text-amber-200/80">
                  Move or delete sub-categories first before changing this row&apos;s
                  group.
                </p>
              ) : (
                <p className="text-xs text-[#F0EDE8]/50">
                  One level only: pick a top-level group, not another sub-category.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
              />
              <p className="text-xs text-[#F0EDE8]/50">
                Lower numbers appear first in the shop filter bar.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className={ADMIN_OUTLINE_BUTTON_CLASS}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
              onClick={saveCategory}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-[#141414] border-[#2C2C2C] text-[#F0EDE8]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#F0EDE8]/70">
              {deleteTarget ? (
                <>
                  This removes <strong>{deleteTarget.name}</strong>. You cannot
                  delete a category that still has products or sub-categories under
                  it.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2C2C2C] bg-transparent text-[#F0EDE8]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}