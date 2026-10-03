export type Animation = 'none' | 'pulse' | 'shake' | 'glow' | 'bounce';
export type ButtonStyle = 'solid' | 'outline' | 'glass' | 'shadow';
export type Shape = 'pill' | 'round' | 'square';
export type BgKind = 'theme' | 'image' | 'video';

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
}

export interface Social {
  id: string;
  platform: string;
  url: string;
}

export interface Profile {
  name: string;
  handle: string;
  bio: string;
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

export interface AppData {
  profile: Profile;
  links: LinkItem[];
  socials: Social[];
  design: Design;
  views: number;
}
