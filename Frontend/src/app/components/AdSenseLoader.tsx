import { useEffect } from 'react';
import { useLocation } from 'react-router';

const ADSENSE_CLIENT = 'ca-pub-6876494943583526';
const SCRIPT_ID = 'throttle-adsense-script';

/** Routes where Google Auto Ads are allowed (publisher content present). */
export function isAdSenseAllowedPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return false;
  if (pathname === '/checkout') return false;
  if (pathname === '/') return true;
  if (pathname.startsWith('/product/')) return true;
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return true;
  if (
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/privacy' ||
    pathname === '/terms'
  ) {
    return true;
  }
  return false;
}

/**
 * Loads the AdSense script only on allowlisted routes so Auto Ads never run on
 * checkout/admin (policy: no ads on screens without publisher content).
 */
export default function AdSenseLoader() {
  const { pathname } = useLocation();
  const allowed = isAdSenseAllowedPath(pathname);

  useEffect(() => {
    if (!allowed) {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) existing.remove();
      return;
    }

    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
  }, [allowed]);

  return null;
}
