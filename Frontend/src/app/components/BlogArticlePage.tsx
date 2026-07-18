import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import ContentPageShell from './ContentPageShell';
import MarkdownBody from './MarkdownBody';
import { apiUrl } from '../../lib/api';
import {
  formatArticleDate,
  parseArticle,
  type Article,
} from '../../lib/articles';
import { useDocumentHead } from '../../lib/useDocumentHead';

export default function BlogArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const res = await fetch(apiUrl(`/articles/${encodeURIComponent(slug)}`));
        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setArticle(null);
          }
          return;
        }
        if (!res.ok) throw new Error('fail');
        const parsed = parseArticle(await res.json());
        if (!cancelled) setArticle(parsed);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const jsonLd = useMemo(() => {
    if (!article) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedAt,
      ...(article.coverImage ? { image: [article.coverImage] } : {}),
      author: {
        '@type': 'Organization',
        name: article.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Throttle LK',
        url: 'https://throttlelk.online/',
      },
      mainEntityOfPage: `https://throttlelk.online/blog/${article.slug}`,
    };
  }, [article]);

  useDocumentHead({
    title: article
      ? `${article.title} | Throttle LK Journal`
      : 'Article | Throttle LK',
    description: article?.excerpt,
    canonicalPath: article ? `/blog/${article.slug}` : undefined,
    ogType: 'article',
    ogImage: article?.coverImage ?? undefined,
    jsonLd,
  });

  return (
    <ContentPageShell>
      <Link
        to="/blog"
        className="mb-8 inline-block text-sm text-[#C0392B] underline underline-offset-2"
      >
        ← All articles
      </Link>

      {loading && <p className="text-[#F0EDE8]/50">Loading…</p>}
      {notFound && !loading && (
        <div>
          <h1
            className="mb-4 text-4xl tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Article not found
          </h1>
          <p className="text-[#F0EDE8]/60">
            This article may be unpublished or the link is outdated.
          </p>
        </div>
      )}

      {article && !loading && (
        <article>
          <p className="mb-3 text-xs text-[#F0EDE8]/40">
            {formatArticleDate(article.publishedAt)} · {article.authorName}
          </p>
          <h1
            className="mb-6 text-4xl tracking-wider text-[#F0EDE8] sm:text-5xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {article.title}
          </h1>
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt=""
              className="mb-8 h-auto w-full"
            />
          ) : null}
          <p className="mb-10 text-lg leading-relaxed text-[#F0EDE8]/65">
            {article.excerpt}
          </p>
          <MarkdownBody markdown={article.body} />
        </article>
      )}
    </ContentPageShell>
  );
}
