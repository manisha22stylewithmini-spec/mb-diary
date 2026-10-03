import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  FaXmark,
  FaCopy,
  FaDownload,
  FaQrcode,
  FaLink,
  FaArrowUpRightFromSquare,
  FaWhatsapp,
  FaXTwitter,
  FaTelegram,
  FaEnvelope,
} from 'react-icons/fa6';

interface Props {
  url: string;
  name: string;
  accent: string;
  onClose: () => void;
  onOpenLive: () => void;
  notify: (msg: string) => void;
}

type Tab = 'qr' | 'link';

export default function ShareModal({ url, name, accent, onClose, onOpenLive, notify }: Props) {
  const [tab, setTab] = useState<Tab>('qr');
  const [qr, setQr] = useState('');
  const [dark, setDark] = useState('#1a1033');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark, light: '#ffffff' },
    })
      .then(setQr)
      .catch(() => setQr(''));
  }, [url, dark]);

  const slug = (name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const downloadQr = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `${slug}-link-forest-qr.png`;
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
    { label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', href: `https://wa.me/?text=${enc}` },
    { label: 'X', icon: FaXTwitter, color: '#111111', href: `https://twitter.com/intent/tweet?url=${enc}` },
    { label: 'Telegram', icon: FaTelegram, color: '#26A5E4', href: `https://t.me/share/url?url=${enc}` },
    { label: 'Email', icon: FaEnvelope, color: '#EA4335', href: `mailto:?body=${enc}` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="pop-in w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="share-title" className="text-lg font-extrabold">Share your Link Forest</h3>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="Close"
          >
            <FaXmark />
          </button>
        </div>

        <div className="mb-5 flex gap-1 rounded-full bg-neutral-100 p-1">
          <button
            onClick={() => setTab('qr')}
            aria-pressed={tab === 'qr'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-bold transition ${
              tab === 'qr' ? 'bg-white shadow' : 'text-neutral-600'
            }`}
          >
            <FaQrcode /> QR code
          </button>
          <button
            onClick={() => setTab('link')}
            aria-pressed={tab === 'link'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-bold transition ${
              tab === 'link' ? 'bg-white shadow' : 'text-neutral-600'
            }`}
          >
            <FaLink /> Link
          </button>
        </div>

        {tab === 'qr' ? (
          <div className="pop-in">
            <div
              className="mx-auto w-fit rounded-3xl p-2"
              style={{ background: `linear-gradient(135deg, ${accent}, #8129d9)` }}
            >
              {qr ? (
                <img src={qr} alt="QR code that opens your page" className="h-48 w-48 rounded-2xl bg-white p-2" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-white text-xs text-neutral-500">
                  Generating…
                </div>
              )}
            </div>
            <canvas ref={canvasRef} hidden />

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">QR colour</span>
              {['#1a1033', '#8129d9', '#ff3d81', '#0f766e', '#000000'].map((c) => (
                <button
                  key={c}
                  onClick={() => setDark(c)}
                  aria-label={`QR colour ${c}`}
                  aria-pressed={dark === c}
                  className={`h-6 w-6 rounded-full ring-2 transition hover:scale-110 ${
                    dark === c ? 'ring-[#8129d9]' : 'ring-black/10'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={downloadQr}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
              >
                <FaDownload /> Download
              </button>
              <button
                onClick={copyQr}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-100 py-3 text-sm font-bold text-neutral-800 transition hover:bg-neutral-200"
              >
                <FaCopy /> Copy image
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-neutral-500">Scan it to open your page instantly.</p>
          </div>
        ) : (
          <div className="pop-in">
            <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1.5 pl-4">
              <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">{url}</span>
              <button
                onClick={() => copyText(url, 'Link copied!')}
                className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-bold text-white"
              >
                <FaCopy /> Copy
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
                    <Icon />
                  </a>
                );
              })}
            </div>

            <a
              href="#live"
              onClick={onOpenLive}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#19c37d] via-[#00b3a4] to-[#8129d9] py-3 text-sm font-bold text-white"
            >
              Open live page <FaArrowUpRightFromSquare className="text-xs" />
            </a>
            <p className="mt-3 text-center text-[11px] leading-snug text-neutral-500">
              Your data is saved in this browser. Deploy the site to share it publicly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
