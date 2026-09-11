'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { FiMapPin, FiDownload, FiMail, FiTerminal, FiHeart } from '@/shared/ui/atoms/Icon';
import { RESUME_FILE } from '@/entities/profile';
import { profile } from '@/entities/profile';
import { useInView } from '@/shared/hooks/useInView';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { BIO, HIGHLIGHTS, NOW_LIST, FUN_FACTS, STATS } from './data';
import { AccordionPanel } from './AccordionPanel';
import { CounterStat } from './CounterStat';
import { GitHubActivity } from './GitHubActivity';
import { AboutMarquee } from './AboutMarquee';
import styles from './About.module.scss';

const reveal = (inView: boolean) =>
  `${styles['ab-reveal']}${inView ? ` ${styles['ab-reveal--in']}` : ''}`;

const stagger = (index: number): CSSProperties => ({ '--i': index } as CSSProperties);

export default function About() {
  const [titleBoxRef, titleVisible] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [headerRef, headerIn] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [leadRef, leadIn] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [accordionRef, accordionIn] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [bottomRef, bottomIn] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [statsRef, statsIn] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="about" className={`${styles.section} ${styles['section--about']}`}>
      <div ref={titleBoxRef} className={styles['ab-title']}>
        <SectionTitle title="about" accent="_" visible={titleVisible} />
      </div>

      <div className={styles['ab-wrap']}>
        {/* ── Header · whoami left / identity chips right ── */}
        <div ref={headerRef} className={styles['ab-header']}>
          <div className={`${styles['ab-head-main']} ${reveal(headerIn)}`}>
            <p className={styles['ab-cmd']}>
              <span className={styles['ab-cmd-prompt']}>➜</span> whoami
            </p>
            <h2 className={styles['ab-name-big']} aria-label={profile.name}>
              {profile.name.split('').map((ch, i) => (
                <span key={i} aria-hidden="true" className={styles['ab-char']}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </h2>
            <p className={styles['ab-tagline']}>
              {profile.brandTagline.split(' ').map((word, i) => (
                <span key={i} className={styles['ab-tag-word']}>{word}</span>
              ))}
            </p>
          </div>

          <div className={`${styles['ab-head-side']} ${reveal(headerIn)}`}>
            <div className={`${styles['ab-status']} ${styles['ab-head-chip']}`}>
              <span className={styles['ab-status-dot']} />
              available for work
            </div>
            <div className={`${styles['ab-loc']} ${styles['ab-head-chip']}`}>
              <FiMapPin size={13} />
              <span>{profile.location}</span>
            </div>
            <a
              href={RESUME_FILE}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles['ab-resume']} ${styles['ab-head-chip']}`}
            >
              <FiDownload size={13} />
              <span>download résumé</span>
            </a>
            <a
              href={`mailto:${profile.email}`}
              className={`${styles['ab-mail']} ${styles['ab-head-chip']}`}
            >
              <FiMail size={13} />
              <span>{profile.email}</span>
            </a>
            <div className={styles['ab-watermark']} aria-hidden="true">01</div>
          </div>
        </div>

        {/* ── Lead · bio left / photo right ── */}
        <div ref={leadRef} className={`${styles['ab-lead']} ${reveal(leadIn)}`}>
          <div className={styles['ab-lead-main']}>
            <span className={styles['ab-step']} aria-hidden="true">
              <i>01</i> intro
            </span>
            <div className={styles['ab-hairline']} aria-hidden="true" />
            {BIO.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          <div className={styles['ab-lead-aside']}>
            <div className={styles['ab-photo-card']}>
              <div className={styles['ab-photo-frame']}>
                <Image
                  src="/images/17969af76asf9y986ad9fy.jpg"
                  alt={profile.name}
                  fill
                  className={styles['ab-photo-img']}
                  sizes="(max-width: 1024px) 90vw, 640px"
                  priority
                  quality={90}
                />
                <span className={styles['ab-photo-frame-ring']} aria-hidden="true" />
              </div>
              <div className={styles['ab-identity']}>
                <span className={styles['ab-name']}>{profile.name}</span>
                <span className={styles['ab-role']}>full-stack · react / three.js / rust / node.js</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── How I work · full-width accordion ── */}
        <div className={styles['ab-work']}>
          <div className={styles['ab-rail-label']} aria-hidden="true">
            <span className={styles['ab-rail-label-text']}>how I work</span>
            <span className={styles['ab-rail-label-index']}>02</span>
          </div>
          <div ref={accordionRef} className={`${styles['ab-accordion']} ${reveal(accordionIn)}`}>
            {HIGHLIGHTS.map((h, i) => (
              <AccordionPanel key={h.title} highlight={h} index={i} />
            ))}
          </div>
        </div>

        {/* ── Bottom · now + facts left / github right ── */}
        <div ref={bottomRef} className={styles['ab-bottom']}>
          <div className={`${styles['ab-bot-side']} ${reveal(bottomIn)}`}>
            <span className={styles['ab-step']} aria-hidden="true">
              <i>03</i> now
            </span>
            <div className={styles['ab-now']}>
              <div className={styles['ab-now-head']}>
                <FiTerminal size={13} />
                <span>currently</span>
              </div>
              <ul className={styles['ab-now-list']}>
                {NOW_LIST.map((item) => (
                  <li key={item}><span className={styles['ab-now-arrow']}>›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles['ab-facts']}>
              <div className={styles['ab-now-head']}>
                <FiHeart size={13} />
                <span>beyond the code</span>
              </div>
              <div className={styles['ab-chips']}>
                {FUN_FACTS.map((f) => (
                  <span key={f} className={styles['ab-chip']}>{f}</span>
                ))}
              </div>
            </div>
          </div>
          <div className={`${styles['ab-bot-main']} ${reveal(bottomIn)}`}>
            <GitHubActivity />
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div ref={statsRef} className={styles['ab-stats-strip']}>
          {STATS.map((s, i) => (
            <div key={s.label} className={`${styles['ab-stat-reveal']} ${styles[statsIn ? 'ab-stat-reveal--in' : '']}`} style={stagger(i)}>
              <CounterStat value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Marquee · full-bleed ticker ── */}
      <AboutMarquee />
    </section>
  );
}