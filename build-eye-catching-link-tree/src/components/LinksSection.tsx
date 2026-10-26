import { useEffect, useRef, useState } from 'react';
import {
  FaPlus,
  FaPen,
  FaEye,
  FaEyeSlash,
  FaEllipsisVertical,
  FaGripVertical,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaClone,
  FaCamera,
  FaImage,
  FaPalette,
  FaCheck,
  FaCropSimple,
} from 'react-icons/fa6';
import type { Animation, Audience, AppData, LinkItem, Mode } from '../types';
import { MODE_META } from '../data/modes';
import { PLATFORMS, detectPlatform, normalizeUrl } from '../data/platforms';
import { makeLink, uid } from '../data/store';
import { resizeCover } from '../utils/media';
import Framed from './Framed';
import FrameEditor from './FrameEditor';
import PopMenu from './PopMenu';
import { Chip } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  mode: Mode;
}

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'both', label: 'Both pages' },
  { id: 'pro', label: 'Professional' },
  { id: 'freelance', label: 'Freelance' },
];

const ANIMS: { id: Animation; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'glow', label: 'Glow' },
  { id: 'shake', label: 'Shake' },
  { id: 'bounce', label: 'Bounce' },
];

const SWATCHES = ['', '#ffffff', '#111111', '#8129d9', '#ff3d81', '#ff8a00', '#19c37d', '#00b3a4', '#1769ff', '#ffe14d'];

const isEmpty = (l: LinkItem) => !l.title.trim() && !l.url.trim();

function hostOf(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export default function LinksSection({ data, setData, mode }: Props) {
  const meta = MODE_META[mode];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [styleOpen, setStyleOpen] = useState(false);
  const [frameOpen, setFrameOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const thumbTarget = useRef<string | null>(null);

  const updateLink = (id: string, patch: Partial<LinkItem>) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));

  const remove = (id: string) => {
    setData((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) }));
    if (editingId === id) setEditingId(null);
  };

  const move = (id: string, dir: -1 | 1) =>
    setData((d) => {
      const i = d.links.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.links.length) return d;
      const links = [...d.links];
      [links[i], links[j]] = [links[j], links[i]];
      return { ...d, links };
    });

  const reorder = (from: string, to: string) =>
    setData((d) => {
      const links = [...d.links];
      const i = links.findIndex((l) => l.id === from);
      const j = links.findIndex((l) => l.id === to);
      if (i < 0 || j < 0 || i === j) return d;
      const [item] = links.splice(i, 1);
      links.splice(j, 0, item);
      return { ...d, links };
    });

  const duplicate = (id: string) =>
    setData((d) => {
      const i = d.links.findIndex((l) => l.id === id);
      if (i < 0) return d;
      const copy = { ...d.links[i], id: uid(), clicks: 0, title: `${d.links[i].title} (copy)` };
      const links = [...d.links];
      links.splice(i + 1, 0, copy);
      return { ...d, links };
    });

  /** open one card for editing (closing the previous one; an untouched blank card is discarded) */
  const edit = (next: string | null) => {
    setData((d) => {
      const cur = editingId ? d.links.find((l) => l.id === editingId) : undefined;
      return cur && isEmpty(cur) && cur.id !== next ? { ...d, links: d.links.filter((l) => l.id !== cur.id) } : d;
    });
    setEditingId(next);
    setStyleOpen(false);
    setFrameOpen(false);
  };

  const addLink = () => {
    const link = makeLink();
    setData((d) => {
      const cur = editingId ? d.links.find((l) => l.id === editingId) : undefined;
      const base = cur && isEmpty(cur) ? d.links.filter((l) => l.id !== cur.id) : d.links;
      return { ...d, links: [...base, link] };
    });
    setEditingId(link.id);
    setFreshId(link.id);
    setStyleOpen(false);
    setFrameOpen(false);
  };

  useEffect(() => {
    if (editingId) document.getElementById(`link-${editingId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [editingId]);

  return (
    <div>
      {/* hidden thumbnail picker shared by all links */}
      <input
        ref={thumbRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          const id = thumbTarget.current;
          e.target.value = '';
          if (f && id) {
            // keep the whole picture so it can be reframed afterwards
            updateLink(id, { image: await resizeCover(f, 480, 0.82), imageFrame: undefined });
            setFrameOpen(true);
          }
        }}
      />

      {data.links.length === 0 && (
        <p className="rounded-3xl border-2 border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
          No links yet. Press “Add link” to create your first one.
        </p>
      )}

      <ul className="space-y-3">
        {data.links.map((l, idx) => {
          const p = PLATFORMS[detectPlatform(l.url)];
          const Icon = p.icon;
          const editing = editingId === l.id;
          const host = hostOf(l.url);
          const onThisPage = l.audience === 'both' || l.audience === mode;
          const name = l.title.trim() || 'Untitled link';
          const place = detectPlatform(l.url) === 'website' ? host : p.label;
          const sub = !l.url.trim() ? (
            <span className="font-medium text-amber-700">Add a URL</span>
          ) : (
            `${place || 'Website'} · ${l.clicks} click${l.clicks === 1 ? '' : 's'}`
          );

          return (
            <li
              key={l.id}
              id={`link-${l.id}`}
              data-card
              onDragOver={(e) => {
                if (dragId) {
                  e.preventDefault();
                  setOverId(l.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) reorder(dragId, l.id);
                setDragId(null);
                setOverId(null);
              }}
              className={`scroll-mt-28 rounded-3xl bg-white ring-1 transition ${
                editing ? 'shadow-lg ring-neutral-300' : 'ring-black/[0.08]'
              } ${overId === l.id && dragId !== l.id ? '!ring-2 !ring-brand-purple' : ''} ${
                dragId === l.id ? 'opacity-40' : ''
              }`}
            >
              <div className={`flex items-center gap-1 px-2 py-2.5 sm:px-3 ${l.enabled && onThisPage ? '' : 'opacity-60'}`}>
                <span
                  draggable
                  onDragStart={(e) => {
                    setDragId(l.id);
                    const card = (e.currentTarget as HTMLElement).closest('[data-card]');
                    if (card) e.dataTransfer.setDragImage(card, 20, 20);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className="hidden h-10 w-6 cursor-grab items-center justify-center text-neutral-400 hover:text-neutral-700 active:cursor-grabbing sm:flex"
                  title="Drag to reorder"
                  aria-hidden
                >
                  <FaGripVertical />
                </span>

                <button
                  type="button"
                  onClick={() => edit(editing ? null : l.id)}
                  aria-expanded={editing}
                  aria-label={`${editing ? 'Close' : 'Edit'} ${name}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-0.5 pr-2 text-left"
                >
                  <span
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-xl sm:h-12 sm:w-12"
                    style={{ color: p.color }}
                    aria-hidden
                  >
                    {l.image ? <Framed src={l.image} frame={l.imageFrame} /> : l.emoji || <Icon />}
                  </span>
                  <span className="min-w-0">
                    <span className={`line-clamp-2 break-words text-[15px] font-semibold leading-snug sm:line-clamp-1 ${l.title.trim() ? '' : 'italic text-neutral-500'}`}>
                      {name}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">{sub}</span>
                  </span>
                </button>

                {l.audience !== 'both' && (
                  <span className="hidden shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 sm:block">
                    {MODE_META[l.audience].label} only
                  </span>
                )}

                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => updateLink(l.id, { enabled: !l.enabled })}
                    aria-pressed={l.enabled}
                    aria-label={`${l.enabled ? 'Hide' : 'Show'} ${name} on your page`}
                    title={l.enabled ? 'Visible — click to hide' : 'Hidden — click to show'}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 sm:h-10 sm:w-10"
                  >
                    {l.enabled ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    type="button"
                    onClick={() => edit(editing ? null : l.id)}
                    aria-label={`Edit ${name}`}
                    title="Edit"
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ${
                      editing ? 'btn-ink' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <FaPen className="text-sm" />
                  </button>
                  <PopMenu
                    label={`More actions for ${name}`}
                    icon={<FaEllipsisVertical />}
                    items={[
                      { label: 'Duplicate', icon: <FaClone />, onSelect: () => duplicate(l.id) },
                      { label: 'Move up', icon: <FaArrowUp />, disabled: idx === 0, onSelect: () => move(l.id, -1) },
                      {
                        label: 'Move down',
                        icon: <FaArrowDown />,
                        disabled: idx === data.links.length - 1,
                        onSelect: () => move(l.id, 1),
                      },
                      {
                        label: 'Delete',
                        icon: <FaTrash />,
                        danger: true,
                        onSelect: () => {
                          if (isEmpty(l) || confirm(`Delete "${name}"?`)) remove(l.id);
                        },
                      },
                    ]}
                  />
                </div>
              </div>

              {editing && (
                <div className="pop-in space-y-4 border-t border-neutral-100 px-4 pb-4 pt-4 sm:px-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        thumbTarget.current = l.id;
                        thumbRef.current?.click();
                      }}
                      title="Add an image to this button"
                      aria-label={`${l.image ? 'Change' : 'Add'} image for ${name}`}
                      className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 text-neutral-600"
                    >
                      {l.image ? <Framed src={l.image} frame={l.imageFrame} /> : <FaCamera />}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        <FaImage />
                      </span>
                    </button>
                    <input
                      className="input !font-semibold"
                      placeholder="Title (e.g. My Dribbble)"
                      aria-label="Link title"
                      autoFocus={freshId === l.id}
                      value={l.title}
                      onChange={(e) => updateLink(l.id, { title: e.target.value })}
                    />
                  </div>
                  <input
                    className="input"
                    type="url"
                    inputMode="url"
                    placeholder="https://your-link.com"
                    aria-label={`URL for ${name}`}
                    value={l.url}
                    onChange={(e) => updateLink(l.id, { url: e.target.value })}
                  />

                  <div role="group" aria-label={`Which page shows ${name}`}>
                    <p className="mb-1.5 text-xs font-semibold text-neutral-500">Show on</p>
                    <div className="flex flex-wrap gap-1.5">
                      {AUDIENCES.map((a) => (
                        <Chip key={a.id} active={l.audience === a.id} onClick={() => updateLink(l.id, { audience: a.id })}>
                          {a.label}
                        </Chip>
                      ))}
                    </div>
                    {!onThisPage && (
                      <p className="mt-1.5 text-xs font-medium text-amber-700">
                        Not on the {meta.label} page — switch pages from the top bar to preview it.
                      </p>
                    )}
                  </div>

                  <div role="group" aria-label="Button animation">
                    <p className="mb-1.5 text-xs font-semibold text-neutral-500">Animation</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ANIMS.map((a) => (
                        <Chip key={a.id} active={l.animation === a.id} onClick={() => updateLink(l.id, { animation: a.id })}>
                          {a.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="input !w-20 text-center"
                      placeholder="😀"
                      maxLength={4}
                      value={l.emoji}
                      onChange={(e) => updateLink(l.id, { emoji: e.target.value })}
                      title="Optional emoji icon"
                      aria-label="Emoji icon (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => setStyleOpen((v) => !v)}
                      aria-expanded={styleOpen}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                        styleOpen ? 'btn-ink' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      <FaPalette /> Colours
                    </button>
                    {l.image && (
                      <>
                        <button
                          type="button"
                          onClick={() => setFrameOpen((v) => !v)}
                          aria-expanded={frameOpen}
                          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                            frameOpen ? 'btn-ink' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          <FaCropSimple aria-hidden /> Adjust image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFrameOpen(false);
                            updateLink(l.id, { image: '', imageFrame: undefined });
                          }}
                          className="text-xs font-semibold text-neutral-600 hover:text-red-600"
                        >
                          Remove image
                        </button>
                      </>
                    )}
                  </div>

                  {frameOpen && l.image && (
                    <FrameEditor
                      kind="image"
                      src={l.image}
                      frame={l.imageFrame}
                      shape="square"
                      label="image"
                      onChange={(imageFrame) => updateLink(l.id, { imageFrame })}
                    />
                  )}

                  {styleOpen && (
                    <div className="pop-in space-y-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold text-neutral-500">Button colour</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SWATCHES.map((c) => (
                          <button
                            key={c || 'default'}
                            type="button"
                            onClick={() => updateLink(l.id, { color: c })}
                            title={c || 'Use theme colour'}
                            aria-label={c ? `Button colour ${c}` : 'Use theme colour'}
                            aria-pressed={l.color === c}
                            className={`h-7 w-7 rounded-full ring-2 transition hover:scale-110 ${
                              l.color === c ? 'ring-brand-purple' : 'ring-black/10'
                            }`}
                            style={
                              c
                                ? { background: c }
                                : { background: 'repeating-linear-gradient(45deg,#fff,#fff 4px,#e4e4e4 4px,#e4e4e4 8px)' }
                            }
                          />
                        ))}
                        <input
                          type="color"
                          value={l.color || '#8129d9'}
                          onChange={(e) => updateLink(l.id, { color: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                          title="Pick any colour"
                          aria-label="Custom button colour"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-neutral-500">Text</span>
                        <input
                          type="color"
                          value={l.textColor || '#111111'}
                          onChange={(e) => updateLink(l.id, { textColor: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                          aria-label="Button text colour"
                        />
                        <button
                          type="button"
                          onClick={() => updateLink(l.id, { color: '', textColor: '' })}
                          className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                        >
                          Reset colours
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => edit(null)}
                      className="btn-ink flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
                    >
                      <FaCheck className="text-xs" /> Done
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* "Add" sits after the cards, so the list grows downward from where you are */}
      <button
        type="button"
        onClick={addLink}
        className="btn-ink mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-bold"
      >
        <FaPlus aria-hidden /> Add link
      </button>
    </div>
  );
}
