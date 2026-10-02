import { useEffect, useState } from 'react';
import type { AppData, LinkItem } from '../types';

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
    ...partial,
  };
}

export const defaultData: AppData = {
  profile: {
    name: 'manisha baroliya',
    handle: '@manishabaroliya',
    bio: '✨ UI/UX Designer • Visual Storyteller\nEverything I make, in one little place 👇',
    avatar: '',
  },
  links: [
    makeLink({ title: 'See my shots on Dribbble', url: 'https://dribbble.com', animation: 'pulse' }),
    makeLink({ title: 'Case studies on Behance', url: 'https://behance.net' }),
    makeLink({ title: 'Live UI projects on UI.live', url: 'https://ui.live', animation: 'glow' }),
    makeLink({ title: 'Follow me on Instagram', url: 'https://instagram.com' }),
    makeLink({ title: 'Say hi on WhatsApp', url: 'https://wa.me/910000000000', emoji: '💬' }),
  ],
  socials: [
    { id: uid(), platform: 'dribbble', url: 'https://dribbble.com' },
    { id: uid(), platform: 'behance', url: 'https://behance.net' },
    { id: uid(), platform: 'uilive', url: 'https://ui.live' },
    { id: uid(), platform: 'instagram', url: 'https://instagram.com' },
    { id: uid(), platform: 'linkedin', url: 'https://linkedin.com' },
    { id: uid(), platform: 'email', url: 'mailto:hello@example.com' },
  ],
  design: {
    theme: 'aurora',
    buttonStyle: 'solid',
    shape: 'pill',
    font: 'poppins',
    custom: {
      color1: '#ff9a9e',
      color2: '#8129d9',
      angle: 135,
      animated: true,
      text: '#ffffff',
      btnBg: '#ffffff',
      btnText: '#2c1046',
      accent: '#ffe14d',
    },
    background: { kind: 'theme', src: '', blur: 0, dim: 25, grayscale: false },
  },
  views: 0,
};

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      return {
        ...defaultData,
        ...parsed,
        profile: { ...defaultData.profile, ...parsed.profile },
        design: {
          ...defaultData.design,
          ...parsed.design,
          custom: { ...defaultData.design.custom, ...parsed.design?.custom },
          background: { ...defaultData.design.background, ...parsed.design?.background },
        },
        links: (parsed.links ?? []).map((l) => makeLink(l)),
      };
    }
  } catch {
    /* ignore */
  }
  return defaultData;
}

export function useStore() {
  const [data, setData] = useState<AppData>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full */
    }
  }, [data]);
  return [data, setData] as const;
}
