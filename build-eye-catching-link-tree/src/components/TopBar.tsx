import { FaRotateLeft, FaRotateRight, FaShareNodes } from 'react-icons/fa6';
import Logo from './Logo';
import type { Mode } from '../types';
import { MODES, MODE_META } from '../data/modes';

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  onShare: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/** Always-visible switch between the two pages: one tap flips what you're editing. */
function PageToggle({ mode, onMode }: Pick<Props, 'mode' | 'onMode'>) {
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = mode === 'pro' ? 'freelance' : 'pro';
      onMode(next);
      (e.currentTarget.querySelector(`[data-mode="${next}"]`) as HTMLElement | null)?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Page you are editing"
      onKeyDown={onKey}
      className="relative grid grid-cols-2 justify-self-center rounded-full bg-neutral-200/60 p-1"
    >
      {/* sliding thumb */}
      <span
        aria-hidden
        className="btn-ink absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full shadow-md transition-transform duration-300 ease-out"
        style={{ transform: mode === 'pro' ? 'translateX(0)' : 'translateX(100%)' }}
      />
      {MODES.map((m) => {
        const meta = MODE_META[m];
        const Icon = meta.icon;
        const on = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            data-mode={m}
            title={`${meta.label} — ${meta.audience}`}
            onClick={() => onMode(m)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-bold transition-colors duration-300 sm:px-5 ${
              on ? 'text-white' : 'text-neutral-700 hover:text-neutral-900'
            }`}
          >
            <Icon aria-hidden className="text-xs" />
            {m === 'pro' ? (
              <>
                <span className="sm:hidden">Pro</span>
                <span className="hidden sm:inline">{meta.label}</span>
              </>
            ) : (
              meta.label
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function TopBar({ mode, onMode, onShare, undo, redo, canUndo, canRedo }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200/60" role="img" aria-label="Link Forest">
            <Logo size={26} />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight md:block" aria-hidden>
            Link<span className="text-brand">Forest</span>
          </span>
        </div>

        <PageToggle mode={mode} onMode={onMode} />

        <div className="flex items-center justify-end gap-3">
          <div className="hidden overflow-hidden rounded-full bg-neutral-200/60 sm:flex" role="group" aria-label="History">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo"
              className="flex h-11 w-12 items-center justify-center text-neutral-800 transition hover:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
            >
              <FaRotateLeft />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo"
              className="flex h-11 w-12 items-center justify-center text-neutral-800 transition hover:bg-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
            >
              <FaRotateRight />
            </button>
          </div>
          <button
            type="button"
            onClick={onShare}
            aria-label="Share"
            className="btn-brand flex h-11 items-center gap-2 rounded-full px-3.5 text-[15px] font-bold shadow-md hover:scale-[1.03] active:scale-95 sm:px-6"
          >
            <FaShareNodes aria-hidden /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  );
}
