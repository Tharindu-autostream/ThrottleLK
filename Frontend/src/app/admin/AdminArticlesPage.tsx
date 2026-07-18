import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, uploadProductImages } from '../../lib/api';
import { parseArticle, type Article } from '../../lib/articles';
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

export default function AdminArticlesPage() {
  const { token, logout } = useAdminAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverPending, setCoverPending] = useState<File | null>(null);
  const [authorName, setAuthorName] = useState('Throttle LK');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverPreview = coverPending
    ? URL.createObjectURL(coverPending)
    : coverImage;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/articles', { token });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load articles');
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('Invalid response');
      setItems(
        raw.map(parseArticle).filter((a): a is Article => a !== null),
      );
    } catch {
      toast.error('Could not load articles');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setBody('');
    setCoverImage('');
    setCoverPending(null);
    setAuthorName('Throttle LK');
    setStatus('draft');
    setDialogOpen(true);
  }

  function openEdit(a: Article) {
    setEditing(a);
    setTitle(a.title);
    setSlug(a.slug);
    setExcerpt(a.excerpt);
    setBody(a.body);
    setCoverImage(a.coverImage ?? '');
    setCoverPending(null);
    setAuthorName(a.authorName);
    setStatus(a.status);
    setDialogOpen(true);
  }

  function onCoverPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverPending(file);
  }

  function clearCover() {
    setCoverImage('');
    setCoverPending(null);
  }

  async function saveArticle() {
    const trimmedTitle = title.trim();
    const trimmedExcerpt = excerpt.trim();
    if (!trimmedTitle || !trimmedExcerpt || body.trim().length < 50) {
      toast.error('Title, excerpt, and body (50+ chars) are required');
      return;
    }
    setSaving(true);
    try {
      let nextCover = coverImage.trim() || null;
      if (coverPending) {
        const uploaded = await uploadProductImages([coverPending], token);
        const url = uploaded[0];
        if (!url) throw new Error('Cover image upload failed');
        nextCover = url;
      }
      const payload = {
        title: trimmedTitle,
        slug: slug.trim() || undefined,
        excerpt: trimmedExcerpt,
        body,
        coverImage: nextCover,
        authorName: authorName.trim() || 'Throttle LK',
        status,
      };
      const path = editing
        ? `/admin/articles/${editing.id}`
        : '/admin/articles';
      const res = await apiFetch(path, {
        method: editing ? 'PATCH' : 'POST',
        token,
        body: JSON.stringify(payload),
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
      toast.success(editing ? 'Article updated' : 'Article created');
      setDialogOpen(false);
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
      const res = await apiFetch(`/admin/articles/${deleteTarget.id}`, {
        method: 'DELETE',
        token,
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Article deleted');
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Could not delete article');
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-3xl tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Articles
          </h1>
          <p className="text-sm text-[#F0EDE8]/60">
            Blog / journal posts for AdSense and SEO
          </p>
        </div>
        <Button
          className="bg-[#C0392B] hover:bg-[#C0392B]/90"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          New article
        </Button>
      </div>

      {loading ? (
        <p className="text-[#F0EDE8]/50">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#2C2C2C] hover:bg-transparent">
              <TableHead className="text-[#F0EDE8]/60">Title</TableHead>
              <TableHead className="text-[#F0EDE8]/60">Status</TableHead>
              <TableHead className="text-[#F0EDE8]/60">Slug</TableHead>
              <TableHead className="text-right text-[#F0EDE8]/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id} className="border-[#2C2C2C]">
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>
                  <span
                    className={
                      a.status === 'published'
                        ? 'text-emerald-400'
                        : 'text-[#F0EDE8]/40'
                    }
                  >
                    {a.status}
                  </span>
                </TableCell>
                <TableCell className="text-[#F0EDE8]/50">{a.slug}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(a)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(a)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-[#C0392B]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#2C2C2C] bg-[#0A0A0A] text-[#F0EDE8]">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {editing ? 'Edit article' : 'New article'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="art-title">Title</Label>
              <Input
                id="art-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 border-[#2C2C2C] bg-[#1a1a1a]"
              />
            </div>
            <div>
              <Label htmlFor="art-slug">Slug (optional)</Label>
              <Input
                id="art-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 border-[#2C2C2C] bg-[#1a1a1a]"
                placeholder="auto-from-title"
              />
            </div>
            <div>
              <Label htmlFor="art-excerpt">Excerpt</Label>
              <Textarea
                id="art-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 border-[#2C2C2C] bg-[#1a1a1a]"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="art-body">Body (markdown)</Label>
              <Textarea
                id="art-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 min-h-[220px] border-[#2C2C2C] bg-[#1a1a1a] font-mono text-sm"
                rows={12}
              />
            </div>
            <div className="space-y-2">
              <Label>Cover image</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative w-full sm:w-64 aspect-video rounded-md overflow-hidden border border-[#2C2C2C] bg-[#0A0A0A]">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {coverImage || coverPending ? (
                    <button
                      type="button"
                      onClick={clearCover}
                      className="absolute top-2 right-2 rounded-full bg-[#0A0A0A]/80 p-1.5 text-[#F0EDE8] hover:text-[#C0392B]"
                      aria-label="Remove cover image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={ADMIN_OUTLINE_BUTTON_CLASS}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <ImagePlus className="w-4 h-4" />
                    {coverImage || coverPending
                      ? 'Replace image'
                      : 'Upload image'}
                  </Button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={onCoverPick}
                  />
                  <p className="text-xs text-[#F0EDE8]/50 max-w-sm">
                    JPEG, PNG, WebP, or GIF. Delivered via{' '}
                    <code className="text-[#F0EDE8]/70">Cloudinary CDN</code>{' '}
                    (auto-optimized).
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="art-author">Author</Label>
              <Input
                id="art-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-1 border-[#2C2C2C] bg-[#1a1a1a]"
              />
            </div>
            <div>
              <Label htmlFor="art-status">Status</Label>
              <select
                id="art-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value === 'published' ? 'published' : 'draft')
                }
                className="mt-1 w-full rounded-md border border-[#2C2C2C] bg-[#1a1a1a] px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
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
              className="bg-[#C0392B] hover:bg-[#C0392B]/90"
              onClick={saveArticle}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-[#2C2C2C] bg-[#0A0A0A] text-[#F0EDE8]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#F0EDE8]/60">
              This permanently removes &quot;{deleteTarget?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={ADMIN_OUTLINE_BUTTON_CLASS}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#C0392B] hover:bg-[#C0392B]/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
