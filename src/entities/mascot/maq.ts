/*  MAQ — Most Asked Questions. Shown as tappable rows in the empty
    chat state. Each question is phrased to hit the mock brain
    (entities/knowledge) and the system prompt, so answers stay
    good online and offline.  */

export interface MaqItem {
  q: string;
}

export const MAQ: MaqItem[] = [
  { q: 'What stack do you use?' },
  { q: 'Tell me about your projects' },
  { q: 'Are you open to freelance?' },
  { q: 'How can I contact you?' },
  { q: 'What is this site about?' },
  { q: 'Where are you based?' },
];
