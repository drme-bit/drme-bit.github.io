'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SceneProvider, useScene } from '@/providers/SceneProvider';
import { useNav } from '@/providers/NavProvider';
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

const Scene = dynamic(() => import('@/widgets/scene/Scene'), {
  ssr: false,
  loading: () => null,
});
const Skills = dynamic(() => import('@/features/skills/ui/Skills'), {
  ssr: false,
  loading: () => null,
});
const Projects = dynamic(() => import('@/features/projects/ui/Projects'), {
  ssr: false,
  loading: () => null,
});
const Archive = dynamic(() => import('@/widgets/archive/Archive'), {
  ssr: false,
});
const Cursor = dynamic(() => import('@/shared/ui/organisms/Cursor/Cursor'), {
  ssr: false,
});
const SoundEffects = dynamic(
  () => import('@/shared/ui/organisms/SoundEffects/SoundEffects'),
  { ssr: false },
);

function MainInner() {
  const [mascotMessage, setMascotMessage] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { setSceneNode } = useScene();
  const { setConfig, setActiveSection } = useNav();

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

  // Configure nav with home page sections
  useEffect(() => {
    const sections = [
      { id: 'about', label: 'about' },
      { id: 'skills', label: 'skills' },
      { id: 'experience', label: 'experience' },
      { id: 'projects', label: 'projects' },
      { id: 'reviews', label: 'reviews' },
      { id: 'contact', label: 'contact' },
    ];

    const onSectionClick = (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    setConfig({ sections, onSectionClick });

    // Observe sections for active state
    const observers = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(s.id);
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [setConfig, setActiveSection]);

  return (
    <>
      <Cursor />
      <ScrollProgressBar />
      <div
        ref={sceneRef}
        style={{
          opacity: 1,
          transition: 'opacity 0.05s linear',
          willChange: 'opacity',
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>
      <Hero />
      <About />
      <Suspense fallback={null}>
        <Skills />
      </Suspense>
      <Experience />
      <Suspense fallback={null}>
        <Projects />
      </Suspense>
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
      <Mascot
        userMessage={mascotMessage ?? undefined}
        searchCount={searchCount}
        onDone={handleMascotDone}
      />
      <SoundEffects />
      <Footer />
      {archiveOpen && (
        <Suspense fallback={null}>
          <Archive onClose={() => setArchiveOpen(false)} />
        </Suspense>
      )}
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
