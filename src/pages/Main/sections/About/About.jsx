import { useState, useEffect, useRef, useCallback } from 'react';
import useReveal from '@/hooks/useReveal';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import Features from '@/components/ui/Features/Features';
import aboutData from '@/data/aboutData';
import './About.scss';

const FILES = [
  { name: 'intro.txt', label: '~ who am i', text: "Hello there! I'm Vyacheslav, a software engineer from Ukraine." },
  { name: 'passion.txt', label: '~ what drives me', text: "I spend my days turning coffee into code and my nights wondering why it worked yesterday." },
  { name: 'building.txt', label: '~ what i build', text: "I love building things — from web applications and backend services to developer tools that make life just a little easier. I enjoy solving problems, optimizing performance, and turning messy ideas into clean, reliable software. The bigger the challenge, the more interesting it becomes." },
  { name: 'education.txt', label: '~ background', text: "I recently graduated with a Professional Junior Bachelor's degree in Software Engineering and have been constantly exploring new technologies ever since. Lately, I've been working with modern web stacks, backend development, APIs, databases, cloud infrastructure, and a bit of everything that catches my curiosity." },
  { name: 'philosophy.txt', label: '~ philosophy', text: "I believe the best way to learn is to build. That's why you'll usually find me experimenting with new projects, rewriting something \"just because it can be better,\" or diving into technologies I've never used before. I'm always looking for the next challenge… though sometimes it's just another excuse to open my IDE." },
];

function TypewriterLine({ text, active, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(''); idx.current = 0; setDone(false); return; }
    if (idx.current >= text.length) { setDone(true); return; }
    const t = setTimeout(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
    }, speed);
    return () => clearTimeout(t);
  }, [active, text, speed, displayed]);

  if (!active && !displayed) return null;
  return (
    <span className="about-file-output">
      {displayed}
      {!done && <span className="about-file-cursor">|</span>}
    </span>
  );
}

function FileBlock({ file, index, sectionVisible }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!sectionVisible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sectionVisible]);

  return (
    <div ref={ref} className={`about-file-block${open ? ' is-open' : ''}`}>
      <div className="about-file-cmd">
        <span className="about-file-prompt">~</span>
        <span className="about-file-command">cat {file.name}</span>
      </div>

      {open && (
        <div className="about-file-content">
          <TypewriterLine text={file.text} active={open} />
        </div>
      )}
    </div>
  );
}

export default function About() {
  const [ref, visible] = useReveal();

  return (
    <section
      id="about"
      ref={ref}
      className={`section section--about reveal${visible ? ' is-visible' : ''}`}
    >
      <SectionTitle title="about" accent="_" visible={visible} />

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

          {/* ── File System ── */}
          <div className="about-files">
            <div className="about-files-header">
              <span className="about-files-prompt">~</span>
              <span className="about-files-command">ls -la ~/about/</span>
            </div>
            {FILES.map((f, i) => (
              <FileBlock key={f.name} file={f} index={i} sectionVisible={visible} />
            ))}
          </div>

          {/* ── Terminal ── */}
          <div className="about-terminal">
            <div className="about-terminal-bar">
              <span className="about-terminal-dot about-terminal-dot--r" />
              <span className="about-terminal-dot about-terminal-dot--y" />
              <span className="about-terminal-dot about-terminal-dot--g" />
              <span className="about-terminal-title">viacheslav@portfolio ~ </span>
            </div>
            <div className="about-terminal-body">
              <div className="about-terminal-line">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-cmd">cat intro.txt</span>
              </div>
              <div className="about-terminal-line">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-output">Hello there! I'm Vyacheslav, a software engineer from Ukraine.</span>
              </div>
              <div className="about-terminal-line">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-cmd">echo $PASSION</span>
              </div>
              <div className="about-terminal-line about-terminal-line--active">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-output">building elegant solutions</span>
              </div>
              <div className="about-terminal-line">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-cmd">cat /dev/brain | grep ideas</span>
              </div>
              <div className="about-terminal-line">
                <span className="about-terminal-prompt">~</span>
                <span className="about-terminal-output">found: coffee → code → repeat</span>
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
              'React', 'TypeScript', 'Node.js', 'PostgreSQL',
              'Python', 'Rust', 'Docker', 'Git',
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
