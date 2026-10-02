import { useRef, useState } from 'react';
import {
  FaPlus,
  FaTrash,
  FaGripVertical,
  FaChevronUp,
  FaChevronDown,
  FaCamera,
  FaImage,
  FaPalette,
} from 'react-icons/fa6';
import type { Animation, AppData, LinkItem } from '../types';
import { PLATFORMS, detectPlatform } from '../data/platforms';
import { makeLink } from '../data/store';
import { resizeImage } from '../utils/media';
import SocialsCard from './SocialsCard';
import { Card, Chip, Toggle } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
}

const ANIMS: { id: Animation; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'glow', label: 'Glow' },
  { id: 'shake', label: 'Shake' },
  { id: 'bounce', label: 'Bounce' },
];

const SWATCHES = ['', '#ffffff', '#111111', '#8129d9', '#ff3d81', '#ff8a00', '#19c37d', '#00b3a4', '#1769ff', '#ffe14d'];

export default function LinksTab({ data, setData }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [openStyle, setOpenStyle] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const thumbTarget = useRef<string | null>(null);

  const updateLink = (id: string, patch: Partial<LinkItem>) =>
    setData((d) => ({ ...d, links: d.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));

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

  const addLink = () => setData((d) => ({ ...d, links: [makeLink(), ...d.links] }));

  return (
    <div className="space-y-5">
      {/* Profile */}
      <Card title="Profile" subtitle="This is what visitors see at the top of your page">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8129d9] to-[#ff3d81] ring-4 ring-neutral-100"
            title="Upload photo"
          >
            {data.profile.avatar ? (
              <img src={data.profile.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {data.profile.name.slice(0, 1).toUpperCase() || '?'}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
              <FaCamera />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const avatar = await resizeImage(f);
              setData((d) => ({ ...d, profile: { ...d.profile, avatar } }));
              e.target.value = '';
            }}
          />
          <div className="flex-1 space-y-2">
            <input
              className="input"
              placeholder="Display name"
              value={data.profile.name}
              onChange={(e) => setData((d) => ({ ...d, profile: { ...d.profile, name: e.target.value } }))}
            />
            <input
              className="input"
              placeholder="@handle"
              value={data.profile.handle}
              onChange={(e) => setData((d) => ({ ...d, profile: { ...d.profile, handle: e.target.value } }))}
            />
          </div>
        </div>
        {data.profile.avatar && (
          <button
            className="mt-2 text-xs font-semibold text-neutral-500 hover:text-red-600"
            onClick={() => setData((d) => ({ ...d, profile: { ...d.profile, avatar: '' } }))}
          >
            Remove photo
          </button>
        )}
        <textarea
          className="input mt-3 resize-none"
          rows={3}
          maxLength={160}
          placeholder="Bio"
          value={data.profile.bio}
          onChange={(e) => setData((d) => ({ ...d, profile: { ...d.profile, bio: e.target.value } }))}
        />
        <p className="mt-1 text-right text-[11px] text-neutral-400">{data.profile.bio.length}/160</p>
      </Card>

      {/* Add link */}
      <button
        onClick={addLink}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8129d9] py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-300/50 transition hover:scale-[1.01] hover:bg-[#6f1fc0] active:scale-[0.98]"
      >
        <FaPlus /> Add link
      </button>

      {/* hidden thumbnail picker shared by all links */}
      <input
        ref={thumbRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          const id = thumbTarget.current;
          if (f && id) updateLink(id, { image: await resizeImage(f, 160, 0.8) });
          e.target.value = '';
        }}
      />

      {/* Links */}
      <div className="space-y-3">
        {data.links.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
            No links yet. Hit “Add link” to create your first one.
          </div>
        )}
        {data.links.map((l, idx) => {
          const Icon = PLATFORMS[detectPlatform(l.url)].icon;
          const styleOpen = openStyle === l.id;
          return (
            <div
              key={l.id}
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
              className={`pop-in rounded-3xl bg-white p-4 shadow-sm ring-1 transition ${
                overId === l.id && dragId !== l.id ? 'ring-2 ring-[#8129d9]' : 'ring-black/5'
              } ${dragId === l.id ? 'opacity-40' : ''} ${l.enabled ? '' : 'opacity-70'}`}
            >
              <div className="flex gap-3">
                <div
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
                  className="flex cursor-grab items-center text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <FaGripVertical />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        thumbTarget.current = l.id;
                        thumbRef.current?.click();
                      }}
                      title="Add an image to this button"
                      className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-lg"
                    >
                      {l.image ? (
                        <img src={l.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        l.emoji || <Icon />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs text-white opacity-0 transition group-hover:opacity-100">
                        <FaImage />
                      </span>
                    </button>
                    <input
                      className="input !font-semibold"
                      placeholder="Title (e.g. My Dribbble)"
                      value={l.title}
                      onChange={(e) => updateLink(l.id, { title: e.target.value })}
                    />
                  </div>
                  <input
                    className="input"
                    placeholder="https://your-link.com"
                    value={l.url}
                    onChange={(e) => updateLink(l.id, { url: e.target.value })}
                  />
                </div>

                <div className="flex flex-col items-center justify-between gap-2">
                  <Toggle checked={l.enabled} onChange={(v) => updateLink(l.id, { enabled: v })} label="Show link" />
                  <div className="flex flex-col">
                    <button
                      disabled={idx === 0}
                      onClick={() => move(l.id, -1)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-25"
                      aria-label="Move up"
                    >
                      <FaChevronUp />
                    </button>
                    <button
                      disabled={idx === data.links.length - 1}
                      onClick={() => move(l.id, 1)}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-25"
                      aria-label="Move down"
                    >
                      <FaChevronDown />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 pl-7">
                <input
                  className="input !w-16 text-center"
                  placeholder="😀"
                  maxLength={4}
                  value={l.emoji}
                  onChange={(e) => updateLink(l.id, { emoji: e.target.value })}
                  title="Optional emoji icon"
                />
                <div className="flex flex-wrap gap-1">
                  {ANIMS.map((a) => (
                    <Chip key={a.id} active={l.animation === a.id} onClick={() => updateLink(l.id, { animation: a.id })}>
                      {a.label}
                    </Chip>
                  ))}
                </div>
                <button
                  onClick={() => setOpenStyle(styleOpen ? null : l.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    styleOpen ? 'bg-[#8129d9] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <FaPalette /> Style
                </button>
                <button
                  onClick={() => {
                    if (!l.title && !l.url)
                      return setData((d) => ({ ...d, links: d.links.filter((x) => x.id !== l.id) }));
                    if (confirm(`Delete "${l.title || 'this link'}"?`))
                      setData((d) => ({ ...d, links: d.links.filter((x) => x.id !== l.id) }));
                  }}
                  className="ml-auto rounded-full p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete link"
                >
                  <FaTrash />
                </button>
              </div>

              {styleOpen && (
                <div className="pop-in mt-3 space-y-3 rounded-2xl bg-neutral-50 p-3 ring-1 ring-black/5">
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
                      Button colour
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SWATCHES.map((c) => (
                        <button
                          key={c || 'default'}
                          onClick={() => updateLink(l.id, { color: c })}
                          title={c || 'Use theme colour'}
                          className={`h-7 w-7 rounded-full ring-2 transition hover:scale-110 ${
                            l.color === c ? 'ring-[#8129d9]' : 'ring-black/10'
                          }`}
                          style={
                            c
                              ? { background: c }
                              : {
                                  background:
                                    'repeating-linear-gradient(45deg,#fff,#fff 4px,#e4e4e4 4px,#e4e4e4 8px)',
                                }
                          }
                        />
                      ))}
                      <input
                        type="color"
                        value={l.color || '#8129d9'}
                        onChange={(e) => updateLink(l.id, { color: e.target.value })}
                        className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                        title="Pick any colour"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Text</span>
                    <input
                      type="color"
                      value={l.textColor || '#111111'}
                      onChange={(e) => updateLink(l.id, { textColor: e.target.value })}
                      className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <button
                      onClick={() => updateLink(l.id, { color: '', textColor: '' })}
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                    >
                      Reset colours
                    </button>
                    {l.image && (
                      <button
                        onClick={() => updateLink(l.id, { image: '' })}
                        className="text-xs font-semibold text-neutral-500 hover:text-red-600"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Socials */}
      <SocialsCard data={data} setData={setData} />
    </div>
  );
}
