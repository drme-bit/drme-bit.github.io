import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import './Skills.scss';

const GROUPS = [
  {
    label: 'frontend',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'SCSS', 'Three.js', 'R3F'],
  },
  {
    label: 'backend',
    items: ['Node.js', 'Python', 'Go', 'Rust', 'Java', 'PostgreSQL', 'Redis'],
  },
  {
    label: 'tools',
    items: ['Git', 'Docker', 'WebGPU', 'WASM', 'CUDA', 'OpenGL', 'Linux'],
  },
];

export default function Skills() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section ref={ref} className={`section section--skills reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
        <div className="section-label">// skills</div>
        <h2 className="section-title">Tools &amp;<span className="section-accent"> technologies</span></h2>
        <div className="skills-groups">
          {GROUPS.map((g) => (
            <div key={g.label} className="skills-group">
              <span className="skills-group-label">{g.label}</span>
              <div className="skills-items">
                {g.items.map((t) => (
                  <span key={t} className="skills-item">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
