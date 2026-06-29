import { useState, useEffect } from 'react';
import Scene from '../../components/Scene';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Skills from './sections/Skills/Skills';
import Experience from './sections/Experience/Experience';
import Projects from './sections/Projects/Projects';
import Contacts from './sections/Contacts/Contacts';
import GitHubStatus from '../../components/ui/GitHubStatus/GitHubStatus';
import Navbar from '../../components/layout/navbar/Navbar';
import DrawerMenu from '../../components/layout/DrawerMenu/DrawerMenu';
import BootScreen from '../../components/ui/BootScreen/BootScreen';
import CustomCursor from '../../components/ui/CustomCursor/CustomCursor';
import CursorTrail from '../../components/ui/CursorTrail/CursorTrail';
import ScrollProgressBar from '../../components/ui/ScrollProgressBar/ScrollProgressBar';
import BackToTop from '../../components/ui/BackToTop/BackToTop';
import SoundEffects from '../../components/ui/SoundEffects/SoundEffects';
import ErrorMessages from '../../components/ui/ErrorMessages/ErrorMessages';

const SECTIONS = ['hero', 'about', 'skills', 'experience', 'work', 'contact'];

export default function Main() {
  const [booted, setBooted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

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
          <Navbar />
          <DrawerMenu
            activePage={activeSection}
            open={drawerOpen}
            onToggle={() => setDrawerOpen((v) => !v)}
            onClose={() => setDrawerOpen(false)}
            onNavigate={(id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          />
          <ErrorMessages />
          <CustomCursor />
          <CursorTrail />
          <BackToTop />
          <SoundEffects />
        </>
      )}
    </>
  );
}
