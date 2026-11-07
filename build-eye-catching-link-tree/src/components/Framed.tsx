import type { CSSProperties } from 'react';
import type { Frame } from '../types';

export const DEFAULT_FRAME: Frame = { x: 50, y: 50, zoom: 1 };

interface Props {
  src: string;
  kind?: 'image' | 'video';
  frame?: Frame;
  alt?: string;
  className?: string;
  /** applied to the clipping box (e.g. a blur filter) */
  style?: CSSProperties;
  onNaturalSize?: (w: number, h: number) => void;
}

/**
 * Shows an image or video inside its parent, filling it, with the owner's chosen framing.
 *
 * x / y (0–100) say how far the picture is slid along the spare room it has, exactly like
 * CSS object-position; zoom (≥ 1) enlarges it. The maths lives in one place, so the editor,
 * the phone preview and the live page always crop identically.
 * The parent must be `relative` with a definite size.
 */
export default function Framed({ src, kind = 'image', frame, alt = '', className = '', style, onNaturalSize }: Props) {
  const f = frame ?? DEFAULT_FRAME;
  const z = Math.max(1, f.zoom);
  const inner: CSSProperties = {
    position: 'absolute',
    width: `${z * 100}%`,
    height: `${z * 100}%`,
    left: `${-(z - 1) * f.x}%`,
    top: `${-(z - 1) * f.y}%`,
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'cover',
    objectPosition: `${f.x}% ${f.y}%`,
    userSelect: 'none',
  };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={style}>
      {kind === 'video' ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          style={inner}
          onLoadedMetadata={(e) => onNaturalSize?.(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          decoding="async"
          draggable={false}
          style={inner}
          onLoad={(e) => onNaturalSize?.(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
        />
      )}
    </div>
  );
}
