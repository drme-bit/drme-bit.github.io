import { useState, useEffect } from 'react';
import useReveal from '@/hooks/useReveal';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import Features from '@/components/ui/Features/Features';
import aboutData from '@/data/aboutData';
import './About.scss';

function useTypewriter(texts, speed = 60, pause = 2000) {
  const [display, setDisplay] = useState('');
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timer;

    if (!isDeleting && charIndex < current.length) {
      timer = setTimeout(() => {
        setDisplay(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, speed);
    } else if (!isDeleting && charIndex === current.length) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setDisplay(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, speed / 2);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setIndex((index + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, index, texts, speed, pause]);

  return display;
}

const TERMINAL_LINES = [
  { prompt: '~', cmd: 'cat intro.txt', delay: 0 },
  { prompt: '~', cmd: 'echo $PASSION', delay: 400 },
  { prompt: '~', cmd: 'cat /dev/brain | grep ideas', delay: 800 },
];

export default function About() {
  const [ref, visible] = useReveal();
  const [terminalLine, setTerminalLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const typewriterText = useTypewriter([
    'building elegant solutions',
    'writing clean code',
    'exploring new technologies',
    'solving complex problems',
  ]);

  useEffect(() => {
    if (!visible) return;
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setTerminalLine(i + 1), line.delay + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      className={`section section--about reveal${visible ? ' is-visible' : ''}`}
    >
      <SectionTitle
        title="about"
        accent="_"
        visible={visible}
      />

      <div className="about-layout">
        {/* ── Photo Column ── */}
        <div className="about-photo-col">
          <img
            src="/images/17969af76asf9y986ad9fy.jpg"
            alt="Viacheslav"
            className="about-photo-img"
          />
        </div>

        {/* ── Content Column ── */}
        <div className="about-content-col">
          <p className="about-role">Software Engineer & Lifelong Learner</p>

          <p className="about-bio">
            Hello there! I’m Vyacheslav, a software engineer from Ukraine. \n
          </p>

          <p className="about-bio">
            I spend my days turning coffee into code and my nights wondering why it worked
            yesterday. \n
          </p>

          <p className="about-bio">
            I love building things—from web applications and backend services to developer tools
            that make life just a little easier. I enjoy solving problems, optimizing performance,
            and turning messy ideas into clean, reliable software. The bigger the challenge, the
            more interesting it becomes. \n
          </p>

          <p className="about-bio">
            I recently graduated with a Professional Junior Bachelor’s degree in Software
            Engineering and have been constantly exploring new technologies ever since. Lately, I’ve
            been working with modern web stacks, backend development, APIs, databases, cloud
            infrastructure, and a bit of everything that catches my curiosity. \n
          </p>

          <p className="about-bio">
            I believe the best way to learn is to build. That’s why you’ll usually find me
            experimenting with new projects, rewriting something “just because it can be better,” or
            diving into technologies I’ve never used before. I’m always looking for the next
            challenge… though sometimes it’s just another excuse to open my IDE.
          </p>

          {/* ── Terminal ── */}
          <div className="about-terminal">
            <div className="about-terminal-bar">
              <span className="about-terminal-dot about-terminal-dot--r" />
              <span className="about-terminal-dot about-terminal-dot--y" />
              <span className="about-terminal-dot about-terminal-dot--g" />
              <span className="about-terminal-title">viacheslav@portfolio ~ </span>
            </div>
            <div className="about-terminal-body">
              {TERMINAL_LINES.slice(0, terminalLine).map((line, i) => (
                <div key={i} className="about-terminal-line">
                  <span className="about-terminal-prompt">{line.prompt}</span>
                  <span className="about-terminal-cmd">{line.cmd}</span>
                </div>
              ))}
              <div className="about-terminal-line about-terminal-line--active">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-output">
                  {typewriterText}
                  <span className={`about-terminal-cursor${showCursor ? ' is-visible' : ''}`}>
                    |
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="about-stats-row">
            {aboutData.stats.map((stat, i) => (
              <div
                key={stat.label}
                className="about-stat-item"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── Tech Tags ── */}
          <div className="about-tech">
            {[
              'React',
              'TypeScript',
              'Node.js',
              'PostgreSQL',
              'Python',
              'Rust',
              'Docker',
              'Git',
            ].map((t, i) => (
              <span
                key={t}
                className="about-tech-tag"
                style={{ animationDelay: `${0.5 + i * 0.05}s` }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* ── Features Grid ── */}
          <Features />
        </div>
      </div>
    </section>
  );
}
