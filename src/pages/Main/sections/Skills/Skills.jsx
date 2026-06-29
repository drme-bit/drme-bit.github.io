import { useState, useCallback } from 'react';
import useReveal from '@/hooks/useReveal';
import SkillsGlobe from './SkillsGlobe';
import './Skills.scss';

const GROUP_LABELS = {
  frontend: 'frontend',
  backend: 'backend',
  tools: 'tools & infra',
};

export default function Skills() {
  const [ref, visible] = useReveal();
  const [selected, setSelected] = useState(null);

  const handleSelect = useCallback((skill) => {
    setSelected((prev) => (prev?.name === skill.name ? null : skill));
  }, []);

  return (
    <section id="skills" ref={ref} className={`section section--skills reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner">
        <div className="section-label">// skills</div>
        <div className="skills-layout">
          <div className="skills-globe-wrap">
            <SkillsGlobe selected={selected} onSelect={handleSelect} />
          </div>

          <div className={`skill-info-wrap${selected ? ' is-visible' : ''}`}>
            <aside className="skill-info">
              {selected && (
                <>
                  <span className="skill-info-name" style={{ color: 'var(--accent)' }}>{selected.name}</span>
                  <span className="skill-info-group" style={{ color: 'var(--accent)' }}>{GROUP_LABELS[selected.group]}</span>
                  <p className="skill-info-desc">{selected.desc}</p>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
