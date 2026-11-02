'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { NavLeaf, useNav } from '@/app/providers/NavProvider';
import { useActivity } from '@/app/providers/ActivityProvider';
import Hero from '@/features/hero/ui/Hero';
import About from '@/features/about/ui/About';
import Experience from '@/features/experience/ui/Experience';
import { Projects } from '@/features/projects/ui/Projects';
import { ProjectsPortal } from '@/features/projects/ui/ProjectsPortal';
import Reviews from '@/features/reviews/ui/Reviews';
import Contacts from '@/features/contacts/ui/Contacts';
import PremiumFooter from '@/widgets/footer/PremiumFooter';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';

const Scene = dynamic(() => import('@/widgets/scene/Scene'), { ssr: true });

function MainInner() {
  const { setPageConfig, setActiveSection } = useNav();
  const { incrementSectionsRevealed } = useActivity();
  const revealedSections = useRef(new Set<string>());

  // Configure nav for home page
  useEffect(() => {
    const contextItems: NavLeaf[] = [
      { id: 'about', label: 'about', type: 'section', targetId: 'about' },
      { id: 'experience', label: 'experience', type: 'section', targetId: 'experience' },
      { id: 'projects', label: 'projects', type: 'section', targetId: 'projects' },
      { id: 'blog', label: 'blog', type: 'section', targetId: 'blog' },
      { id: 'reviews', label: 'reviews', type: 'section', targetId: 'reviews' },
      { id: 'contact', label: 'contact', type: 'section', targetId: 'contact' },
    ];

    const onSectionClick = (sectionId: string) => {
      scrollToTarget(`#${sectionId}`);
    };

    setPageConfig({
      contextItems,
      onSectionClick,
    });

    // Active section observer
    const observers = contextItems.map((item) => {
      const el = document.getElementById(item.id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(item.id);
            if (!revealedSections.current.has(item.id)) {
              revealedSections.current.add(item.id);
              incrementSectionsRevealed();
            }
          }
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, [setPageConfig, setActiveSection, incrementSectionsRevealed]);

  return (
    <>
      <main className="relative z-10 pb-[340px] max-[700px]:pb-[300px]">
        <Scene />

        <Hero />

        <About />
        <Experience />

        <ProjectsPortal />

        <div id="projects" className="projects-wrapper">
          <Projects />
        </div>

        <Reviews />
        <Contacts />
        <span id="footer-reveal-trigger" aria-hidden="true" className="pointer-events-none absolute bottom-[340px] h-px w-px max-[700px]:bottom-[300px]" />
      </main>
      <PremiumFooter />
    </>
  );
}

export default function MainPage() {
  return <MainInner />;
}
