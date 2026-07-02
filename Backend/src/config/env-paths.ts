import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

function trimSlash(url: string): string {
  return url.replace(/\/$/, '');
}

/** Storefront origin — env: FRONTEND_PATH or frontend_path */
export function getFrontendPath(config: ConfigService): string {
  return trimSlash(
    config.get<string>('FRONTEND_PATH') ??
      config.get<string>('frontend_path') ??
      config.get<string>('CORS_ORIGIN')?.split(',')[0]?.trim() ??
      'http://localhost:5173',
  );
}

/** API public base URL — env: BACKEND_PATH or Backend_path */
export function getBackendPath(config: ConfigService): string {
  const explicit =
    config.get<string>('BACKEND_PATH') ?? config.get<string>('Backend_path');
  if (explicit) {
    return trimSlash(explicit);
  }
  const port = config.get<string>('PORT', '3000');
  return `http://localhost:${port}`;
}

export function getListenPort(config: ConfigService): number {
  const portEnv = config.get<string>('PORT');
  if (portEnv !== undefined && portEnv !== '') {
    return Number(portEnv);
  }
  try {
    const u = new URL(getBackendPath(config));
    if (u.port) {
      return Number(u.port);
    }
    return u.protocol === 'https:' ? 443 : 80;
  } catch {
    return 3000;
  }
}

/** Add www / non-www companion so mobile bookmarks and redirects still pass CORS. */
function expandOriginVariants(origin: string): string[] {
  try {
    const u = new URL(origin);
    const host = u.hostname;
    const port = u.port ? `:${u.port}` : '';
    const base = `${u.protocol}//`;
    const variants = [origin];
    if (host.startsWith('www.')) {
      variants.push(`${base}${host.slice(4)}${port}`);
    } else if (
      host !== 'localhost' &&
      !/^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    ) {
      variants.push(`${base}www.${host}${port}`);
    }
    return variants;
  } catch {
    return [origin];
  }
}

export function getCorsOrigins(config: ConfigService): string[] {
  const legacy = config.get<string>('CORS_ORIGIN');
  const fromLegacy = legacy
    ? legacy.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const fromFrontend = getFrontendPath(config);
  return [
    ...new Set(
      [...fromLegacy, fromFrontend].flatMap((origin) =>
        expandOriginVariants(origin),
      ),
    ),
  ];
}

export function logPathConfig(config: ConfigService): void {
  const logger = new Logger('Bootstrap');
  logger.log(`BACKEND_PATH=${getBackendPath(config)}`);
  logger.log(`FRONTEND_PATH (CORS)=${getCorsOrigins(config).join(', ')}`);
}
