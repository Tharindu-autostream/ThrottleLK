import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ADMIN_OUTLINE_BUTTON_CLASS } from './adminButtonStyles';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const BRAND_COLOR_PRESETS = [
  '#0A0A0A',
  '#2C2C2C',
  '#1a1a1a',
  '#4a4a4a',
  '#C0392B',
  '#F0EDE8',
] as const;

function normalizeHex(raw: string): string | null {
  let v = raw.trim();
  if (!v) return null;
  if (!v.startsWith('#')) v = `#${v}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    v = `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(v)) return null;
  return v.toLowerCase();
}

type AdminColorPickerProps = {
  value: string[];
  onChange: (colors: string[]) => void;
};

export default function AdminColorPicker({
  value,
  onChange,
}: AdminColorPickerProps) {
  const [pickerHex, setPickerHex] = React.useState('#c0392b');
  const [hexDraft, setHexDraft] = React.useState('');

  function addColor(hex: string) {
    const n = normalizeHex(hex);
    if (!n) return;
    const exists = value.some(
      (c) => normalizeHex(c)?.toLowerCase() === n.toLowerCase(),
    );
    if (exists) return;
    onChange([...value, n]);
  }

  function removeColor(hex: string) {
    onChange(value.filter((c) => c !== hex));
  }

  function handleHexSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = normalizeHex(hexDraft);
    if (!n) return;
    addColor(n);
    setHexDraft('');
  }

  return (
    <div className="space-y-3">
      <Label className="text-[#F0EDE8]">Select colors</Label>

      <div className="rounded-lg border border-[#2C2C2C] bg-[#0A0A0A]/60 p-4">
        <p
          className="text-xs uppercase tracking-widest text-[#F0EDE8]/50 mb-3"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Storefront preview — Select Color
        </p>
        {value.length === 0 ? (
          <p className="text-sm text-[#F0EDE8]/40">No colors selected yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {value.map((color) => (
              <span
                key={color}
                className="w-12 h-12 rounded-full border-2 border-[#C0392B] shadow-[0_0_0_3px_rgba(192,57,43,0.25)]"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#F0EDE8]/50 mb-2">Selected (hover × to remove)</p>
        <div className="flex flex-wrap gap-3">
          {value.map((color) => (
            <div key={color} className="relative group">
              <span
                className="block w-10 h-10 rounded-full border-2 border-[#F0EDE8]/30"
                style={{ backgroundColor: color }}
                title={color}
              />
              <button
                type="button"
                onClick={() => removeColor(color)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C0392B] text-[#F0EDE8] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${color}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#F0EDE8]/50 mb-2">Brand presets</p>
        <div className="flex flex-wrap gap-2">
          {BRAND_COLOR_PRESETS.map((preset) => {
            const taken = value.some(
              (c) => normalizeHex(c)?.toLowerCase() === preset.toLowerCase(),
            );
            return (
              <button
                key={preset}
                type="button"
                disabled={taken}
                onClick={() => addColor(preset)}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  taken
                    ? 'opacity-40 cursor-not-allowed border-[#C0392B]'
                    : 'border-transparent hover:scale-110 hover:border-[#C0392B]'
                }`}
                style={{ backgroundColor: preset }}
                title={preset}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-[#F0EDE8]/60">Color picker</Label>
          <input
            type="color"
            value={pickerHex}
            onChange={(e) => setPickerHex(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-[#2C2C2C] bg-transparent"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={ADMIN_OUTLINE_BUTTON_CLASS}
          onClick={() => addColor(pickerHex)}
        >
          <Plus className="w-4 h-4" />
          Add color
        </Button>
        <form onSubmit={handleHexSubmit} className="flex gap-2 flex-1 min-w-[140px]">
          <Input
            value={hexDraft}
            onChange={(e) => setHexDraft(e.target.value)}
            placeholder="#C0392B"
            className="bg-[#0A0A0A] border-[#2C2C2C] font-mono text-sm text-[#F0EDE8] h-9"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className={`${ADMIN_OUTLINE_BUTTON_CLASS} shrink-0`}
          >
            Add
          </Button>
        </form>
      </div>

      <p className="text-xs text-[#F0EDE8]/50">
        Swatches appear on product cards and in Select Color on the detail modal.
      </p>
    </div>
  );
}
