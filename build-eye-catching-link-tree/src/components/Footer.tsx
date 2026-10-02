import { FaLinkedin, FaHeart, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import Logo from './Logo';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/manisha-baroliya-488016265/';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-purple-50 ring-1 ring-black/5">
            <Logo size={24} />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight">
              Link<span className="text-[#19c37d]">Forest</span>
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
              className="font-bold text-neutral-900 underline decoration-[#19c37d] decoration-2 underline-offset-4 transition hover:text-[#19c37d]"
            >
              Manisha Baroliya
            </a>
            <FaHeart className="text-xs text-[#ff3d81]" />
          </p>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0A66C2] to-[#1769ff] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:scale-105"
          >
            <FaLinkedin className="text-sm" />
            Know me more on LinkedIn
            <FaArrowUpRightFromSquare className="text-[10px] opacity-80 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
      <p className="pb-24 text-center text-[11px] text-neutral-400 lg:pb-6">
        © {new Date().getFullYear()} Link Forest · Made with care for personal use
      </p>
    </footer>
  );
}
