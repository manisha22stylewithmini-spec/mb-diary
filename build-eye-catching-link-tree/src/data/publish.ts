import type { AppData, Mode, ModeSettings, ShareView } from '../types';
import { liveHash } from './modes';
import { slim } from './sharePayload';
import { getMediaBlob, isLocalMedia, isLocalRef } from '../utils/mediaStore';

/* ---------- the owner's passcode and "what did I last publish" bookkeeping (this browser only) ---------- */

const KEY_STORE = 'lf-edit-key';
const META_STORE = 'lf-published';
const URL_CACHE = 'lf-media-urls';

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* storage blocked */
  }
};

export const getEditKey = () => read(KEY_STORE) ?? '';
export const setEditKey = (key: string | null) => write(KEY_STORE, key || null);

export interface PublishedMeta {
  at: number;
  fingerprint: string;
}

export function getPublishedMeta(): PublishedMeta | null {
  try {
    return JSON.parse(read(META_STORE) ?? 'null') as PublishedMeta | null;
  } catch {
    return null;
  }
}

function hash(s: string) {
  let a = 2166136261;
  let b = 5381;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    a = Math.imul(a ^ c, 16777619);
    b = (Math.imul(b, 33) ^ c) | 0;
  }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}${s.length.toString(36)}`;
}

/** A fingerprint of everything a visitor could see (view and click counters don't count). */
export function pageFingerprint(d: AppData): string {
  return hash(JSON.stringify({ ...d, views: 0, links: d.links.map((l) => ({ ...l, clicks: 0 })) }));
}

export const publishedUrl = (view: ShareView) => `${window.location.origin}${window.location.pathname}${liveHash(view)}`;

/* ---------- publishing ---------- */

export class PublishError extends Error {
  code: 'passcode' | 'storage' | 'network' | 'other';
  constructor(code: PublishError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

function toPublishError(e: unknown): PublishError {
  if (e instanceof PublishError) return e;
  const msg = e instanceof Error ? e.message : String(e);
  if (/passcode|unauthori[sz]ed|401/i.test(msg)) return new PublishError('passcode', "That passcode isn't right.");
  if (/token|not set up|storage|503/i.test(msg)) {
    return new PublishError('storage', 'Online storage is not connected to this site yet.');
  }
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return new PublishError('network', "Couldn't reach the server. Check your connection and try again.");
  }
  return new PublishError('other', msg || 'Something went wrong while publishing.');
}

export interface Progress {
  label: string;
  /** 0–1 across the whole publish */
  fraction: number;
}

const keyOf = (ref: string) => (isLocalRef(ref) ? ref : `data:${hash(ref)}`);

function loadUrlCache(): Record<string, string> {
  try {
    return JSON.parse(read(URL_CACHE) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

async function blobOf(ref: string): Promise<Blob | null> {
  if (isLocalRef(ref)) return getMediaBlob(ref);
  return (await fetch(ref)).blob();
}

async function uploadFile(blob: Blob, name: string, editKey: string, onPct: (pct: number) => void) {
  const { upload } = await import('@vercel/blob/client');
  const ext = (blob.type.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin';
  const res = await upload(`media/${name}.${ext}`, blob, {
    access: 'public',
    handleUploadUrl: '/api/blob',
    clientPayload: editKey,
    multipart: blob.size > 8 * 1024 * 1024,
    contentType: blob.type || undefined,
    onUploadProgress: (p) => onPct(p.percentage),
  });
  return res.url;
}

/**
 * Uploads any photos / videos / music that only exist in this browser, then saves the page
 * itself. Visitors then get the latest page (and its media) from the plain link.
 */
export async function publishPage(
  data: AppData,
  editKey: string,
  onProgress: (p: Progress) => void,
): Promise<{ at: number }> {
  try {
    const urls = loadUrlCache();
    const refs = new Map<string, string>(); // ref → label
    const want = (ref: string, label: string) => {
      if (ref && isLocalMedia(ref) && !urls[keyOf(ref)]) refs.set(ref, label);
    };
    want(data.profile.avatar, 'profile photo');
    data.links.forEach((l) => want(l.image, `image for “${l.title || 'link'}”`));
    (Object.entries(data.modes) as [Mode, ModeSettings][]).forEach(([mode, m]) => {
      const label = mode === 'pro' ? 'Professional' : 'Freelance';
      if (m.design.background.kind !== 'theme') want(m.design.background.src, `${label} background`);
      if (m.music.enabled && m.music.source === 'upload') want(m.music.url, `${label} music`);
    });

    const total = refs.size + 1;
    let done = 0;
    for (const [ref, label] of refs) {
      onProgress({ label: `Uploading ${label}…`, fraction: done / total });
      const blob = await blobOf(ref);
      if (!blob) continue; // the file is gone from this browser; publish without it
      const name = isLocalRef(ref) ? ref.replace('idb:', '') : hash(ref);
      urls[keyOf(ref)] = await uploadFile(blob, name, editKey, (pct) =>
        onProgress({ label: `Uploading ${label}… ${Math.round(pct)}%`, fraction: (done + pct / 100) / total }),
      );
      write(URL_CACHE, JSON.stringify(urls));
      done++;
    }

    const resolve = (ref: string) => (isLocalMedia(ref) ? urls[keyOf(ref)] ?? '' : ref);
    const fixMode = (m: ModeSettings): ModeSettings => ({
      ...m,
      design: { ...m.design, background: { ...m.design.background, src: resolve(m.design.background.src) } },
      music: m.music.source === 'upload' ? { ...m.music, source: 'url', url: resolve(m.music.url) } : m.music,
    });
    const publishable: AppData = {
      ...data,
      profile: { ...data.profile, avatar: resolve(data.profile.avatar) },
      links: data.links.map((l) => ({ ...l, image: resolve(l.image) })),
      modes: { pro: fixMode(data.modes.pro), freelance: fixMode(data.modes.freelance) },
    };

    onProgress({ label: 'Publishing your page…', fraction: done / total });
    const res = await fetch('/api/page', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-edit-key': editKey },
      body: JSON.stringify(slim(publishable)),
    });
    if (res.status === 401) throw new PublishError('passcode', "That passcode isn't right.");
    if (res.status === 503 || res.status === 404) throw new PublishError('storage', 'Online storage is not connected to this site yet.');
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new PublishError('other', body?.error ?? `The server answered ${res.status}.`);
    }
    const { publishedAt } = (await res.json()) as { publishedAt: number };
    write(META_STORE, JSON.stringify({ at: publishedAt, fingerprint: pageFingerprint(data) } satisfies PublishedMeta));
    onProgress({ label: 'Published', fraction: 1 });
    return { at: publishedAt };
  } catch (e) {
    throw toPublishError(e);
  }
}
