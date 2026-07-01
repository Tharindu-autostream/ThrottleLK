import React from 'react';
import { Label } from '../components/ui/label';
import { DEFAULT_PRODUCT_SIZES } from '../../lib/productDisplayDefaults';

export const SIZE_CHART = [...DEFAULT_PRODUCT_SIZES] as const;

type AdminSizePickerProps = {
  value: string[];
  onChange: (sizes: string[]) => void;
};

export default function AdminSizePicker({ value, onChange }: AdminSizePickerProps) {
  function toggle(size: string) {
    if (value.includes(size)) {
      onChange(value.filter((s) => s !== size));
      return;
    }
    const next = SIZE_CHART.filter((s) => value.includes(s) || s === size);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Label className="text-[#F0EDE8]">Select sizes</Label>

      <div className="rounded-lg border border-[#2C2C2C] bg-[#0A0A0A]/60 p-4">
        <p
          className="text-xs uppercase tracking-widest text-[#F0EDE8]/50 mb-3"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Storefront preview — Select Size
        </p>
        {value.length === 0 ? (
          <p className="text-sm text-[#F0EDE8]/40">No sizes selected yet</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {value.map((size) => (
              <span
                key={size}
                className="w-14 h-14 flex items-center justify-center border-2 tracking-wider rounded-xl bg-[#C0392B]/30 border-[#C0392B] text-[#F0EDE8] shadow-[0_8px_32px_0_rgba(192,57,43,0.3)]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-[#F0EDE8]/50 mb-2">Size chart — click to toggle</p>
        <div className="flex flex-wrap gap-3">
          {SIZE_CHART.map((size) => {
            const active = value.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggle(size)}
                className={`w-14 h-14 border-2 tracking-wider transition-all backdrop-blur-md rounded-xl ${
                  active
                    ? 'bg-[#C0392B]/30 border-[#C0392B] text-[#F0EDE8] shadow-[0_8px_32px_0_rgba(192,57,43,0.3)]'
                    : 'bg-[#0A0A0A]/20 border-[#F0EDE8]/30 text-[#F0EDE8]/50 hover:border-[#C0392B] hover:bg-[#C0392B]/10'
                }`}
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-[#F0EDE8]/50">
        Selected sizes appear as buttons on the product detail modal, in chart order
        (S → XXL).
      </p>
    </div>
  );
}
