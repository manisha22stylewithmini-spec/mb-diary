import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { FaPen } from 'react-icons/fa6';
import Logo from './components/Logo';
import ProfilePage from './components/ProfilePage';
import { useStore } from './data/store';
import { parseLiveHash, type LiveRoute } from './data/modes';
import { decodePayload } from './data/sharePayload';
import { fetchPublished } from './data/published';
import type { AppData, LinkItem } from './types';

// The editor (and the QR code library inside it) is only fetched for the owner.
// Visitors opening a share link get just this file plus the page itself.
const Editor = lazy(() => import('./Editor'));

function Loading({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-canvas" role="status" aria-live="polite">
      <Logo size={72} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function App() {
  const { data, setData, undo, redo, canUndo, canRedo, saveFailed } = useStore();
  const [route, setRoute] = useState<LiveRoute | null>(() => parseLiveHash(window.location.hash));
  // page carried inside a share link: undefined while decoding, null when there is none
  const [shared, setShared] = useState<AppData | null | undefined>(undefined);
  const counted = useRef(false);

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

  // a plain live link shows the page the owner last published (a #preview link shows their draft)
  const wantsPublished = route !== null && !route.preview && !payload;
  const [published, setPublished] = useState<AppData | null | undefined>(undefined);
  useEffect(() => {
    if (!wantsPublished) {
      setPublished(null);
      return;
    }
    let stale = false;
    setPublished(undefined);
    fetchPublished().then((d) => {
      if (!stale) setPublished(d);
    });
    return () => {
      stale = true;
    };
  }, [wantsPublished]);

  const ownerPreview = route !== null && route.preview;

  // count a page view once per owner preview (kept quietly in the background)
  useEffect(() => {
    if (ownerPreview && !counted.current) {
      counted.current = true;
      setData((d) => ({ ...d, views: d.views + 1 }), { silent: true });
    }
    if (!ownerPreview) counted.current = false;
  }, [ownerPreview, setData]);

  const recordClick = (link: LinkItem) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l)) }), {
      silent: true,
    });

  /* ---------------- Live (public) view ---------------- */
  if (route) {
    if ((payload && shared === undefined) || (wantsPublished && published === undefined)) {
      return <Loading label="Loading page…" />;
    }
    return (
      <div className="fixed inset-0 overflow-y-auto">
        <ProfilePage
          key={route.view}
          data={shared ?? published ?? data}
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
    <Suspense fallback={<Loading label="Loading editor…" />}>
      <Editor
        data={data}
        setData={setData}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        saveFailed={saveFailed}
      />
    </Suspense>
  );
}
