import { useEffect, useState } from 'react';

/*
 * Big uploads (background videos) live in IndexedDB as Blobs instead of being stuffed into
 * localStorage as text. That removes the old 2.5 MB ceiling: the only real limit is the
 * free disk space the browser grants this site. The page data just keeps a short
 * "idb:<id>" reference, and the Blob is streamed to the <video> through an object URL.
 */

export const MAX_VIDEO_BYTES = 50 * 1024 ** 3; // 50 GB

export const isLocalRef = (s: string) => s.startsWith('idb:');
/** Anything that exists only in this browser and so can't travel inside a share link. */
export const isLocalMedia = (s: string) => s.startsWith('data:') || s.startsWith('idb:');

const DB_NAME = 'linkforest-media';
const STORE = 'blobs';

let dbPromise: Promise<IDBDatabase> | null = null;
const db = () =>
  (dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise<T>((resolve, reject) => {
    const t = d.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    // resolve on transaction completion so a write is really on disk before we report success
    t.oncomplete = () => resolve(req.result);
    t.onerror = () => reject(t.error ?? req.error);
    t.onabort = () => reject(t.error ?? new Error('Storage write was aborted'));
  });
}

/** Stores a file and returns its "idb:<id>" reference. */
export async function saveMedia(file: Blob): Promise<string> {
  const id = `idb:${crypto.randomUUID()}`;
  await run('readwrite', (s) => s.put(file, id));
  return id;
}

const urls = new Map<string, Promise<string>>();

/** Turns a reference into something a <video>/<img> can load. Plain links pass straight through. */
export function mediaUrl(ref: string): Promise<string> {
  if (!isLocalRef(ref)) return Promise.resolve(ref);
  let p = urls.get(ref);
  if (!p) {
    p = run<Blob | undefined>('readonly', (s) => s.get(ref)).then((b) => (b ? URL.createObjectURL(b) : ''));
    urls.set(ref, p);
  }
  return p;
}

/** Deletes stored files that no page refers to any more (runs once when the editor opens). */
export async function cleanupMedia(keep: Set<string>): Promise<void> {
  const ids = (await run('readonly', (s) => s.getAllKeys())) as string[];
  for (const id of ids) {
    if (keep.has(id)) continue;
    await run('readwrite', (s) => s.delete(id));
    const u = urls.get(id);
    urls.delete(id);
    if (u) URL.revokeObjectURL(await u);
  }
}

/** Free space this browser will let the site use, or null when it can't tell. */
export async function storageRoom(): Promise<{ free: number; quota: number } | null> {
  const e = await navigator.storage?.estimate?.();
  if (!e?.quota) return null;
  return { quota: e.quota, free: e.quota - (e.usage ?? 0) };
}

export function fmtBytes(n: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

/** Resolves a media reference to a loadable URL ('' until ready). */
export function useMediaUrl(src: string): string {
  const [url, setUrl] = useState(() => (isLocalRef(src) ? '' : src));
  useEffect(() => {
    if (!isLocalRef(src)) {
      setUrl(src);
      return;
    }
    let stale = false;
    setUrl('');
    mediaUrl(src)
      .then((u) => {
        if (!stale) setUrl(u);
      })
      .catch(() => {
        if (!stale) setUrl('');
      });
    return () => {
      stale = true;
    };
  }, [src]);
  return url;
}

/** Visitors who asked for less motion or less data shouldn't be made to stream a video. */
export function shouldSkipVideo(): boolean {
  if (typeof window === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!conn?.saveData;
}
