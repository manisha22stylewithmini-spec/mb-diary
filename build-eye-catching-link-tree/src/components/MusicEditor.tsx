import { useEffect, useRef, useState } from 'react';
import { FaPlay, FaStop, FaUpload, FaMusic, FaLink, FaWaveSquare } from 'react-icons/fa6';
import type { Music, MusicSource } from '../types';
import { MUSIC_PRESETS, createPlayer, type Player } from '../utils/music';
import { fileToDataUrl } from '../utils/media';
import { Toggle } from './ui';

interface Props {
  music: Music;
  onChange: (patch: Partial<Music>) => void;
  notify: (msg: string) => void;
  /** e.g. "Professional" — names the page this track belongs to */
  pageLabel: string;
}

const MAX_UPLOAD = 1.5 * 1024 * 1024;

const SOURCES: { id: MusicSource; label: string; icon: typeof FaMusic }[] = [
  { id: 'preset', label: 'Built-in', icon: FaWaveSquare },
  { id: 'url', label: 'Link', icon: FaLink },
  { id: 'upload', label: 'Upload', icon: FaUpload },
];

export default function MusicEditor({ music, onChange, notify, pageLabel }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<Player | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const stopPreview = () => {
    previewRef.current?.dispose();
    previewRef.current = null;
    setPreviewing(false);
  };

  const preview = async (config: Music) => {
    stopPreview();
    const p = createPlayer({ ...config, enabled: true });
    if (!p) {
      notify('Add a track first');
      return;
    }
    previewRef.current = p;
    p.subscribe(setPreviewing);
    try {
      await p.play();
    } catch {
      stopPreview();
      notify("Couldn't play that track — check the link");
    }
  };

  useEffect(() => stopPreview, []);
  useEffect(() => {
    previewRef.current?.setVolume(music.volume);
  }, [music.volume]);

  const hasTrack = music.source === 'preset' || music.url.trim() !== '';

  return (
    <div className="pop-in space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3 ring-1 ring-black/5">
        <div>
          <p className="text-sm font-bold">Music on your {pageLabel} page</p>
          <p className="text-xs text-neutral-600">Visitors tap play — browsers don’t allow autoplay.</p>
        </div>
        <Toggle
          checked={music.enabled}
          onChange={(v) => {
            if (!v) stopPreview();
            onChange({ enabled: v });
          }}
          label={`Play music on the ${pageLabel} page`}
        />
      </div>

      {music.enabled && (
        <>
          <div className="flex gap-1 rounded-full bg-neutral-100 p-1" role="group" aria-label="Music source">
            {SOURCES.map((s) => {
              const Icon = s.icon;
              const on = music.source === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    stopPreview();
                    onChange({ source: s.id });
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-xs font-bold transition ${
                    on ? 'bg-white text-neutral-900 shadow' : 'text-neutral-600'
                  }`}
                >
                  <Icon aria-hidden /> {s.label}
                </button>
              );
            })}
          </div>

          {music.source === 'preset' && (
            <div className="space-y-2">
              {MUSIC_PRESETS.map((p) => {
                const on = music.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      onChange({ preset: p.id });
                      void preview({ ...music, source: 'preset', preset: p.id });
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      on ? 'bg-purple-50 ring-2 ring-brand-purple' : 'bg-neutral-50 ring-1 ring-black/5 hover:bg-neutral-100'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs ${
                        on ? 'btn-brand' : 'bg-white text-brand-purple ring-1 ring-black/5'
                      }`}
                    >
                      <FaMusic aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{p.name}</span>
                      <span className="block text-xs text-neutral-600">{p.vibe}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {music.source === 'url' && (
            <div className="space-y-2">
              <input
                className="input"
                type="url"
                inputMode="url"
                placeholder="https://…/track.mp3"
                aria-label="Direct link to an audio file"
                value={music.url.startsWith('data:') ? '' : music.url}
                onChange={(e) => onChange({ url: e.target.value })}
              />
              <input
                className="input"
                placeholder="Track name (optional)"
                aria-label="Track name"
                value={music.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
              <p className="text-xs text-neutral-600">
                Use a direct link to an .mp3 / .m4a / .wav file. Streaming pages (Spotify, YouTube) can’t be used.
              </p>
            </div>
          )}

          {music.source === 'upload' && (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  if (f.size > MAX_UPLOAD) {
                    notify('Track too big (max 1.5 MB) — paste a link instead');
                    return;
                  }
                  onChange({ url: await fileToDataUrl(f), title: music.title || f.name.replace(/\.[^.]+$/, '') });
                  notify('Track added');
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-brand flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold"
              >
                <FaUpload aria-hidden /> {music.url.startsWith('data:') ? 'Replace track' : 'Upload a track'}
              </button>
              {music.url.startsWith('data:') && (
                <p className="text-xs font-medium text-neutral-700">Using: {music.title || 'your uploaded track'}</p>
              )}
              <p className="text-xs text-amber-700">
                Uploaded files stay in this browser and can’t travel inside a share link. For links you send to
                others, pick a built-in track or paste a link.
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!hasTrack}
              onClick={() => (previewing ? stopPreview() : void preview(music))}
              className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
            >
              {previewing ? <FaStop aria-hidden /> : <FaPlay aria-hidden />} {previewing ? 'Stop' : 'Preview'}
            </button>
            <label className="flex flex-1 items-center gap-3 text-xs font-semibold text-neutral-700">
              Volume
              <input
                type="range"
                min={0}
                max={100}
                value={music.volume}
                onChange={(e) => onChange({ volume: Number(e.target.value) })}
                className="flex-1 accent-[#8129d9]"
              />
              <span className="w-9 text-right font-mono text-neutral-600">{music.volume}%</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
