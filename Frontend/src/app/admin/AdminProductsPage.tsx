import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, uploadProductImages } from '../../lib/api';
import {
  DEFAULT_PRODUCT_STOCK,
  PRODUCT_LIST_DEFAULTS,
  parseProductFromApi,
} from '../../lib/productDisplayDefaults';
import type { Product } from '../components/CartContext';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { useAdminAuth } from './AdminAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
import AdminColorPicker from './AdminColorPicker';
import AdminProductImagePicker from './AdminProductImagePicker';
import AdminSizePicker from './AdminSizePicker';
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

import type { CatalogCategory } from '../../lib/categories';
import {
  FALLBACK_CATEGORY_NAMES,
  leafCategoryNamesFromFlatList,
  parseAdminCategory,
} from '../../lib/categories';

function newProductFormDefaults(categoryNames: string[]) {
  return {
    name: '',
    price: '',
    category: categoryNames[0] ?? FALLBACK_CATEGORY_NAMES[0],
    colors: ['#0A0A0A', '#2C2C2C'] as string[],
    imageUrls: [] as string[],
    description: PRODUCT_LIST_DEFAULTS.description,
    specsRaw: PRODUCT_LIST_DEFAULTS.specifications.join('\n'),
    sizes: [...PRODUCT_LIST_DEFAULTS.sizes],
    stock: String(DEFAULT_PRODUCT_STOCK),
  };
}

function parseSpecsRaw(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function AdminProductsPage() {
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CatalogCategory[]>([]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORY_NAMES[0]);
  const [colors, setColors] = useState<string[]>(['#0A0A0A', '#2C2C2C']);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [specsRaw, setSpecsRaw] = useState('');
  const [sizes, setSizes] = useState<string[]>([...PRODUCT_LIST_DEFAULTS.sizes]);
  const [stock, setStock] = useState(String(DEFAULT_PRODUCT_STOCK));
  const [discountPercent, setDiscountPercent] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/categories', { token });
      if (!res.ok) return;
      const raw = await res.json();
      if (!Array.isArray(raw)) return;
      const parsed = raw
        .map(parseAdminCategory)
        .filter((c): c is CatalogCategory => c !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      if (parsed.length > 0) {
        setCategoryOptions(parsed);
      }
    } catch {
      /* keep fallback names in UI */
    }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/products', { token });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load products');
      }
      const raw = await res.json();
      if (!Array.isArray(raw)) {
        throw new Error('Invalid response');
      }
      setItems(
        raw
          .map(parseProductFromApi)
          .filter((p): p is Product => p !== null),
      );
    } catch {
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
    loadCategories();
  }, [load, loadCategories]);

  const leafCategoryNames = useMemo(
    () => leafCategoryNamesFromFlatList(categoryOptions),
    [categoryOptions],
  );

  const categoryNames = useMemo(() => {
    const base =
      leafCategoryNames.length > 0 ? leafCategoryNames : [...FALLBACK_CATEGORY_NAMES];
    const current = category.trim();
    if (current && !base.includes(current)) {
      return [current, ...base];
    }
    return base;
  }, [leafCategoryNames, category]);

  function openCreate() {
    setEditing(null);
    const d = newProductFormDefaults(categoryNames);
    setName(d.name);
    setPrice(d.price);
    setCategory(d.category);
    setColors(d.colors);
    setImageUrls([]);
    setPendingFiles([]);
    setDescription(d.description);
    setSpecsRaw(d.specsRaw);
    setSizes(d.sizes);
    setStock(d.stock);
    setDiscountPercent('');
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category);
    setColors([...p.colors]);
    setImageUrls(p.images?.length ? [...p.images] : p.image ? [p.image] : []);
    setPendingFiles([]);
    setDescription(p.description);
    setSpecsRaw(p.specifications.join('\n'));
    setSizes([...p.sizes]);
    setStock(String(p.stock));
    setDiscountPercent(p.discountPercent ? String(p.discountPercent) : '');
    setDialogOpen(true);
  }

  async function saveProduct() {
    if (colors.length < 1) {
      toast.error('Select at least one color');
      return;
    }
    const priceNum = Number(price);
    if (!Number.isInteger(priceNum) || priceNum < 0) {
      toast.error('Price must be a non-negative whole number');
      return;
    }
    const specifications = parseSpecsRaw(specsRaw);
    if (sizes.length < 1) {
      toast.error('Select at least one size from the size chart');
      return;
    }
    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      toast.error('Quantity must be a non-negative whole number');
      return;
    }
    const discountNum = discountPercent.trim() === '' ? 0 : Number(discountPercent);
    if (!Number.isInteger(discountNum) || discountNum < 0 || discountNum > 99) {
      toast.error('Discount must be a whole number between 0 and 99');
      return;
    }
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (imageUrls.length + pendingFiles.length < 1) {
      toast.error('Add at least one product image');
      return;
    }
    setSaving(true);
    try {
      let allUrls = [...imageUrls];
      if (pendingFiles.length > 0) {
        const uploaded = await uploadProductImages(pendingFiles, token);
        allUrls = [...allUrls, ...uploaded];
      }
      allUrls = allUrls.slice(0, 5);
      const body = {
        name: name.trim(),
        price: priceNum,
        category: category.trim(),
        colors,
        image: allUrls[0],
        images: allUrls,
        description: description.trim(),
        specifications,
        sizes,
        stock: stockNum,
        discountPercent: discountNum > 0 ? discountNum : 0,
      };
      if (editing) {
        const res = await apiFetch(`/admin/products/${editing.id}`, {
          method: 'PATCH',
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
          throw new Error(msg || 'Update failed');
        }
        toast.success('Product updated');
      } else {
        const res = await apiFetch('/admin/products', {
          method: 'POST',
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
          throw new Error(msg || 'Create failed');
        }
        toast.success('Product created');
      }
      setDialogOpen(false);
      setPendingFiles([]);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
        token,
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      toast.success('Product deleted');
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Could not delete product');
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
            Products
          </h1>
          <p className="text-[#F0EDE8]/60 text-sm">
            Same fields as the storefront (grid cards and product detail). The table
            loads from your database; each row is normalized to the full Product shape
            the site expects.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
        >
          <Plus className="w-4 h-4" />
          Add product
        </Button>
      </div>

      <div className="rounded-lg border border-[#2C2C2C] bg-[#141414]/80 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-[#F0EDE8]/70">
            No products yet. Seed the database or add your first item.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2C2C2C] hover:bg-transparent">
                <TableHead className="text-[#F0EDE8]">Name</TableHead>
                <TableHead className="text-[#F0EDE8]">Category</TableHead>
                <TableHead className="text-[#F0EDE8] text-right">
                  Price (LKR)
                </TableHead>
                <TableHead className="text-[#F0EDE8] text-right">
                  Discount
                </TableHead>
                <TableHead className="text-[#F0EDE8] text-right">
                  Qty
                </TableHead>
                <TableHead className="text-[#F0EDE8] w-[120px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} className="border-[#2C2C2C]">
                  <TableCell className="font-medium text-[#F0EDE8]">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt=""
                        className="w-10 h-10 shrink-0 rounded object-cover bg-[#2C2C2C]"
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#F0EDE8]/80">
                    {p.category}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#F0EDE8]">
                    {p.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.discountPercent ? (
                      <span className="text-[#C0392B] font-medium">
                        {p.discountPercent}%
                      </span>
                    ) : (
                      <span className="text-[#F0EDE8]/30">—</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      p.stock <= 0 ? 'text-[#C0392B]' : 'text-[#F0EDE8]'
                    }`}
                  >
                    {p.stock}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-[#F0EDE8] hover:bg-[#C0392B]/20"
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-[#C0392B] hover:bg-[#C0392B]/15"
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`Delete ${p.name}`}
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
        <DialogContent className="bg-[#141414] border-[#2C2C2C] text-[#F0EDE8] max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {editing ? 'Edit product' : 'New product'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <AdminProductImagePicker
              urls={imageUrls}
              pendingFiles={pendingFiles}
              onUrlsChange={setImageUrls}
              onPendingChange={setPendingFiles}
            />
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (LKR, integer)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  step={1}
                  placeholder="0 = no discount"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                />
                {discountPercent && Number(discountPercent) > 0 && price && Number(price) > 0 && (
                  <p className="text-xs text-[#C0392B]">
                    Sale price: LKR{' '}
                    {Math.round(Number(price) * (1 - Number(discountPercent) / 100)).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full h-9 rounded-md border border-[#2C2C2C] bg-[#0A0A0A] px-3 text-sm text-[#F0EDE8]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#F0EDE8]/50">
                  Pick the product type (e.g. Zip-up under Hoodie). Main groups like
                  Hoodie are not listed here — manage them under{' '}
                  <a href="/admin/categories" className="text-[#C0392B] underline">
                    Admin → Categories
                  </a>
                  .
                </p>
              </div>
              <div className="space-y-2">
                <Label>Quantity in stock</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                />
                <p className="text-xs text-[#F0EDE8]/50">
                  Customers cannot add more than this amount. Set to 0 to show sold
                  out on the storefront.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8] resize-y min-h-[100px]"
              />
              <p className="text-xs text-[#F0EDE8]/50">
                Body copy under the price on the product detail view.
              </p>
            </div>
            <AdminColorPicker value={colors} onChange={setColors} />
            <AdminSizePicker value={sizes} onChange={setSizes} />
            <div className="space-y-2">
              <Label>Specifications (one line each)</Label>
              <Textarea
                value={specsRaw}
                onChange={(e) => setSpecsRaw(e.target.value)}
                rows={6}
                className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8] font-mono text-sm resize-y min-h-[120px]"
              />
              <p className="text-xs text-[#F0EDE8]/50">
                Each non-empty line becomes a bullet in the Specifications section.
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
              onClick={saveProduct}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
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
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#F0EDE8]/70">
              {deleteTarget ? (
                <>
                  This removes <strong>{deleteTarget.name}</strong> from the
                  catalog. This cannot be undone.
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
