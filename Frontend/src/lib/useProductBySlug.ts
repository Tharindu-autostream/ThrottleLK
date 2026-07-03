import { useEffect, useState } from 'react';
import { apiUrl } from './api';
import { parseProductFromApi } from './productDisplayDefaults';
import type { Product } from '../app/components/CartContext';

export type ProductLoadState = 'loading' | 'ready' | 'not-found' | 'error';

/** Fetches a single product by its computed slug via `GET /products/slug/:slug`. */
export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loadState, setLoadState] = useState<ProductLoadState>('loading');

  useEffect(() => {
    if (!slug) {
      setLoadState('not-found');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    setProduct(null);

    (async () => {
      try {
        const res = await fetch(apiUrl(`/products/slug/${encodeURIComponent(slug)}`));
        if (res.status === 404) {
          if (!cancelled) setLoadState('not-found');
          return;
        }
        if (!res.ok) throw new Error('bad status');
        const raw = await res.json();
        const parsed = parseProductFromApi(raw);
        if (cancelled) return;
        if (!parsed) {
          setLoadState('not-found');
          return;
        }
        setProduct(parsed);
        setLoadState('ready');
      } catch {
        if (!cancelled) setLoadState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product, loadState };
}
