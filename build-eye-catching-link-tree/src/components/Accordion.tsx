import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

/**
 * One-open-at-a-time sections: opening a section closes the one that was open.
 * The choice is remembered for the browser session so switching tabs doesn't reset it.
 */
export function useOpenSection<T extends string>(key: string, valid: readonly T[], initial: T | null) {
  const [open, setOpen] = useState<T | null>(() => {
    try {
      const v = sessionStorage.getItem(key);
      if (v === '') return null;
      if (v && (valid as readonly string[]).includes(v)) return v as T;
    } catch {
      /* ignore */
    }
    return initial;
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, open ?? '');
    } catch {
      /* ignore */
    }
  }, [key, open]);

  const toggle = useCallback(
    (id: T) => {
      setOpen((cur) => (cur === id ? null : id));
      window.setTimeout(
        () => document.getElementById(`acc-btn-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
        320,
      );
    },
    [],
  );
  return [open, toggle] as const;
}

export function AccordionFrame({ children }: { children: ReactNode }) {
  return <div className="-mx-2 sm:-mx-3">{children}</div>;
}

interface SectionProps {
  id: string;
  icon: ReactNode;
  title: string;
  /** one quiet line shown while the section is closed (and under the title when open) */
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionSection({ id, icon, title, summary, open, onToggle, children }: SectionProps) {
  // clip the content only while it animates, so pop-over menus inside aren't cut off
  const [clip, setClip] = useState(!open);
  useEffect(() => {
    if (!open) setClip(true);
  }, [open]);

  return (
    <section className="border-t border-neutral-100 first:border-t-0">
      <h3>
        <button
          id={`acc-btn-${id}`}
          type="button"
          aria-expanded={open}
          aria-controls={`acc-panel-${id}`}
          onClick={onToggle}
          className="flex w-full scroll-mt-28 items-center gap-4 rounded-2xl px-2 py-4 text-left transition hover:bg-neutral-50 sm:px-3"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base transition ${
              open ? 'btn-ink' : 'bg-neutral-100 text-neutral-700'
            }`}
            aria-hidden
          >
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold tracking-tight">{title}</span>
            {summary && <span className="mt-0.5 block truncate text-sm text-neutral-500">{summary}</span>}
          </span>
          <FaChevronDown
            aria-hidden
            className={`shrink-0 text-xs text-neutral-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div
        id={`acc-panel-${id}`}
        role="region"
        aria-labelledby={`acc-btn-${id}`}
        inert={!open}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && open) setClip(false);
        }}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className={`min-w-0 ${clip || !open ? 'overflow-hidden' : ''}`}>
          <div className="px-2 pb-6 pt-1 sm:px-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
