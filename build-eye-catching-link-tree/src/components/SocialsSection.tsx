import { useState } from 'react';
import { FaPlus, FaTrash, FaArrowLeft, FaArrowRight, FaMagnifyingGlass, FaCheck } from 'react-icons/fa6';
import type { AppData } from '../types';
import { PLATFORMS } from '../data/platforms';
import { uid } from '../data/store';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
}

export default function SocialsSection({ data, setData }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const used = new Set(data.socials.map((s) => s.platform));
  const available = Object.entries(PLATFORMS).filter(
    ([key, p]) => !used.has(key) && p.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const editing = data.socials.find((s) => s.id === editingId);
  const editingIdx = editing ? data.socials.indexOf(editing) : -1;

  const add = (key: string) => {
    const id = uid();
    setData((d) => ({ ...d, socials: [...d.socials, { id, platform: key, url: key === 'email' ? 'mailto:' : '' }] }));
    setEditingId(id);
    setFreshId(id);
    setPicking(false);
    setQuery('');
  };

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

  const shift = (id: string, dir: -1 | 1) =>
    setData((d) => {
      const i = d.socials.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.socials.length) return d;
      const socials = [...d.socials];
      [socials[i], socials[j]] = [socials[j], socials[i]];
      return { ...d, socials };
    });

  return (
    <div>
      <p className="mb-3 text-xs text-neutral-500">
        Tap an icon to edit its link · drag to reorder. They show as small icons under your bio.
      </p>

      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Your social icons">
        {data.socials.map((s) => {
          const p = PLATFORMS[s.platform] ?? PLATFORMS.website;
          const Icon = p.icon;
          const on = editingId === s.id;
          const blank = !s.url.trim() || s.url.trim() === 'mailto:';
          return (
            <button
              key={s.id}
              type="button"
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
              onClick={() => {
                setPicking(false);
                setEditingId(on ? null : s.id);
              }}
              aria-pressed={on}
              aria-label={`${p.label}${blank ? ' (no link yet)' : ''} — edit`}
              title={p.label}
              className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl transition hover:scale-105 ${
                on ? 'ring-2 ring-neutral-900 ring-offset-2' : ''
              } ${overId === s.id && dragId !== s.id ? 'ring-2 ring-brand-purple' : ''} ${dragId === s.id ? 'opacity-40' : ''}`}
              style={{ color: p.color }}
            >
              <Icon aria-hidden />
              {blank && <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-amber-500 ring-2 ring-white" aria-hidden />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setPicking((v) => !v);
          }}
          aria-expanded={picking}
          aria-label="Add a social icon"
          title="Add a social icon"
          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed text-base transition ${
            picking ? 'btn-ink border-transparent' : 'border-neutral-300 text-neutral-700 hover:border-neutral-500'
          }`}
        >
          <FaPlus />
        </button>
      </div>

      {editing && (
        <div className="pop-in mt-4 rounded-3xl bg-neutral-50 p-4 ring-1 ring-black/5">
          {(() => {
            const p = PLATFORMS[editing.platform] ?? PLATFORMS.website;
            return (
              <>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-500" htmlFor="social-url">
                  {p.label} link
                </label>
                <input
                  id="social-url"
                  className="input"
                  placeholder={`${p.label} link`}
                  autoFocus={freshId === editing.id}
                  value={editing.url}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      socials: d.socials.map((x) => (x.id === editing.id ? { ...x, url: e.target.value } : x)),
                    }))
                  }
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={editingIdx <= 0}
                    onClick={() => shift(editing.id, -1)}
                    aria-label={`Move ${p.label} earlier`}
                    className="btn-soft flex h-9 w-9 items-center justify-center rounded-full text-xs disabled:opacity-40"
                  >
                    <FaArrowLeft />
                  </button>
                  <button
                    type="button"
                    disabled={editingIdx >= data.socials.length - 1}
                    onClick={() => shift(editing.id, 1)}
                    aria-label={`Move ${p.label} later`}
                    className="btn-soft flex h-9 w-9 items-center justify-center rounded-full text-xs disabled:opacity-40"
                  >
                    <FaArrowRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setData((d) => ({ ...d, socials: d.socials.filter((x) => x.id !== editing.id) }));
                      setEditingId(null);
                    }}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FaTrash /> Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-ink ml-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
                  >
                    <FaCheck className="text-xs" /> Done
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {picking && (
        <div className="pop-in mt-4 rounded-3xl bg-neutral-50 p-4 ring-1 ring-black/5">
          <div className="relative mb-3">
            <FaMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500" />
            <input
              className="input !pl-9"
              placeholder="Search platforms…"
              aria-label="Search platforms"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {available.length === 0 ? (
            <p className="py-3 text-center text-sm text-neutral-500">
              {query ? 'No platform matches that search.' : 'All platforms added 🎉'}
            </p>
          ) : (
            <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {available.map(([key, p]) => {
                const Icon = p.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => add(key)}
                    className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-base" style={{ color: p.color }}>
                      <Icon aria-hidden />
                    </span>
                    <span className="truncate text-xs font-semibold text-neutral-800">{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
