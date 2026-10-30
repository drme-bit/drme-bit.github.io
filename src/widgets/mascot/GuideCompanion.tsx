'use client';

import { useState } from 'react';
import GuideCat from './GuideCat';
import styles from './GuideCompanion.module.scss';

export type CompanionMood = 'idle' | 'listening' | 'thinking' | 'replying' | 'ready';

const greetings = ['At your service.', 'All ears.', 'A tiny break. Back to work.', 'You rang?'];

export default function GuideCompanion({ mood }: { mood: CompanionMood }) {
  const [pets, setPets] = useState(0);
  return (
    <button
      type="button"
      className={styles.companion}
      data-mood={mood}
      onClick={() => setPets((count) => count + 1)}
      aria-label="Say hello to the guide"
      title="Say hello"
    >
      <span className={styles.figure}>
        <span key={pets} className={pets ? styles.wave : undefined}>
          <GuideCat size={29} />
        </span>
      </span>
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.greeting} role="status">
        {pets ? greetings[(pets - 1) % greetings.length] : 'Hello there.'}
      </span>
    </button>
  );
}
