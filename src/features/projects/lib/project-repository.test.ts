import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectRepository } from './project-repository';
import type { ProjectData } from './project-repository';
import { Skill } from '@/entities/skill';
import type { SkillData } from '@/entities/skill';

const SKILLS: SkillData[] = [
  { name: 'React', group: 'frontend', category: 'framework', level: 4, difficulty: 2, desc: 'ui', funLevel: 'high', related: [], projects: [] },
  { name: 'Rust', group: 'backend', category: 'language', level: 3, difficulty: 5, desc: 'systems', funLevel: 'high', related: [], projects: [] },
  { name: 'WebGPU', group: 'frontend', category: 'other', level: 2, difficulty: 4, desc: 'gpu', funLevel: 'high', related: [], projects: [] },
];

const NEXAGON: ProjectData = {
  id: 'nexagon', title: 'Nexagon', desc: 'game server monitoring dashboard', status: 'ACTIVE',
  tech: ['Rust', 'React', 'WebGPU'], features: ['realtime charts', 'webgpu rendering'],
  stages: [{ title: 'v1', duration: '2025', desc: 'first release' }],
};
const BLOXINGBAD: ProjectData = {
  id: 'bloxingbad', title: 'Bloxingbad', desc: 'roblox experience', status: 'PAUSED',
  tech: ['React'], features: ['battle system'],
};
const LEGACY: ProjectData = {
  id: 'legacy', title: 'Legacy Tool', desc: 'old automation script', status: 'DEPRECATED', tech: [],
};

function buildRepo(): ProjectRepository {
  const repo = new ProjectRepository();
  repo.registerAll([NEXAGON, BLOXINGBAD, LEGACY]);
  repo.linkSkills(() => SKILLS.map(s => new Skill(s)));
  return repo;
}

let repo: ProjectRepository;

beforeEach(() => {
  repo = buildRepo();
});

describe('ProjectRepository', () => {
  it('registers and resolves skills', () => {
    expect(repo.get('nexagon')!.hasSkill('Rust')).toBe(true);
    expect(repo.get('nexagon')!.techSkills.map(s => s.name)).toEqual(['Rust', 'React', 'WebGPU']);
    expect(repo.get('legacy')!.techSkills).toEqual([]);
  });

  it('splits by status', () => {
    expect(repo.active.map(p => p.id)).toEqual(['nexagon']);
    expect(repo.paused.map(p => p.id)).toEqual(['bloxingbad']);
    expect(repo.deprecated.map(p => p.id)).toEqual(['legacy']);
    expect(repo.byStatus('ACTIVE').map(p => p.id)).toEqual(['nexagon']);
  });

  it('queries by skill', () => {
    expect(repo.bySkill('Rust').map(p => p.id)).toEqual(['nexagon']);
    expect(repo.bySkills(['React', 'WebGPU']).map(p => p.id)).toEqual(['nexagon']);
    expect(repo.byGroup('backend').map(p => p.id)).toEqual(['nexagon']);
    expect(repo.byCategory('language').map(p => p.id)).toEqual(['nexagon']);
  });

  it('searches title, desc, tech and features', () => {
    expect(repo.search('nexagon').map(p => p.id)).toEqual(['nexagon']);
    expect(repo.search('roblox').map(p => p.id)).toEqual(['bloxingbad']);
    expect(repo.search('webgpu').map(p => p.id)).toEqual(['nexagon']);
    expect(repo.search('realtime').map(p => p.id)).toEqual(['nexagon']);
    expect(repo.search('zzz')).toEqual([]);
  });

  it('computes skill levels', () => {
    const nexagon = repo.get('nexagon')!;
    expect(nexagon.getSkillLevel('Rust')).toBe(3);
    expect(nexagon.getSkillLevel('nope')).toBeUndefined();
    expect(nexagon.avgSkillLevel).toBe(3);
    expect(repo.get('legacy')!.avgSkillLevel).toBe(0);
  });

  it('content accessors', () => {
    const nexagon = repo.get('nexagon')!;
    expect(nexagon.getStage(0)!.title).toBe('v1');
    expect(nexagon.hasFeature('realtime')).toBe(true);
    expect(nexagon.hasImages).toBe(false);
    expect(nexagon.hasStages).toBe(true);
    expect(nexagon.hasFeatures).toBe(true);
  });

  it('reports stats', () => {
    expect(repo.stats).toEqual({
      total: 3, active: 1, paused: 1, deprecated: 1,
      totalFeatures: 3, totalStages: 1,
    });
  });
});
