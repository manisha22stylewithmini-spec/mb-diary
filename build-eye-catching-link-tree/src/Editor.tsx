import { useCallback, useEffect, useState } from 'react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import ContentPanel from './components/ContentPanel';
import AppearanceTab from './components/AppearanceTab';
import SoundPanel from './components/SoundPanel';
import PanelFrame from './components/PanelFrame';
import TopBar from './components/TopBar';
import EditorNav, { type Area } from './components/EditorNav';
import ShareModal from './components/ShareModal';
import { MODE_META, VIEW_LABEL, liveHash } from './data/modes';
import { cleanupMedia, isLocalRef } from './utils/mediaStore';
import type { AppData, Mode, ShareView } from './types';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData, opts?: { silent?: boolean }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PANELS: Record<Area, { title: string; subtitle: (page: string) => string }> = {
  content: { title: 'Content', subtitle: (p) => `What visitors see on your ${p} page` },
  design: { title: 'Design', subtitle: (p) => `How your ${p} page looks and feels` },
  sound: { title: 'Sound', subtitle: (p) => `Background music for your ${p} page` },
};

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
    <div className="relative mx-auto h-[660px] w-[322px] lg:h-[clamp(440px,calc(100dvh-13rem),660px)] rounded-[48px] bg-brand-ink p-[10px] shadow-2xl shadow-black/30 ring-1 ring-black/40">
      <div className="absolute left-1/2 top-[14px] z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-brand-ink" />
      <div className="no-scrollbar h-full w-full overflow-y-auto overflow-x-hidden rounded-[38px] bg-white">
        {/* key restarts the page (and its music) cleanly when the page type changes */}
        <ProfilePage key={view} data={data} view={view} />
      </div>
    </div>
  );
}

/** The editor. Loaded on demand, so visitors who only open a share link never download it. */
export default function Editor({ data, setData, undo, redo, canUndo, canRedo }: Props) {
  const [area, setArea] = useState<Area>('content');
  const [editMode, setEditMode] = useState<Mode>(readMode);
  const [showShare, setShowShare] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [toast, setToast] = useState('');

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const chooseMode = (m: Mode) => {
    setEditMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* private mode */
    }
  };

  // tidy up uploaded videos that no page uses any more (only at start-up, so undo history stays valid)
  useEffect(() => {
    const keep = new Set<string>();
    for (const m of Object.values(data.modes)) {
      if (isLocalRef(m.design.background.src)) keep.add(m.design.background.src);
    }
    cleanupMedia(keep).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z, except while typing in a field (which has its own undo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const openLive = (view: ShareView) => {
    window.location.hash = liveHash(view);
    setShowShare(false);
  };

  const previewView: ShareView = data.share.combined ? 'both' : editMode;
  const pageLabel = MODE_META[editMode].label;
  const panel = PANELS[area];

  return (
    <div className="min-h-screen bg-canvas lg:flex lg:h-dvh lg:min-h-[680px] lg:flex-col">
      <TopBar
        mode={editMode}
        onMode={chooseMode}
        onShare={() => setShowShare(true)}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="mx-auto flex w-full max-w-[1320px] gap-6 px-4 pb-28 pt-2 lg:min-h-0 lg:flex-1 lg:items-center lg:px-6 lg:pb-4">
        <EditorNav
          area={area}
          onArea={(a) => {
            setArea(a);
            setMobilePreview(false);
          }}
          onShare={() => setShowShare(true)}
          shareOpen={showShare}
          previewing={mobilePreview}
          onPreview={() => setMobilePreview((v) => !v)}
        />

        <main
          className={`${mobilePreview ? 'hidden lg:block' : ''} min-w-0 flex-1 lg:h-full lg:self-stretch lg:overflow-y-auto lg:overscroll-contain lg:px-1`}
        >
          <div className="flex min-h-full flex-col">
            <div className="my-auto py-2">
              <PanelFrame title={panel.title} subtitle={panel.subtitle(pageLabel)}>
                {area === 'content' && <ContentPanel data={data} setData={setData} mode={editMode} />}
                {area === 'design' && <AppearanceTab data={data} setData={setData} notify={notify} mode={editMode} />}
                {area === 'sound' && <SoundPanel data={data} setData={setData} mode={editMode} notify={notify} />}
              </PanelFrame>
            </div>
            <div className="mt-6 overflow-hidden rounded-[32px] lg:mb-2">
              <Footer />
            </div>
          </div>
        </main>

        <aside className={`${mobilePreview ? 'block w-full' : 'hidden'} lg:block lg:w-[340px] lg:shrink-0 lg:self-center`}>
          <div>
            <p className="mb-3 text-center text-xs font-semibold text-neutral-600">
              Previewing: {data.share.combined ? VIEW_LABEL.both : pageLabel}
            </p>
            <PhoneFrame data={data} view={previewView} />
            <div className="mt-4 flex justify-center">
              <a
                href={liveHash(previewView)}
                className="btn-soft flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                Open live page <FaArrowUpRightFromSquare className="text-xs" aria-hidden />
              </a>
            </div>
          </div>
        </aside>
      </div>

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

      <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-24 z-[60] max-w-[90vw] -translate-x-1/2 text-center">
        {toast && (
          <div className="pop-in rounded-full bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
