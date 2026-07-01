import { useState, useEffect, useCallback } from 'react';
import Scene from '../../components/Scene';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Skills from './sections/Skills/Skills';
import Experience from './sections/Experience/Experience';
import Projects from './sections/Projects/Projects';
import Contacts from './sections/Contacts/Contacts';
import Outro from './sections/Outro/Outro';
import GitHubStatus from '../../components/ui/GitHubStatus/GitHubStatus';
import Navbar from '../../components/layout/navbar/Navbar';
import DrawerMenu from '../../components/layout/DrawerMenu/DrawerMenu';
import BootScreen from '../../components/ui/BootScreen/BootScreen';
import CustomCursor from '../../components/ui/CustomCursor/CustomCursor';
import CursorTrail from '../../components/ui/CursorTrail/CursorTrail';
import ScrollProgressBar from '../../components/ui/ScrollProgressBar/ScrollProgressBar';
import SearchBar from '../../components/ui/SearchBar/SearchBar';
import Mascot, { getMockMessage } from '../../components/ui/Mascot/Mascot';
import Archive from '../../components/ui/Archive/Archive';
import BackToTop from '../../components/ui/BackToTop/BackToTop';
import SoundEffects from '../../components/ui/SoundEffects/SoundEffects';
import ErrorMessages from '../../components/ui/ErrorMessages/ErrorMessages';

const SECTIONS = ['hero', 'about', 'skills', 'experience', 'projects', 'contact'];

export default function Main() {
  const [booted, setBooted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
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

  useEffect(() => {
    if (!booted) return;
    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [booted]);

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />
      {booted && (
        <>
          <ScrollProgressBar />
          <GitHubStatus />
          <Scene />
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Contacts />
          <Navbar onArchive={() => setArchiveOpen(true)} />
          <SearchBar onSearch={handleSearch} />
          <Mascot userMessage={mascotMessage} searchCount={searchCount} onDone={handleMascotDone} />
          <DrawerMenu
            activePage={activeSection}
            open={drawerOpen}
            onToggle={() => setDrawerOpen((v) => !v)}
            onClose={() => setDrawerOpen(false)}
            onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            onArchive={() => { setDrawerOpen(false); setArchiveOpen(true); }}
          />
          <ErrorMessages />
          <CustomCursor />
          <CursorTrail />
          <BackToTop />
          <SoundEffects />
          <Outro />
          {archiveOpen && <Archive onClose={() => setArchiveOpen(false)} />}
        </>
      )}
    </>
  );
}
