import type { ReactNode } from 'react';

/** The big, quiet white card every editing area lives in. */
export default function PanelFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby="panel-title"
      className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-black/[0.04] sm:p-8"
    >
      <header className="mb-3 px-1 sm:mb-4">
        <h1 id="panel-title" className="text-[28px] font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
