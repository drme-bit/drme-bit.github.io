'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PostContent.module.scss';

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles['section']}${visible ? ` ${styles['is-visible']}` : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function TechStack({ items }: { items: { name: string; role: string }[] }) {
  return (
    <div className={styles['tech-grid']}>
      {items.map((item) => (
        <div key={item.name} className={styles['tech-item']}>
          <span className={styles['tech-name']}>{item.name}</span>
          <span className={styles['tech-role']}>{item.role}</span>
        </div>
      ))}
    </div>
  );
}

export default function PostContent() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles['hero-gradient']} />
        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>Dev</div>
          <h1 className={styles['hero-title']}>
            Building My{' '}
            <span className={styles['hero-accent']}>Portfolio</span>
          </h1>
          <p className={styles['hero-desc']}>
            Decided to build a portfolio site from scratch instead of using templates.
            Here&apos;s what went into it.
          </p>
          <div className={styles['hero-meta']}>
            <span>Jul 16, 2026</span>
            <span className={styles['hero-sep']}>/</span>
            <span>4 min read</span>
          </div>
        </div>
      </header>

      {/* Why from scratch */}
      <Section>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>01</span>
            Why from scratch
          </h2>
          <p className={styles['body-text']}>
            Templates are fast but they all look the same. I wanted something that actually
            feels like mine — the terminal aesthetic, the 3D background, the scroll
            interactions. It took longer, but the result is something I can stand behind.
          </p>
          <div className={styles['callout']}>
            <span className={styles['callout-icon']}>→</span>
            <span className={styles['callout-text']}>
              The goal was not to build the most impressive portfolio — it was to build
              one that actually represents how I think about code.
            </span>
          </div>
        </div>
      </Section>

      {/* Stack choices */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>02</span>
            Stack choices
          </h2>
          <TechStack items={[
            { name: 'React 19 + Next.js 15', role: 'App Router with server components' },
            { name: 'SCSS Modules', role: 'Full control over design tokens, no utility-first' },
            { name: 'Firebase', role: 'Authentication + Firestore for reviews' },
            { name: 'Three.js + three-globe', role: 'Interactive 3D skill globe' },
            { name: 'Lenis', role: 'Buttery smooth scroll' },
            { name: 'Vercel', role: 'Deployment, analytics, edge functions' },
          ]} />
        </div>
      </Section>

      {/* Design tokens */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>03</span>
            Design tokens first
          </h2>
          <p className={styles['body-text']}>
            Started without a design system and paid for it later. Spent hours fixing spacing
            inconsistencies that a proper token setup would have prevented from day one.
            Lesson learned: design tokens first, components second.
          </p>
          <div className={styles['lesson-box']}>
            <div className={styles['lesson-header']}>Key Takeaway</div>
            <p className={styles['lesson-text']}>
              Define your CSS custom properties before writing a single component.
              Colors, spacing, typography, border-radius — all of it goes into
              <code>:root</code> before anything else. You will thank yourself later.
            </p>
          </div>
        </div>
      </Section>

      {/* What I'd do differently */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>04</span>
            What I&apos;d do differently
          </h2>
          <p className={styles['body-text']}>
            If I started over, I would set up the design system and component library first,
            before writing any page-specific code. I would also start with TypeScript from
            day one instead of retrofitting it later. The migration was not painful, but it
            was unnecessary.
          </p>
        </div>
      </Section>
    </div>
  );
}
