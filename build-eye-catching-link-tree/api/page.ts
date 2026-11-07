import { list, put } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';

/*
 * GET  /api/page  — the published page, for visitors (public)
 * PUT  /api/page  — publish a new version (needs the edit passcode in the x-edit-key header)
 */

const PATH = 'page.json';
const MAX_BYTES = 2 * 1024 * 1024; // the page itself is small; media is uploaded separately

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

function authorised(request: Request) {
  const expected = process.env.EDIT_KEY ?? '';
  const given = request.headers.get('x-edit-key') ?? '';
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: PATH, limit: 1 });
    const blob = blobs.find((b) => b.pathname === PATH);
    if (!blob) return json({ error: 'Nothing published yet' }, 404, { 'cache-control': 'no-store' });
    // ?v= makes sure a fresh publish is never served from an older cached copy
    const res = await fetch(`${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`);
    if (!res.ok) return json({ error: 'Could not read the published page' }, 502, { 'cache-control': 'no-store' });
    return new Response(await res.text(), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // visitors get the page from Vercel's edge cache; a new publish shows up within ~15 seconds
        'cache-control': 'public, max-age=0, s-maxage=15, stale-while-revalidate=300',
      },
    });
  } catch {
    return json({ error: 'Storage is not set up yet' }, 503, { 'cache-control': 'no-store' });
  }
}

export async function PUT(request: Request) {
  if (!authorised(request)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return json({ error: 'Wrong passcode' }, 401);
  }
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: 'Page is too large' }, 413);
  let page: unknown;
  try {
    page = JSON.parse(text);
  } catch {
    return json({ error: 'Not valid JSON' }, 400);
  }
  if (!page || typeof page !== 'object' || !('modes' in page) || !('links' in page)) {
    return json({ error: 'This does not look like a LinkForest page' }, 400);
  }
  try {
    const stored = await put(PATH, JSON.stringify(page), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return json({ ok: true, publishedAt: Date.now(), url: stored.url });
  } catch (e) {
    const message = (e as Error).message;
    // no store connected yet (missing access token) is a setup problem, not a crash
    if (/token|BLOB_READ_WRITE/i.test(message)) return json({ error: 'Storage is not set up yet' }, 503);
    return json({ error: `Could not save: ${message}` }, 500);
  }
}
