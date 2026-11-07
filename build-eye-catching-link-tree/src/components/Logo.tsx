interface Props {
  size?: number;
}

/** The site logo: Manisha Baroliya's own mark (public/logo.png). */
export default function Logo({ size = 36 }: Props) {
  return (
    <img
      src="/logo.png"
      alt="Manisha Baroliya logo"
      width={size}
      height={size}
      decoding="async"
      className="rounded-full bg-white object-cover shadow-sm ring-1 ring-black/10"
      style={{ width: size, height: size }}
    />
  );
}
