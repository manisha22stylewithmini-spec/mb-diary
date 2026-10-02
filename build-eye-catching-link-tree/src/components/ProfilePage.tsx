import type { CSSProperties } from 'react';
import { FaArrowUpRightFromSquare, FaLinkedin } from 'react-icons/fa6';
import { LINKEDIN_URL } from './Footer';
import type { AppData, LinkItem } from '../types';
import { FONTS, linkStyle, resolveTheme } from '../data/themes';
import { PLATFORMS, detectPlatform, normalizeUrl } from '../data/platforms';

interface Props {
  data: AppData;
  onOpen?: (link: LinkItem) => void;
}

export default function ProfilePage({ data, onOpen }: Props) {
  const { profile, links, socials, design } = data;
  const theme = resolveTheme(design);
  const bg = design.background;
  const hasMedia = bg.kind !== 'theme' && !!bg.src.trim();
  const font = FONTS.find((f) => f.id === design.font) ?? FONTS[0];
  const visible = links.filter((l) => l.enabled && l.title.trim());
  const initials =
    profile.name
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  const rootStyle = {
    background: theme.bg,
    color: theme.text,
    fontFamily: font.css,
    '--accent': theme.accent,
  } as CSSProperties;

  const mediaFilter = `blur(${bg.blur}px) ${bg.grayscale ? 'grayscale(1)' : ''}`;
  const socialBg = theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.7)';

  return (
    <div
      className={`relative min-h-full w-full overflow-hidden ${theme.animated && !hasMedia ? 'bg-animated' : ''}`}
      style={rootStyle}
    >
      {/* Custom background media */}
      {hasMedia && (
        <div className="absolute inset-0 overflow-hidden">
          {bg.kind === 'video' ? (
            <video
              key={bg.src}
              src={bg.src}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full scale-110 object-cover"
              style={{ filter: mediaFilter }}
            />
          ) : (
            <img
              src={bg.src}
              alt=""
              className="h-full w-full scale-110 object-cover"
              style={{ filter: mediaFilter }}
            />
          )}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${bg.dim / 100})` }} />
        </div>
      )}

      {/* floating blobs (only on pure themes) */}
      {!hasMedia && (
        <>
          <div className="blob" style={{ width: 240, height: 240, top: -60, left: -80, background: theme.accent }} />
          <div
            className="blob"
            style={{ width: 280, height: 280, bottom: 40, right: -100, background: '#ff3d81', animationDelay: '-4s' }}
          />
        </>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10 pt-12">
        {/* Avatar */}
        <div className="fade-up relative" style={{ animationDelay: '0ms' }}>
          <div className="avatar-ring absolute -inset-1.5 rounded-full blur-[1px]" />
          <div
            className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 text-3xl font-bold"
            style={{
              borderColor: theme.dark ? 'rgba(0,0,0,0.25)' : '#fff',
              background: theme.btnBg,
              color: theme.btnText,
            }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        <h1 className="fade-up mt-5 text-center text-2xl font-bold tracking-tight" style={{ animationDelay: '80ms' }}>
          {profile.name || 'Your Name'}
        </h1>
        {profile.handle && (
          <p className="fade-up mt-0.5 text-sm font-medium opacity-75" style={{ animationDelay: '120ms' }}>
            {profile.handle}
          </p>
        )}
        {profile.bio && (
          <p
            className="fade-up mt-3 max-w-xs whitespace-pre-line text-center text-sm leading-relaxed opacity-90"
            style={{ animationDelay: '160ms' }}
          >
            {profile.bio}
          </p>
        )}

        {/* Socials */}
        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {socials
              .filter((s) => s.url.trim())
              .map((s, i) => {
                const p = PLATFORMS[s.platform] ?? PLATFORMS.website;
                const Icon = p.icon;
                return (
                  <a
                    key={s.id}
                    href={normalizeUrl(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.label}
                    aria-label={p.label}
                    className="social-btn fade-up flex h-11 w-11 items-center justify-center rounded-full text-lg"
                    style={{
                      animationDelay: `${220 + i * 60}ms`,
                      background: socialBg,
                      color: theme.text,
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <Icon />
                  </a>
                );
              })}
          </div>
        )}

        {/* Links */}
        <div className="mt-7 flex w-full flex-col gap-3.5">
          {visible.length === 0 && (
            <p className="text-center text-sm opacity-70">No links yet — add some in the editor ✨</p>
          )}
          {visible.map((l, i) => {
            const Icon = PLATFORMS[detectPlatform(l.url)].icon;
            const radius = (linkStyle(theme, design, l).borderRadius as string) ?? '9999px';
            return (
              <div key={l.id} className="fade-up" style={{ animationDelay: `${350 + i * 90}ms` }}>
                <a
                  href={normalizeUrl(l.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onOpen?.(l)}
                  className={`link-btn flex w-full items-center gap-3 py-2.5 pl-2.5 pr-5 text-[15px] font-semibold ${
                    l.animation !== 'none' ? `anim-${l.animation}` : ''
                  }`}
                  style={linkStyle(theme, design, l)}
                >
                  {l.image ? (
                    <img
                      src={l.image}
                      alt=""
                      className="h-11 w-11 shrink-0 object-cover"
                      style={{ borderRadius: radius === '9999px' ? '9999px' : '12px' }}
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center text-xl">
                      {l.emoji ? l.emoji : <Icon />}
                    </span>
                  )}
                  <span className="flex-1 text-center">{l.title}</span>
                  <FaArrowUpRightFromSquare className="shrink-0 text-xs opacity-50" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Signature */}
        <div
          className="mt-10 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur"
          style={{
            background: theme.dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
            color: theme.text,
          }}
        >
          <span style={{ color: theme.accent }}>✦</span>
          {profile.name || 'My'} · Link Forest
        </div>
        <p className="mt-3 text-[11px] opacity-70">
          Designed by{' '}
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 transition hover:opacity-100"
            style={{ color: theme.accent }}
          >
            Manisha Baroliya
          </a>{' '}
          💜
        </p>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn mt-2 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur"
          style={{
            background: theme.dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.6)',
            color: theme.text,
          }}
        >
          <FaLinkedin /> Know me more
        </a>
      </div>
    </div>
  );
}
