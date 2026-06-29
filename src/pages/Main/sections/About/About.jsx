import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import './About.scss';

export default function About() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section id="about" ref={ref} className={`section reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
        <div className="section-label">// about</div>
        <h2 className="section-title">Building digital<br /><span className="section-accent">products</span></h2>
        <div className="section-body">
          <p>
            Full-stack developer with a focus on creative technology and
            immersive experiences. I work across design, code, and 3D to
            craft interfaces that feel alive.
          </p>
          <p>
            Currently exploring procedural generation, spatial computing,
            and the space where code meets art.
          </p>
        </div>
        <div className="section-tags">
          {['Design', 'Engineering', '3D', 'Creative Tech'].map((t) => (
            <span key={t} className="section-tag">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
