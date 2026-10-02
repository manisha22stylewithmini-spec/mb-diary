import { useState } from 'react';
import { FaPlus, FaXmark, FaGripVertical, FaChevronDown, FaMagnifyingGlass } from 'react-icons/fa6';
import type { AppData } from '../types';
import { PLATFORMS } from '../data/platforms';
import { uid } from '../data/store';
import { Card } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
}

export default function SocialsCard({ data, setData }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const used = new Set(data.socials.map((s) => s.platform));
  const available = Object.entries(PLATFORMS).filter(
    ([key, p]) => !used.has(key) && p.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const add = (key: string) =>
    setData((d) => ({
      ...d,
      socials: [...d.socials, { id: uid(), platform: key, url: key === 'email' ? 'mailto:' : '' }],
    }));

  const reorder = (from: string, to: string) =>
    setData((d) => {
      const socials = [...d.socials];
      const i = socials.findIndex((s) => s.id === from);
      const j = socials.findIndex((s) => s.id === to);
      if (i < 0 || j < 0 || i === j) return d;
      const [item] = socials.splice(i, 1);
      socials.splice(j, 0, item);
      return { ...d, socials };
    });

  return (
    <Card title="Social icons" subtitle="Drag to reorder — they appear as small icons under your bio">
      {/* --- Active socials (draggable) --- */}
      <div className="space-y-2">
        {data.socials.map((s) => {
          const p = PLATFORMS[s.platform] ?? PLATFORMS.website;
          const Icon = p.icon;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOverId(s.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) reorder(dragId, s.id);
                setDragId(null);
                setOverId(null);
              }}
              className={`pop-in flex items-center gap-2 rounded-2xl p-1 transition ${
                overId === s.id && dragId !== s.id ? 'ring-2 ring-[#19c37d]' : ''
              } ${dragId === s.id ? 'opacity-40' : ''}`}
            >
              <span
                className="cursor-grab px-1 text-neutral-300 hover:text-neutral-600 active:cursor-grabbing"
                title="Drag to reorder"
              >
                <FaGripVertical />
              </span>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-white"
                style={{ background: p.color }}
                title={p.label}
              >
                <Icon />
              </span>
              <input
                className="input"
                placeholder={`${p.label} link`}
                value={s.url}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    socials: d.socials.map((x) => (x.id === s.id ? { ...x, url: e.target.value } : x)),
                  }))
                }
              />
              <button
                onClick={() => setData((d) => ({ ...d, socials: d.socials.filter((x) => x.id !== s.id) }))}
                className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${p.label}`}
              >
                <FaXmark />
              </button>
            </div>
          );
        })}
        {data.socials.length === 0 && (
          <p className="rounded-2xl bg-neutral-50 p-4 text-center text-sm text-neutral-400">
            No social icons yet — add one below.
          </p>
        )}
      </div>

      {/* --- One card holding every unselected platform --- */}
      <div className="mt-4 overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-black/5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-neutral-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#19c37d] text-xs text-white">
            <FaPlus />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold">Add a platform</span>
            <span className="block text-[11px] text-neutral-500">
              {available.length} available{used.size > 0 ? ` · ${used.size} added` : ''}
            </span>
          </span>
          <FaChevronDown className={`text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="pop-in border-t border-neutral-200 p-4">
            <div className="relative mb-3">
              <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
              <input
                className="input !pl-8"
                placeholder="Search platforms…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {available.length === 0 ? (
              <p className="py-3 text-center text-sm text-neutral-400">
                {query ? 'No platform matches that search.' : 'All platforms added 🎉'}
              </p>
            ) : (
              <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {available.map(([key, p]) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        add(key);
                        setQuery('');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm text-white"
                        style={{ background: p.color }}
                      >
                        <Icon />
                      </span>
                      <span className="truncate text-xs font-semibold text-neutral-700">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
