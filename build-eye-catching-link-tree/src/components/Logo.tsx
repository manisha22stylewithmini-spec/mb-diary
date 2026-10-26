interface Props {
  size?: number;
  /** single colour instead of the gradient (used on coloured backgrounds) */
  mono?: string;
}

/** Original "Link Forest" mark: three linked leaves growing from a trunk. */
export default function Logo({ size = 36, mono }: Props) {
  const gid = 'lf-grad';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Link Forest logo">
      <defs>
        <linearGradient id={gid} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#19c37d" />
          <stop offset="0.5" stopColor="#00b3a4" />
          <stop offset="1" stopColor="#8129d9" />
        </linearGradient>
      </defs>
      <g stroke={mono ?? `url(#${gid})`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* trunk */}
        <path d="M24 44V20" />
        {/* lower branches */}
        <path d="M24 31l-9-6M24 31l9-6" />
        {/* canopy leaves */}
        <path d="M24 20c-5.5 0-9-3.8-9-8.4C15 7 18.7 4 24 4s9 3 9 7.6C33 16.2 29.5 20 24 20z" />
        <path d="M15 25c-4.2 0-7-2.6-7-6s2.8-5.6 6.4-5.6" />
        <path d="M33 25c4.2 0 7-2.6 7-6s-2.8-5.6-6.4-5.6" />
      </g>
      <circle cx="24" cy="12" r="2.6" fill={mono ?? `url(#${gid})`} />
    </svg>
  );
}
