'use client';

import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import styles from './LoadingCurtain.module.scss';

const SESSION_KEY = 'drme-loaded';

export function LoadingCurtain() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
  }, []);

  useGSAP(
    () => {
      if (!visible || !wrapperRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem(SESSION_KEY, '1');
          setVisible(false);
        },
      });

      tl.to(`.${styles.line}`, {
        scaleX: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.inOut',
      })
        .to(
          `.${styles.brand}`,
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
          '-=0.3',
        )
        .to(`.${styles.brand}`, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: 'power2.in',
          delay: 0.4,
        })
        .to(`.${styles.line}`, {
          scaleX: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.inOut',
        })
        .to(
          wrapperRef.current,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.7,
            ease: 'power4.inOut',
          },
          '-=0.3',
        );
    },
    { scope: wrapperRef, dependencies: [visible] },
  );

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className={styles.curtain}>
      <div className={styles.lines}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={styles.line} />
        ))}
      </div>
      <div className={styles.brand}>
        <span className={styles.dot} />
        <span className={styles.name}>Dr.ME</span>
      </div>
    </div>
  );
}
