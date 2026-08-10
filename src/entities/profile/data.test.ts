import { describe, it, expect } from 'vitest';
import { profile, socialLinks } from './profile';
import { navLinks } from './links';
import { RESUME_FILE, resume } from './resume';

describe('profile entity', () => {
  it('contains identity fields', () => {
    expect(profile.name).toBe('Vyacheslav Tkachyk');
    expect(profile.githubUsername).toBe('drme-bit');
    expect(profile.email).toMatch(/@gmail\.com$/);
    expect(profile.location).toContain('Odesa');
  });

  it('exposes consistent social links', () => {
    expect(socialLinks).toHaveLength(3);
    const ids = socialLinks.map(s => s.id);
    expect(ids).toContain('github');
    expect(ids).toContain('linkedin');
    expect(ids).toContain('discord');
    for (const s of socialLinks) {
      expect(s.href).toMatch(/^https?:\/\//);
    }
  });

  it('defines navigation links', () => {
    expect(navLinks.map(l => l.href)).toEqual(['/stats', '/blog', '/projects']);
  });

  it('exposes the resume', () => {
    expect(RESUME_FILE).toMatch(/\.pdf$/);
    expect(resume.timeline.length).toBeGreaterThan(0);
  });
});
