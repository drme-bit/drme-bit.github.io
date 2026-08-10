import { describe, it, expect } from 'vitest';
import { Skill, Project, SkillGraph } from './skill-graph';
import type { SkillData, ProjectData } from './skill-graph';

const TS: SkillData = {
  name: 'TypeScript', group: 'frontend', category: 'language', level: 5, difficulty: 3,
  desc: 'typed javascript', funLevel: 'high', related: ['React'], projects: ['web'],
};
const REACT: SkillData = {
  name: 'React', group: 'frontend', category: 'framework', level: 4, difficulty: 3,
  desc: 'ui library', funLevel: 'high', related: ['TypeScript'], projects: ['web'],
};
const RUST: SkillData = {
  name: 'Rust', group: 'backend', category: 'language', level: 3, difficulty: 5,
  desc: 'systems language', funLevel: 'medium', related: [], projects: ['nexagon'],
};
const WEB: ProjectData = { id: 'web', title: 'Web App', desc: 'a website', tech: ['TypeScript', 'React'] };
const NEXAGON: ProjectData = { id: 'nexagon', title: 'Nexagon', desc: 'game server dashboard', tech: ['Rust'] };

function buildGraph(): SkillGraph {
  const g = new SkillGraph();
  g.registerSkills([TS, REACT, RUST]);
  g.registerProjects([WEB, NEXAGON]);
  return g.resolve();
}

describe('Skill', () => {
  it('maps difficulty to label', () => {
    expect(new Skill(TS).difficultyLabel).toBe('moderate');
    expect(new Skill({ ...TS, difficulty: 5 }).difficultyLabel).toBe('expert');
  });

  it('computes level percent', () => {
    expect(new Skill(TS).levelPercent).toBe(100);
    expect(new Skill(RUST).levelPercent).toBe(60);
  });
});

describe('Project', () => {
  it('defaults status and image', () => {
    const p = new Project({ id: 'x', title: 'X', desc: 'd', tech: [] });
    expect(p.isActive).toBe(true);
    expect(p.image).toBeNull();
  });

  it('filters skills by group/category', () => {
    const g = buildGraph();
    const p = g.getProject('web')!;
    expect(p.skillsByGroup('frontend').map(s => s.name)).toEqual(['TypeScript', 'React']);
    expect(p.skillsByCategory('language').map(s => s.name)).toEqual(['TypeScript']);
  });
});

describe('SkillGraph', () => {
  it('resolves bidirectional relationships', () => {
    const g = buildGraph();
    const ts = g.getSkill('TypeScript')!;
    const react = g.getSkill('React')!;

    expect(ts.isRelatedTo('React')).toBe(true);
    expect(ts.relatedSkills.map(s => s.name)).toContain('React');
    expect(react.relatedSkills.map(s => s.name)).toContain('TypeScript');
    expect(ts.usedInProjects.map(p => p.id)).toEqual(['web']);
    expect(ts.hasProject('web')).toBe(true);
  });

  it('ignores unresolved references', () => {
    const g = new SkillGraph();
    g.registerSkill(TS);
    g.registerProject({ id: 'ghost', title: 'G', desc: 'd', tech: ['MissingSkill'] });
    g.resolve();
    expect(g.getProject('ghost')!.techSkills).toEqual([]);
  });

  it('queries skills by group and category', () => {
    const g = buildGraph();
    expect(g.skillsByGroup('frontend').map(s => s.name)).toEqual(['TypeScript', 'React']);
    expect(g.skillsByGroup('backend').map(s => s.name)).toEqual(['Rust']);
    expect(g.skillsByCategory('language').map(s => s.name)).toEqual(['TypeScript', 'Rust']);
  });

  it('projectsUsingSkill / skillsUsedInProject', () => {
    const g = buildGraph();
    expect(g.projectsUsingSkill('Rust').map(p => p.id)).toEqual(['nexagon']);
    expect(g.skillsUsedInProject('web').map(s => s.name)).toEqual(['TypeScript', 'React']);
    expect(g.skillsUsedInProject('nope')).toEqual([]);
  });

  it('searches by name, desc, group and category', () => {
    const g = buildGraph();
    expect(g.searchSkills('typescript').map(s => s.name)).toEqual(['TypeScript']);
    expect(g.searchSkills('systems').map(s => s.name)).toEqual(['Rust']);
    expect(g.searchSkills('frontend').map(s => s.name).sort()).toEqual(['React', 'TypeScript']);
    expect(g.searchSkills('zzz')).toEqual([]);
  });

  it('reports stats', () => {
    const g = buildGraph();
    expect(g.stats).toMatchObject({
      totalSkills: 3,
      totalProjects: 2,
      byGroup: { frontend: 2, backend: 1, tools: 0 },
      byCategory: { language: 2, framework: 1 },
    });
  });

  it('auto-resolves on read after late registration', () => {
    const g = new SkillGraph();
    g.registerSkill(TS);
    g.registerSkill(REACT);
    g.registerProject(WEB);
    /*  no explicit resolve() — reads must trigger it  */
    expect(g.getSkill('TypeScript')!.relatedSkills).toHaveLength(1);
  });
});
