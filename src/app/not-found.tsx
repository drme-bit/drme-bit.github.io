'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiArrowLeft, FiTerminal } from 'react-icons/fi';
import styles from './NotFound.module.scss';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles['not-found-page']}>
      <div className={styles['nf-terminal']}>
        <div className={styles['nf-terminal-bar']}>
          <span className={`${styles['nf-terminal-dot']} ${styles['nf-terminal-dot--red']}`} />
          <span className={`${styles['nf-terminal-dot']} ${styles['nf-terminal-dot--yellow']}`} />
          <span className={`${styles['nf-terminal-dot']} ${styles['nf-terminal-dot--green']}`} />
          <span className={styles['nf-terminal-title']}>bash</span>
        </div>
        <div className={styles['nf-terminal-body']}>
          <div className={styles['nf-line']}>
            <span className={styles['nf-prompt']}>$</span>
            <span className={styles['nf-command']}>curl {typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
          </div>
          <div className={`${styles['nf-line']} ${styles['nf-output']} ${styles['nf-error']}`}>
            <FiTerminal size={14} />
            <span>curl: (404) The resource you requested could not be found</span>
          </div>
          <div className={styles['nf-line']}>
            <span className={styles['nf-prompt']}>$</span>
            <span className={styles['nf-cursor']}>|</span>
          </div>
        </div>
      </div>

      <div className={styles['nf-content']}>
        <h1 className={styles['nf-code']}>404</h1>
        <p className={styles['nf-message']}>Page not found</p>
        <p className={styles['nf-desc']}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className={styles['nf-actions']}>
          <Link href="/" className={`${styles['nf-btn']} ${styles['nf-btn--primary']}`}>
            <FiHome size={14} />
            <span>cd ~</span>
          </Link>
          <button
            onClick={() => router.back()}
            className={`${styles['nf-btn']} ${styles['nf-btn--secondary']}`}
          >
            <FiArrowLeft size={14} />
            <span>cd -</span>
          </button>
        </div>
      </div>
    </div>
  );
}
