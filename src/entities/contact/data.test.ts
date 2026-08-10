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
    expect(contactItems.map(i => i.id)).toEqual(['calendar', 'email', 'phone', 'location']);
    for (const i of contactItems) {
      expect(i.title).toBeTruthy();
      expect(i.subtitle).toBeTruthy();
    }
  });

  it('re-exports social links', () => {
    expect(socialLinks.map(s => s.id)).toContain('github');
  });
});
