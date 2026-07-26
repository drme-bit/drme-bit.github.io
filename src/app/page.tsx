'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NavLeaf, useNav } from '@/providers/NavProvider';
import useLockOrientation from '@/shared/hooks/useLockOrientation';
import Hero from '@/features/hero/ui/Hero';
import About from '@/features/about/ui/About';
import Experience from '@/features/experience/ui/Experience';
import { Projects } from '@/features/projects/ui/Projects';
import Reviews from '@/features/reviews/ui/Reviews';
import Contacts from '@/features/contacts/ui/Contacts';
import PremiumFooter from '@/widgets/footer/PremiumFooter';
import ScrollProgressBar from '@/shared/ui/molecules/ScrollProgressBar/ScrollProgressBar';

const Scene = dynamic(() => import('@/widgets/scene/Scene'), { ssr: true });
const Skills = dynamic(() => import('@/features/skills/ui/Skills'), { ssr: false });
const Cursor = dynamic(() => import('@/shared/ui/organisms/Cursor/Cursor'), { ssr: false });
const SoundEffects = dynamic(() => import('@/shared/ui/organisms/SoundEffects/SoundEffects'), {
  ssr: false,
});

function MainInner() {
  const { setPageConfig, setActiveSection } = useNav();

  useLockOrientation();

  // Configure nav for home page
  useEffect(() => {
    const contextItems: NavLeaf[] = [
      { id: 'about', label: 'about', type: 'section', targetId: 'about' },
      { id: 'skills', label: 'skills', type: 'section', targetId: 'skills' },
      { id: 'experience', label: 'experience', type: 'section', targetId: 'experience' },
      { id: 'projects', label: 'projects', type: 'section', targetId: 'projects' },
      { id: 'blog', label: 'blog', type: 'section', targetId: 'blog' },
      { id: 'reviews', label: 'reviews', type: 'section', targetId: 'reviews' },
      { id: 'contact', label: 'contact', type: 'section', targetId: 'contact' },
    ];

    const onSectionClick = (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
          if (entry.isIntersecting) setActiveSection(item.id);
        },
        { threshold: 0.4 },
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, [setPageConfig, setActiveSection]);

  return (
    <>
      <Cursor />
      <ScrollProgressBar />

      <Scene />

      <Hero />
      <About />
      <Skills />
      <Experience />

      <div id="projects" className="projects-wrapper">
        <Projects />
      </div>

      <div id="reviews-contacts" className="reviews-contacts-wrapper">
        <Reviews />
        <Contacts />
      </div>
      <PremiumFooter />
    </>
  );
}

export default function MainPage() {
  return (
    <MainInner />
  );
}
