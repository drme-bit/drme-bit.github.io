import { useState, useCallback, useMemo } from 'react';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import SkillsGlobe, { SKILLS_DATA, GROUP_COLORS } from './SkillsGlobe';
import './Skills.scss';

export default function Skills() {
  const [ref, visible] = useReveal();
  const [selected, setSelected] = useState(SKILLS_DATA[0]);

  const groupCounts = useMemo(() =>
    SKILLS_DATA.reduce((acc, s) => { acc[s.group] = (acc[s.group] || 0) + 1; return acc; }, {}),
  []);

  const handleSelect = useCallback((skill) => {
    setSelected((prev) => (prev?.name === skill.name ? null : skill));
  }, []);

  return (
    <section id="skills" ref={ref} className={`section section--skills reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="skills" number="02" visible={visible} />
      <div className="section-inner">
        <h2 className="section-title">
          Tools &<span className="section-accent"> technologies</span>
          <span className="section-title-sub"> — click a node to learn more</span>
        </h2>

        <div className="skills-layout">
          <div className="skills-globe-wrap">
            <SkillsGlobe selected={selected} onSelect={handleSelect} />
          </div>

          <div className="skills-sidebar">
            <div className={`skill-info-wrap${selected ? ' is-visible' : ''}`}>
              <aside className="skill-info">
                {selected && (
                  <>
                    <span className="skill-info-name" style={{ color: GROUP_COLORS[selected.group] }}>{selected.name}</span>
                    <span className="skill-info-group" style={{ color: GROUP_COLORS[selected.group] }}>{selected.group}</span>
                    <p className="skill-info-desc">{selected.desc}</p>
                  </>
                )}
              </aside>
            </div>

            <div className="skill-categories">
              {Object.entries(GROUP_COLORS).map(([key, color]) => (
                <div key={key} className="skill-category">
                  <span className="skill-category-dot" style={{ background: color }} />
                  <span className="skill-category-label">{key}</span>
                  <span className="skill-category-count">{groupCounts[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
