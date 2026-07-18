import { Link } from 'react-router';
import ContentPageShell from './ContentPageShell';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function TermsPage() {
  useDocumentHead({
    title: 'Terms & Conditions | Throttle LK',
    description:
      'Throttle LK terms for orders, payments, island-wide shipping, returns, and website use.',
    canonicalPath: '/terms',
  });

  return (
    <ContentPageShell>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C0392B]">Legal</p>
      <h1
        className="mb-6 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Terms &amp; Conditions
      </h1>
      <p className="mb-8 text-sm text-[#F0EDE8]/50">Last updated: 18 July 2026</p>

      <div className="space-y-8 text-base leading-relaxed text-[#F0EDE8]/75">
        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Agreement
          </h2>
          <p>
            By using throttlelk.online and placing an order, you agree to these
            terms. If you do not agree, please do not use the site or submit an
            order.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Products and pricing
          </h2>
          <p>
            Product images and descriptions aim to be accurate; minor colour
            differences can occur due to screens and lighting. Prices are shown
            in Sri Lankan Rupees (LKR) unless stated otherwise. We may correct
            errors and update stock without prior notice.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Orders and payment
          </h2>
          <p>
            Orders are confirmed through our checkout and WhatsApp process. We
            provide bank details after you submit an order; you confirm payment
            with a deposit slip or equivalent proof. We may cancel orders that
            are not paid within a reasonable time or that appear fraudulent.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Shipping
          </h2>
          <p>
            We offer island-wide delivery in Sri Lanka. A flat delivery fee of
            LKR 450 is added at checkout unless a promotion states otherwise.
            Delivery times vary by district and courier conditions. You are
            responsible for providing a complete, reachable address and phone
            number.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Returns and exchanges
          </h2>
          <p>
            Please review size options before ordering. If an item arrives
            damaged or incorrect, contact us promptly with your order details
            and photos so we can assess a replacement or other remedy. Change-of-
            mind returns may be limited for hygienic reasons on worn apparel —
            ask us before returning anything.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Website content
          </h2>
          <p>
            Journal articles, product copy, and branding on this site are owned
            by Throttle LK or used with permission. You may not copy content for
            commercial use without written consent.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by applicable law, Throttle LK is
            not liable for indirect or consequential losses arising from site
            use or delays outside our reasonable control (including courier
            disruptions). Our liability for a product claim is limited to the
            purchase price of that product.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Contact
          </h2>
          <p>
            Questions about these terms:{' '}
            <Link to="/contact" className="text-[#C0392B] underline">
              Contact page
            </Link>{' '}
            or{' '}
            <a href="mailto:info@throttlelk.com" className="text-[#C0392B] underline">
              info@throttlelk.com
            </a>
            . See also our{' '}
            <Link to="/privacy" className="text-[#C0392B] underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
