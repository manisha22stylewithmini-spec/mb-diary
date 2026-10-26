import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppData, Design, LinkItem, Mode, ModeSettings, Music, Profile } from '../types';
import { MODES } from './modes';

const KEY = 'my-linktree-v1';

export const uid = () => Math.random().toString(36).slice(2, 10);

export function makeLink(partial: Partial<LinkItem> = {}): LinkItem {
  return {
    id: uid(),
    title: '',
    url: '',
    emoji: '',
    image: '',
    enabled: true,
    clicks: 0,
    animation: 'none',
    color: '',
    textColor: '',
    audience: 'both',
    ...partial,
  };
}

const baseCustom = {
  color1: '#ff9a9e',
  color2: '#8129d9',
  angle: 135,
  animated: true,
  text: '#ffffff',
  btnBg: '#ffffff',
  btnText: '#2c1046',
  accent: '#ffe14d',
};

const baseBackground = { kind: 'theme' as const, src: '', blur: 0, dim: 25, grayscale: false };

const baseMusic: Music = { enabled: false, source: 'preset', preset: 'calm', url: '', title: '', volume: 60 };

export const defaultData: AppData = {
  profile: {
    name: 'manisha baroliya',
    handle: '@manishabaroliya',
    avatar: '',
  },
  links: [
    makeLink({ title: 'See my shots on Dribbble', url: 'https://dribbble.com', animation: 'pulse' }),
    makeLink({ title: 'Case studies on Behance', url: 'https://behance.net' }),
    makeLink({ title: 'Live UI projects on UI.live', url: 'https://ui.live', animation: 'glow' }),
    makeLink({ title: 'Connect on LinkedIn', url: 'https://linkedin.com', audience: 'pro' }),
    makeLink({ title: 'Follow me on Instagram', url: 'https://instagram.com' }),
    makeLink({ title: 'Say hi on WhatsApp', url: 'https://wa.me/910000000000', emoji: '💬', audience: 'freelance' }),
  ],
  socials: [
    { id: uid(), platform: 'dribbble', url: 'https://dribbble.com' },
    { id: uid(), platform: 'behance', url: 'https://behance.net' },
    { id: uid(), platform: 'uilive', url: 'https://ui.live' },
    { id: uid(), platform: 'instagram', url: 'https://instagram.com' },
    { id: uid(), platform: 'linkedin', url: 'https://linkedin.com' },
    { id: uid(), platform: 'email', url: 'mailto:hello@example.com' },
  ],
  modes: {
    pro: {
      bio: 'UI/UX Designer · Product & visual design\nPortfolio, case studies and ways to connect 👇',
      badge: 'Open to opportunities',
      design: {
        theme: 'executive',
        buttonStyle: 'solid',
        shape: 'round',
        font: 'inter',
        custom: { ...baseCustom },
        background: { ...baseBackground },
      },
      music: { ...baseMusic, preset: 'calm' },
    },
    freelance: {
      bio: '✨ UI/UX Designer • Visual Storyteller\nAvailable for freelance projects — let’s build something 👇',
      badge: 'Available for projects',
      design: {
        theme: 'studio',
        buttonStyle: 'solid',
        shape: 'pill',
        font: 'poppins',
        custom: { ...baseCustom },
        background: { ...baseBackground },
      },
      music: { ...baseMusic, preset: 'upbeat' },
    },
  },
  share: { combined: false },
  views: 0,
};

/** Shape of anything we might load: older single-design saves, or a slimmed share payload. */
interface Loose {
  profile?: Partial<Profile> & { bio?: string };
  links?: Partial<LinkItem>[];
  socials?: { id?: string; platform: string; url: string }[];
  design?: Partial<Design>;
  modes?: Partial<Record<Mode, Partial<ModeSettings> & { design?: Partial<Design>; music?: Partial<Music> }>>;
  share?: { combined?: boolean };
  views?: number;
}

function mergeDesign(base: Design, over?: Partial<Design>): Design {
  return {
    ...base,
    ...over,
    custom: { ...base.custom, ...over?.custom },
    background: { ...base.background, ...over?.background },
  };
}

/** Fills gaps and upgrades older saves (one shared design/bio) to the two-page shape. */
export function hydrate(raw: unknown): AppData {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Loose;
  const legacyBio = p.profile?.bio;
  const modes = {} as Record<Mode, ModeSettings>;
  for (const m of MODES) {
    const d = defaultData.modes[m];
    const s = p.modes?.[m];
    // an old single design is carried over to the colourful Freelance page
    const legacyDesign = m === 'freelance' ? p.design : undefined;
    modes[m] = {
      bio: s?.bio ?? legacyBio ?? d.bio,
      badge: s?.badge ?? d.badge,
      design: mergeDesign(d.design, s?.design ?? legacyDesign),
      music: { ...d.music, ...s?.music },
    };
  }
  return {
    profile: {
      name: p.profile?.name ?? defaultData.profile.name,
      handle: p.profile?.handle ?? defaultData.profile.handle,
      avatar: p.profile?.avatar ?? '',
      avatarFrame: p.profile?.avatarFrame,
    },
    links: p.links ? p.links.map((l) => makeLink(l)) : defaultData.links,
    socials: p.socials
      ? p.socials.map((s) => ({ id: s.id ?? uid(), platform: s.platform, url: s.url }))
      : defaultData.socials,
    modes,
    share: { combined: !!p.share?.combined },
    views: p.views ?? 0,
  };
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return hydrate(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return defaultData;
}

type Updater = (d: AppData) => AppData;

/**
 * App data with undo / redo. Edits made in quick succession (typing, dragging a slider)
 * collapse into one history step; `silent` updates (like view counts) skip history.
 */
export function useStore() {
  const [data, setDataState] = useState<AppData>(load);
  const current = useRef(data);
  const past = useRef<AppData[]>([]);
  const future = useRef<AppData[]>([]);
  const lastEdit = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full */
    }
  }, [data]);

  const setData = useCallback((fn: Updater, opts?: { silent?: boolean }) => {
    const before = current.current;
    const next = fn(before);
    if (next === before) return;
    if (!opts?.silent) {
      const now = Date.now();
      if (now - lastEdit.current > 700) past.current = [...past.current.slice(-49), before];
      lastEdit.current = now;
      future.current = [];
    }
    current.current = next;
    setDataState(next);
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(current.current);
    current.current = prev;
    lastEdit.current = 0;
    setDataState(prev);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(current.current);
    current.current = next;
    lastEdit.current = 0;
    setDataState(next);
  }, []);

  return { data, setData, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}

/* ---- small immutable helpers for per-page settings ---- */

export function patchMode(d: AppData, mode: Mode, patch: Partial<ModeSettings>): AppData {
  return { ...d, modes: { ...d.modes, [mode]: { ...d.modes[mode], ...patch } } };
}

export function patchDesign(d: AppData, mode: Mode, fn: (design: Design) => Design): AppData {
  return patchMode(d, mode, { design: fn(d.modes[mode].design) });
}
