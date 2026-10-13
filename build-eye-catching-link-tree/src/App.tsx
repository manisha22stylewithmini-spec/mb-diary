import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaLink,
  FaPalette,
  FaShareNodes,
  FaArrowUpRightFromSquare,
  FaPen,
  FaMobileScreen,
} from 'react-icons/fa6';
import Logo from './components/Logo';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import LinksTab from './components/LinksTab';
import AppearanceTab from './components/AppearanceTab';
import ModeSwitch from './components/ModeSwitch';
import ShareModal from './components/ShareModal';
import { useStore } from './data/store';
import { MODE_META, VIEW_LABEL, liveHash, parseLiveHash, type LiveRoute } from './data/modes';
import { decodePayload } from './data/sharePayload';
import type { AppData, LinkItem, Mode, ShareView } from './types';

type Tab = 'links' | 'appearance';

const TABS: { id: Tab; label: string; icon: typeof FaLink }[] = [
  { id: 'links', label: 'Links', icon: FaLink },
  { id: 'appearance', label: 'Appearance', icon: FaPalette },
];

const MODE_KEY = 'lf-edit-mode';

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === 'freelance' ? 'freelance' : 'pro';
  } catch {
    return 'pro';
  }
}

function PhoneFrame({ data, view }: { data: AppData; view: ShareView }) {
  return (
    <div className="relative mx-auto h-[660px] w-[322px] rounded-[48px] bg-brand-ink p-[10px] shadow-2xl shadow-black/30 ring-1 ring-black/40">
      <div className="absolute left-1/2 top-[14px] z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-brand-ink" />
      <div className="h-full w-full overflow-y-auto overflow-x-hidden rounded-[38px] bg-white">
        {/* key restarts the page (and its music) cleanly when the page type changes */}
        <ProfilePage key={view} data={data} view={view} />
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useStore();
  const [tab, setTab] = useState<Tab>('links');
  const [editMode, setEditMode] = useState<Mode>(readMode);
  const [route, setRoute] = useState<LiveRoute | null>(() => parseLiveHash(window.location.hash));
  // page carried inside a share link: undefined while decoding, null when there is none
  const [shared, setShared] = useState<AppData | null | undefined>(undefined);
  const [showShare, setShowShare] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState('');
  const counted = useRef(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  }, []);

  const chooseMode = (m: Mode) => {
    setEditMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* private mode */
    }
  };

  useEffect(() => {
    const onHash = () => setRoute(parseLiveHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const payload = route?.payload ?? '';
  useEffect(() => {
    if (!payload) {
      setShared(null);
      return;
    }
    let stale = false;
    setShared(undefined);
    decodePayload(payload).then((d) => {
      if (!stale) setShared(d);
    });
    return () => {
      stale = true;
    };
  }, [payload]);

  const live = route !== null;
  const ownerPreview = live && !payload;

  // count a page view once per owner preview (kept quietly in the background)
  useEffect(() => {
    if (ownerPreview && !counted.current) {
      counted.current = true;
      setData((d) => ({ ...d, views: d.views + 1 }));
    }
    if (!ownerPreview) counted.current = false;
  }, [ownerPreview, setData]);

  const recordClick = (link: LinkItem) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l)) }));

  const openLive = (view: ShareView) => {
    window.location.hash = liveHash(view);
    setShowShare(false);
  };

  const previewView: ShareView = data.share.combined ? 'both' : editMode;

  /* ---------------- Live (public) view ---------------- */
  if (route) {
    if (payload && shared === undefined) {
      return (
        <div className="flex h-full items-center justify-center bg-canvas" role="status" aria-live="polite">
          <Logo size={44} />
          <span className="sr-only">Loading page…</span>
        </div>
      );
    }
    const pageData = shared ?? data;
    return (
      <div className="fixed inset-0 overflow-y-auto">
        <ProfilePage
          key={route.view}
          data={pageData}
          view={route.view}
          onOpen={ownerPreview ? recordClick : undefined}
        />
        {ownerPreview && (
          <a
            href="#"
            onClick={() => {
              window.location.hash = '';
            }}
            className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:scale-110 hover:bg-black/70"
            title="Back to editor"
            aria-label="Back to editor"
          >
            <FaPen />
          </a>
        )}
      </div>
    );
  }

  /* ---------------- Editor view ---------------- */
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="bg-brand h-[3px]" aria-hidden />
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-purple-50 shadow-sm ring-1 ring-black/5">
              <Logo size={26} />
            </div>
            <span className="hidden text-lg font-extrabold tracking-tight sm:block">
              Link<span className="text-brand">Forest</span>
            </span>
          </div>

          <nav aria-label="Editor sections" className="mx-auto flex gap-1 rounded-full bg-neutral-100 p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition sm:px-6 ${
                    tab === t.id ? 'bg-white text-neutral-900 shadow' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="text-xs" aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="btn-brand flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow hover:scale-105 active:scale-95"
            >
              <FaShareNodes aria-hidden /> <span className="sr-only sm:not-sr-only">Share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-6">
        <div className={`${mobilePreview ? 'hidden lg:block' : ''} mx-auto w-full max-w-2xl space-y-5`}>
          <ModeSwitch value={editMode} onChange={chooseMode} />
          {tab === 'links' && <LinksTab data={data} setData={setData} mode={editMode} />}
          {tab === 'appearance' && <AppearanceTab data={data} setData={setData} notify={notify} mode={editMode} />}
        </div>

        <aside className={`${mobilePreview ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-28">
            <p className="mb-3 text-center text-xs font-semibold text-neutral-600">
              Previewing: {data.share.combined ? VIEW_LABEL.both : MODE_META[editMode].label}
            </p>
            <PhoneFrame data={data} view={previewView} />
            <div className="mt-4 flex justify-center">
              <a
                href={liveHash(previewView)}
                className="btn-brand flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow hover:scale-105"
              >
                Open live page <FaArrowUpRightFromSquare className="text-xs" aria-hidden />
              </a>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <button
        onClick={() => setMobilePreview((v) => !v)}
        className="btn-brand fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-2xl lg:hidden"
      >
        {mobilePreview ? (
          <>
            <FaPen aria-hidden /> Back to editing
          </>
        ) : (
          <>
            <FaMobileScreen aria-hidden /> Preview
          </>
        )}
      </button>

      {showShare && (
        <ShareModal
          data={data}
          setData={setData}
          initialMode={editMode}
          notify={notify}
          onClose={() => setShowShare(false)}
          onOpenLive={openLive}
        />
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2">
        {toast && (
          <div className="pop-in rounded-full bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
