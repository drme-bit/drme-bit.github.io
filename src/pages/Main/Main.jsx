import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { SceneProvider, useScene } from '@/contexts/SceneContext';
import useLockOrientation from '@/hooks/useLockOrientation';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Experience from './sections/Experience/Experience';
import Blog from './sections/Blog/Blog';
import Reviews from './sections/Reviews/Reviews';
import Contacts from './sections/Contacts/Contacts';
import Footer from '@/components/layout/Footer/Footer';
import GitHubStatus from '@/components/ui/GitHubStatus/GitHubStatus';
import Navbar from '@/components/layout/navbar/Navbar';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar/ScrollProgressBar';
import SearchBar from '@/components/ui/SearchBar/SearchBar';
import Mascot, { getMockMessage } from '@/components/ui/Mascot/Mascot';
import SoundEffects from '@/components/ui/SoundEffects/SoundEffects';
import Cursor from '@/components/ui/Cursor/Cursor';
import ChangeTheme from '@/components/ui/ChangeTheme/ChangeTheme.jsx';

const Scene = lazy(() => import('@/components/Scene'));
const Skills = lazy(() => import('./sections/Skills/Skills'));
const Projects = lazy(() => import('./sections/Projects/Projects'));
const Archive = lazy(() => import('@/components/ui/Archive/Archive'));

function MainInner() {
  const [mascotMessage, setMascotMessage] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { sceneOpacity } = useScene();
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

  return (
    <>
      <Cursor />
      <ScrollProgressBar />
      <GitHubStatus />
      <div
        style={{
          opacity: sceneOpacity,
          visibility: sceneOpacity < 0.01 ? 'hidden' : 'visible',
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
      <Footer />
      <Navbar />
      <button className="archive-fab" onClick={() => setArchiveOpen(true)} title="archive">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      </button>
      <SearchBar onSearch={handleSearch} />
      <ChangeTheme />
      <Mascot userMessage={mascotMessage} searchCount={searchCount} onDone={handleMascotDone} />

      <SoundEffects />
      {archiveOpen && (
        <Suspense fallback={null}>
          <Archive onClose={() => setArchiveOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

export default function Main() {
  return (
    <SceneProvider>
      <MainInner />
    </SceneProvider>
  );
}
