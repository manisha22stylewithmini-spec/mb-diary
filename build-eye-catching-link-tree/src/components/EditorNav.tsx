import { FaLayerGroup, FaPalette, FaMusic, FaShareNodes, FaMobileScreen } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

export type Area = 'content' | 'design' | 'sound';

const AREAS: { id: Area; label: string; icon: IconType }[] = [
  { id: 'content', label: 'Content', icon: FaLayerGroup },
  { id: 'design', label: 'Design', icon: FaPalette },
  { id: 'sound', label: 'Sound', icon: FaMusic },
];

interface Props {
  area: Area;
  onArea: (a: Area) => void;
  onShare: () => void;
  shareOpen: boolean;
  previewing: boolean;
  onPreview: () => void;
}

function Item({
  label,
  icon: Icon,
  active,
  onClick,
  className = '',
  ...aria
}: {
  label: string;
  icon: IconType;
  active?: boolean;
  onClick: () => void;
  className?: string;
  'aria-current'?: 'page';
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...aria}
      className={`group flex w-16 flex-col items-center gap-1.5 text-xs font-semibold ${
        active ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
      } ${className}`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full text-base transition lg:h-[52px] lg:w-[52px] lg:text-lg ${
          active ? 'btn-ink shadow-lg' : 'bg-neutral-200/70 group-hover:bg-neutral-200'
        }`}
        aria-hidden
      >
        <Icon />
      </span>
      {label}
    </button>
  );
}

/**
 * The editing areas. A pill-shaped rail down the left on desktop; the same items
 * become a bottom bar on phones, with a Preview switch added.
 */
export default function EditorNav({ area, onArea, onShare, shareOpen, previewing, onPreview }: Props) {
  return (
    <nav
      aria-label="Editing areas"
      className="fixed inset-x-0 bottom-0 z-40 flex items-start justify-around border-t border-black/5 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:static lg:inset-auto lg:z-10 lg:w-[76px] lg:shrink-0 lg:flex-col lg:items-center lg:justify-start lg:gap-6 lg:self-center lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      {AREAS.map((a) => (
        <Item
          key={a.id}
          label={a.label}
          icon={a.icon}
          active={!previewing && area === a.id}
          aria-current={!previewing && area === a.id ? 'page' : undefined}
          onClick={() => onArea(a.id)}
        />
      ))}
      <Item label="Share" icon={FaShareNodes} active={shareOpen} aria-haspopup="dialog" aria-expanded={shareOpen} onClick={onShare} />
      <Item label="Preview" icon={FaMobileScreen} active={previewing} onClick={onPreview} className="lg:hidden" />
    </nav>
  );
}
