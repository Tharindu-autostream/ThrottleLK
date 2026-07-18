import { Link } from 'react-router';
import ContentPageShell from './ContentPageShell';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function PrivacyPage() {
  useDocumentHead({
    title: 'Privacy Policy | Throttle LK',
    description:
      'How Throttle LK collects and uses personal data, cookies, analytics, and advertising technologies including Google AdSense.',
    canonicalPath: '/privacy',
  });

  return (
    <ContentPageShell>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C0392B]">Legal</p>
      <h1
        className="mb-6 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-[#F0EDE8]/50">Last updated: 18 July 2026</p>

      <div className="space-y-8 text-base leading-relaxed text-[#F0EDE8]/75">
        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Who we are
          </h2>
          <p>
            Throttle LK (&quot;we&quot;, &quot;us&quot;) operates{' '}
            <a href="https://throttlelk.online/" className="text-[#C0392B] underline">
              throttlelk.online
            </a>
            , an online store for streetwear and related products based in
            Colombo, Sri Lanka. Contact:{' '}
            <a href="mailto:info@throttlelk.com" className="text-[#C0392B] underline">
              info@throttlelk.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Information we collect
          </h2>
          <p className="mb-3">We may collect:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Order and delivery details you submit at checkout (name, phone,
              address, notes).
            </li>
            <li>Messages you send via WhatsApp, email, or social channels.</li>
            <li>Newsletter email addresses if you subscribe.</li>
            <li>
              Technical data such as IP address, device/browser type, and pages
              visited via analytics cookies.
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            How we use information
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To fulfil and support orders.</li>
            <li>To respond to customer service requests.</li>
            <li>To send newsletter updates if you opted in.</li>
            <li>To understand site usage and improve the storefront.</li>
            <li>
              To show advertising where Google AdSense (or similar) is approved
              and enabled on content pages.
            </li>
          </ul>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Cookies, analytics, and advertising
          </h2>
          <p className="mb-3">
            We use Google Analytics (gtag) to measure traffic. When AdSense is
            active on eligible pages, Google and partners may use cookies or
            similar technologies to serve and personalise ads, measure
            performance, and prevent fraud.
          </p>
          <p>
            You can control cookies through your browser settings. Learn more
            about Google&apos;s use of data in advertising via Google&apos;s
            published privacy resources. We do not intentionally place ads on
            checkout or admin screens.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Sharing
          </h2>
          <p>
            We share data with service providers needed to run the business
            (hosting, payment confirmation workflows, couriers, analytics, and
            advertising partners). We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Retention and security
          </h2>
          <p>
            We keep order records as long as needed for fulfilment, accounting,
            and dispute resolution. We use reasonable technical measures to
            protect data, but no online transmission is fully risk-free.
          </p>
        </section>

        <section>
          <h2
            className="mb-3 text-2xl tracking-wide text-[#F0EDE8]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Your choices
          </h2>
          <p>
            Contact us to update or correct order details, unsubscribe from the
            newsletter, or ask questions about this policy. See also our{' '}
            <Link to="/terms" className="text-[#C0392B] underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </section>
      </div>
    </ContentPageShell>
  );
}
