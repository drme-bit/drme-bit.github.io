'use client';

import CodeBlock from '@/shared/ui/CodeBlock/CodeBlock';
import {
  Article,
  Section,
  H2,
  P,
  Grid2,
  CompareCard,
} from '../ui/Article';

export default function PostContent() {
  return (
    <Article>
      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="01">The original choice</H2>
          <P>
            cobe is a beautiful library. The demo on their homepage is hypnotic — a glowing
            globe with smooth rotation and a minimal API. It ships as a single canvas element,
            takes a few config options, and just works. For a portfolio site, it seemed like the
            perfect choice: small bundle, zero dependencies, and it looks impressive with almost
            no effort. I integrated it into the Skills section and for about a week everything
            was fine.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="02">Where cobe fell apart</H2>
          <Grid2>
            <CompareCard
              title="Marker Projection"
              variant="before"
              items={[
                'Renders to 2D canvas only',
                'No access to 3D→screen projection',
                'Required reverse-engineering rotation matrix',
                'Fragile, breaks on resize',
              ]}
            />
            <CompareCard
              title="Mobile Performance"
              variant="before"
              items={[
                'Full pixel ratio, no DPI cap',
                'No pause-on-idle support',
                'Battery drain on high-DPI phones',
                'No detail reduction for mobile',
              ]}
            />
            <CompareCard
              title="Feature Ceiling"
              variant="before"
              items={[
                'No arcs between markers',
                'No polygon outlines',
                'No per-marker sizing',
                'Dead end for interactivity',
              ]}
            />
          </Grid2>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="03">Why three-globe won</H2>
          <P>
            three-globe is built on Three.js and integrates with React Three Fiber. This means
            a full 3D scene with proper depth, lighting, and camera controls. Marker projection
            becomes trivial with Vector3.project().
          </P>
          <CodeBlock
            lang="typescript"
            code={`// Screen-space projection in three-globe
const pos = new THREE.Vector3(lat, lng, 0);
pos.project(camera);
const x = (pos.x + 1) / 2 * window.innerWidth;
const y = (-pos.y + 1) / 2 * window.innerHeight;`}
          />
          <Grid2>
            <CompareCard
              title="Performance"
              variant="after"
              items={[
                'frameloop="demand" — pauses when idle',
                'Lower-poly geometries on mobile',
                'Tree-shaking keeps bundle reasonable',
                '50+ interactive markers at 60fps',
              ]}
            />
            <CompareCard
              title="Features"
              variant="after"
              items={[
                'Arcs connecting skill groups',
                'Custom SVG polygons for borders',
                'Per-point sizing and coloring',
                'HTML labels via Vector3.projects()',
              ]}
            />
          </Grid2>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="04">The migration in practice</H2>
          <P>
            The migration took about two days. The hardest part was rebuilding the marker
            overlay system — computing screen positions from lat/lng in the R3F render loop,
            then positioning absolutely-positioned DOM elements over the canvas. I wrote a
            GlobeManager class that handles filter, search, select, and disabled states as
            pure state updates, keeping the R3F component clean.
          </P>
          <div className="flex flex-col rounded-[var(--radius-md)] border border-[var(--border)]">
            {[
              { day: 'Day 1', task: 'Rebuild marker overlay system with Vector3.projects()' },
              { day: 'Day 1', task: 'Implement GlobeManager class for state management' },
              { day: 'Day 2', task: 'Add arcs, polygon highlights, and custom marker shapes' },
              { day: 'Day 2', task: 'Mobile optimization and performance tuning' },
            ].map((item, i, arr) => (
              <div
                key={i}
                className={`flex items-baseline gap-3 px-3.5 py-2.5 ${i > 0 ? 'border-t border-[var(--border)]' : ''} ${i === 0 ? 'rounded-t-[var(--radius-md)]' : ''} ${i === arr.length - 1 ? 'rounded-b-[var(--radius-md)]' : ''}`}
              >
                <span className="shrink-0 font-mono text-[0.64rem] text-[var(--accent-secondary)]">{item.day}</span>
                <span className="text-[0.82rem] text-[var(--text-secondary)]">{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="05">When to still use cobe</H2>
          <P>
            cobe is not a bad library. If you need a quick, decorative globe with zero
            interactivity — a hero background, a loading screen, a visual accent — cobe is
            still the fastest path to a good-looking result. The API is simpler, the bundle is
            smaller, and you do not need to understand Three.js at all. But the moment you need
            custom markers, screen-space projection, mobile optimization, or any feature beyond
            &quot;glowing spinning sphere,&quot; you will hit a wall.
          </P>
        </div>
      </Section>
    </Article>
  );
}
