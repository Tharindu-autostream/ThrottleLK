import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, uploadProductImages } from '../../lib/api';
import {
  DEFAULT_SITE_CONTENT,
  MAX_GALLERY_IMAGES,
  parseSiteContent,
  type SiteGalleryImage,
} from '../../lib/siteContent';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { useAdminAuth } from './AdminAuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

function newGalleryId(): string {
  return crypto.randomUUID();
}

type SingleImageSectionProps = {
  label: string;
  description: string;
  url: string;
  pendingFile: File | null;
  onUrlChange: (url: string) => void;
  onPendingChange: (file: File | null) => void;
};

function SingleImageSection({
  label,
  description,
  url,
  pendingFile,
  onUrlChange,
  onPendingChange,
}: SingleImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = pendingFile ? URL.createObjectURL(pendingFile) : url;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    onPendingChange(file);
  }

  return (
    <section className="rounded-lg border border-[#2C2C2C] bg-[#0A0A0A]/50 p-6 space-y-4">
      <div>
        <h2
          className="text-2xl text-[#F0EDE8] tracking-wider"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {label}
        </h2>
        <p className="text-sm text-[#F0EDE8]/60 mt-1">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative w-full sm:w-64 aspect-video rounded-md overflow-hidden border border-[#2C2C2C] bg-[#0A0A0A]">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : null}
          {url || pendingFile ? (
            <button
              type="button"
              onClick={() => {
                onUrlChange('');
                onPendingChange(null);
              }}
              className="absolute top-2 right-2 rounded-full bg-[#0A0A0A]/80 p-1.5 text-[#F0EDE8] hover:text-[#C0392B]"
              aria-label="Remove image"
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
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="w-4 h-4" />
            {url || pendingFile ? 'Replace image' : 'Upload image'}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onPick}
          />
          <p className="text-xs text-[#F0EDE8]/50 max-w-sm">{description}</p>
        </div>
      </div>
    </section>
  );
}

export default function AdminSiteContentPage() {
  const { token, logout } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImage, setHeroImage] = useState(DEFAULT_SITE_CONTENT.heroImage);
  const [aboutFeaturedImage, setAboutFeaturedImage] = useState(
    DEFAULT_SITE_CONTENT.aboutFeaturedImage,
  );
  const [galleryImages, setGalleryImages] = useState<SiteGalleryImage[]>(
    DEFAULT_SITE_CONTENT.galleryImages,
  );
  const [heroPending, setHeroPending] = useState<File | null>(null);
  const [aboutPending, setAboutPending] = useState<File | null>(null);
  const [galleryPending, setGalleryPending] = useState<File[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/site/content', { token });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load site images');
      const parsed = parseSiteContent(await res.json());
      if (!parsed) throw new Error('Invalid response');
      setHeroImage(parsed.heroImage);
      setAboutFeaturedImage(parsed.aboutFeaturedImage);
      setGalleryImages(parsed.galleryImages);
      setHeroPending(null);
      setAboutPending(null);
      setGalleryPending([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadSingle(file: File | null): Promise<string | null> {
    if (!file || !token) return null;
    const urls = await uploadProductImages([file], token);
    return urls[0] ?? null;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      let nextHero = heroImage;
      let nextAbout = aboutFeaturedImage;

      if (heroPending) {
        const uploaded = await uploadSingle(heroPending);
        if (!uploaded) throw new Error('Hero image upload failed');
        nextHero = uploaded;
      }
      if (aboutPending) {
        const uploaded = await uploadSingle(aboutPending);
        if (!uploaded) throw new Error('About image upload failed');
        nextAbout = uploaded;
      }

      let nextGallery = [...galleryImages];
      if (galleryPending.length > 0) {
        const uploaded = await uploadProductImages(galleryPending, token);
        const start = nextGallery.length;
        uploaded.forEach((url, i) => {
          nextGallery.push({
            id: newGalleryId(),
            url,
            title: `Image ${start + i + 1}`,
            sortOrder: start + i,
          });
        });
      }
      nextGallery = nextGallery.slice(0, MAX_GALLERY_IMAGES);
      nextGallery = nextGallery.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      const res = await apiFetch('/admin/site/content', {
        method: 'PUT',
        token,
        body: JSON.stringify({
          heroImage: nextHero || null,
          aboutFeaturedImage: nextAbout || null,
          galleryImages: nextGallery,
        }),
      });
      if (res.status === 401) {
        logout();
        toast.error('Session expired. Please sign in again.');
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
      const parsed = parseSiteContent(await res.json());
      if (!parsed) throw new Error('Invalid response');
      setHeroImage(parsed.heroImage);
      setAboutFeaturedImage(parsed.aboutFeaturedImage);
      setGalleryImages(parsed.galleryImages);
      setHeroPending(null);
      setAboutPending(null);
      setGalleryPending([]);
      toast.success('Site images saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function removeGalleryItem(id: string) {
    setGalleryImages((items) =>
      items.filter((item) => item.id !== id).map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
    );
  }

  function updateGalleryTitle(id: string, title: string) {
    setGalleryImages((items) =>
      items.map((item) => (item.id === id ? { ...item, title } : item)),
    );
  }

  function onGalleryPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    const total = galleryImages.length + galleryPending.length;
    const slots = MAX_GALLERY_IMAGES - total;
    setGalleryPending((prev) => [...prev, ...picked.slice(0, slots)]);
  }

  const galleryTotal = galleryImages.length + galleryPending.length;

  if (loading) {
    return <p className="text-[#F0EDE8]/60">Loading site images…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl text-[#F0EDE8] tracking-wider"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Site images
        </h1>
        <p className="text-sm text-[#F0EDE8]/60 mt-1">
          Manage the homepage hero, Built for the Streets feature image, and
          Street Culture Gallery.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        <SingleImageSection
          label="Hero banner"
          description="Full-width background on the homepage hero. Recommended 1920×1080 or larger."
          url={heroImage}
          pendingFile={heroPending}
          onUrlChange={setHeroImage}
          onPendingChange={setHeroPending}
        />

        <SingleImageSection
          label="Built for the Streets"
          description="Featured image in the About section beside the brand story."
          url={aboutFeaturedImage}
          pendingFile={aboutPending}
          onUrlChange={setAboutFeaturedImage}
          onPendingChange={setAboutPending}
        />

        <section className="rounded-lg border border-[#2C2C2C] bg-[#0A0A0A]/50 p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2
                className="text-2xl text-[#F0EDE8] tracking-wider"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Street Culture Gallery
              </h2>
              <p className="text-sm text-[#F0EDE8]/60 mt-1">
                Grid images below the About copy. Up to {MAX_GALLERY_IMAGES}{' '}
                photos.
              </p>
            </div>
            <span className="text-xs text-[#F0EDE8]/50 tabular-nums">
              {galleryTotal}/{MAX_GALLERY_IMAGES}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-[#2C2C2C] bg-[#0A0A0A] overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(item.id)}
                    className="absolute top-2 right-2 rounded-full bg-[#0A0A0A]/80 p-1.5 text-[#F0EDE8] hover:text-[#C0392B]"
                    aria-label="Remove gallery image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <Label htmlFor={`title-${item.id}`}>Caption</Label>
                  <Input
                    id={`title-${item.id}`}
                    value={item.title}
                    onChange={(ev) =>
                      updateGalleryTitle(item.id, ev.target.value)
                    }
                    className="bg-[#0A0A0A] border-[#2C2C2C] text-[#F0EDE8]"
                  />
                </div>
              </div>
            ))}
            {galleryPending.map((file, index) => (
              <div
                key={`pending-${file.name}-${file.size}-${index}`}
                className="rounded-md border border-dashed border-[#2C2C2C] bg-[#0A0A0A] overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover opacity-80"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryPending((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="absolute top-2 right-2 rounded-full bg-[#0A0A0A]/80 p-1.5 text-[#F0EDE8] hover:text-[#C0392B]"
                    aria-label="Remove pending image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="p-3 text-xs text-[#F0EDE8]/50">New — save to publish</p>
              </div>
            ))}
          </div>

          {galleryTotal < MAX_GALLERY_IMAGES ? (
            <Button
              type="button"
              variant="outline"
              className={ADMIN_OUTLINE_BUTTON_CLASS}
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
              Add gallery images
            </Button>
          ) : null}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={onGalleryPick}
          />
        </section>

        <Button
          type="submit"
          disabled={saving}
          className="bg-[#C0392B] hover:bg-[#C0392B]/90 text-[#F0EDE8]"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save site images'}
        </Button>
      </form>
    </div>
  );
}
