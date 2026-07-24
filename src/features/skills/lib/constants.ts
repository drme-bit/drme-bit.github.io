import { FiMove, FiMousePointer, FiSliders } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Learning',
  2: 'Familiar',
  3: 'Proficient',
  4: 'Advanced',
  5: 'Expert',
};

export const EXPLORER_GUIDE = [
  { step: '01', icon: FiMove, title: 'Rotate', detail: 'drag the globe' },
  { step: '02', icon: FiMousePointer, title: 'Inspect', detail: 'select a marker' },
  { step: '03', icon: FiSliders, title: 'Refine', detail: 'search or filter' },
];

export const MAX_HISTORY = 5;
