'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import useReveal from '@/shared/hooks/useReveal';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import LocationMap from '@/shared/ui/molecules/LocationMap/LocationMap';
import aboutData from '@/data/aboutData';
import styles from './About.module.scss';

// utility
import { log } from '@/shared/lib/logger'

/* Icons */
import { BsFillKanbanFill } from 'react-icons/bs';
import { LuTriangle } from 'react-icons/lu';
import { RiOpenSourceFill, RiRobot2Fill } from 'react-icons/ri';

/* ─── Intro Block ──────────────────────────────────────── */

function IntroBlock({ text, active, delay }: { text: string; active: boolean; delay: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  return (
    <p
      ref={ref}
      className={`${styles['about-intro-text']}${open ? ` ${styles['is-open']}` : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {text}
    </p>
  );
}

/* ─── GitHub Activity ──────────────────────────────────── */
interface CommitInfo {
  hash: string;
  message: string;
  date: string;
  repo: string;
}

function GitHubActivity() {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchGitHub() {
      try {
        const res = await fetch('https://api.github.com/users/drme-bit/events/public?per_page=30');
        if (!res.ok) {
          log(`Github response with status code ${res.status} ${res.body}`);
        } else {
          log(`Github response with status code ${res.status} ${res.body}`);
        }
        const events = await res.json();

        const pushEvents = events
          .filter((e: { type: string }) => e.type === 'PushEvent')
          .slice(0, 5);

        const detailed = await Promise.all(
          pushEvents.map(async (e: any) => {
            const commitRes = await fetch(
              `https://api.github.com/repos/${e.repo.name}/commits/${e.payload.head}`,
            );
            if (!commitRes.ok) return null;
            const data = await commitRes.json();
            return {
              hash: data.sha.slice(0, 7),
              message: data.commit.message.split('\n')[0],
              date: new Date(e.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              repo: e.repo.name.split('/')[1],
            };
          }),
        );

        setCommits(detailed.filter(Boolean) as CommitInfo[]);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    fetchGitHub().finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles['about-github']}>
      <div className={styles['about-github-bar']}>
        <span className={`${styles['about-map-dot']} ${styles['about-map-dot--r']}`} />
        <span className={`${styles['about-map-dot']} ${styles['about-map-dot--y']}`} />
        <span className={`${styles['about-map-dot']} ${styles['about-map-dot--g']}`} />
        <span className={styles['about-map-title']}>git log --all --oneline</span>
      </div>
      <div className={styles['about-github-body']}>
        {loading ? (
          <div className={styles['about-github-loading']}>fetching...</div>
        ) : error ? (
          <div className={styles['about-github-loading']}>git log unavailable</div>
        ) : (
          commits.map((c, i) => (
            <div key={i} className={styles['about-github-commit']}>
              <span className={styles['about-github-sha']}>{c.hash}</span>
              <span className={styles['about-github-msg']}>{c.message}</span>
              <span className={styles['about-github-repo']}>{c.repo}</span>
              <span className={styles['about-github-date']}>{c.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── About ──────────────────────────────────────────────── */

const INTRO_LINES = [
  "Hello there! I'm Vyacheslav, a software engineer from Ukraine. I spend my days turning coffee into code and my nights wondering why it worked yesterday.",
  'I love building things — from web applications and backend services to developer tools that make life just a little easier. I enjoy solving problems, optimizing performance, and turning messy ideas into clean, reliable software. The bigger the challenge, the more interesting it becomes.',
  "I recently graduated with a Professional Junior Bachelor's degree in Software Engineering and have been constantly exploring new technologies ever since. Lately, I've been working with modern web stacks, backend development, APIs, databases, cloud infrastructure, and a bit of everything that catches my curiosity.",
  "I believe the best way to learn is to build. That's why you'll usually find me experimenting with new projects, rewriting something \u201Cjust because it can be better,\u201D or diving into technologies I've never used before. I'm always looking for the next challenge… though sometimes it's just another excuse to open my IDE.",
];

export default function About() {
  const [ref, visible] = useReveal();

  return (
    <section
      id="about"
      ref={ref}
      className={`${styles.section} ${styles['section--about']} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}
    >
      <SectionTitle title="about" accent="_" visible={visible} />

      <div className={styles['about-whoami']}>
        <p className={styles['about-whoami-cmd']}>
          <span className={styles['about-whoami-prompt']}>&gt;</span> whoami
        </p>
        <h2 className={styles['about-whoami-name']}>Vyacheslav Tkachyk</h2>
        <p className={styles['about-whoami-tags']}>
          Software Engineer <span className={styles['about-whoami-sep']}>·</span> Coffee Lover{' '}
          <span className={styles['about-whoami-sep']}>·</span> <s>Ukraine</s> Ukrai
          <span className={styles['about-whoami-error']}>TypeError: locate is not a function</span>
        </p>
      </div>

      <div className={styles['about-layout']}>
        {/* ── Photo Column ── */}
        <div className={styles['about-photo-col']}>
          <div className={styles['about-photo-frame']}>
            <Image
              src="/images/17969af76asf9y986ad9fy.jpg"
              alt="Vyacheslav Tkachyk"
              fill
              className={styles['about-photo-img']}
              sizes="(max-width: 900px) 280px, 320px"
              priority
              quality={90}
            />
            <div className={styles['about-photo-glow']} />
          </div>

          <LocationMap
            lat={46.482952}
            lng={30.712481}
            city={'Im here :3'}
            zoom={5}
            className={styles['about-map-canvas']}
          />
          <div className={styles['about-map-coords']}>46.482952&deg; N, 30.712481&deg; E</div>
        </div>

        {/* ── Content Column ── */}
        <div className={styles['about-content-col']}>
          {/* ── Intro Paragraphs ── */}
          <div className={styles['about-intro']}>
            {INTRO_LINES.map((text, i) => (
              <IntroBlock key={i} text={text} active={visible} delay={0.1 + i * 0.1} />
            ))}
          </div>

          {/* ── Bento Grid ── */}
          <div className={styles['about-bento']}>
            <div className={`${styles['about-bento-card']} ${styles['about-bento-card--wide']}`}>
              <BsFillKanbanFill />
              <span className={styles['about-bento-title']}>Kanban Workflow</span>
              <div className={`${styles['about-bento-demo']} w-85 h-95 mx-auto rounded-md`}>
                <Image
                  src="/images/demonstration/kanban-demo.png"
                  alt="Kanban Demonstration"
                  fill
                  quality={90}
                />
              </div>
              <p className={styles['about-bento-desc']}>
                I follow a Kanban workflow where tasks move through clear stages — Backlog, In
                Progress, Review, and Done. I keep my board clean and organized, move cards with
                intention, and prefer shipping in small, frequent iterations. This approach helps me
                stay focused, reduce context switching, and deliver value consistently.
              </p>
              <span className={styles['about-bento-tag']}>productivity</span>
            </div>

            <div className={styles['about-bento-card']}>
              <RiRobot2Fill />
              <span className={styles['about-bento-title']}>AI-Augmented</span>
              <div className={`${styles['about-bento-demo']} w-85 h-70 mx-auto rounded-md`}>
                <Image
                  src="/images/demonstration/jetbrains-ai-use-demo.png"
                  alt="Using AI as a tool"
                  fill
                  quality={90}
                />
              </div>
              <p className={styles['about-bento-desc']}>
                I integrate modern tools into my workflow to boost productivity and code quality.
                GitHub Copilot and Cursor provide powerful autocompletion and refactoring, ChatGPT
                helps with reviews and problem-solving, while GitHub Security tools and Dependabot
                keep dependencies secure and up-to-date. I also use Linear AI, Vercel tools, and
                other agents to streamline development.
              </p>
              <span className={styles['about-bento-tag']}>tooling</span>
            </div>

            <div className={`${styles['about-bento-card']} ${styles['about-bento-card--tall']}`}>
              <LuTriangle />
              <span className={styles['about-bento-title']}>Persistent</span>
              <div className={`${styles['about-bento-demo']} w-85 h-90 rounded-md mx-auto`}>
                <Image
                  src="/images/demonstration/me-coding-demo.png"
                  alt="this is me coding"
                  fill
                  quality={90}
                />
              </div>
              <p className={styles['about-bento-desc']}>
                When something doesn&apos;t work, I don&apos;t stop. I dig through docs, read source
                code, and find the answer. Every bug is a puzzle &mdash; I just need more time to
                solve it.
              </p>
              <span className={styles['about-bento-tag']}>mindset</span>
            </div>

            <div className={styles['about-bento-card']}>
              <RiOpenSourceFill />
              <span className={styles['about-bento-title']}>Open Source</span>
              <p className={styles['about-bento-desc']}>
                Contributing to tools I use daily. Building things others can reuse.
              </p>
              <span className={styles['about-bento-tag']}>community</span>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className={styles['about-stats-row']}>
            {aboutData.stats.map((stat: { value: string; label: string }, i: number) => (
              <div
                key={stat.label}
                className={styles['about-stat-item']}
                style={{ animationDelay: `${0.4 + i * 0.08}s` }}
              >
                <span className={styles['about-stat-value']}>{stat.value}</span>
                <span className={styles['about-stat-label']}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* ── GitHub Activity ── */}
          <GitHubActivity />
        </div>
      </div>
    </section>
  );
}
