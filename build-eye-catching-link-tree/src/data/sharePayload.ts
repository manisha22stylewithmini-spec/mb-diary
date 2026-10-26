import type { AppData } from '../types';
import { hydrate } from './store';
import { isLocalMedia } from '../utils/mediaStore';

/*
 * A share link carries a compressed copy of the page inside its #hash, so whoever opens
 * it sees exactly what the owner built — no server needed. Anything stored as a data-url
 * (profile photo, uploaded media) is too heavy for a link and is left out.
 */

const noData = (s: string) => (isLocalMedia(s) ? '' : s);

function slim(d: AppData) {
  const modes = {} as Record<string, unknown>;
  for (const [key, m] of Object.entries(d.modes)) {
    const bgIsData = isLocalMedia(m.design.background.src);
    modes[key] = {
      ...m,
      design: {
        ...m.design,
        background: bgIsData ? { ...m.design.background, kind: 'theme', src: '' } : m.design.background,
      },
      music: m.music.source === 'upload' ? { ...m.music, enabled: false, url: '' } : m.music,
    };
  }
  return {
    profile: { name: d.profile.name, handle: d.profile.handle, avatar: noData(d.profile.avatar), avatarFrame: d.profile.avatarFrame },
    links: d.links
      .filter((l) => l.enabled && l.title.trim())
      .map((l) => ({
        title: l.title,
        url: l.url,
        emoji: l.emoji,
        image: noData(l.image),
        animation: l.animation,
        color: l.color,
        textColor: l.textColor,
        audience: l.audience,
        imageFrame: l.imageFrame,
      })),
    socials: d.socials.filter((s) => s.url.trim()).map((s) => ({ platform: s.platform, url: s.url })),
    modes,
    share: d.share,
  };
}

const toB64Url = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const w = stream.writable.getWriter();
  void w.write(bytes as unknown as BufferSource);
  void w.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/** Compact, URL-safe copy of the page. "z" = deflated, "r" = raw (older browsers). */
export async function encodePayload(d: AppData): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(slim(d)));
  if (typeof CompressionStream !== 'undefined') {
    try {
      return 'z' + toB64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
    } catch {
      /* fall through */
    }
  }
  return 'r' + toB64Url(bytes);
}

/** Returns null when the payload is damaged or can't be read in this browser. */
export async function decodePayload(payload: string): Promise<AppData | null> {
  try {
    let bytes = fromB64Url(payload.slice(1));
    if (payload[0] === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    return hydrate(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
