function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/** NestJS API base URL — from VITE_BACKEND_PATH / BACKEND_PATH in .env */
export const BACKEND_PATH = trimTrailingSlash(
  (import.meta.env.VITE_BACKEND_PATH as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined) ||
    'http://localhost:3000',
);

/** Storefront URL — from VITE_FRONTEND_PATH / FRONTEND_PATH in .env */
export const FRONTEND_PATH = trimTrailingSlash(
  (import.meta.env.VITE_FRONTEND_PATH as string | undefined) ||
    'http://localhost:5173',
);

/** @deprecated Use BACKEND_PATH */
export const API_BASE = BACKEND_PATH;

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_PATH}${p}`;
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const body = init?.body;
  if (
    body &&
    typeof body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }
  const token = init?.token;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const { token: _omit, ...rest } = init ?? {};
  return fetch(apiUrl(path), {
    ...rest,
    headers,
  });
}

/** Upload up to 5 product images (multipart). Returns public URLs under /images/. */
export async function uploadProductImages(
  files: File[],
  token: string | null,
): Promise<string[]> {
  if (!files.length) return [];
  const form = new FormData();
  for (const file of files) {
    form.append('images', file);
  }
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(apiUrl('/admin/products/images'), {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const msg = Array.isArray(err.message)
      ? err.message.join(', ')
      : err.message;
    throw new Error(msg || 'Image upload failed');
  }
  const data = (await res.json()) as { urls?: string[] };
  return Array.isArray(data.urls) ? data.urls : [];
}
