import type { IconType } from 'react-icons';
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaWhatsapp,
  FaTelegram,
  FaSnapchat,
  FaSpotify,
  FaPinterest,
  FaDiscord,
  FaTwitch,
  FaThreads,
  FaReddit,
  FaEnvelope,
  FaGlobe,
  FaDribbble,
  FaBehance,
  FaMedium,
  FaFigma,
  FaPatreon,
  FaSoundcloud,
  FaAppStoreIos,
  FaGooglePlay,
} from 'react-icons/fa6';
import { FaLayerGroup } from 'react-icons/fa6';

export interface Platform {
  label: string;
  icon: IconType;
  color: string;
  hosts: string[];
}

export const PLATFORMS: Record<string, Platform> = {
  instagram: { label: 'Instagram', icon: FaInstagram, color: '#E4405F', hosts: ['instagram.com'] },
  youtube: { label: 'YouTube', icon: FaYoutube, color: '#FF0000', hosts: ['youtube.com', 'youtu.be'] },
  tiktok: { label: 'TikTok', icon: FaTiktok, color: '#010101', hosts: ['tiktok.com'] },
  x: { label: 'X / Twitter', icon: FaXTwitter, color: '#111111', hosts: ['twitter.com', 'x.com'] },
  facebook: { label: 'Facebook', icon: FaFacebook, color: '#1877F2', hosts: ['facebook.com', 'fb.com', 'fb.me'] },
  linkedin: { label: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2', hosts: ['linkedin.com'] },
  github: { label: 'GitHub', icon: FaGithub, color: '#181717', hosts: ['github.com'] },
  whatsapp: { label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', hosts: ['wa.me', 'whatsapp.com'] },
  telegram: { label: 'Telegram', icon: FaTelegram, color: '#26A5E4', hosts: ['t.me', 'telegram.me'] },
  snapchat: { label: 'Snapchat', icon: FaSnapchat, color: '#FFB800', hosts: ['snapchat.com'] },
  spotify: { label: 'Spotify', icon: FaSpotify, color: '#1DB954', hosts: ['spotify.com'] },
  pinterest: { label: 'Pinterest', icon: FaPinterest, color: '#E60023', hosts: ['pinterest.com', 'pin.it'] },
  discord: { label: 'Discord', icon: FaDiscord, color: '#5865F2', hosts: ['discord.gg', 'discord.com'] },
  twitch: { label: 'Twitch', icon: FaTwitch, color: '#9146FF', hosts: ['twitch.tv'] },
  threads: { label: 'Threads', icon: FaThreads, color: '#111111', hosts: ['threads.net'] },
  reddit: { label: 'Reddit', icon: FaReddit, color: '#FF4500', hosts: ['reddit.com'] },
  dribbble: { label: 'Dribbble', icon: FaDribbble, color: '#EA4C89', hosts: ['dribbble.com'] },
  behance: { label: 'Behance', icon: FaBehance, color: '#1769FF', hosts: ['behance.net'] },
  uilive: { label: 'UI.live', icon: FaLayerGroup, color: '#00B3A4', hosts: ['ui.live'] },
  figma: { label: 'Figma', icon: FaFigma, color: '#F24E1E', hosts: ['figma.com'] },
  medium: { label: 'Medium', icon: FaMedium, color: '#000000', hosts: ['medium.com'] },
  patreon: { label: 'Patreon', icon: FaPatreon, color: '#FF424D', hosts: ['patreon.com'] },
  soundcloud: { label: 'SoundCloud', icon: FaSoundcloud, color: '#FF5500', hosts: ['soundcloud.com'] },
  appstore: { label: 'App Store', icon: FaAppStoreIos, color: '#0D96F6', hosts: ['apps.apple.com'] },
  playstore: { label: 'Google Play', icon: FaGooglePlay, color: '#01875F', hosts: ['play.google.com'] },
  email: { label: 'Email', icon: FaEnvelope, color: '#EA4335', hosts: [] },
  website: { label: 'Website', icon: FaGlobe, color: '#6D28D9', hosts: [] },
};

export function normalizeUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '#';
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(url)) return `mailto:${url}`;
  return `https://${url}`;
}

export function detectPlatform(raw: string): string {
  const url = raw.trim().toLowerCase();
  if (!url) return 'website';
  if (url.startsWith('mailto:') || /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(url)) return 'email';
  try {
    const host = new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
    for (const [key, p] of Object.entries(PLATFORMS)) {
      if (p.hosts.some((h) => host === h || host.endsWith('.' + h))) return key;
    }
  } catch {
    /* ignore */
  }
  return 'website';
}
