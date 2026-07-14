import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import aboutData from '@/data/aboutData';
import './About.scss';

const SECTIONS = [
  {
    id: 'philosophy',
    label: 'Philosophy',
    icon: '◈',
    paragraphs: [
      "I don't believe in perfect code. I believe in code that ships, solves a real problem, and can be improved tomorrow.",
      "Every project teaches me something new — whether it's a tricky bug, a new framework, or a late-night refactor.",
    ],
  },
  {
    id: 'approach',
    label: 'Approach',
    icon: '◆',
    paragraphs: [
      'I actively integrate AI tools into my workflow to speed up research, automate repetitive tasks, and explore solutions faster — always with full understanding.',
      'I believe in using AI as an amplifier, not a replacement for engineering thinking.',
    ],
  },
  {
    id: 'direction',
    label: 'Direction',
    icon: '▸',
    paragraphs: [
      "Right now I'm focused on deepening full-stack skills, system architecture, and developer tooling. Always open to interesting challenges.",
    ],
  },
];

const INFO_ITEMS = [
  { label: 'Education', value: 'Software Eng. — Jr. Bachelor' },
  { label: 'Approach', value: 'AI-assisted, human-driven' },
  { label: 'Focus', value: 'Full-Stack · Backend · Integration' },
  { label: 'Motto', value: 'Coffee. Sleep. Repeat.' },
];

export default function About() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  const mainParallax = { transform: `translate(${x * 4}px, ${y * 3}px)` };
  const subtleParallax = { transform: `translate(${x * 1.5}px, ${y * 1.2}px)` };

  return (
    <section id="about" ref={ref} className={`section section--about reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="about" number="01" visible={visible} />

      <div className="section-inner" style={mainParallax}>

        {/* ── Heading ── */}
        <h2 className="section-title">
          About<span className="section-accent"> me</span>
          <span className="section-title-sub"> — software engineer &amp; lifelong learner</span>
        </h2>

        {/* ── Bento Grid ── */}
        <div className="about-bento" style={subtleParallax}>

          {/* Cell 1: Hero card — photo + intro */}
          <div className="about-cell about-cell--hero">
            <div className="about-hero-photo">
              <div className="about-photo-dots">
                <span className="about-photo-dot" />
                <span className="about-photo-dot" />
                <span className="about-photo-dot" />
              </div>
              <img src="/images/17969af76asf9y986ad9fy.jpg" alt="Viacheslav" />
            </div>
            <div className="about-hero-text">
              <p className="about-hero-name">Viacheslav</p>
              <p className="about-hero-role">Software Engineer</p>
              <p className="about-hero-bio">
                Builds things for the web, backend systems, and beyond. Recently completed
                my Professional Junior Bachelor in Software Engineering — always
                exploring new tools and ways to solve real problems.
              </p>
              <div className="about-tags">
                {['Full-Stack', 'Backend', 'AI-Assisted Dev', 'Architecture'].map(t => (
                  <span key={t} className="about-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Cell 2: Quick-info grid */}
          <div className="about-cell about-cell--info">
            <span className="about-cell-label">// quick info</span>
            <div className="about-info-grid">
              {INFO_ITEMS.map(item => (
                <div key={item.label} className="about-info-item">
                  <span className="about-info-label">{item.label}</span>
                  <span className="about-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cell 3: Stats */}
          <div className="about-cell about-cell--stats">
            <span className="about-cell-label">// numbers</span>
            <div className="about-stats-grid">
              {aboutData.stats.map(s => (
                <div key={s.label} className="about-stat">
                  <span className="about-stat-value">{s.value}</span>
                  <span className="about-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cell 4–6: Philosophy / Approach / Direction */}
          {SECTIONS.map(section => (
            <div key={section.id} className={`about-cell about-cell--block about-cell--${section.id}`}>
              <div className="about-block-header">
                <span className="about-block-icon">{section.icon}</span>
                <span className="about-cell-label">// {section.label}</span>
              </div>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="about-block-text">{p}</p>
              ))}
            </div>
          ))}

          {/* Cell 7: Timeline */}
          <div className="about-cell about-cell--timeline">
            <span className="about-cell-label">// timeline</span>
            <div className="about-timeline-track">
              {aboutData.timeline.map((entry, i) => (
                <div key={i} className="about-tl-item">
                  <div className="about-tl-marker">
                    <span className="about-tl-dot" />
                    {i < aboutData.timeline.length - 1 && <div className="about-tl-line" />}
                  </div>
                  <div className="about-tl-content">
                    <span className="about-tl-date">{entry.date}</span>
                    <span className="about-tl-title">{entry.title}</span>
                    <p className="about-tl-desc">{entry.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
