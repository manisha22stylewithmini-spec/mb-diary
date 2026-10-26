import { useRef, useState } from 'react';
import { FaCamera, FaCropSimple } from 'react-icons/fa6';
import type { AppData, Mode } from '../types';
import { MODE_META } from '../data/modes';
import { patchMode } from '../data/store';
import { resizeCover } from '../utils/media';
import Framed from './Framed';
import FrameEditor from './FrameEditor';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  mode: Mode;
}

export default function ProfileSection({ data, setData, mode }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [adjusting, setAdjusting] = useState(false);
  const settings = data.modes[mode];
  const meta = MODE_META[mode];
  const { profile } = data;

  return (
    <div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#8129d9] to-[#ff3d81] ring-4 ring-neutral-100"
          title="Upload photo"
          aria-label={profile.avatar ? 'Change profile photo' : 'Upload profile photo'}
        >
          {profile.avatar ? (
            <Framed src={profile.avatar} frame={profile.avatarFrame} />
          ) : (
            <span className="text-2xl font-bold text-white">{profile.name.slice(0, 1).toUpperCase() || '?'}</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
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
            e.target.value = '';
            if (!f) return;
            // keep the whole picture (not a pre-cropped square) so it can be reframed afterwards
            const avatar = await resizeCover(f, 800, 0.85);
            setData((d) => ({ ...d, profile: { ...d.profile, avatar, avatarFrame: undefined } }));
            setAdjusting(true);
          }}
        />
        <div className="flex-1 space-y-2">
          <input
            className="input"
            placeholder="Display name"
            aria-label="Display name"
            value={profile.name}
            onChange={(e) => setData((d) => ({ ...d, profile: { ...d.profile, name: e.target.value } }))}
          />
          <input
            className="input"
            placeholder="@handle"
            aria-label="Handle"
            value={profile.handle}
            onChange={(e) => setData((d) => ({ ...d, profile: { ...d.profile, handle: e.target.value } }))}
          />
        </div>
      </div>
      {profile.avatar && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-expanded={adjusting}
              onClick={() => setAdjusting((v) => !v)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                adjusting ? 'btn-ink' : 'btn-soft'
              }`}
            >
              <FaCropSimple aria-hidden /> Adjust photo
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                setAdjusting(false);
                setData((d) => ({ ...d, profile: { ...d.profile, avatar: '', avatarFrame: undefined } }));
              }}
            >
              Remove photo
            </button>
          </div>
          {adjusting && (
            <div className="mt-3">
              <FrameEditor
                kind="image"
                src={profile.avatar}
                frame={profile.avatarFrame}
                shape="circle"
                label="photo"
                onChange={(avatarFrame) => setData((d) => ({ ...d, profile: { ...d.profile, avatarFrame } }))}
              />
            </div>
          )}
        </>
      )}
      <p className="mb-2 mt-5 text-xs font-semibold text-neutral-500">
        Bio and status badge are just for your {meta.label} page
      </p>
      <textarea
        className="input resize-none"
        rows={3}
        maxLength={160}
        placeholder="Bio"
        aria-label={`Bio for your ${meta.label} page`}
        value={settings.bio}
        onChange={(e) => setData((d) => patchMode(d, mode, { bio: e.target.value }))}
      />
      <p className="mt-1 text-right text-[11px] text-neutral-500">{settings.bio.length}/160</p>
      <input
        className="input mt-1"
        maxLength={40}
        placeholder="Status badge, e.g. Open to opportunities"
        aria-label={`Status badge for your ${meta.label} page`}
        value={settings.badge}
        onChange={(e) => setData((d) => patchMode(d, mode, { badge: e.target.value }))}
      />
    </div>
  );
}
