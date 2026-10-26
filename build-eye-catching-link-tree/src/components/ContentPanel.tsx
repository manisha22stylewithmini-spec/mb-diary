import { FaUser, FaLink, FaAt } from 'react-icons/fa6';
import type { AppData, Mode } from '../types';
import { MODE_META } from '../data/modes';
import { PLATFORMS } from '../data/platforms';
import { AccordionFrame, AccordionSection, useOpenSection } from './Accordion';
import ProfileSection from './ProfileSection';
import LinksSection from './LinksSection';
import SocialsSection from './SocialsSection';

interface Props {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  mode: Mode;
}

const SECTIONS = ['profile', 'links', 'socials'] as const;

/** Profile, Links and Social icons in one frame — one open at a time, so the page never grows long. */
export default function ContentPanel({ data, setData, mode }: Props) {
  const [open, toggle] = useOpenSection('lf-content-open', SECTIONS, 'links');
  const meta = MODE_META[mode];
  const live = data.links.filter(
    (l) => l.enabled && l.title.trim() && (l.audience === 'both' || l.audience === mode),
  ).length;
  const socials = data.socials;

  return (
    <AccordionFrame>
      <AccordionSection
        id="profile"
        icon={<FaUser />}
        title="Profile"
        summary={[data.profile.name, data.profile.handle].filter(Boolean).join(' · ') || 'Add your name'}
        open={open === 'profile'}
        onToggle={() => toggle('profile')}
      >
        <ProfileSection data={data} setData={setData} mode={mode} />
      </AccordionSection>

      <AccordionSection
        id="links"
        icon={<FaLink />}
        title="Links"
        summary={`${data.links.length} link${data.links.length === 1 ? '' : 's'} · ${live} showing on ${meta.label}`}
        open={open === 'links'}
        onToggle={() => toggle('links')}
      >
        <LinksSection data={data} setData={setData} mode={mode} />
      </AccordionSection>

      <AccordionSection
        id="socials"
        icon={<FaAt />}
        title="Social icons"
        summary={
          socials.length === 0 ? (
            'None yet'
          ) : (
            <span className="inline-flex items-center gap-1.5 align-middle">
              {socials.slice(0, 7).map((s) => {
                const p = PLATFORMS[s.platform] ?? PLATFORMS.website;
                const Icon = p.icon;
                return <Icon key={s.id} aria-hidden style={{ color: p.color }} />;
              })}
              <span className="ml-1">{socials.length} added</span>
            </span>
          )
        }
        open={open === 'socials'}
        onToggle={() => toggle('socials')}
      >
        <SocialsSection data={data} setData={setData} />
      </AccordionSection>
    </AccordionFrame>
  );
}
