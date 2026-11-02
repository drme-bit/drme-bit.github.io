import { describe, expect, it } from 'vitest';
import { getRelatedSources } from './sources';

describe('getRelatedSources', () => {
  it('points Nexagon questions to its case study', () => {
    expect(getRelatedSources('How was Nexagon built?')[0]).toMatchObject({
      title: 'Nexagon',
      href: '/projects/nexagon',
    });
  });

  it('points availability questions to actionable contact information', () => {
    expect(getRelatedSources('Are you available for freelance?').map((source) => source.href)).toEqual([
      '#contact',
      '/resume',
    ]);
  });
});
