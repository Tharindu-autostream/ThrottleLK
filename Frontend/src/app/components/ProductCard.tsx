import { useState } from 'react';
import { motion } from 'motion/react';
import { Product, useCart } from './CartContext';
import { isSoldOut, remainingStock } from '../../lib/stock';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { state, dispatch } = useCart();
  const soldOut = isSoldOut(product);
  const canAdd = remainingStock(product, state.items) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soldOut || !canAdd) return;
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, selectedColor },
    });
    dispatch({ type: 'OPEN_CART' });
  };

  return (
    <motion.article
      className="group relative flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] transition-all duration-300 hover:border-[#C0392B] hover:shadow-[0_0_24px_0_rgba(192,57,43,0.18)]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px', amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onClick={() => onViewDetails(product)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} — ${product.category} | Throttle LK`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />

        {/* Dark gradient at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent" />

        {/* Category badge */}
        <span
          className="absolute left-3 top-3 rounded-md bg-[#C0392B] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white sm:left-3.5 sm:top-3.5 sm:text-[11px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {product.category}
        </span>

        {/* Sold out overlay */}
        {soldOut && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#0A0A0A]/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span
              className="rounded-sm border border-white/30 bg-[#C0392B]/90 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Sold Out
            </span>
          </motion.div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2.5 border-t border-[#3a3a3a] p-3 sm:gap-3 sm:p-4">
        <div>
          <h3
            className="line-clamp-1 text-sm font-semibold leading-snug text-white sm:text-base"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {product.name}
          </h3>
          {product.discountPercent && product.discountPercent > 0 ? (
            <div className="mt-0.5 flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-semibold text-[#C0392B] sm:text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                LKR {Math.round(product.price * (1 - product.discountPercent / 100)).toLocaleString()}
              </span>
              <span
                className="text-xs text-[#F0EDE8]/40 line-through sm:text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                LKR {product.price.toLocaleString()}
              </span>
              <span className="rounded bg-[#C0392B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                -{product.discountPercent}%
              </span>
            </div>
          ) : (
            <p
              className="mt-0.5 text-xs font-medium text-[#C0392B] sm:text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              LKR {product.price.toLocaleString()}
            </p>
          )}
        </div>

        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                aria-label={`Color ${color}`}
                aria-pressed={selectedColor === color}
                className={`h-4 w-4 rounded-full border-2 transition-all duration-200 sm:h-[18px] sm:w-[18px] ${
                  selectedColor === color
                    ? 'border-[#C0392B] scale-110'
                    : 'border-[#555] hover:border-[#888]'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        <motion.button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || !canAdd}
          className="mt-auto w-full rounded-lg bg-[#C0392B] py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-all duration-200 hover:bg-[#a93226] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#3a3a3a] disabled:text-[#888] sm:py-3 sm:text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          whileTap={soldOut || !canAdd ? undefined : { scale: 0.97 }}
        >
          {soldOut ? 'Sold Out' : !canAdd ? 'Max in Cart' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.article>
  );
}
