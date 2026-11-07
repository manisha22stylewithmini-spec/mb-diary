import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/** Closes a pop-over on outside click or Escape. */
export function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/** A small "⋮" style menu button with a pop-over list of actions. */
export default function PopMenu({ label, icon, items }: { label: string; icon: ReactNode; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 sm:h-10 sm:w-10"
      >
        {icon}
      </button>
      {open && (
        <div
          role="menu"
          className="pop-in absolute right-0 z-30 mt-1 min-w-48 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10"
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={() => {
                close();
                it.onSelect();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition disabled:opacity-40 ${
                it.danger ? 'text-red-600 hover:bg-red-50' : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <span className="w-4 text-center text-xs" aria-hidden>
                {it.icon}
              </span>
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
