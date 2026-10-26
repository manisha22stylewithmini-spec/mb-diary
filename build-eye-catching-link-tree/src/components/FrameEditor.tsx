import { useEffect, useId, useRef, useState } from 'react';
import { FaMagnifyingGlassMinus, FaMagnifyingGlassPlus, FaRotateLeft } from 'react-icons/fa6';
import type { Frame } from '../types';
import Framed, { DEFAULT_FRAME } from './Framed';

type Shape = 'circle' | 'square' | 'phone';

interface Props {
  kind: 'image' | 'video';
  /** loadable URL of the picture/video */
  src: string;
  frame?: Frame;
  onChange: (f: Frame) => void;
  /** the shape the media is shown in on the page */
  shape: Shape;
  /** what is being framed, e.g. "profile photo" */
  label: string;
}

const BOX: Record<Shape, string> = {
  circle: 'h-56 w-56 rounded-full',
  square: 'h-48 w-48 rounded-3xl',
  phone: 'h-[400px] w-[190px] rounded-[30px]',
};

const clamp = (n: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, n)) * 100) / 100;

/**
 * Drag to slide the picture, zoom to enlarge it. Every change is saved straight away, so the
 * phone preview beside the editor updates live while you move it.
 */
export default function FrameEditor({ kind, src, frame, onChange, shape, label }: Props) {
  const f = frame ?? DEFAULT_FRAME;
  const boxRef = useRef<HTMLDivElement>(null);
  const natural = useRef<{ w: number; h: number } | null>(null);
  const drag = useRef<{ x: number; y: number; f: Frame } | null>(null);
  const latest = useRef(f);
  latest.current = f;
  const pending = useRef<Frame | null>(null);
  const raf = useRef(0);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  // changes are batched to one per animation frame so dragging stays smooth
  const emit = (next: Frame) => {
    latest.current = next;
    pending.current = next;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      if (pending.current) onChange(pending.current);
      pending.current = null;
    });
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /** how many px of picture overflow the frame in each direction at the current zoom */
  const overflow = (zoom: number) => {
    const box = boxRef.current;
    const n = natural.current;
    if (!box || !n) return null;
    const r = box.getBoundingClientRect();
    const cover = Math.max(r.width / n.w, r.height / n.h);
    return { x: n.w * cover * zoom - r.width, y: n.h * cover * zoom - r.height };
  };

  const pan = (start: Frame, dx: number, dy: number) => {
    const o = overflow(start.zoom);
    if (!o) return;
    // dragging right moves the picture right, which means sliding toward its left edge (smaller x)
    emit({
      ...start,
      x: o.x > 1 ? clamp(start.x - (dx / o.x) * 100, 0, 100) : start.x,
      y: o.y > 1 ? clamp(start.y - (dy / o.y) * 100, 0, 100) : start.y,
    });
  };

  const setZoom = (zoom: number) => emit({ ...latest.current, zoom: clamp(zoom, 1, 4) });

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const cur = latest.current;
    const move: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (move[e.key]) {
      e.preventDefault();
      emit({ ...cur, x: clamp(cur.x + move[e.key][0], 0, 100), y: clamp(cur.y + move[e.key][1], 0, 100) });
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      setZoom(cur.zoom + 0.1);
    } else if (e.key === '-') {
      e.preventDefault();
      setZoom(cur.zoom - 0.1);
    } else if (e.key === '0') {
      e.preventDefault();
      emit(DEFAULT_FRAME);
    }
  };

  const changed = f.x !== 50 || f.y !== 50 || f.zoom !== 1;

  return (
    <div className="pop-in flex flex-col items-center gap-4 rounded-3xl bg-neutral-50 p-5 ring-1 ring-black/5">
      <p id={hintId} className="max-w-xs text-center text-xs leading-relaxed text-neutral-600">
        Drag the {label} to choose what shows. Use the slider to zoom.
        <span className="hidden lg:inline"> Watch the phone preview update as you move it.</span>
      </p>

      <div
        ref={boxRef}
        role="group"
        tabIndex={0}
        aria-label={`Adjust ${label}: arrow keys move it, plus and minus zoom, 0 resets`}
        aria-describedby={hintId}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          if (!natural.current) return;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* pointer already gone */
          }
          drag.current = { x: e.clientX, y: e.clientY, f: latest.current };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) pan(d.f, e.clientX - d.x, e.clientY - d.y);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className={`relative touch-none select-none overflow-hidden bg-neutral-200 shadow-md ring-1 ring-black/10 ${BOX[shape]} ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <Framed
          src={src}
          kind={kind}
          frame={f}
          onNaturalSize={(w, h) => {
            natural.current = { w, h };
          }}
        />
        {/* rule-of-thirds guide while dragging */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-opacity ${dragging ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage:
              'linear-gradient(to right, transparent 33.2%, rgba(255,255,255,.7) 33.2%, rgba(255,255,255,.7) 33.8%, transparent 33.8%, transparent 66.2%, rgba(255,255,255,.7) 66.2%, rgba(255,255,255,.7) 66.8%, transparent 66.8%), linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,.7) 33.2%, rgba(255,255,255,.7) 33.8%, transparent 33.8%, transparent 66.2%, rgba(255,255,255,.7) 66.2%, rgba(255,255,255,.7) 66.8%, transparent 66.8%)',
          }}
        />
        {shape === 'phone' && (
          <span aria-hidden className="pointer-events-none absolute left-1/2 top-2.5 h-3 w-16 -translate-x-1/2 rounded-full bg-black/55" />
        )}
      </div>

      <div className="flex w-full max-w-xs items-center gap-3">
        <button
          type="button"
          onClick={() => setZoom(f.zoom - 0.25)}
          disabled={f.zoom <= 1}
          aria-label="Zoom out"
          className="btn-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs disabled:opacity-40"
        >
          <FaMagnifyingGlassMinus />
        </button>
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={f.zoom}
          aria-label={`Zoom ${label}`}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[#111]"
        />
        <button
          type="button"
          onClick={() => setZoom(f.zoom + 0.25)}
          disabled={f.zoom >= 4}
          aria-label="Zoom in"
          className="btn-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs disabled:opacity-40"
        >
          <FaMagnifyingGlassPlus />
        </button>
        <span className="w-9 text-right font-mono text-xs text-neutral-600">{f.zoom.toFixed(1)}×</span>
      </div>

      <button
        type="button"
        onClick={() => emit(DEFAULT_FRAME)}
        disabled={!changed}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <FaRotateLeft aria-hidden /> Reset framing
      </button>
    </div>
  );
}
