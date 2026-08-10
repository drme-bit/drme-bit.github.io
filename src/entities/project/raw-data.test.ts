import { describe, it, expect } from 'vitest';
import { PROJECTS, createProject } from './raw-data';

describe('project raw-data', () => {
  it('registers the expected projects', () => {
    expect(PROJECTS).toHaveLength(3);
    expect(PROJECTS.map(p => p.id)).toEqual(expect.arrayContaining(['nexagon', 'gmod-roblox', 'bloxingbad']));
  });

  it('every project has stable identity fields', () => {
    for (const p of PROJECTS) {
      expect(p.id).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(Array.isArray(p.tech)).toBe(true);
      expect(p.tech.length).toBeGreaterThan(0);
      expect(p.status).toBeTruthy();
    }
  });

  it('createProject fills defaults and merges overrides', () => {
    const p = createProject({ id: 'a', title: 'A', tech: ['X'] });
    expect(p.id).toBe('a');
    expect(p.title).toBe('A');
    expect(p.tech).toEqual(['X']);
    expect(p.url).toBe('#');
    expect(p.status).toBe('ACTIVE');
    expect(p.presentation.mode).toBe('classic');
  });
});
