import { useState, useEffect, useCallback } from 'react';
import Scene from '@/components/Scene';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Skills from './sections/Skills/Skills';
import Experience from './sections/Experience/Experience';
import Projects from './sections/Projects/Projects';
import Blog from './sections/Blog/Blog';
import Reviews from './sections/Reviews/Reviews';
import Contacts from './sections/Contacts/Contacts';
import GitHubStatus from '@/components/ui/GitHubStatus/GitHubStatus';
import Navbar from '@/components/layout/navbar/Navbar';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar/ScrollProgressBar';
import SearchBar from '@/components/ui/SearchBar/SearchBar';
import Mascot, { getMockMessage } from '@/components/ui/Mascot/Mascot';
import Archive from '@/components/ui/Archive/Archive';

import SoundEffects from '@/components/ui/SoundEffects/SoundEffects';
import Cursor from '@/components/ui/Cursor/Cursor';
import ChangeTheme from '@/components/ui/ChangeTheme/ChangeTheme.jsx';

export default function Main() {
  const [mascotMessage, setMascotMessage] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [archiveOpen, setArchiveOpen] = useState(false);

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
      <Scene />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Blog />
      <Reviews />
      <Contacts />
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
      {archiveOpen && <Archive onClose={() => setArchiveOpen(false)} />}
    </>
  );
}
