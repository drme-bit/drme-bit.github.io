import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import aboutData from '@/data/aboutData';
import './About.scss';

const infoItems = [
  { label: 'Education', value: 'Software Engineering, Professional Junior Bachelor' },
  { label: 'Approach', value: 'AI-assisted, human-driven' },
  { label: 'Focus', value: 'Full-Stack, Backend, Integration' },
  { label: 'Motto', value: 'Coffee. Sleep. Repeat.' },
];

const SECTIONS = [
  {
    id: 'philosophy',
    label: 'Philosophy',
    paragraphs: [
      "I don't believe in perfect code. I believe in code that ships, solves a real problem, and can be improved tomorrow. Done is better than perfect — but well-done is better than done.",
      'Every project teaches me something new. Whether it\'s a tricky bug, a new framework, or a late-night refactor — I treat each one as a chance to get better.',
    ],
  },
  {
    id: 'approach',
    label: 'Approach',
    paragraphs: [
      'What drives me is the process of learning itself. I genuinely enjoy diving into unfamiliar stacks, understanding how things work under the hood, and turning that understanding into working software.',
      'I actively integrate AI tools into my workflow to speed up research, automate repetitive tasks, and explore solutions faster — but always with full understanding of what the code does. I believe in using AI as an amplifier, not a replacement for engineering thinking.',
    ],
  },
  {
    id: 'direction',
    label: 'Direction',
    paragraphs: [
      "Right now I'm focused on deepening my full-stack skills, system architecture, and developer tooling. Always open to whatever interesting challenge comes next.",
    ],
  },
];

export default function About() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  const mainParallax = { transform: `translate(${x * 4}px, ${y * 3}px)` };
  const secondaryParallax = { transform: `translate(${x * 1.5}px, ${y * 1.2}px)` };

  return (
    <section id="about" ref={ref} className={`section section--about reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="about" number="01" visible={visible} />
      <div className="section-inner" style={mainParallax}>
        <h2 className="section-title">
          About<span className="section-accent"> me</span>
          <span className="section-title-sub"> — software engineer & lifelong learner</span>
        </h2>

        <div className="about-intro" style={secondaryParallax}>
          <div className="about-photo">
            <div className="about-photo-dots">
              <span className="about-photo-dot" />
              <span className="about-photo-dot" />
              <span className="about-photo-dot" />
            </div>
            <div className="about-photo-body">
              <img src="/images/17969af76asf9y986ad9fy.jpg" alt="Viacheslav" />
            </div>
          </div>

          <div className="about-text">
            <p>
              Hey there — I'm Viacheslav, a software engineering graduate who builds
              things for the web, backend systems, and beyond. I recently completed my
              Professional Junior Bachelor's degree in Software Engineering, and I'm
              always exploring new tools, languages, and ways to solve problems.
            </p>
            <div className="about-info">
              {infoItems.map(item => (
                <div key={item.label} className="about-info-item">
                  <span className="about-info-label">{item.label}</span>
                  <span className="about-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about-main" style={secondaryParallax}>
          <div className="about-blocks">
            {SECTIONS.map((section) => (
              <div key={section.id} className="about-block">
                <span className="about-block-label">{section.label}</span>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="about-block-text">{p}</p>
                ))}
              </div>
            ))}
          </div>

          <aside className="about-timeline">
            <span className="about-block-label">Timeline</span>
            <div className="about-timeline-track">
              {aboutData.timeline.map((entry, i) => (
                <div key={i} className="about-tl-item">
                  <div className="about-tl-marker">
                    <span className="about-tl-dot" />
                    {i < aboutData.timeline.length - 1 && <div className="about-tl-line" />}
                  </div>
                  <div className="about-tl-content">
                    <span className="about-tl-title">{entry.title}</span>
                    <span className="about-tl-date">{entry.date}</span>
                    <p className="about-tl-desc">{entry.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="about-stats">
          {aboutData.stats.map((s) => (
            <div key={s.label} className="about-stat">
              <span className="about-stat-value">{s.value}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="about-tags">
          {['Software Engineering', 'AI-Assisted Dev', 'Backend', 'Architecture'].map((t) => (
            <span key={t} className="about-tag">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
