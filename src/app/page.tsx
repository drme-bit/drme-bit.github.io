'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SceneProvider, useScene } from '@/providers/SceneProvider';
import { NavLeaf, useNav } from '@/providers/NavProvider';
import useLockOrientation from '@/shared/hooks/useLockOrientation';
import Hero from '@/features/hero/ui/Hero';
import About from '@/features/about/ui/About';
import Experience from '@/features/experience/ui/Experience';
import Blog from '@/features/blog/ui/Blog';
import Reviews from '@/features/reviews/ui/Reviews';
import Contacts from '@/features/contacts/ui/Contacts';
import Footer from '@/widgets/footer/Footer';
import ScrollProgressBar from '@/shared/ui/molecules/ScrollProgressBar/ScrollProgressBar';
import SearchBar from '@/shared/ui/molecules/SearchBar/SearchBar';
import ChangeTheme from '@/shared/ui/molecules/ChangeTheme/ChangeTheme';
import Mascot, { getMockMessage } from '@/widgets/mascot/Mascot';

const Scene = dynamic(() => import('@/widgets/scene/Scene'), { ssr: false });
const Skills = dynamic(() => import('@/features/skills/ui/Skills'), { ssr: false });
const Projects = dynamic(() => import('@/features/projects/ui/Projects'), { ssr: false });
const Archive = dynamic(() => import('@/widgets/archive/Archive'), { ssr: false });
const Cursor = dynamic(() => import('@/shared/ui/organisms/Cursor/Cursor'), { ssr: false });
const SoundEffects = dynamic(() => import('@/shared/ui/organisms/SoundEffects/SoundEffects'), {
  ssr: false,
});

function MainInner() {
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const { setSceneNode } = useScene();
  const { setPageConfig, setActiveSection } = useNav();

  const sceneRef = useCallback(
    (node: HTMLElement | null) => {
      setSceneNode(node);
    },
    [setSceneNode],
  );

  useLockOrientation();

  const handleSearch = useCallback(() => {
    setSearchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (searchCount > 0) setMascotMessage(getMockMessage(searchCount));
  }, [searchCount]);

  const handleMascotDone = useCallback(() => {
    setMascotMessage(null);
  }, []);

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

      <div ref={sceneRef}>
        <Scene />
      </div>

      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Blog />
      <Reviews />
      <Contacts />

      <button className="archive-fab" onClick={() => setArchiveOpen(true)} title="archive">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      </button>

      <SearchBar onSearch={handleSearch} />
      <ChangeTheme />
      <Mascot userMessage={mascotMessage ?? undefined} onDone={handleMascotDone} />
      <SoundEffects />
      <Footer />

      {archiveOpen && <Archive onClose={() => setArchiveOpen(false)} />}
    </>
  );
}

export default function MainPage() {
  return (
    <SceneProvider>
      <MainInner />
    </SceneProvider>
  );
}
