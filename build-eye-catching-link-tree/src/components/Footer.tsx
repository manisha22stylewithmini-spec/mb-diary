import { FaLinkedin, FaHeart, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import Logo from './Logo';
import { DESIGNER, LINKEDIN_URL } from '../data/constants';
import { PLATFORMS } from '../data/platforms';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={52} />
          <div>
            <p className="text-sm font-extrabold tracking-tight">
              Link<span className="text-brand">Forest</span>
            </p>
            <p className="text-[11px] text-neutral-500">All your links, growing in one place.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <p className="flex items-center gap-1.5 text-sm text-neutral-600">
            Designed by
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-neutral-900 underline decoration-brand-deep decoration-2 underline-offset-4 transition hover:text-brand-deep"
            >
              Manisha Baroliya
            </a>
            <FaHeart className="text-xs text-brand-purple" aria-hidden />
          </p>
          <nav aria-label={`Contact the designer, ${DESIGNER.name}`} className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
            {DESIGNER.links.map((l) => {
              const p = PLATFORMS[l.platform];
              const Icon = p.icon;
              return (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${p.label} — ${DESIGNER.name}`}
                  aria-label={`${p.label} — ${DESIGNER.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-base transition hover:-translate-y-0.5 hover:bg-neutral-200"
                  style={{ color: p.color }}
                >
                  <Icon aria-hidden />
                </a>
              );
            })}
          </nav>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-md hover:scale-105"
          >
            <FaLinkedin className="text-sm" />
            Contact the designer on LinkedIn
            <FaArrowUpRightFromSquare className="text-[10px] opacity-80 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
      <p className="pb-24 text-center text-[11px] text-neutral-600 lg:pb-6">
        © {new Date().getFullYear()} Link Forest · Made with care for personal use
      </p>
    </footer>
  );
}
