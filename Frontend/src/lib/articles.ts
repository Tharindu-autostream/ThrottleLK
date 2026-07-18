export type ArticleStatus = 'draft' | 'published';

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  authorName: string;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function parseArticle(raw: unknown): Article | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.title !== 'string') return null;
  if (typeof o.slug !== 'string' || typeof o.excerpt !== 'string') return null;
  if (typeof o.body !== 'string') return null;
  const status = o.status === 'published' ? 'published' : 'draft';
  return {
    id: o.id,
    title: o.title,
    slug: o.slug,
    excerpt: o.excerpt,
    body: o.body,
    coverImage: typeof o.coverImage === 'string' ? o.coverImage : null,
    authorName: typeof o.authorName === 'string' ? o.authorName : 'Throttle LK',
    status,
    publishedAt: typeof o.publishedAt === 'string' ? o.publishedAt : null,
    createdAt: typeof o.createdAt === 'string' ? o.createdAt : '',
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : '',
  };
}

export function formatArticleDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
