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

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className={styles['code-block']}>
      <div className={styles['code-lang']}>{lang}</div>
      <pre className={styles['code-pre']}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ComparisonCard({ title, items, variant }: { title: string; items: string[]; variant: 'before' | 'after' }) {
  return (
    <div className={`${styles['compare-card']} ${styles[`compare-card--${variant}`]}`}>
      <div className={styles['compare-card-header']}>
        <span className={styles['compare-card-badge']}>
          {variant === 'before' ? '✗ cobe' : '✓ three-globe'}
        </span>
        <span className={styles['compare-card-title']}>{title}</span>
      </div>
      <ul className={styles['compare-card-list']}>
        {items.map((item, i) => (
          <li key={i} className={styles['compare-card-item']}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function PostContent() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles['hero-globe']}>
          <div className={styles['hero-globe-ring']} />
          <div className={styles['hero-globe-ring']} />
          <div className={styles['hero-globe-ring']} />
          <div className={styles['hero-globe-core']} />
        </div>
        <div className={styles['hero-content']}>
          <div className={styles['hero-badge']}>Frontend</div>
          <h1 className={styles['hero-title']}>
            Why I Replaced{' '}
            <span className={styles['hero-strike']}>cobe</span>{' '}
            with{' '}
            <span className={styles['hero-accent']}>three-globe</span>
          </h1>
          <p className={styles['hero-desc']}>
            cobe looked great in demos but fell apart in production.
            Here is what went wrong and why three-globe was the right call.
          </p>
          <div className={styles['hero-meta']}>
            <span>Jul 19, 2026</span>
            <span className={styles['hero-sep']}>/</span>
            <span>6 min read</span>
          </div>
        </div>
      </header>

      {/* The original choice */}
      <Section>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>01</span>
            The original choice
          </h2>
          <p className={styles['body-text']}>
            cobe is a beautiful library. The demo on their homepage is hypnotic — a glowing
            globe with smooth rotation and a minimal API. It ships as a single canvas element,
            takes a few config options, and just works. For a portfolio site, it seemed like the
            perfect choice: small bundle, zero dependencies, and it looks impressive with almost
            no effort. I integrated it into the Skills section and for about a week everything
            was fine.
          </p>
        </div>
      </Section>

      {/* Where cobe fell apart — comparison */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>02</span>
            Where cobe fell apart
          </h2>
          <div className={styles['compare-grid']}>
            <ComparisonCard
              title="Marker Projection"
              variant="before"
              items={[
                'Renders to 2D canvas only',
                'No access to 3D→screen projection',
                'Required reverse-engineering rotation matrix',
                'Fragile, breaks on resize',
              ]}
            />
            <ComparisonCard
              title="Mobile Performance"
              variant="before"
              items={[
                'Full pixel ratio, no DPI cap',
                'No pause-on-idle support',
                'Battery drain on high-DPI phones',
                'No detail reduction for mobile',
              ]}
            />
            <ComparisonCard
              title="Feature Ceiling"
              variant="before"
              items={[
                'No arcs between markers',
                'No polygon outlines',
                'No per-marker sizing',
                'Dead end for interactivity',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Why three-globe won */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>03</span>
            Why three-globe won
          </h2>
          <p className={styles['body-text']}>
            three-globe is built on Three.js and integrates with React Three Fiber. This means
            a full 3D scene with proper depth, lighting, and camera controls. Marker projection
            becomes trivial with Vector3.project().
          </p>
          <CodeBlock
            lang="typescript"
            code={`// Screen-space projection in three-globe
const pos = new THREE.Vector3(lat, lng, 0);
pos.project(camera);
const x = (pos.x + 1) / 2 * window.innerWidth;
const y = (-pos.y + 1) / 2 * window.innerHeight;`}
          />
          <div className={styles['compare-grid']}>
            <ComparisonCard
              title="Performance"
              variant="after"
              items={[
                'frameloop="demand" — pauses when idle',
                'Lower-poly geometries on mobile',
                'Tree-shaking keeps bundle reasonable',
                '50+ interactive markers at 60fps',
              ]}
            />
            <ComparisonCard
              title="Features"
              variant="after"
              items={[
                'Arcs connecting skill groups',
                'Custom SVG polygons for borders',
                'Per-point sizing and coloring',
                'HTML labels via Vector3.projects()',
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Migration */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>04</span>
            The migration in practice
          </h2>
          <p className={styles['body-text']}>
            The migration took about two days. The hardest part was rebuilding the marker
            overlay system — computing screen positions from lat/lng in the R3F render loop,
            then positioning absolutely-positioned DOM elements over the canvas. I wrote a
            GlobeManager class that handles filter, search, select, and disabled states as
            pure state updates, keeping the R3F component clean.
          </p>
          <div className={styles['timeline']}>
            {[
              { day: 'Day 1', task: 'Rebuild marker overlay system with Vector3.projects()' },
              { day: 'Day 1', task: 'Implement GlobeManager class for state management' },
              { day: 'Day 2', task: 'Add arcs, polygon highlights, and custom marker shapes' },
              { day: 'Day 2', task: 'Mobile optimization and performance tuning' },
            ].map((item, i) => (
              <div key={i} className={styles['timeline-item']}>
                <span className={styles['timeline-day']}>{item.day}</span>
                <span className={styles['timeline-task']}>{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* When to use cobe */}
      <Section delay={0.05}>
        <div className={styles['content-block']}>
          <h2 className={styles['section-title']}>
            <span className={styles['section-prompt']}>05</span>
            When to still use cobe
          </h2>
          <p className={styles['body-text']}>
            cobe is not a bad library. If you need a quick, decorative globe with zero
            interactivity — a hero background, a loading screen, a visual accent — cobe is
            still the fastest path to a good-looking result. The API is simpler, the bundle is
            smaller, and you do not need to understand Three.js at all. But the moment you need
            custom markers, screen-space projection, mobile optimization, or any feature beyond
            &quot;glowing spinning sphere,&quot; you will hit a wall.
          </p>
        </div>
      </Section>
    </div>
  );
}
