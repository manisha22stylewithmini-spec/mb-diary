import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaImage, FaVideo, FaWandMagicSparkles, FaTrash, FaUpload } from 'react-icons/fa6';
import type { AppData, BgKind, ButtonStyle, Mode, Shape } from '../types';
import { MODE_META } from '../data/modes';
import { patchDesign } from '../data/store';
import { FONTS, THEMES, buttonStyle, resolveTheme } from '../data/themes';
import { FaPalette, FaSliders, FaImage as FaPhoto, FaHandPointer, FaFont } from 'react-icons/fa6';
import { AccordionFrame, AccordionSection, useOpenSection } from './Accordion';
import { resizeCover } from '../utils/media';
import { MAX_VIDEO_BYTES, fmtBytes, isLocalMedia, saveMedia, storageRoom, useMediaUrl } from '../utils/mediaStore';
import FrameEditor from './FrameEditor';
import { loadAllFonts } from '../utils/fonts';
import { Chip, Toggle } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  notify: (msg: string) => void;
  /** which page (Professional / Freelance) is being styled */
  mode: Mode;
}

const STYLES: { id: ButtonStyle; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'outline', label: 'Outline' },
  { id: 'glass', label: 'Glass' },
  { id: 'shadow', label: 'Hard shadow' },
];
const SHAPES: { id: Shape; label: string }[] = [
  { id: 'pill', label: 'Pill' },
  { id: 'round', label: 'Rounded' },
  { id: 'square', label: 'Square' },
];
const BG_KINDS: { id: BgKind; label: string; icon: typeof FaImage }[] = [
  { id: 'theme', label: 'Theme only', icon: FaWandMagicSparkles },
  { id: 'image', label: 'Image', icon: FaImage },
  { id: 'video', label: 'Video', icon: FaVideo },
];
const SECTIONS = ['themes', 'colours', 'background', 'buttons', 'font'] as const;

const BLUR_PRESETS = [
  { v: 0, label: 'As it is' },
  { v: 4, label: 'Soft blur' },
  { v: 10, label: 'Blur' },
  { v: 20, label: 'Heavy blur' },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-3 py-2 ring-1 ring-black/5">
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
      <span className="flex items-center gap-2">
        <input
          className="w-20 bg-transparent text-right text-xs font-mono uppercase text-neutral-500 outline-none"
          value={value}
          aria-label={`${label} hex code`}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
          className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </span>
    </label>
  );
}

export default function AppearanceTab({ data, setData, notify, mode }: Props) {
  const design = data.modes[mode].design;
  const bg = design.background;
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const bgUrl = useMediaUrl(bg.src);
  useEffect(loadAllFonts, []); // the Font section previews every typeface

  const set = (patch: Partial<typeof design>) => setData((d) => patchDesign(d, mode, (x) => ({ ...x, ...patch })));
  const setCustom = (patch: Partial<typeof design.custom>) =>
    setData((d) => patchDesign(d, mode, (x) => ({ ...x, theme: 'custom', custom: { ...x.custom, ...patch } })));
  const setBg = (patch: Partial<typeof bg>) =>
    setData((d) => patchDesign(d, mode, (x) => ({ ...x, background: { ...x.background, ...patch } })));

  const preview = resolveTheme(design);
  const [open, toggle] = useOpenSection('lf-design-open', SECTIONS, 'themes');
  const sec = (id: (typeof SECTIONS)[number]) => ({ id, open: open === id, onToggle: () => toggle(id) });
  const styleName = STYLES.find((s) => s.id === design.buttonStyle)?.label ?? '';
  const shapeName = SHAPES.find((s) => s.id === design.shape)?.label ?? '';
  const fontName = FONTS.find((f) => f.id === design.font)?.name ?? '';

  return (
    <AccordionFrame>
      <AccordionSection
        {...sec('themes')}
        icon={<FaPalette />}
        title="Themes"
        summary={`${preview.name} · for your ${MODE_META[mode].label} page`}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => {
            const active = design.theme === t.id;
            return (
              <button key={t.id} onClick={() => set({ theme: t.id })} aria-pressed={active} className="group rounded-2xl text-left">
                <div
                  className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl p-3 transition group-hover:scale-[1.04] ${
                    active ? 'ring-4 ring-[#8129d9] ring-offset-2' : 'ring-1 ring-black/10'
                  } ${t.animated ? 'bg-animated' : ''}`}
                  style={{ background: t.bg }}
                >
                  <div className="h-7 w-7 rounded-full" style={{ background: t.btnBg, opacity: 0.9 }} />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-3 w-full" style={{ ...buttonStyle(t, 'solid', 'pill'), boxShadow: 'none' }} />
                  ))}
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8129d9] text-[10px] text-white">
                      <FaCheck />
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-center text-xs font-semibold">{t.name}</p>
              </button>
            );
          })}

          {/* Custom theme tile */}
          <button onClick={() => set({ theme: 'custom' })} aria-pressed={design.theme === 'custom'} className="group rounded-2xl text-left">
            <div
              className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl p-3 transition group-hover:scale-[1.04] ${
                design.theme === 'custom' ? 'ring-4 ring-[#8129d9] ring-offset-2' : 'ring-1 ring-black/10'
              }`}
              style={{
                background: `linear-gradient(${design.custom.angle}deg, ${design.custom.color1}, ${design.custom.color2})`,
              }}
            >
              <FaWandMagicSparkles className="text-xl text-white drop-shadow" />
              {design.theme === 'custom' && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#8129d9] text-[10px] text-white">
                  <FaCheck />
                </span>
              )}
            </div>
            <p className="mt-1.5 text-center text-xs font-semibold">Custom</p>
          </button>
        </div>
      </AccordionSection>

      {/* Custom colours */}
      <AccordionSection
        {...sec('colours')}
        icon={<FaSliders />}
        title="Custom colours"
        summary={
          <span className="inline-flex items-center gap-2 align-middle">
            <span className="inline-block h-3.5 w-8 rounded-full ring-1 ring-black/10" style={{ background: preview.bg }} />
            Editing any colour switches to the Custom theme
          </span>
        }
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <ColorField label="Background 1" value={design.custom.color1} onChange={(v) => setCustom({ color1: v })} />
          <ColorField label="Background 2" value={design.custom.color2} onChange={(v) => setCustom({ color2: v })} />
          <ColorField label="Text" value={design.custom.text} onChange={(v) => setCustom({ text: v })} />
          <ColorField label="Accent / glow" value={design.custom.accent} onChange={(v) => setCustom({ accent: v })} />
          <ColorField label="Button fill" value={design.custom.btnBg} onChange={(v) => setCustom({ btnBg: v })} />
          <ColorField label="Button text" value={design.custom.btnText} onChange={(v) => setCustom({ btnText: v })} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex flex-1 items-center gap-3 text-xs font-semibold text-neutral-600">
            Gradient angle
            <input
              type="range"
              min={0}
              max={360}
              value={design.custom.angle}
              onChange={(e) => setCustom({ angle: Number(e.target.value) })}
              className="flex-1 accent-[#8129d9]"
            />
            <span className="w-10 text-right font-mono text-neutral-500">{design.custom.angle}°</span>
          </label>
          <span className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
            Animate
            <Toggle checked={design.custom.animated} onChange={(v) => setCustom({ animated: v })} label="Animate gradient" />
          </span>
        </div>
      </AccordionSection>

      {/* Background media */}
      <AccordionSection
        {...sec('background')}
        icon={<FaPhoto />}
        title="Background"
        summary={bg.kind === 'theme' ? 'Theme only' : `${bg.kind === 'image' ? 'Image' : 'Video'}${bg.src ? ' added' : ' — not set yet'}`}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {BG_KINDS.map((k) => {
            const Icon = k.icon;
            return (
              <button
                key={k.id}
                onClick={() => setBg({ kind: k.id })}
                aria-pressed={bg.kind === k.id}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  bg.kind === k.id ? 'btn-brand' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                <Icon /> {k.label}
              </button>
            );
          })}
        </div>

        {bg.kind !== 'theme' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => (bg.kind === 'image' ? imgRef.current : vidRef.current)?.click()}
                disabled={saving}
                className="btn-brand flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold disabled:opacity-60"
              >
                <FaUpload /> {saving ? 'Saving video…' : `Upload ${bg.kind}`}
              </button>
              {bg.src && (
                <button
                  onClick={() => setBg({ src: '', frame: undefined })}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-red-50 hover:text-red-600"
                >
                  <FaTrash /> Remove
                </button>
              )}
            </div>

            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setBg({ src: await resizeCover(f), kind: 'image', frame: undefined });
                  notify('Background image added');
                }
                e.target.value = '';
              }}
            />
            <input
              ref={vidRef}
              type="file"
              accept="video/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                if (f.size > MAX_VIDEO_BYTES) {
                  notify(`That video is ${fmtBytes(f.size)} — the limit is 50 GB`);
                  return;
                }
                const room = await storageRoom();
                if (room && f.size > room.free) {
                  notify(`Not enough free space in this browser: ${fmtBytes(room.free)} left, video is ${fmtBytes(f.size)}`);
                  return;
                }
                setSaving(true);
                try {
                  void navigator.storage?.persist?.(); // ask the browser not to evict it
                  const ref = await saveMedia(f);
                  setBg({ src: ref, kind: 'video', frame: undefined });
                  notify('Background video saved');
                } catch {
                  notify("Couldn't save the video — your browser may be out of space");
                } finally {
                  setSaving(false);
                }
              }}
            />

            <input
              className="input"
              type="url"
              aria-label={`Background ${bg.kind} URL`}
              placeholder={bg.kind === 'video' ? 'https://…/clip.mp4' : 'https://…/photo.jpg'}
              value={isLocalMedia(bg.src) ? '' : bg.src}
              onChange={(e) => setBg({ src: e.target.value })}
            />
            {isLocalMedia(bg.src) && (
              <p className="text-[11px] text-neutral-500">Using an uploaded file. Paste a URL above to replace it.</p>
            )}
            {bg.src.trim() && bgUrl && (
              <FrameEditor
                kind={bg.kind === 'video' ? 'video' : 'image'}
                src={bgUrl}
                frame={bg.frame}
                shape="phone"
                label={bg.kind === 'video' ? 'video' : 'image'}
                onChange={(frame) => setBg({ frame })}
              />
            )}
            {bg.kind === 'video' && (
              <p className="rounded-2xl bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">
                Upload up to <b>50 GB</b>. Uploads are kept in this browser, so visitors who open your share link
                only see a video you paste as a link. For a fast page, use a short muted loop (about 10–20 MB, 1080p
                or less, MP4/H.264 with “fast start”).
              </p>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Effect</p>
              <div className="flex flex-wrap gap-2">
                {BLUR_PRESETS.map((b) => (
                  <Chip key={b.v} active={bg.blur === b.v} onClick={() => setBg({ blur: b.v })}>
                    {b.label}
                  </Chip>
                ))}
                <Chip active={bg.grayscale} onClick={() => setBg({ grayscale: !bg.grayscale })}>
                  Black &amp; white
                </Chip>
              </div>
            </div>

            <label className="flex items-center gap-3 text-xs font-semibold text-neutral-600">
              Blur
              <input
                type="range"
                min={0}
                max={30}
                value={bg.blur}
                onChange={(e) => setBg({ blur: Number(e.target.value) })}
                className="flex-1 accent-[#8129d9]"
              />
              <span className="w-10 text-right font-mono text-neutral-500">{bg.blur}px</span>
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-neutral-600">
              Dark overlay
              <input
                type="range"
                min={0}
                max={80}
                value={bg.dim}
                onChange={(e) => setBg({ dim: Number(e.target.value) })}
                className="flex-1 accent-[#8129d9]"
              />
              <span className="w-10 text-right font-mono text-neutral-500">{bg.dim}%</span>
            </label>
          </div>
        )}
      </AccordionSection>

      <AccordionSection {...sec('buttons')} icon={<FaHandPointer />} title="Buttons" summary={`${styleName} · ${shapeName} corners`}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Style</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} active={design.buttonStyle === s.id} onClick={() => set({ buttonStyle: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Corners</p>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <Chip key={s.id} active={design.shape === s.id} onClick={() => set({ shape: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-neutral-500">
          Tip: give any single button its own colour or image from the <b>Style</b> button on the Links tab.
        </p>
      </AccordionSection>

      <AccordionSection {...sec('font')} icon={<FaFont />} title="Font" summary={fontName}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => set({ font: f.id })}
              aria-pressed={design.font === f.id}
              style={{ fontFamily: f.css }}
              className={`rounded-2xl border-2 px-3 py-3 text-base transition ${
                design.font === f.id ? 'border-[#8129d9] bg-purple-50' : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </AccordionSection>
    </AccordionFrame>
  );
}
