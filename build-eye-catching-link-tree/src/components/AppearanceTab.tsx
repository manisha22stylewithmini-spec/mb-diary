import { useRef } from 'react';
import { FaCheck, FaImage, FaVideo, FaWandMagicSparkles, FaTrash, FaUpload } from 'react-icons/fa6';
import type { AppData, BgKind, ButtonStyle, Shape } from '../types';
import { FONTS, THEMES, buttonStyle, resolveTheme } from '../data/themes';
import { fileToDataUrl, resizeCover } from '../utils/media';
import { Card, Chip, Toggle } from './ui';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  notify: (msg: string) => void;
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
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </span>
    </label>
  );
}

export default function AppearanceTab({ data, setData, notify }: Props) {
  const { design } = data;
  const bg = design.background;
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<typeof design>) => setData((d) => ({ ...d, design: { ...d.design, ...patch } }));
  const setCustom = (patch: Partial<typeof design.custom>) =>
    setData((d) => ({ ...d, design: { ...d.design, theme: 'custom', custom: { ...d.design.custom, ...patch } } }));
  const setBg = (patch: Partial<typeof bg>) =>
    setData((d) => ({ ...d, design: { ...d.design, background: { ...d.design.background, ...patch } } }));

  const preview = resolveTheme(design);

  return (
    <div className="space-y-5">
      <Card title="Themes" subtitle="Pick a ready-made vibe, or build your own below">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => {
            const active = design.theme === t.id;
            return (
              <button key={t.id} onClick={() => set({ theme: t.id })} className="group text-left">
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
          <button onClick={() => set({ theme: 'custom' })} className="group text-left">
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
      </Card>

      {/* Custom colours */}
      <Card
        title="Custom colours"
        subtitle="Editing any colour switches your page to the Custom theme"
        action={
          <div
            className="h-10 w-16 rounded-xl ring-1 ring-black/10"
            style={{ background: preview.bg }}
            title="Live preview"
          />
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
            <span className="w-10 text-right font-mono text-neutral-400">{design.custom.angle}°</span>
          </label>
          <span className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
            Animate
            <Toggle checked={design.custom.animated} onChange={(v) => setCustom({ animated: v })} label="Animate gradient" />
          </span>
        </div>
      </Card>

      {/* Background media */}
      <Card title="Background image / video" subtitle="Upload your own, or paste a direct link">
        <div className="mb-4 flex flex-wrap gap-2">
          {BG_KINDS.map((k) => {
            const Icon = k.icon;
            return (
              <button
                key={k.id}
                onClick={() => setBg({ kind: k.id })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  bg.kind === k.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                className="flex items-center gap-2 rounded-full bg-[#8129d9] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#6f1fc0]"
              >
                <FaUpload /> Upload {bg.kind}
              </button>
              {bg.src && (
                <button
                  onClick={() => setBg({ src: '' })}
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
                  setBg({ src: await resizeCover(f), kind: 'image' });
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
                if (f) {
                  if (f.size > 2.5 * 1024 * 1024) {
                    notify('Video too big to save (max 2.5 MB) — paste a link instead');
                  } else {
                    setBg({ src: await fileToDataUrl(f), kind: 'video' });
                    notify('Background video added');
                  }
                }
                e.target.value = '';
              }}
            />

            <input
              className="input"
              placeholder={bg.kind === 'video' ? 'https://…/clip.mp4' : 'https://…/photo.jpg'}
              value={bg.src.startsWith('data:') ? '' : bg.src}
              onChange={(e) => setBg({ src: e.target.value })}
            />
            {bg.src.startsWith('data:') && (
              <p className="text-[11px] text-neutral-400">Using an uploaded file. Paste a URL above to replace it.</p>
            )}

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Effect</p>
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
              <span className="w-10 text-right font-mono text-neutral-400">{bg.blur}px</span>
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
              <span className="w-10 text-right font-mono text-neutral-400">{bg.dim}%</span>
            </label>
          </div>
        )}
      </Card>

      <Card title="Buttons">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Style</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} active={design.buttonStyle === s.id} onClick={() => set({ buttonStyle: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Corners</p>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <Chip key={s.id} active={design.shape === s.id} onClick={() => set({ shape: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-neutral-400">
          Tip: give any single button its own colour or image from the <b>Style</b> button on the Links tab.
        </p>
      </Card>

      <Card title="Font">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => set({ font: f.id })}
              style={{ fontFamily: f.css }}
              className={`rounded-2xl border-2 px-3 py-3 text-base transition ${
                design.font === f.id ? 'border-[#8129d9] bg-purple-50' : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
