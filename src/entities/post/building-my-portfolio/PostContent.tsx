'use client';

import {
  Article,
  Section,
  H2,
  P,
  C,
  Callout,
  Grid2,
  MiniCard,
} from '../ui/Article';

export default function PostContent() {
  return (
    <Article>
      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="01">Why from scratch</H2>
          <P>
            Templates are fast but they all look the same. I wanted something that actually
            feels like mine — the terminal aesthetic, the 3D background, the scroll
            interactions. It took longer, but the result is something I can stand behind.
          </P>
          <Callout tone="tip" label="Goal">
            The goal was not to build the most impressive portfolio — it was to build
            one that actually represents how I think about code.
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="02">Stack choices</H2>
          <Grid2>
            {[
              { title: 'React 19 + Next.js 15', desc: 'App Router with server components' },
              { title: 'SCSS Modules', desc: 'Full control over design tokens, no utility-first' },
              { title: 'Firebase', desc: 'Authentication + Firestore for reviews' },
              { title: 'Three.js + three-globe', desc: 'Interactive 3D skill globe' },
              { title: 'Lenis', desc: 'Buttery smooth scroll' },
              { title: 'Vercel', desc: 'Deployment, analytics, edge functions' },
            ].map((item) => (
              <MiniCard key={item.title} title={item.title} desc={item.desc} />
            ))}
          </Grid2>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="03">Design tokens first</H2>
          <P>
            Started without a design system and paid for it later. Spent hours fixing spacing
            inconsistencies that a proper token setup would have prevented from day one.
            Lesson learned: design tokens first, components second.
          </P>
          <Callout tone="info" label="Key takeaway">
            Define your CSS custom properties before writing a single component.
            Colors, spacing, typography, border-radius — all of it goes into <C>:root</C> before
            anything else. You will thank yourself later.
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2 index="04">What I&apos;d do differently</H2>
          <P>
            If I started over, I would set up the design system and component library first,
            before writing any page-specific code. I would also start with TypeScript from
            day one instead of retrofitting it later. The migration was not painful, but it
            was unnecessary.
          </P>
        </div>
      </Section>
    </Article>
  );
}
