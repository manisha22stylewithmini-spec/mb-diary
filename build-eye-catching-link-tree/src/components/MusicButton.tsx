import { useEffect, useRef, useState } from 'react';
import { FaMusic, FaPause } from 'react-icons/fa6';
import type { Music } from '../types';
import { createPlayer, trackLabel, type Player } from '../utils/music';

interface Props {
  music: Music;
  dark: boolean;
  accent: string;
}

/** Floating play/pause pill. Browsers block autoplay, so the visitor starts the music themselves. */
export default function MusicButton({ music, dark, accent }: Props) {
  const playerRef = useRef<Player | null>(null);
  const wasPlaying = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // (re)build the player whenever the track changes; keep playing if it already was
  useEffect(() => {
    setFailed(false);
    const p = createPlayer(music);
    playerRef.current = p;
    setReady(!!p);
    if (!p) return;
    p.setVolume(music.volume);
    const off = p.subscribe(setPlaying);
    if (wasPlaying.current) p.play().catch(() => setFailed(true));
    return () => {
      wasPlaying.current = p.playing;
      off();
      p.dispose();
      playerRef.current = null;
      setPlaying(false);
    };
    // volume is applied separately so dragging the slider doesn't restart the track
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music.enabled, music.source, music.preset, music.url]);

  useEffect(() => {
    playerRef.current?.setVolume(music.volume);
  }, [music.volume]);

  if (!music.enabled || !ready) return null;

  const toggle = async () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.playing) {
      p.pause();
      wasPlaying.current = false;
      return;
    }
    try {
      setFailed(false);
      await p.play();
    } catch {
      setFailed(true);
    }
  };

  const label = failed
    ? "Couldn't play this track"
    : `${playing ? 'Pause' : 'Play'} music: ${trackLabel(music)}`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      className="absolute right-3 top-3 z-20 flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold backdrop-blur transition hover:scale-105 active:scale-95"
      style={{
        background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.08)',
        color: dark ? '#fff' : '#0f172a',
        boxShadow: playing ? `0 0 0 2px ${accent}` : undefined,
      }}
    >
      {playing ? (
        <>
          <span className="eq" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <FaPause className="text-xs" aria-hidden />
        </>
      ) : (
        <>
          <FaMusic className="text-xs" aria-hidden />
          <span className="text-xs">{failed ? 'Unavailable' : 'Play'}</span>
        </>
      )}
    </button>
  );
}
