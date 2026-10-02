import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaLink,
  FaPalette,
  FaShareNodes,
  FaArrowUpRightFromSquare,
  FaDownload,
  FaUpload,
  FaPen,
  FaMobileScreen,
} from 'react-icons/fa6';
import Logo from './components/Logo';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import LinksTab from './components/LinksTab';
import AppearanceTab from './components/AppearanceTab';
import ShareModal from './components/ShareModal';
import { useStore } from './data/store';
import { resolveTheme } from './data/themes';
import type { AppData, LinkItem } from './types';

type Tab = 'links' | 'appearance';

const TABS: { id: Tab; label: string; icon: typeof FaLink }[] = [
  { id: 'links', label: 'Links', icon: FaLink },
  { id: 'appearance', label: 'Appearance', icon: FaPalette },
];

function PhoneFrame({ data }: { data: AppData }) {
  return (
    <div className="relative mx-auto h-[660px] w-[322px] rounded-[48px] bg-neutral-900 p-[10px] shadow-2xl shadow-black/30 ring-1 ring-black/40">
      <div className="absolute left-1/2 top-[14px] z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="h-full w-full overflow-y-auto overflow-x-hidden rounded-[38px] bg-white">
        <ProfilePage data={data} />
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useStore();
  const [tab, setTab] = useState<Tab>('links');
  const [live, setLive] = useState(() => window.location.hash === '#live');
  const [showShare, setShowShare] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const counted = useRef(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  }, []);

  useEffect(() => {
    const onHash = () => setLive(window.location.hash === '#live');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // count a page view once per live visit (kept quietly in the background)
  useEffect(() => {
    if (live && !counted.current) {
      counted.current = true;
      setData((d) => ({ ...d, views: d.views + 1 }));
    }
    if (!live) counted.current = false;
  }, [live, setData]);

  const recordClick = (link: LinkItem) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l)) }));

  const liveUrl = `${window.location.origin}${window.location.pathname}#live`;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'link-forest-backup.json';
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Backup downloaded');
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (!parsed.profile || !Array.isArray(parsed.links)) throw new Error('bad');
      setData((d) => ({ ...d, ...parsed }));
      notify('Backup restored');
    } catch {
      notify('Invalid backup file');
    }
  };

  /* ---------------- Live (public) view ---------------- */
  if (live) {
    return (
      <div className="fixed inset-0 overflow-y-auto">
        <ProfilePage data={data} onOpen={recordClick} />
        <a
          href="#"
          onClick={() => {
            window.location.hash = '';
          }}
          className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:scale-110 hover:bg-black/70"
          title="Back to editor"
        >
          <FaPen />
        </a>
      </div>
    );
  }

  /* ---------------- Editor view ---------------- */
  return (
    <div className="min-h-screen bg-[#f3f3f1]">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-purple-50 shadow-sm ring-1 ring-black/5">
              <Logo size={26} />
            </div>
            <span className="hidden text-lg font-extrabold tracking-tight sm:block">
              Link<span className="text-[#19c37d]">Forest</span>
            </span>
          </div>

          <nav className="mx-auto flex gap-1 rounded-full bg-neutral-100 p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition sm:px-6 ${
                    tab === t.id ? 'bg-white text-neutral-900 shadow' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Icon className="text-xs" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={exportJson}
              title="Download backup"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 md:flex"
            >
              <FaDownload />
            </button>
            <button
              onClick={() => importRef.current?.click()}
              title="Restore backup"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 md:flex"
            >
              <FaUpload />
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 rounded-full bg-[#d2e823] px-4 py-2.5 text-sm font-bold text-neutral-900 shadow transition hover:scale-105 active:scale-95"
            >
              <FaShareNodes /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-6">
        <div className={`${mobilePreview ? 'hidden lg:block' : ''} mx-auto w-full max-w-2xl`}>
          {tab === 'links' && <LinksTab data={data} setData={setData} />}
          {tab === 'appearance' && <AppearanceTab data={data} setData={setData} notify={notify} />}
        </div>

        <aside className={`${mobilePreview ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24">
            <PhoneFrame data={data} />
            <div className="mt-4 flex justify-center">
              <a
                href="#live"
                onClick={() => setLive(true)}
                className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105"
              >
                Open live page <FaArrowUpRightFromSquare className="text-xs" />
              </a>
            </div>
          </div>
        </aside>
      </main>

      <Footer />

      <button
        onClick={() => setMobilePreview((v) => !v)}
        className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white shadow-2xl lg:hidden"
      >
        {mobilePreview ? (
          <>
            <FaPen /> Back to editing
          </>
        ) : (
          <>
            <FaMobileScreen /> Preview
          </>
        )}
      </button>

      {showShare && (
        <ShareModal
          url={liveUrl}
          name={data.profile.name}
          accent={resolveTheme(data.design).accent}
          notify={notify}
          onClose={() => setShowShare(false)}
          onOpenLive={() => {
            setShowShare(false);
            setLive(true);
          }}
        />
      )}

      {toast && (
        <div className="pop-in fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
