import { Link } from 'react-router';
import ContentPageShell from './ContentPageShell';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function AboutPage() {
  useDocumentHead({
    title: 'About Throttle LK | Streetwear & Rider Culture in Sri Lanka',
    description:
      'Throttle LK is a Colombo-based streetwear and rider culture brand crafting bold oversized hoodies and tees, with Motor Garage parts and accessories on the way.',
    canonicalPath: '/about',
  });

  return (
    <ContentPageShell>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C0392B]">About</p>
      <h1
        className="mb-6 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Built in Colombo. Worn without apology.
      </h1>
      <div className="space-y-5 text-base leading-relaxed text-[#F0EDE8]/75 md:text-lg">
        <p>
          Throttle LK is a streetwear and rider culture brand based in Colombo,
          Sri Lanka. We make bold, oversized hoodies and t-shirts for people who
          refuse to blend in — on the street, in the city, and on the bike.
        </p>
        <p>
          The brand grew out of a simple frustration: too much of what was sold
          as “streetwear” here felt imported, thin, or disconnected from how we
          actually live. Humidity, scooter rides, late nights, and island-wide
          delivery realities shape how we cut, print, and ship.
        </p>
        <p>
          Today we focus on premium fleece and graphic drops you can wear daily.
          Next, Motor Garage expands the same attitude into modified motorbike
          parts and riders&apos; accessories — gear for Sri Lanka&apos;s bike
          community, not tourist cosplay.
        </p>
        <p>
          We deliver island-wide for a flat fee, confirm orders clearly over
          WhatsApp, and stand behind the pieces we ship. If you want the full
          story in motion, explore the{' '}
          <Link to="/blog" className="text-[#C0392B] underline underline-offset-2">
            journal
          </Link>{' '}
          or{' '}
          <Link to="/contact" className="text-[#C0392B] underline underline-offset-2">
            get in touch
          </Link>
          .
        </p>
      </div>
    </ContentPageShell>
  );
}
