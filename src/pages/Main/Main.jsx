import { useState, useEffect } from 'react';
import Scene from '../../components/Scene';
import Hero from './sections/heroSection/Hero';
import About from './sections/aboutSection/About';
import Skills from './sections/skillsSection/Skills';
import Experience from './sections/experienceSection/Experience';
import Projects from './sections/projectsSection/Projects';
import Contacts from './sections/contactsSection/Contacts';
import GitHubStatus from '../../components/ui/GitHubStatus';
import Navbar from '../../components/layout/navbar/Navbar';
import DrawerMenu from '../../components/layout/DrawerMenu/DrawerMenu';
import BootScreen from '../../components/ui/BootScreen';
import CustomCursor from '../../components/ui/CustomCursor';
import CursorTrail from '../../components/ui/CursorTrail';
import ScrollProgressBar from '../../components/ui/ScrollProgressBar';
import BackToTop from '../../components/ui/BackToTop';
import SoundEffects from '../../components/ui/SoundEffects';
import ErrorMessages from '../../components/ui/ErrorMessages';

const SECTIONS = ['hero', 'about', 'skills', 'experience', 'work', 'contact'];

function useActiveSection() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);
  return active;
}

export default function Main() {
  const [booted, setBooted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeSection = useActiveSection();

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
