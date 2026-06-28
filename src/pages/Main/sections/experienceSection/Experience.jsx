import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import './Experience.scss';

const ENTRIES = [
  
];

export default function Experience() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section ref={ref} className={`section section--experience reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
        <div className="section-label">// experience</div>
        <h2 className="section-title">Where I've<span className="section-accent"> worked</span></h2>
        <div className="timeline">
          {ENTRIES.map((e, i) => (
            <div key={i} className="timeline-entry">
              <div className="timeline-line">
                <span className="timeline-dot" />
                {i < ENTRIES.length - 1 && <span className="timeline-connector" />}
              </div>
              <div className="timeline-body">
                <span className="timeline-period">{e.period}</span>
                <span className="timeline-role">{e.role}</span>
                <span className="timeline-org">{e.org}</span>
                <p className="timeline-desc">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
