import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  FaXmark,
  FaCopy,
  FaDownload,
  FaQrcode,
  FaLink,
  FaMusic,
  FaArrowUpRightFromSquare,
  FaWhatsapp,
  FaXTwitter,
  FaTelegram,
  FaEnvelope,
  FaCheck,
  FaLayerGroup,
} from 'react-icons/fa6';
import type { AppData, Mode, ShareView } from '../types';
import { MODES, MODE_META, VIEW_LABEL, liveHash } from '../data/modes';
import { encodePayload } from '../data/sharePayload';
import { patchMode } from '../data/store';
import MusicEditor from './MusicEditor';
import { Toggle } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  initialMode: Mode;
  onClose: () => void;
  onOpenLive: (view: ShareView) => void;
  notify: (msg: string) => void;
}

type Tab = 'qr' | 'link' | 'music';

const TABS: { id: Tab; label: string; icon: typeof FaQrcode }[] = [
  { id: 'qr', label: 'QR code', icon: FaQrcode },
  { id: 'link', label: 'Link', icon: FaLink },
  { id: 'music', label: 'Music', icon: FaMusic },
];

export default function ShareModal({ data, setData, initialMode, onClose, onOpenLive, notify }: Props) {
  const [tab, setTab] = useState<Tab>('qr');
  const [type, setType] = useState<Mode>(initialMode);
  const [musicFor, setMusicFor] = useState<Mode>(initialMode);
  const [url, setUrl] = useState('');
  const [qr, setQr] = useState('');
  const [qrFailed, setQrFailed] = useState(false);
  const [dark, setDark] = useState('#1a1033');
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const combined = data.share.combined;
  const view: ShareView = combined ? 'both' : type;
  const musicMode: Mode = combined ? musicFor : type;

  // move focus into the dialog, close on Escape, and hand focus back afterwards
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, []);

  // the link carries a compressed copy of the page, so rebuild it whenever the page changes
  useEffect(() => {
    let stale = false;
    encodePayload(data).then((payload) => {
      if (!stale) setUrl(`${window.location.origin}${window.location.pathname}${liveHash(view, payload)}`);
    });
    return () => {
      stale = true;
    };
  }, [data, view]);

  useEffect(() => {
    if (!url) return;
    setQrFailed(false);
    QRCode.toDataURL(url, {
      width: 720,
      margin: 1,
      errorCorrectionLevel: url.length > 700 ? 'L' : 'M',
      color: { dark, light: '#ffffff' },
    })
      .then(setQr)
      .catch(() => {
        setQr('');
        setQrFailed(true);
      });
  }, [url, dark]);

  const slug = (data.profile.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const downloadQr = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `${slug}-${view}-link-forest-qr.png`;
    a.click();
    notify('QR code downloaded');
  };

  const copyQr = async () => {
    try {
      const blob = await (await fetch(qr)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      notify('QR image copied!');
    } catch {
      notify('Copy not supported here — use Download');
    }
  };

  const copyText = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(msg);
    } catch {
      notify('Copy failed — select the link manually');
    }
  };

  const enc = encodeURIComponent(url);
  const shares = [
    { label: 'WhatsApp', icon: FaWhatsapp, color: '#128C4A', href: `https://wa.me/?text=${enc}` },
    { label: 'X', icon: FaXTwitter, color: '#111111', href: `https://twitter.com/intent/tweet?url=${enc}` },
    { label: 'Telegram', icon: FaTelegram, color: '#1F7FB6', href: `https://t.me/share/url?url=${enc}` },
    { label: 'Email', icon: FaEnvelope, color: '#C5221F', href: `mailto:?body=${enc}` },
  ];

  const droppedMedia =
    data.profile.avatar.startsWith('data:') ||
    MODES.some(
      (m) =>
        data.modes[m].design.background.src.startsWith('data:') ||
        (data.modes[m].music.enabled && data.modes[m].music.source === 'upload'),
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="pop-in max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="share-title" className="text-lg font-extrabold">
            Share your <span className="text-brand">Link Forest</span>
          </h3>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Close"
          >
            <FaXmark />
          </button>
        </div>

        {/* ---- which link are you sharing? ---- */}
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-600">Who is it for?</p>
        {combined ? (
          <div className="flex items-center gap-3 rounded-2xl bg-purple-50 px-4 py-3 ring-2 ring-brand-purple">
            <span className="btn-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm">
              <FaLayerGroup aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold">Professional + Freelance</span>
              <span className="block text-xs text-neutral-700">
                One link — visitors flip between both pages with a toggle.
              </span>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Link type">
            {MODES.map((m) => {
              const meta = MODE_META[m];
              const Icon = meta.icon;
              const on = type === m;
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setType(m);
                    setMusicFor(m);
                  }}
                  className={`flex flex-col items-start gap-2 rounded-2xl px-4 py-3 text-left transition ${
                    on ? 'bg-purple-50 ring-2 ring-brand-purple' : 'bg-neutral-50 ring-1 ring-black/5 hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex w-full items-center justify-between">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm ${
                        on ? 'btn-brand' : 'bg-white text-brand-purple ring-1 ring-black/5'
                      }`}
                    >
                      <Icon aria-hidden />
                    </span>
                    {on && <FaCheck className="text-xs text-brand-purple" aria-hidden />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{meta.label}</span>
                    <span className="block text-[11px] leading-snug text-neutral-700">{meta.audience}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-black/5">
          <div>
            <p className="text-sm font-bold">Combine both in one link</p>
            <p className="text-xs text-neutral-600">Adds a Professional / Freelance toggle for visitors.</p>
          </div>
          <Toggle
            checked={combined}
            onChange={(v) => setData((d) => ({ ...d, share: { ...d.share, combined: v } }))}
            label="Combine Professional and Freelance in one link"
          />
        </div>

        {/* ---- tabs ---- */}
        <div className="mb-5 mt-5 flex gap-1 rounded-full bg-neutral-100 p-1" role="group" aria-label="Share options">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={on}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-bold transition ${
                  on ? 'bg-white shadow' : 'text-neutral-600'
                }`}
              >
                <Icon aria-hidden /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'qr' && (
          <div className="pop-in">
            <div className="mx-auto w-fit rounded-3xl bg-brand p-2">
              {qr ? (
                <img src={qr} alt={`QR code that opens your ${VIEW_LABEL[view]} page`} className="h-48 w-48 rounded-2xl bg-white p-2" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-4 text-center text-xs text-neutral-600">
                  {qrFailed ? 'This page is too large for a QR code — use the Link tab instead.' : 'Generating…'}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-neutral-600">QR colour</span>
              {['#1a1033', '#8129d9', '#0a8456', '#00857a', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => setDark(c)}
                  aria-label={`QR colour ${c}`}
                  aria-pressed={dark === c}
                  className={`h-6 w-6 rounded-full ring-2 transition hover:scale-110 ${
                    dark === c ? 'ring-brand-purple' : 'ring-black/10'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={downloadQr}
                disabled={!qr}
                className="btn-brand flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold hover:scale-[1.02] disabled:opacity-50"
              >
                <FaDownload aria-hidden /> Download
              </button>
              <button
                onClick={copyQr}
                disabled={!qr}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-100 py-3 text-sm font-bold text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                <FaCopy aria-hidden /> Copy image
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-neutral-600">
              Scan to open your {VIEW_LABEL[view]} page instantly.
            </p>
          </div>
        )}

        {tab === 'link' && (
          <div className="pop-in">
            <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1.5 pl-4">
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{url || 'Preparing link…'}</span>
              <button
                onClick={() => copyText(url, 'Link copied!')}
                disabled={!url}
                className="btn-brand flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
              >
                <FaCopy aria-hidden /> Copy
              </button>
            </div>

            <div className="mt-4 flex justify-center gap-3">
              {shares.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Share on ${s.label}`}
                    aria-label={`Share on ${s.label}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-lg text-white transition hover:scale-110"
                    style={{ background: s.color }}
                  >
                    <Icon aria-hidden />
                  </a>
                );
              })}
            </div>

            <a
              href={liveHash(view)}
              onClick={() => onOpenLive(view)}
              className="btn-brand mt-4 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold"
            >
              Open live page <FaArrowUpRightFromSquare className="text-xs" aria-hidden />
            </a>
            <p className="mt-3 text-center text-xs leading-snug text-neutral-600">
              The link contains your page, so anyone who opens it sees this version. Edited something? Copy the link
              again.
            </p>
          </div>
        )}

        {tab === 'music' && (
          <>
            {combined && (
              <div className="mb-4 flex gap-1 rounded-full bg-neutral-100 p-1" role="group" aria-label="Which page's music">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={musicFor === m}
                    onClick={() => setMusicFor(m)}
                    className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
                      musicFor === m ? 'bg-white text-neutral-900 shadow' : 'text-neutral-600'
                    }`}
                  >
                    {MODE_META[m].label} music
                  </button>
                ))}
              </div>
            )}
            <MusicEditor
              key={musicMode}
              music={data.modes[musicMode].music}
              pageLabel={MODE_META[musicMode].label}
              notify={notify}
              onChange={(patch) =>
                setData((d) => patchMode(d, musicMode, { music: { ...d.modes[musicMode].music, ...patch } }))
              }
            />
          </>
        )}

        {droppedMedia && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-xs leading-snug text-amber-800">
            Heads up: your profile photo and any uploaded images or music stay in this browser, so visitors who open
            the link see your initials and no uploaded media. Use image / audio links to include them.
          </p>
        )}
      </div>
    </div>
  );
}
