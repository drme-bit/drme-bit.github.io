import { useEffect, useRef, useCallback } from 'react';
import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import './Experience.scss';

const ENTRIES = [
  {
    period: '2024 — present',
    role: 'Freelance Roblox Developer',
    org: 'Self-employed',
    desc: 'Developed commission-based games across multiple genres: anime-themed experiences (JoJo, One Piece), an item trading economy game, and the creepypasta horror game "Vault 8166". Built interactive gameplay systems and server-side logic using Luau.',
  },
  {
    period: '2024',
    role: 'Diploma Project — Nexagon',
    org: 'Software Engineering Bachelor',
    desc: 'Created Nexagon, a platform for monitoring and managing game servers. Features real-time tracking, server management tools, and planned hosting integration. Served as the thesis project for my Professional Junior Bachelor degree.',
  },
  {
    period: '2023 — present',
    role: 'Bot Developer',
    org: 'Freelance',
    desc: 'Built custom Telegram and Discord bots for moderation, community management, automation, and game server integration. Focused on reliable, self-hosted solutions using Python and Node.js.',
  },
];

export default function Experience() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();
  const timelineRef = useRef(null);
  const entryRefs = useRef([]);
  const tailRef = useRef(null);
  const headRef = useRef(null);

  const update = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return;

    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const total = rect.height - vh;
    const scrolled = -rect.top;
    const p = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

    if (tailRef.current) tailRef.current.style.height = `${p * 100}%`;
    if (headRef.current) headRef.current.style.top = `${p * 100}%`;

    const threshold = vh * 0.1 + p * vh * 0.8;

    entryRefs.current.forEach((entryEl, i) => {
      if (!entryEl) return;
      const dot = entryEl.querySelector('.tl-dot');
      if (!dot) return;
      const dotRect = dot.getBoundingClientRect();
      if (threshold >= dotRect.top + dotRect.height / 2) {
        entryEl.classList.add('is-visible');
      } else {
        entryEl.classList.remove('is-visible');
      }
    });
  }, []);

  useEffect(() => {
    let rafId;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [update]);

  return (
    <section id="experience" ref={ref} className={`section section--experience reveal${visible ? ' is-visible' : ''}`}>
      <SectionTitle
        title="experience"
        accent=" & background"
        visible={visible}
      />
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>

        <div className="timeline" ref={timelineRef}>
          <div className="timeline-line">
            <span ref={tailRef} className="tl-tail" />
            <span ref={headRef} className="tl-head" />
          </div>

          {ENTRIES.map((e, i) => (
            <div
              key={i}
              ref={el => { entryRefs.current[i] = el; }}
              className={`timeline-entry ${i % 2 === 0 ? 'tl-left' : 'tl-right'}`}
            >
              <span className="tl-dot" />
              <div className="tl-body">
                <span className="tl-period">{e.period}</span>
                <span className="tl-role">{e.role}</span>
                <span className="tl-org">{e.org}</span>
                <p className="tl-desc">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
