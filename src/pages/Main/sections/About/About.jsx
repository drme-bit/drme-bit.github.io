import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import './About.scss';

const infoItems = [
  { label: 'Education', value: 'Software Engineering, Professional Junior Bachelor' },
  { label: 'Approach', value: 'AI-assisted, human-driven' },
  { label: 'Focus', value: 'Full-Stack, Backend, Integration' },
  { label: 'Motto', value: 'Coffee. Sleep. Repeat.' },
];

export default function About() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  const mainParallax = { transform: `translate(${x * 4}px, ${y * 3}px)` };
  const secondaryParallax = { transform: `translate(${x * 1.5}px, ${y * 1.2}px)` };
  const imgParallax = { transform: `translate(${x * 2}px, ${y * 1.5}px)` };

  return (
    <section id="about" ref={ref} className={`section reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="about" number="01" visible={visible} />
      <div className="section-inner" style={mainParallax}>
        <h2 className="section-title">
          About<span className="section-accent"> me</span>
          <span className="section-title-sub"> — software engineer & lifelong learner</span>
        </h2>

        <div className="main-intro" style={secondaryParallax}>
          <div className="img-frame" style={imgParallax}>
            <div className="img-frame-dots">
              <span className="img-frame-dot" />
              <span className="img-frame-dot" />
              <span className="img-frame-dot" />
            </div>
            <div className="img-frame-body">
              <img src="images/17969af76asf9y986ad9fy.jpg" alt="About" />
            </div>
          </div>
          <div className="intro-content">
            <p>
              Software engineering graduate passionate about building with
              modern technology. I recently completed my Professional Junior
              Bachelor's degree in Software Engineering, and I'm always eager
              to explore new tools, languages, and ways to solve problems.
            </p>
            <div className="quick-info">
              {infoItems.map(item => (
                <div key={item.label} className="quick-info-item">
                  <span className="quick-info-label">{item.label}</span>
                  <span className="quick-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-body">
          <p>
            What drives me is the process of learning itself — especially
            when it comes to new technologies. I genuinely enjoy diving
            into unfamiliar stacks, understanding how things work under
            the hood, and turning that understanding into working software.
          </p>
          <p>
            I actively integrate AI tools into my workflow to speed up
            research, automate repetitive tasks, and explore solutions
            faster — but always with full understanding of what the code
            does. I believe in using AI as an amplifier, not a replacement
            for engineering thinking.
          </p>
          <p>
            Right now I'm focused on deepening my full-stack skills,
            system architecture, and developer tooling — always open
            to whatever interesting challenge comes next.
          </p>
        </div>

        <div className="section-tags">
          {['Software Engineering', 'AI-Assisted Dev', 'Backend', 'Architecture'].map((t) => (
            <span key={t} className="section-tag">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
