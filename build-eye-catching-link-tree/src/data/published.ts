import type { AppData } from '../types';
import { hydrate } from './store';

let cached: Promise<AppData | null> | null = null;

/**
 * The page the owner last published, as visitors see it. Null when nothing is published,
 * the server isn't set up, or we're running somewhere without the API (e.g. local dev).
 * The request starts once and is shared, so it can be kicked off before the app renders.
 */
export function fetchPublished(): Promise<AppData | null> {
  return (cached ??= fetch('/api/page')
    .then(async (r) => {
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
      return hydrate(await r.json());
    })
    .catch(() => null));
}
