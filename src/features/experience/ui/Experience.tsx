'use client';

//react
import { useEffect, useRef } from 'react';
//gsap
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
//other
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import styles from './Experience.module.scss';
import { experienceData, ExperienceEntry } from '@/data/experienceData';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const zoomWrapperRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const zoomZoneRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const zoomWrapper = zoomWrapperRef.current;
    const timeline = timelineRef.current;
    const tail = tailRef.current;
    const head = headRef.current;
    const zoomZone = zoomZoneRef.current;
    if (!section || !zoomWrapper || !timeline || !tail || !head || !zoomZone) return;

    const ctx = gsap.context(() => {
      const updateTransformOrigin = () => {
        const headRect = head.getBoundingClientRect();
        const wrapperRect = zoomWrapper.getBoundingClientRect();

        const x =
          ((headRect.left + headRect.width / 2 - wrapperRect.left) / wrapperRect.width) * 100;
        const y =
          ((headRect.top + headRect.height / 2 - wrapperRect.top) / wrapperRect.height) * 100;

        zoomWrapper.style.transformOrigin = `${x}% ${y}%`;
      };

      updateTransformOrigin();

      gsap.set(tail, { height: '0%' });
      gsap.set(head, { top: '0%' });

      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 70%',
        end: 'bottom 50%',
        scrub: 0.1,
        onUpdate: (self) => {
          const p = self.progress;
          tail.style.height = `${p * 100}%`;
          head.style.top = `${p * 100}%`;

          const headRect = head.getBoundingClientRect();

          entryRefs.current.forEach((entryEl) => {
            if (!entryEl) return;
            const dot = entryEl.querySelector(`.${styles['tl-dot']}`) as HTMLElement;
            if (!dot) return;

            const dotRect = dot.getBoundingClientRect();

            if (headRect.top + headRect.height / 2 >= dotRect.top) {
              entryEl.classList.add(styles['is-visible']);
            } else {
              entryEl.classList.remove(styles['is-visible']);
            }
          });
        },
      });

      ScrollTrigger.refresh();

      const iWidth = window.innerWidth;
      const iHeight = window.innerHeight * 1.35;
      const iRatio = iWidth / iHeight;
      const isMobile = window.innerWidth < 768;

      const zoomTl = gsap.timeline({
        scrollTrigger: {
          trigger: zoomZone,
          start: 'top 70%',
          end: 'bottom top',
          scrub: 0.3,
          invalidateOnRefresh: true,
          onUpdate: () => {
            updateTransformOrigin();
          },
        },
      });

      const lineWrapper = section.querySelector(`.${styles['timeline-line-wrapper']}`);

      if (lineWrapper) {
        zoomTl.to(lineWrapper, { zIndex: 99998, duration: 0 }, 0);
      }

      zoomTl
        .to(
          zoomWrapper,
          {
            scale: 1.5,
            ease: 'power2.in',
          },
          '+=1.5',
        )
        .to(
          zoomWrapper,
          {
            scale: 6,
            ease: 'power2.out',
          },
          0,
        )
        .to(
          head,
          {
            width: isMobile ? iWidth * 1.5 : iWidth,
            height: iHeight,
            zIndex: 99999,
            borderRadius: '0px',
            ease: 'power2.inOut',
          },
          '> -0.4',
        );
    }, {scope: section, invalidateOnRefresh: true});

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className={`${styles.section} ${styles['section--experience']}`}
    >
      <div ref={zoomWrapperRef} className={styles['zoom-wrapper']}>
        <SectionTitle title="experience" accent=" & background" />

        <div className={styles['section-inner']}>
          <div className={`${styles['timeline-line-wrapper']} tl-head-wrapper`}>
            <span ref={tailRef} className={styles['tl-tail']} />
            <span ref={headRef} className={styles['tl-head']} />
          </div>

          <div className={styles.timeline} ref={timelineRef}>
            {experienceData.map((e: ExperienceEntry, i: number) => (
              <div
                key={i}
                ref={(el) => {
                  entryRefs.current[i] = el;
                }}
                className={`${styles['timeline-entry']} ${i % 2 === 0 ? styles['tl-left'] : styles['tl-right']}`}
              >
                <span className={styles['tl-dot']} />
                <div className={styles['tl-body']}>
                  <span className={styles['tl-period']}>{e.period}</span>
                  <span className={styles['tl-role']}>{e.role}</span>
                  <span className={styles['tl-org']}>{e.org}</span>
                  <p className={styles['tl-desc']}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={zoomZoneRef} className={styles['zoom-zone']} />
    </section>
  );
}
