import { useEffect } from 'react';
import { FRONTEND_PATH } from './api';

export type JsonLd = Record<string, unknown>;

export interface DocumentHeadOptions {
  /** Sets document.title and og:title/twitter:title. */
  title: string;
  description?: string;
  /** Site-relative path, e.g. '/' or '/product/some-slug'. Used for canonical + og:url. */
  canonicalPath?: string;
  /** Defaults to 'index, follow'. Use 'noindex, nofollow' for admin/checkout pages. */
  robots?: string;
  ogImage?: string;
  ogType?: string;
  /** One or more JSON-LD objects to inject as <script type="application/ld+json">. */
  jsonLd?: JsonLd | JsonLd[] | null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Imperatively syncs <head> tags (title, meta description/OG/Twitter, canonical,
 * robots, JSON-LD) for the currently mounted route. Deliberately dependency-free
 * (no react-helmet) since this is a small, single-purpose need.
 */
export function useDocumentHead(options: DocumentHeadOptions) {
  const serialized = JSON.stringify(options);

  useEffect(() => {
    const {
      title,
      description,
      canonicalPath,
      robots = 'index, follow',
      ogImage,
      ogType = 'website',
      jsonLd,
    } = options;

    document.title = title;
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', title);
    upsertMeta('name', 'twitter:title', title);

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    if (ogImage) {
      upsertMeta('property', 'og:image', ogImage);
      upsertMeta('name', 'twitter:image', ogImage);
    }

    upsertMeta('property', 'og:type', ogType);

    if (canonicalPath) {
      const normalized = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
      const href = `${FRONTEND_PATH}${normalized}`;
      upsertLink('canonical', href);
      upsertMeta('property', 'og:url', href);
    }

    document
      .querySelectorAll('script[data-seo-managed="true"]')
      .forEach((el) => el.remove());

    const entries = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    for (const entry of entries) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-managed', 'true');
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);
}
