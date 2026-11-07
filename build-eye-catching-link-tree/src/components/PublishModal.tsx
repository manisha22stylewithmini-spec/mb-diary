import { useEffect, useRef, useState } from 'react';
import { FaXmark, FaCloudArrowUp, FaCheck, FaCopy, FaArrowUpRightFromSquare, FaTriangleExclamation } from 'react-icons/fa6';
import type { AppData, Mode, ShareView } from '../types';
import { VIEW_LABEL } from '../data/modes';
import {
  PublishError,
  getEditKey,
  publishPage,
  publishedUrl,
  setEditKey,
  type Progress,
} from '../data/publish';

interface Props {
  data: AppData;
  /** which page(s) the share link points to */
  view: ShareView;
  editMode: Mode;
  hasUnpublished: boolean;
  onClose: () => void;
  onPublished: () => void;
  notify: (msg: string) => void;
}

export default function PublishModal({ data, view, hasUnpublished, onClose, onPublished, notify }: Props) {
  const [key, setKey] = useState(getEditKey);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<PublishError | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // focus the passcode field (or the close button when it's already filled in), Escape closes, focus returns after
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (getEditKey() ? closeRef.current : inputRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [busy]);

  const urls: { label: string; url: string }[] =
    view === 'both'
      ? [{ label: VIEW_LABEL.both, url: publishedUrl('both') }]
      : [{ label: VIEW_LABEL[view], url: publishedUrl(view) }];

  const run = async () => {
    if (!key.trim()) {
      setError(new PublishError('passcode', 'Enter your passcode first.'));
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    setProgress({ label: 'Getting ready…', fraction: 0 });
    try {
      await publishPage(data, key.trim(), setProgress);
      setEditKey(remember ? key.trim() : null);
      setDone(true);
      onPublished();
    } catch (e) {
      setError(e instanceof PublishError ? e : new PublishError('other', 'Something went wrong while publishing.'));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Link copied!');
    } catch {
      notify('Copy failed — select the link manually');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="pop-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="publish-title" className="text-lg font-extrabold">
            {done ? 'Your page is live' : 'Publish your page'}
          </h3>
          <button
            ref={closeRef}
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 disabled:opacity-40"
            aria-label="Close"
          >
            <FaXmark />
          </button>
        </div>

        {done ? (
          <div>
            <p className="mb-4 flex items-start gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
              <FaCheck className="mt-0.5 shrink-0" aria-hidden />
              <span>
                Published. Anyone who opens the link below now sees this version, on any device. Changes later? Press
                Publish again.
              </span>
            </p>
            {urls.map((u) => (
              <div key={u.url} className="mb-3">
                <p className="mb-1.5 text-xs font-semibold text-neutral-600">{u.label}</p>
                <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1.5 pl-4">
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{u.url}</span>
                  <button
                    onClick={() => copy(u.url)}
                    className="btn-ink flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold"
                  >
                    <FaCopy aria-hidden /> Copy
                  </button>
                </div>
              </div>
            ))}
            <a
              href={urls[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold"
            >
              Open published page <FaArrowUpRightFromSquare className="text-xs" aria-hidden />
            </a>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) void run();
            }}
          >
            <p className="mb-4 text-sm leading-relaxed text-neutral-600">
              Publishing saves your page online, so your link always shows the latest version on every device. Photos,
              link images, music files and background videos are uploaded too.
            </p>
            {hasUnpublished && (
              <p className="mb-3 text-xs font-medium text-amber-700">You have changes that visitors can’t see yet.</p>
            )}

            <label htmlFor="edit-passcode" className="mb-1.5 block text-xs font-semibold text-neutral-600">
              Your passcode
            </label>
            <input
              id="edit-passcode"
              ref={inputRef}
              className="input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Only you know this"
              value={key}
              disabled={busy}
              onChange={(e) => {
                setKey(e.target.value);
                setError(null);
              }}
            />
            <label className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={remember}
                disabled={busy}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 accent-[#111]"
              />
              Remember it on this device
            </label>

            {error && (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                <FaTriangleExclamation className="mt-0.5 shrink-0" aria-hidden />
                <span>
                  {error.message}
                  {error.code === 'storage' && (
                    <span className="mt-1 block text-xs">
                      In Vercel: open the LinkForest project → Storage → Create a Blob store → Connect to project, then
                      redeploy.
                    </span>
                  )}
                </span>
              </p>
            )}

            {busy && progress && (
              <div className="mt-4" role="status" aria-live="polite">
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="bg-brand h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${Math.max(6, Math.round(progress.fraction * 100))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-600">{progress.label}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-60"
            >
              <FaCloudArrowUp aria-hidden /> {busy ? 'Publishing…' : 'Publish now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
