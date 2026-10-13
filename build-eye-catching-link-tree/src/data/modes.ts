import type { IconType } from 'react-icons';
import { FaBriefcase, FaPenRuler } from 'react-icons/fa6';
import type { Mode, ShareView } from '../types';

export const MODES: Mode[] = ['pro', 'freelance'];

export const MODE_META: Record<Mode, { label: string; audience: string; blurb: string; icon: IconType }> = {
  pro: {
    label: 'Professional',
    audience: 'HR, management & community',
    blurb: 'A clean, confident page for recruiters, managers and your professional community.',
    icon: FaBriefcase,
  },
  freelance: {
    label: 'Freelance',
    audience: 'Clients & projects',
    blurb: 'A bolder, more creative page that shows your range to prospective clients.',
    icon: FaPenRuler,
  },
};

export const VIEW_LABEL: Record<ShareView, string> = {
  pro: 'Professional',
  freelance: 'Freelance',
  both: 'Professional + Freelance',
};

/* ---- hash routing:  #live/pro  #live/freelance  #live/both  (+ optional ~payload) ---- */

export interface LiveRoute {
  view: ShareView;
  /** compressed copy of the page that travels inside a share link */
  payload: string;
}

export function parseLiveHash(hash: string): LiveRoute | null {
  const m = /^#live(?:\/(pro|freelance|both))?(?:~(.+))?$/.exec(hash);
  if (!m) return null;
  return { view: (m[1] as ShareView | undefined) ?? 'pro', payload: m[2] ?? '' };
}

export function liveHash(view: ShareView, payload = '') {
  return `#live/${view}${payload ? `~${payload}` : ''}`;
}
