import { Mail, MapPin, Phone } from 'lucide-react';
import ContentPageShell from './ContentPageShell';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function ContactPage() {
  useDocumentHead({
    title: 'Contact Throttle LK | Support & Orders',
    description:
      'Contact Throttle LK in Colombo, Sri Lanka — email, phone, WhatsApp order support, and social channels.',
    canonicalPath: '/contact',
  });

  return (
    <ContentPageShell>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C0392B]">Contact</p>
      <h1
        className="mb-6 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Get in touch
      </h1>
      <p className="mb-10 text-base leading-relaxed text-[#F0EDE8]/75 md:text-lg">
        Questions about sizing, shipping, or an order? Reach us directly — we
        respond during business hours and confirm every order on WhatsApp at
        checkout.
      </p>

      <ul className="space-y-6">
        <li className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2C2C2C]/60">
            <Mail className="h-4 w-4 text-[#C0392B]" />
          </span>
          <div>
            <p className="text-sm text-[#F0EDE8]/50">Email</p>
            <a
              href="mailto:info@throttlelk.com"
              className="text-lg text-[#F0EDE8] hover:text-[#C0392B]"
            >
              info@throttlelk.com
            </a>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2C2C2C]/60">
            <Phone className="h-4 w-4 text-[#C0392B]" />
          </span>
          <div>
            <p className="text-sm text-[#F0EDE8]/50">Phone / WhatsApp</p>
            <a
              href="tel:+94727707597"
              className="text-lg text-[#F0EDE8] hover:text-[#C0392B]"
            >
              +94 72 770 7597
            </a>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2C2C2C]/60">
            <MapPin className="h-4 w-4 text-[#C0392B]" />
          </span>
          <div>
            <p className="text-sm text-[#F0EDE8]/50">Based in</p>
            <p className="text-lg text-[#F0EDE8]">Colombo, Sri Lanka</p>
          </div>
        </li>
      </ul>

      <div className="mt-12 border-t border-[#2C2C2C] pt-8">
        <p className="mb-3 text-sm text-[#F0EDE8]/50">Social</p>
        <div className="flex flex-wrap gap-4 text-[#C0392B]">
          <a
            href="https://www.facebook.com/share/18qA9nBdVh/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Facebook
          </a>
          <a
            href="https://www.tiktok.com/@throttle_lk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            TikTok
          </a>
        </div>
      </div>
    </ContentPageShell>
  );
}
