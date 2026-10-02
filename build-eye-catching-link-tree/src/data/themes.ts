import type { ButtonStyle, Design, LinkItem, Shape } from '../types';
import type { CSSProperties } from 'react';

export interface Theme {
  id: string;
  name: string;
  bg: string;
  animated: boolean;
  dark: boolean;
  text: string;
  btnBg: string;
  btnText: string;
  accent: string;
}

export const THEMES: Theme[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    bg: 'linear-gradient(135deg,#7f00ff,#e100ff,#ff6a00,#7f00ff)',
    animated: true,
    dark: true,
    text: '#ffffff',
    btnBg: '#ffffff',
    btnText: '#1a1033',
    accent: '#ffe14d',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: 'linear-gradient(135deg,#ff512f,#dd2476,#ffb347,#ff512f)',
    animated: true,
    dark: true,
    text: '#ffffff',
    btnBg: '#fff7ed',
    btnText: '#7a1236',
    accent: '#ffd23f',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: 'linear-gradient(135deg,#00c6ff,#0072ff,#00f2c3,#00c6ff)',
    animated: true,
    dark: true,
    text: '#ffffff',
    btnBg: '#ffffff',
    btnText: '#04305e',
    accent: '#fff176',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e,#0f0c29)',
    animated: true,
    dark: true,
    text: '#f5f3ff',
    btnBg: '#a78bfa',
    btnText: '#0f0c29',
    accent: '#f0abfc',
  },
  {
    id: 'neon',
    name: 'Neon',
    bg: 'radial-gradient(circle at 20% 0%,#1b1b1b,#000 70%)',
    animated: false,
    dark: true,
    text: '#f4fff0',
    btnBg: '#39ff14',
    btnText: '#031a00',
    accent: '#ff00e5',
  },
  {
    id: 'candy',
    name: 'Candy',
    bg: 'linear-gradient(135deg,#ffecd2,#fcb69f,#ff9a9e,#fad0c4,#ffecd2)',
    animated: true,
    dark: false,
    text: '#4a1d3d',
    btnBg: '#ffffff',
    btnText: '#4a1d3d',
    accent: '#ff4d8d',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: 'linear-gradient(135deg,#134e5e,#71b280,#134e5e)',
    animated: true,
    dark: true,
    text: '#f0fff4',
    btnBg: '#f0fff4',
    btnText: '#0b3b2e',
    accent: '#fde047',
  },
  {
    id: 'mono',
    name: 'Mono',
    bg: 'linear-gradient(180deg,#ffffff,#f1f1ef)',
    animated: false,
    dark: false,
    text: '#111111',
    btnBg: '#111111',
    btnText: '#ffffff',
    accent: '#d2e823',
  },
];

export const FONTS = [
  { id: 'inter', name: 'Inter', css: "'Inter', system-ui, sans-serif" },
  { id: 'poppins', name: 'Poppins', css: "'Poppins', system-ui, sans-serif" },
  { id: 'grotesk', name: 'Space Grotesk', css: "'Space Grotesk', system-ui, sans-serif" },
  { id: 'playfair', name: 'Playfair', css: "'Playfair Display', Georgia, serif" },
  { id: 'fredoka', name: 'Fredoka', css: "'Fredoka', system-ui, sans-serif" },
];

export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** luminance helper so custom colours keep readable text */
function isLight(hex: string) {
  const h = hex.replace('#', '');
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

/** Resolves the active theme, including the user's fully custom one. */
export function resolveTheme(design: Design): Theme {
  if (design.theme !== 'custom') return getTheme(design.theme);
  const c = design.custom;
  return {
    id: 'custom',
    name: 'Custom',
    bg: `linear-gradient(${c.angle}deg, ${c.color1}, ${c.color2}, ${c.color1})`,
    animated: c.animated,
    dark: !isLight(c.color1) || !isLight(c.color2),
    text: c.text,
    btnBg: c.btnBg,
    btnText: c.btnText,
    accent: c.accent,
  };
}

export function radiusFor(shape: Shape) {
  return shape === 'pill' ? '9999px' : shape === 'round' ? '18px' : '4px';
}

export function buttonStyle(theme: Theme, style: ButtonStyle, shape: Shape): CSSProperties {
  const base: CSSProperties = { borderRadius: radiusFor(shape) };
  switch (style) {
    case 'outline':
      return { ...base, background: 'transparent', color: theme.text, border: `2px solid ${theme.text}` };
    case 'glass':
      return {
        ...base,
        background: theme.dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.55)',
        color: theme.text,
        border: `1px solid ${theme.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.1)'}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      };
    case 'shadow':
      return {
        ...base,
        background: theme.btnBg,
        color: theme.btnText,
        border: `2px solid ${theme.btnText}`,
        boxShadow: `5px 5px 0 ${theme.accent}`,
      };
    default:
      return { ...base, background: theme.btnBg, color: theme.btnText, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.35)' };
  }
}

/** Button style for one link, applying its personal colour overrides. */
export function linkStyle(theme: Theme, design: Design, link: LinkItem): CSSProperties {
  const style = buttonStyle(theme, design.buttonStyle, design.shape);
  if (link.color) {
    if (design.buttonStyle === 'outline') {
      style.borderColor = link.color;
      style.color = link.textColor || link.color;
    } else {
      style.background = link.color;
      style.color = link.textColor || (isLight(link.color) ? '#111111' : '#ffffff');
      style.backdropFilter = undefined;
    }
  } else if (link.textColor) {
    style.color = link.textColor;
  }
  return style;
}
