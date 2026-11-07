import type { IconBaseProps } from 'react-icons';

/** Muzli has no icon in the icon pack, so this is a simple "M" mark in the same style. */
export function MuzliIcon(props: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" aria-hidden {...props}>
      <path d="M3 19V5h3.2L12 12.6 17.8 5H21v14h-3v-8.6l-6 7.9-6-7.9V19z" />
    </svg>
  );
}
