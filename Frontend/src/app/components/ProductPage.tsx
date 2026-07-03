import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import CustomCursor from './CustomCursor';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ProductDetailContent from './ProductDetailContent';
import ProductCard from './ProductCard';
import { Product } from './CartContext';
import { apiUrl, FRONTEND_PATH } from '../../lib/api';
import { parseProductFromApi } from '../../lib/productDisplayDefaults';
import { buildProductSlug } from '../../lib/slug';
import { useDocumentHead } from '../../lib/useDocumentHead';
import { useProductBySlug } from '../../lib/useProductBySlug';
import { isSoldOut } from '../../lib/stock';

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { product, loadState } = useProductBySlug(slug);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/products'));
        if (!res.ok) return;
        const rows = await res.json();
        const list = Array.isArray(rows)
          ? rows.map(parseProductFromApi).filter((p): p is Product => p !== null)
          : [];
        if (!cancelled) {
          setRelated(
            list
              .filter((p) => p.id !== product.id && p.category === product.category)
              .slice(0, 4),
          );
        }
      } catch {
        /* related products are a nice-to-have */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const canonicalPath = product ? `/product/${buildProductSlug(product.name, product.id)}` : undefined;

  const jsonLd = useMemo(() => {
    if (!product) return null;
    const unitPrice =
      product.discountPercent && product.discountPercent > 0
        ? Math.round(product.price * (1 - product.discountPercent / 100))
        : product.price;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: (product.images?.length ?? 0) > 0 ? product.images : [product.image],
      sku: product.id,
      category: product.category,
      brand: { '@type': 'Brand', name: 'Throttle LK' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'LKR',
        price: unitPrice,
        availability: isSoldOut(product)
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        url: canonicalPath ? `${FRONTEND_PATH}${canonicalPath}` : undefined,
      },
    };
  }, [product, canonicalPath]);

  useDocumentHead(
    product
      ? {
          title: `${product.name} | Throttle LK`,
          description:
            product.description ||
            `Shop ${product.name} — premium ${product.category} streetwear from Throttle LK, Sri Lanka. Island-wide delivery.`,
          canonicalPath,
          ogImage: product.image,
          ogType: 'product',
          jsonLd,
        }
      : {
          title: 'Throttle LK',
          robots: 'noindex, follow',
        },
  );

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F0EDE8]"
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: 'none' }}
    >
      <CustomCursor />
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20 sm:pt-32">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm tracking-wide text-[#F0EDE8]/60 transition-colors hover:text-[#C0392B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        {loadState === 'loading' && (
          <div
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            aria-busy="true"
            aria-label="Loading product"
          >
            <div className="aspect-square animate-pulse rounded-2xl border border-[#2C2C2C] bg-[#1a1a1a]" />
            <div className="space-y-4">
              <div className="h-10 w-2/3 animate-pulse rounded bg-[#1a1a1a]" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-[#1a1a1a]" />
              <div className="h-24 w-full animate-pulse rounded bg-[#1a1a1a]" />
            </div>
          </div>
        )}

        {(loadState === 'not-found' || loadState === 'error') && (
          <div className="py-24 text-center">
            <h1
              className="mb-4 text-4xl tracking-wider text-[#F0EDE8]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {loadState === 'not-found' ? 'Product not found' : 'Something went wrong'}
            </h1>
            <p className="mb-8 text-[#F0EDE8]/60">
              {loadState === 'not-found'
                ? "This product may have sold out or been removed."
                : 'Please refresh or try again shortly.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full border-2 border-[#C0392B]/50 bg-[#C0392B]/20 px-8 py-3 tracking-wider text-[#F0EDE8]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Back to shop
            </button>
          </div>
        )}

        {loadState === 'ready' && product && (
          <>
            <ProductDetailContent product={product} variant="page" />

            {related.length > 0 && (
              <motion.section
                className="mt-24"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                <h2
                  className="mb-8 text-3xl tracking-wider text-[#F0EDE8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  You might also like
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                  {related.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onViewDetails={(picked) =>
                        navigate(`/product/${buildProductSlug(picked.name, picked.id)}`)
                      }
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
