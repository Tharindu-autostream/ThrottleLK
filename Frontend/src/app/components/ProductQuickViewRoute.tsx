import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import ProductDetail from './ProductDetail';
import { useProductBySlug } from '../../lib/useProductBySlug';

/**
 * Renders the quick-view modal on top of whatever "background" route is showing
 * (see the `backgroundLocation` routing pattern in `main.tsx`). This is what makes
 * clicking a product card push a real, shareable `/product/:slug` URL while still
 * feeling like an in-page modal — a direct hit on that URL instead renders the full
 * `ProductPage`.
 */
export default function ProductQuickViewRoute() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, loadState } = useProductBySlug(slug);

  useEffect(() => {
    if (loadState === 'not-found' || loadState === 'error') {
      navigate(-1);
    }
  }, [loadState, navigate]);

  if (loadState === 'loading') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#C0392B]" />
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      isOpen={!!product}
      onClose={() => navigate(-1)}
    />
  );
}
