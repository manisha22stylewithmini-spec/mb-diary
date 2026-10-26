import type { AppData, Mode } from '../types';
import { MODE_META } from '../data/modes';
import { patchMode } from '../data/store';
import MusicEditor from './MusicEditor';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  mode: Mode;
  notify: (msg: string) => void;
}

/** Background music for the page being edited — the same editor also lives in the Share dialog. */
export default function SoundPanel({ data, setData, mode, notify }: Props) {
  return (
    <div className="px-1">
      <MusicEditor
        music={data.modes[mode].music}
        pageLabel={MODE_META[mode].label}
        notify={notify}
        onChange={(patch) => setData((d) => patchMode(d, mode, { music: { ...d.modes[mode].music, ...patch } }))}
      />
    </div>
  );
}
