/*  MAQ — Most Asked Questions. Shown as tappable rows in the empty
    chat state. Each question is phrased to hit the mock brain
    (entities/knowledge) and the system prompt, so answers stay
    good online and offline.  */

export interface MaqItem {
  q: string;
  label: string;
  hint: string;
}

export const MAQ: MaqItem[] = [
  {
    q: 'Which projects best show backend and systems work?',
    label: 'Show backend and systems work',
    hint: 'Projects',
  },
  {
    q: 'Tell me about Nexagon and the technical decisions behind it.',
    label: 'Explain Nexagon',
    hint: 'Rust, React and WebGPU',
  },
  {
    q: 'What experience is most relevant for a product team?',
    label: 'Find relevant experience',
    hint: 'Timeline',
  },
  {
    q: 'Is Vyacheslav available for freelance or full-time work?',
    label: 'Ask about availability',
    hint: 'Contact',
  },
];
