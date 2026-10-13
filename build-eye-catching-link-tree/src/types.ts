export type Animation = 'none' | 'pulse' | 'shake' | 'glow' | 'bounce';
export type ButtonStyle = 'solid' | 'outline' | 'glass' | 'shadow';
export type Shape = 'pill' | 'round' | 'square';
export type BgKind = 'theme' | 'image' | 'video';

/** The two kinds of share link. */
export type Mode = 'pro' | 'freelance';
/** Which page type a link belongs to. */
export type Audience = 'both' | Mode;
/** What a share link opens: one page type, or both with a visitor toggle. */
export type ShareView = Mode | 'both';

export type MusicSource = 'preset' | 'url' | 'upload';

export interface Music {
  enabled: boolean;
  source: MusicSource;
  /** built-in generated track id (when source is "preset") */
  preset: string;
  /** direct audio link, or a data-url for an uploaded file */
  url: string;
  title: string;
  /** 0–100 */
  volume: number;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  emoji: string;
  image: string;
  enabled: boolean;
  clicks: number;
  animation: Animation;
  /** per-link colour override (empty = use global button style) */
  color: string;
  textColor: string;
  /** which page type shows this link */
  audience: Audience;
}

export interface Social {
  id: string;
  platform: string;
  url: string;
}

export interface Profile {
  name: string;
  handle: string;
  avatar: string;
}

export interface CustomTheme {
  color1: string;
  color2: string;
  angle: number;
  animated: boolean;
  text: string;
  btnBg: string;
  btnText: string;
  accent: string;
}

export interface Background {
  kind: BgKind;
  /** data-url or remote url */
  src: string;
  blur: number;
  dim: number;
  grayscale: boolean;
}

export interface Design {
  theme: string;
  buttonStyle: ButtonStyle;
  shape: Shape;
  font: string;
  custom: CustomTheme;
  background: Background;
}

/** Everything that can differ between the Professional and Freelance pages. */
export interface ModeSettings {
  bio: string;
  /** short status pill under the handle */
  badge: string;
  design: Design;
  music: Music;
}

export interface AppData {
  profile: Profile;
  links: LinkItem[];
  socials: Social[];
  modes: Record<Mode, ModeSettings>;
  share: { combined: boolean };
  views: number;
}
