import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { Product } from './CartContext';
import ProductDetailContent from './ProductDetailContent';

interface ProductDetailProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const spring = { type: 'spring' as const, stiffness: 380, damping: 32 };

/** Fast in-page "quick view" — the crawlable, full-content version lives at `/product/:slug` (see `ProductPage.tsx`). */
export default function ProductDetail({ product, isOpen, onClose }: ProductDetailProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} details`}
            className="fixed inset-0 z-[201] flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden rounded-none border border-white/[0.06] bg-[#161616] shadow-2xl shadow-black/50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(90vh,820px)] sm:max-h-[min(90vh,820px)] sm:w-[min(94vw,960px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <motion.p
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F0EDE8]/45"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                Product
              </motion.p>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#F0EDE8]/70 transition-colors hover:bg-white/[0.06] hover:text-[#F0EDE8]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </header>

            <ProductDetailContent
              product={product}
              variant="modal"
              onAddedToCart={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
