import { useState } from 'react';
import Scene from '../../components/Scene';
import Hero from './Hero';
import About from './About';
import GitHubStatus from '../../components/ui/GitHubStatus';
import Navbar from '../../components/layout/navbar/Navbar';
import MusicPlayer from '../../components/layout/musicPlayer/MusicPlayer';
import BootScreen from '../../components/ui/BootScreen';

export default function Main() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      <BootScreen onComplete={() => setBooted(true)} />
      {booted && (
        <>
          // GitHub status indicator
          <GitHubStatus />
          // 3D scene with interactive elements
          <Scene />
          // Hero section with parallax effect and typing animation
          <Hero />
          // About section with personal information and skills
          <About />
          // TODO: Add a Projects section with a list of projects and links to their repositories
          <div id="work" className="scroll-zone" />
          <div id="contact" className="scroll-zone" />
          <Navbar />
          <MusicPlayer />
        </>
      )}
    </>
  );
}
