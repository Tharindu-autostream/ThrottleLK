import React, { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '../components/ui/label';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { Button } from '../components/ui/button';

export const MAX_PRODUCT_IMAGES = 5;

type Props = {
  urls: string[];
  pendingFiles: File[];
  onUrlsChange: (urls: string[]) => void;
  onPendingChange: (files: File[]) => void;
};

export default function AdminProductImagePicker({
  urls,
  pendingFiles,
  onUrlsChange,
  onPendingChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = urls.length + pendingFiles.length;
  const canAddMore = total < MAX_PRODUCT_IMAGES;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    const slotsLeft = MAX_PRODUCT_IMAGES - total;
    onPendingChange([...pendingFiles, ...picked.slice(0, slotsLeft)]);
  }

  function removeUrl(index: number) {
    onUrlsChange(urls.filter((_, i) => i !== index));
  }

  function removePending(index: number) {
    onPendingChange(pendingFiles.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Product images</Label>
        <span className="text-xs text-[#F0EDE8]/50 tabular-nums">
          {total}/{MAX_PRODUCT_IMAGES}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {urls.map((url, index) => (
          <div
            key={`url-${url}`}
            className="relative aspect-square rounded-md overflow-hidden border border-[#2C2C2C] bg-[#0A0A0A]"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeUrl(index)}
              className="absolute top-1 right-1 rounded-full bg-[#0A0A0A]/80 p-1 text-[#F0EDE8] hover:text-[#C0392B]"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {pendingFiles.map((file, index) => (
          <div
            key={`pending-${file.name}-${file.size}-${index}`}
            className="relative aspect-square rounded-md overflow-hidden border border-[#2C2C2C] bg-[#0A0A0A]"
          >
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePending(index)}
              className="absolute top-1 right-1 rounded-full bg-[#0A0A0A]/80 p-1 text-[#F0EDE8] hover:text-[#C0392B]"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {canAddMore ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-md border border-dashed border-[#2C2C2C] bg-[#0A0A0A] flex flex-col items-center justify-center gap-1 text-[#F0EDE8]/60 hover:text-[#F0EDE8] hover:border-[#C0392B]/50 transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wide">Add</span>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={onPick}
      />
      {canAddMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={ADMIN_OUTLINE_BUTTON_CLASS}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="w-4 h-4" />
          Upload images
        </Button>
      ) : null}
      <p className="text-xs text-[#F0EDE8]/50">
        Up to {MAX_PRODUCT_IMAGES} photos (JPEG, PNG, WebP, GIF). Delivered via the{' '}
        <code className="text-[#F0EDE8]/70">Cloudinary CDN</code> (auto-optimized).
        The first image is used on collection cards; all images appear on the
        product detail view.
      </p>
    </div>
  );
}
