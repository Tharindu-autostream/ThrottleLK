import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, useCart } from './CartContext';
import { isSoldOut, remainingStock } from '../../lib/stock';
import logo from '@/imports/Gemini_Generated_Image_s1qapns1qapns1qa-removebg-preview.png';

const spring = { type: 'spring' as const, stiffness: 380, damping: 32 };

interface ProductDetailContentProps {
  product: Product;
  /** 'modal' = quick-view dialog (fixed height, own scroll areas). 'page' = full standalone page (normal document flow, real h1). */
  variant: 'modal' | 'page';
  /** Called after a successful add-to-cart (e.g. so the modal can close itself). */
  onAddedToCart?: () => void;
}

/**
 * Gallery + info/specs/add-to-cart content shared by the quick-view modal
 * (`ProductDetail.tsx`) and the standalone, crawlable `ProductPage.tsx`.
 */
export default function ProductDetailContent({
  product,
  variant,
  onAddedToCart,
}: ProductDetailContentProps) {
  const isModal = variant === 'modal';
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { state, dispatch } = useCart();

  const gallery =
    (product.images?.length ?? 0) > 0
      ? product.images!
      : product.image
        ? [product.image]
        : [];

  useEffect(() => {
    setSelectedColor(product.colors[0] ?? '');
    setSelectedSize(product.sizes[0] ?? 'M');
    setQuantity(1);
    setActiveImageIndex(0);
    setImageLoaded(false);
  }, [product.id]);

  const soldOut = isSoldOut(product);
  const maxSelectable = remainingStock(product, state.items);

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), Math.max(1, maxSelectable)));
  }, [product.id, maxSelectable]);

  const goToImage = useCallback(
    (index: number) => {
      if (!gallery.length) return;
      setImageLoaded(false);
      setActiveImageIndex((index + gallery.length) % gallery.length);
    },
    [gallery.length],
  );

  useEffect(() => {
    if (gallery.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToImage(activeImageIndex - 1);
      if (e.key === 'ArrowRight') goToImage(activeImageIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gallery.length, activeImageIndex, goToImage]);

  const activeImage = gallery[activeImageIndex] ?? product.image;

  const handleAddToCart = () => {
    if (soldOut || maxSelectable < 1) return;
    const toAdd = Math.min(quantity, maxSelectable);
    for (let i = 0; i < toAdd; i++) {
      dispatch({
        type: 'ADD_ITEM',
        payload: { ...product, selectedColor },
      });
    }
    dispatch({ type: 'OPEN_CART' });
    onAddedToCart?.();
  };

  const ctaLabel = soldOut
    ? 'Sold out'
    : (() => {
        const unitPrice =
          product.discountPercent && product.discountPercent > 0
            ? Math.round(product.price * (1 - product.discountPercent / 100))
            : product.price;
        return `Add to Cart — LKR ${(unitPrice * quantity).toLocaleString()}`;
      })();

  const TitleTag = isModal ? 'h2' : 'h1';

  const gallerySection = (
    <motion.section
      className={`flex flex-col items-center justify-start p-4 pb-3 sm:p-6 md:border-r md:border-white/[0.06] ${
        isModal ? 'md:overflow-y-auto' : ''
      }`}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: spring },
      }}
    >
      <motion.div className="flex w-full max-w-full flex-col items-center gap-3">
        <motion.img
          src={logo}
          alt="Throttle LK"
          className="h-19 w-auto shrink-0 brightness-0 invert opacity-85 sm:h-19"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        />
        <div className="group relative flex w-full min-h-[min(38vh,360px)] items-center justify-center overflow-hidden rounded-xl bg-[#0A0A0A] sm:min-h-[min(52vh,560px)]">
          {!imageLoaded && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] bg-[length:200%_100%]"
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={activeImage}
              src={activeImage}
              alt={`${product.name} — Throttle LK ${product.category}`}
              className="relative z-[1] block max-h-[min(38vh,360px)] max-w-full object-contain sm:max-h-[min(52vh,560px)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onLoad={() => setImageLoaded(true)}
            />
          </AnimatePresence>

          {product.category && (
            <motion.span
              className="absolute right-3 top-3 z-10 rounded-md bg-[#C0392B] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#F0EDE8]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {product.category}
            </motion.span>
          )}

          {gallery.length > 1 && (
            <>
              <motion.button
                type="button"
                aria-label="Previous image"
                onClick={() => goToImage(activeImageIndex - 1)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-[#F0EDE8] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                type="button"
                aria-label="Next image"
                onClick={() => goToImage(activeImageIndex + 1)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-[#F0EDE8] opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </div>

        {gallery.length > 1 && (
          <motion.div
            className="flex w-full flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
          >
            {gallery.map((src, index) => {
              const isActive = index === activeImageIndex;
              return (
                <motion.button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => goToImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={isActive}
                  className={`relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#0A0A0A] p-0 sm:h-16 sm:w-16 transition-opacity duration-200 ${
                    isActive
                      ? 'opacity-100 ring-2 ring-[#C0392B] ring-offset-2 ring-offset-[#161616]'
                      : 'opacity-55 hover:opacity-85'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain object-center"
                  />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  );

  const detailsSection = (
    <motion.section
      className={`flex flex-col ${isModal ? 'md:min-h-0 md:max-h-full md:overflow-hidden' : ''}`}
      variants={{
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: spring },
      }}
    >
      <motion.div
        className={`px-4 pt-1 pb-3 sm:px-6 md:px-8 md:py-6 md:pb-4 ${
          isModal ? 'md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-contain' : ''
        }`}
      >
        <TitleTag
          className="text-4xl leading-none tracking-wide text-[#F0EDE8] sm:text-5xl"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {product.name}
        </TitleTag>

        <motion.div
          className="mt-3 h-px bg-[#C0392B]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ originX: 0, width: 48 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        />

        {product.discountPercent && product.discountPercent > 0 ? (
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span
              className="text-2xl text-[#C0392B] sm:text-3xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              LKR {Math.round(product.price * (1 - product.discountPercent / 100)).toLocaleString()}
            </span>
            <span
              className="text-lg text-[#F0EDE8]/35 line-through sm:text-xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              LKR {product.price.toLocaleString()}
            </span>
            <span className="rounded bg-[#C0392B] px-2 py-0.5 text-xs font-bold tracking-wider text-white">
              -{product.discountPercent}% OFF
            </span>
          </div>
        ) : (
          <p
            className="mt-4 text-2xl text-[#C0392B] sm:text-3xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            LKR {product.price.toLocaleString()}
          </p>
        )}

        {product.description ? (
          <p
            className="mt-4 text-sm leading-relaxed text-[#F0EDE8]/65"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {product.description}
          </p>
        ) : null}

        <div className="mt-6 space-y-5">
          {/* Color */}
          {product.colors.length > 0 && (
            <div>
              <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#F0EDE8]/40">
                Color
              </p>
              <motion.div
                className="flex flex-wrap gap-2.5"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                initial="hidden"
                animate="visible"
              >
                {product.colors.map((color) => {
                  const selected = selectedColor === color;
                  return (
                    <motion.button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1 },
                      }}
                      className="relative h-9 w-9 rounded-full"
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      aria-label={`Color ${color}`}
                      aria-pressed={selected}
                    >
                      {selected && (
                        <motion.span
                          className="absolute -inset-1 rounded-full border-2 border-[#C0392B]"
                          layoutId={`color-ring-${variant}`}
                          transition={spring}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#F0EDE8]/40">
                Size
              </p>
              <motion.div className="flex flex-wrap gap-2" layout>
                {product.sizes.map((size) => {
                  const selected = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`relative min-w-[2.75rem] rounded-lg px-3 py-2 text-sm tracking-wide transition-colors ${
                        selected
                          ? 'text-[#F0EDE8]'
                          : 'text-[#F0EDE8]/55 hover:text-[#F0EDE8]'
                      }`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={selected}
                    >
                      {selected && (
                        <motion.span
                          layoutId={`size-bg-${variant}`}
                          className="absolute inset-0 rounded-lg border border-[#C0392B] bg-[#C0392B]/15"
                          transition={spring}
                        />
                      )}
                      <span className="relative z-10">{size}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Quantity */}
          {!soldOut && maxSelectable > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#F0EDE8]/40">
                Quantity
                <span className="ml-2 text-[#F0EDE8]/30">
                  ({maxSelectable} available)
                </span>
              </p>
              <motion.div
                className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0A0A0A]/60 p-1"
                layout
              >
                <motion.button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#F0EDE8]/80 hover:bg-white/[0.06] hover:text-[#F0EDE8] disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </motion.button>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={quantity}
                    className="min-w-[2rem] text-center text-lg text-[#F0EDE8]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {quantity}
                  </motion.span>
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(maxSelectable, quantity + 1))
                  }
                  disabled={quantity >= maxSelectable}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#F0EDE8]/80 hover:bg-white/[0.06] hover:text-[#F0EDE8] disabled:opacity-40"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
          {soldOut && (
            <p
              className="text-lg tracking-wider text-[#C0392B]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Sold out
            </p>
          )}
        </div>

        {/* Specs */}
        {product.specifications.length > 0 && (
          <motion.div
            className="mt-6 rounded-xl bg-[#0A0A0A]/50 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              className="mb-2 text-xs uppercase tracking-wider text-[#F0EDE8]/50"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Specifications
            </p>
            <ul
              className="space-y-1.5 text-sm text-[#F0EDE8]/60"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {product.specifications.map((line, i) => (
                <motion.li
                  key={`${product.id}-spec-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.04 }}
                >
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>

      <div
        className={
          isModal
            ? 'hidden shrink-0 border-t border-white/[0.06] bg-[#161616] px-8 py-4 md:block'
            : 'border-t border-white/[0.06] px-4 py-4 sm:px-6 md:px-8'
        }
      >
        <motion.button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || maxSelectable < 1}
          className="w-full rounded-xl bg-[#C0392B] py-4 text-base tracking-wider text-[#F0EDE8] shadow-lg shadow-[#C0392B]/25 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          whileHover={
            soldOut || maxSelectable < 1
              ? undefined
              : {
                  scale: 1.01,
                  boxShadow: '0 12px 40px rgba(192, 57, 43, 0.35)',
                }
          }
          whileTap={soldOut || maxSelectable < 1 ? undefined : { scale: 0.98 }}
        >
          {ctaLabel}
        </motion.button>
      </div>
    </motion.section>
  );

  return (
    <motion.div
      className={
        isModal
          ? 'flex min-h-0 flex-1 flex-col overflow-hidden md:grid md:grid-cols-[1fr_1.05fr] md:items-stretch'
          : 'flex flex-col gap-10 md:grid md:grid-cols-[1fr_1.05fr] md:items-start md:gap-12'
      }
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
      }}
    >
      {isModal ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] md:contents">
          {gallerySection}
          {detailsSection}
        </div>
      ) : (
        <>
          {gallerySection}
          {detailsSection}
        </>
      )}

      {/* Mobile add-to-cart — fixed at bottom (modal only; page variant uses the inline CTA above) */}
      {isModal && (
        <div className="mb-3 shrink-0 border-t border-white/[0.06] bg-[#161616]/95 px-4 pt-2.5 pb-2 backdrop-blur-md md:hidden">
          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut || maxSelectable < 1}
            className="w-full rounded-xl bg-[#C0392B] py-3.5 text-base tracking-wider text-[#F0EDE8] shadow-lg shadow-[#C0392B]/25 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            whileTap={soldOut || maxSelectable < 1 ? undefined : { scale: 0.98 }}
          >
            {ctaLabel}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
