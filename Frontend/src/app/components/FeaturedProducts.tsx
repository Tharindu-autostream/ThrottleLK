import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router';
import ProductCard from './ProductCard';
import { products as staticProducts } from './products';
import { Product } from './CartContext';
import { apiUrl } from '../../lib/api';
import { parseProductFromApi } from '../../lib/productDisplayDefaults';
import { buildProductSlug } from '../../lib/slug';

import {
  FALLBACK_CATEGORY_GROUPS,
  fetchPublicCategoryGroups,
  type CategoryGroup,
} from '../../lib/categories';

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [groups, setGroups] = useState<CategoryGroup[]>(FALLBACK_CATEGORY_GROUPS);
  const [activeRootId, setActiveRootId] = useState<string>('all');
  /** Within a parent that has children: 'all' or a leaf category name */
  const [activeLeaf, setActiveLeaf] = useState<string>('all');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoadState, setCatalogLoadState] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [catalogNote, setCatalogNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPublicCategoryGroups();
        if (!cancelled && list.length > 0) {
          setGroups(list);
        }
      } catch {
        /* keep fallback groups */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/products'));
        if (!res.ok) {
          throw new Error('bad status');
        }
        const raw = await res.json();
        if (!cancelled) {
          const rows = Array.isArray(raw) ? raw : [];
          setCatalog(
            rows
              .map(parseProductFromApi)
              .filter((p): p is Product => p !== null),
          );
          setCatalogLoadState('ready');
          setCatalogNote(null);
        }
      } catch {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            setCatalog(staticProducts);
            setCatalogNote(
              'Showing offline catalog — start the API to load live products.',
            );
          } else {
            setCatalog([]);
            setCatalogNote(
              'Could not load products. Please refresh or try again shortly.',
            );
          }
          setCatalogLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const products =
    catalogLoadState === 'ready'
      ? catalog
      : catalogLoadState === 'error' && import.meta.env.DEV
        ? staticProducts
        : [];

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeRootId) ?? null,
    [groups, activeRootId],
  );

  const filteredProducts = useMemo(() => {
    if (activeRootId === 'all') {
      return products;
    }
    const group = activeGroup;
    if (!group) {
      return products;
    }
    if (group.children.length === 0) {
      return products.filter((p) => p.category === group.name);
    }
    if (activeLeaf === 'all') {
      const leafNames = new Set(group.children.map((c) => c.name));
      return products.filter((p) => leafNames.has(p.category));
    }
    return products.filter((p) => p.category === activeLeaf);
  }, [activeRootId, activeLeaf, products, activeGroup]);

  const handlePickRoot = (rootId: string) => {
    setActiveRootId(rootId);
    setActiveLeaf('all');
  };

  /**
   * Pushes a real, shareable `/product/:slug` URL (with the current page kept
   * as `backgroundLocation`, see main.tsx) so the quick-view modal opens on top
   * — direct visits/refreshes to that same URL render the full ProductPage.
   */
  const handleViewDetails = (product: Product) => {
    navigate(`/product/${buildProductSlug(product.name, product.id)}`, {
      state: { backgroundLocation: location },
    });
  };

  const showSubRow =
    activeRootId !== 'all' &&
    activeGroup !== null &&
    activeGroup.children.length > 0;

  return (
    <section id="shop" className="bg-[#0A0A0A] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-6xl text-[#F0EDE8] mb-4 tracking-wider text-center"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Featured Collection
        </motion.h2>

        {catalogNote && (
          <p
            className="text-center text-sm text-amber-200/90 mb-6 max-w-xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {catalogNote}
          </p>
        )}

        <motion.div
          className="h-1 bg-[#C0392B] mb-12 mx-auto"
          initial={{ width: 0 }}
          whileInView={{ width: '120px' }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <motion.div
          className={`flex flex-wrap justify-center gap-4 ${showSubRow ? 'mb-6' : 'mb-16'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            key="root-all"
            type="button"
            onClick={() => handlePickRoot('all')}
            className={`px-6 py-2 border-2 tracking-wider transition-all backdrop-blur-md rounded-full ${
              activeRootId === 'all'
                ? 'bg-[#C0392B]/30 border-[#C0392B] text-[#F0EDE8] shadow-[0_8px_32px_0_rgba(192,57,43,0.3)]'
                : 'bg-[#2C2C2C]/20 border-[#2C2C2C]/50 text-[#F0EDE8] hover:border-[#C0392B] hover:bg-[#C0392B]/10'
            }`}
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All
          </motion.button>
          {groups.map((g, i) => (
            <motion.button
              key={g.id}
              type="button"
              onClick={() => handlePickRoot(g.id)}
              className={`px-6 py-2 border-2 tracking-wider transition-all backdrop-blur-md rounded-full ${
                activeRootId === g.id
                  ? 'bg-[#C0392B]/30 border-[#C0392B] text-[#F0EDE8] shadow-[0_8px_32px_0_rgba(192,57,43,0.3)]'
                  : 'bg-[#2C2C2C]/20 border-[#2C2C2C]/50 text-[#F0EDE8] hover:border-[#C0392B] hover:bg-[#C0392B]/10'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ delay: 0.05 * (i + 1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {g.name}
            </motion.button>
          ))}
        </motion.div>

        {showSubRow && activeGroup && (
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-16"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.button
              key="leaf-all"
              type="button"
              onClick={() => setActiveLeaf('all')}
              className={`px-5 py-1.5 text-sm border tracking-wider transition-all backdrop-blur-md rounded-full ${
                activeLeaf === 'all'
                  ? 'bg-[#C0392B]/20 border-[#C0392B] text-[#F0EDE8]'
                  : 'bg-[#2C2C2C]/15 border-[#2C2C2C]/40 text-[#F0EDE8]/90 hover:border-[#C0392B]/60'
              }`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              All {activeGroup.name}
            </motion.button>
            {activeGroup.children.map((c, j) => (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setActiveLeaf(c.name)}
                className={`px-5 py-1.5 text-sm border tracking-wider transition-all backdrop-blur-md rounded-full ${
                  activeLeaf === c.name
                    ? 'bg-[#C0392B]/20 border-[#C0392B] text-[#F0EDE8]'
                    : 'bg-[#2C2C2C]/15 border-[#2C2C2C]/40 text-[#F0EDE8]/90 hover:border-[#C0392B]/60'
                }`}
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * j }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {c.name}
              </motion.button>
            ))}
          </motion.div>
        )}

        {catalogLoadState === 'loading' ? (
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-[#2C2C2C] bg-[#1a1a1a]"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
            layout
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
              />
            ))}
          </motion.div>
        ) : (
          <p
            className="text-center text-sm text-[#F0EDE8]/60 py-12"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No products to show right now.
          </p>
        )}
      </div>
    </section>
  );
}
