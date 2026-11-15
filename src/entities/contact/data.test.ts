import { describe, it, expect } from 'vitest';
import { fieldConfigs, contactItems, socialLinks } from './data';

describe('contact entity', () => {
  it('defines the expected form fields', () => {
    expect(fieldConfigs.map(f => f.name)).toEqual(['name', 'email', 'subject', 'message']);
    for (const f of fieldConfigs) {
      expect(f.label).toBeTruthy();
      expect(f.type).toBeTruthy();
    }
  });

  it('contact items cover the main channels', () => {
    expect(contactItems.map(i => i.id)).toEqual(['calendar', 'email', 'phone', 'resume', 'location']);
    for (const i of contactItems) {
      expect(i.title).toBeTruthy();
      expect(i.subtitle).toBeTruthy();
    }
    expect(contactItems.find(i => i.id === 'email')?.href).toMatch(/^mailto:/);
    expect(contactItems.find(i => i.id === 'phone')?.href).toMatch(/^tel:\+380/);
    expect(contactItems.find(i => i.id === 'location')?.href).toBeUndefined();
  });

  it('re-exports social links', () => {
    expect(socialLinks.map(s => s.id)).toContain('github');
  });
});
