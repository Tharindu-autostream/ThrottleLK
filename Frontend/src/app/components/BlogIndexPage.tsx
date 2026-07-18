import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import ContentPageShell from './ContentPageShell';
import { apiUrl } from '../../lib/api';
import {
  formatArticleDate,
  parseArticle,
  type Article,
} from '../../lib/articles';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function BlogIndexPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useDocumentHead({
    title: 'Journal | Throttle LK Streetwear & Rider Guides',
    description:
      'Guides on oversized fit, hoodie care, Colombo streetwear culture, delivery, and rider basics from Throttle LK.',
    canonicalPath: '/blog',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/articles'));
        if (!res.ok) throw new Error('fail');
        const raw = await res.json();
        if (!cancelled) {
          setArticles(
            Array.isArray(raw)
              ? raw.map(parseArticle).filter((a): a is Article => a !== null)
              : [],
          );
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentPageShell>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#C0392B]">Journal</p>
      <h1
        className="mb-4 text-5xl tracking-wider text-[#F0EDE8] sm:text-6xl"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Street notes &amp; rider guides
      </h1>
      <p className="mb-12 max-w-2xl text-base leading-relaxed text-[#F0EDE8]/70 md:text-lg">
        Practical writing from Throttle LK — fit, care, Colombo culture, delivery,
        and the rider life that shapes what we make.
      </p>

      {loading && (
        <p className="text-[#F0EDE8]/50">Loading articles…</p>
      )}
      {error && (
        <p className="text-[#C0392B]">
          Could not load articles. Please try again later.
        </p>
      )}
      {!loading && !error && articles.length === 0 && (
        <p className="text-[#F0EDE8]/50">No published articles yet.</p>
      )}

      <ul className="space-y-10">
        {articles.map((article) => (
          <li key={article.id} className="border-b border-[#2C2C2C] pb-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              {article.coverImage ? (
                <Link
                  to={`/blog/${article.slug}`}
                  className="block w-full shrink-0 sm:w-56"
                  aria-hidden
                  tabIndex={-1}
                >
                  <img
                    src={article.coverImage}
                    alt=""
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </Link>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs text-[#F0EDE8]/40">
                  {formatArticleDate(article.publishedAt)} ·{' '}
                  {article.authorName}
                </p>
                <h2
                  className="mb-3 text-3xl tracking-wide text-[#F0EDE8]"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  <Link
                    to={`/blog/${article.slug}`}
                    className="hover:text-[#C0392B]"
                  >
                    {article.title}
                  </Link>
                </h2>
                <p className="mb-4 text-[#F0EDE8]/70 leading-relaxed">
                  {article.excerpt}
                </p>
                <Link
                  to={`/blog/${article.slug}`}
                  className="text-sm text-[#C0392B] underline underline-offset-2"
                >
                  Read article
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ContentPageShell>
  );
}
