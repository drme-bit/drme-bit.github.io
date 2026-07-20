'use client';

import styles from './LoadingScreen.module.scss';

export default function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingScreenBox} />
      <p className={styles.loadingScreenText}>
        loading<span className={styles.loadingScreenDots} />
      </p>
    </div>
  );
}
