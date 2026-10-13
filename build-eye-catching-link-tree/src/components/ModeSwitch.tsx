import type { Mode } from '../types';
import { MODES, MODE_META } from '../data/modes';

interface Props {
  value: Mode;
  onChange: (m: Mode) => void;
}

/** Chooses which page (Professional / Freelance) the editor is working on. */
export default function ModeSwitch({ value, onChange }: Props) {
  return (
    <section
      aria-label="Page type"
      className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/5"
    >
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Which page are you editing?">
        {MODES.map((m) => {
          const meta = MODE_META[m];
          const Icon = meta.icon;
          const on = value === m;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(m)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                on ? 'btn-brand shadow-md' : 'bg-neutral-50 text-neutral-700 ring-1 ring-black/5 hover:bg-neutral-100'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                  on ? 'bg-white/20' : 'bg-white text-brand-purple ring-1 ring-black/5'
                }`}
              >
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{meta.label}</span>
                <span className={`block truncate text-[11px] ${on ? 'text-white/90' : 'text-neutral-600'}`}>
                  {meta.audience}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
