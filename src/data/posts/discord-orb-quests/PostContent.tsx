'use client';

import { useEffect, useRef, useState } from 'react';
import { CodeBlock } from '@/shared/ui/molecules/CodeBlock';
import styles from './PostContent.module.scss';

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles['section']}${visible ? ` ${styles['is-visible']}` : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function Callout({ type, children }: { type: 'info' | 'warn' | 'tip'; children: React.ReactNode }) {
  return (
    <div className={`${styles['callout']} ${styles[`callout--${type}`]}`}>
      <span className={styles['callout-icon']}>
        {type === 'info' ? 'ℹ' : type === 'warn' ? '⚠' : '✦'}
      </span>
      <div>{children}</div>
    </div>
  );
}

export default function PostContent() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles['hero-glow']} />
        <div className={styles['hero-content']}>
          <span className={styles['hero-badge']}>Discord · Reverse Engineering</span>
          <h1 className={styles['hero-title']}>
            How I Automated<br />
            <span className={styles['hero-accent']}>Discord Orb Quests</span>
          </h1>
          <p className={styles['hero-desc']}>
            A deep-dive into Discord&apos;s internal webpack modules and how to
            spoof quest progress to earn orbs without actually watching videos
            or playing games.
          </p>
          <div className={styles['hero-meta']}>
            <span>Jul 28, 2026</span>
            <span className={styles['hero-dot']} />
            <span>8 min read</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className={styles.content}>

        <Section>
          <h2>What are Discord Orbs?</h2>
          <p>
            Discord introduced &quot;Orbs&quot; — a virtual currency you earn by completing
            in-app quests. Watch a sponsored stream for 30 minutes? Earn orbs.
            Play a featured game for an hour? Earn orbs. These orbs can be spent
            on profile cosmetics, which makes them genuinely desirable.
          </p>
          <p>
            The problem: most quests require you to actually sit there and do
            the thing. Watch a 30-minute stream of a game you don&apos;t care about.
            Leave a game running for an hour. It&apos;s tedious, and most people
            don&apos;t have the time or patience for it.
          </p>
        </Section>

        <Section delay={0.1}>
          <h2>The Idea</h2>
          <p>
            Discord runs entirely in the browser (or Electron, which is just a
            browser). All the logic — quest tracking, progress reporting, heartbeats
            — happens in JavaScript. That means it&apos;s all accessible, inspectable,
            and ultimately, spoofable.
          </p>
          <p>
            The approach is simple: intercept Discord&apos;s internal stores and API
            calls, fake the data they expect, and let the quest system think
            you&apos;re actually doing the thing.
          </p>
        </Section>

        <Section delay={0.1}>
          <h2>Step 1: Accessing Webpack Modules</h2>
          <p>
            Discord bundles its client with webpack. All the internal modules
            — stores, utilities, API clients — are accessible through webpack&apos;s
            module system. The trick is to tap into the chunk loading mechanism:
          </p>
          <CodeBlock lang="javascript" code={`let wpRequire = webpackChunkdiscord_app.push(
  [[Symbol()], {}, (r) => r]
);
webpackChunkdiscord_app.pop();`} />
          <p>
            This gives us <code>wpRequire</code> — a handle to webpack&apos;s internal
            require function. From here, we can iterate over all loaded modules
            and find the ones we need by looking for specific exported functions.
          </p>
        </Section>

        <Section delay={0.1}>
          <h2>Step 2: Finding the Right Stores</h2>
          <p>
            Discord uses a Flux-like architecture. Key stores we need:
          </p>
          <div className={styles['store-grid']}>
            <div className={styles['store-card']}>
              <span className={styles['store-name']}>QuestsStore</span>
              <span className={styles['store-desc']}>Holds all quest data, progress, enrollment status</span>
            </div>
            <div className={styles['store-card']}>
              <span className={styles['store-name']}>RunningGameStore</span>
              <span className={styles['store-desc']}>Tracks which games are running on your system</span>
            </div>
            <div className={styles['store-card']}>
              <span className={styles['store-name']}>ApplicationStreamingStore</span>
              <span className={styles['store-desc']}>Provides active stream metadata for streaming quests</span>
            </div>
            <div className={styles['store-card']}>
              <span className={styles['store-name']}>FluxDispatcher</span>
              <span className={styles['store-desc']}>The event bus — dispatches actions and subscribes to events</span>
            </div>
          </div>
          <p>
            Each store is found by scanning webpack modules for their signature
            methods. Discord&apos;s module exports have inconsistent naming (<code>Z</code>,
            <code>ZP</code>, <code>Ay</code>, etc.) across builds, so we check for both patterns:
          </p>
          <CodeBlock lang="javascript" code={`let QuestsStore = Object.values(wpRequire.c).find(
  (x) => x?.exports?.Z?.__proto__?.getQuest,
)?.exports.Z;`} />
        </Section>

        <Section delay={0.1}>
          <h2>Step 3: Spoofing Each Quest Type</h2>
          <p>
            Discord has four main quest types, each requiring a different spoofing
            strategy:
          </p>
        </Section>

        <Section delay={0.15}>
          <h3>WATCH_VIDEO</h3>
          <p>
            The simplest one. Discord sends video progress timestamps to their
            API. We just need to POST fake timestamps at a reasonable pace:
          </p>
          <CodeBlock lang="javascript" code={`await api.post({
  url: \`/quests/\${quest.id}/video-progress\`,
  body: {
    timestamp: Math.min(secondsNeeded, timestamp + Math.random()),
  },
});`} />
          <Callout type="tip">
            The key is pacing. Sending the full timestamp immediately would look
            suspicious. Instead, we advance by a few seconds every second, simulating
            real-time playback.
          </Callout>
        </Section>

        <Section delay={0.15}>
          <h3>PLAY_ON_DESKTOP</h3>
          <p>
            This one is more involved. Discord checks if a game is running by
            querying the <code>RunningGameStore</code>. We need to:
          </p>
          <ol className={styles.steps}>
            <li>Fetch the application metadata from Discord&apos;s API</li>
            <li>Create a fake game entry with a random PID</li>
            <li>Monkey-patch <code>getRunningGames()</code> to return our fake game</li>
            <li>Dispatch a <code>RUNNING_GAMES_CHANGE</code> event</li>
            <li>Listen for heartbeat confirmations to track progress</li>
          </ol>
          <CodeBlock lang="javascript" code={`const fakeGame = {
  cmdLine: \`C:\\\\Program Files\\\\\${appData.name}\\\\\${execName}\`,
  execName,
  hidden: false,
  id: applicationId,
  name: appData.name,
  pid: Math.floor(Math.random() * 30000) + 1000,
  start: Date.now(),
};

RunningGameStore.getRunningGames = () => [fakeGame];
FluxDispatcher.dispatch({
  type: "RUNNING_GAMES_CHANGE",
  removed: realGames,
  added: [fakeGame],
  games: [fakeGame],
});`} />
          <Callout type="warn">
            This only works in the Discord desktop app (Electron), not in the
            browser. Discord&apos;s browser client doesn&apos;t have access to the
            running games API.
          </Callout>
        </Section>

        <Section delay={0.15}>
          <h3>STREAM_ON_DESKTOP</h3>
          <p>
            Similar to PLAY_ON_DESKTOP, but we spoof the streaming metadata instead.
            We monkey-patch <code>getStreamerActiveStreamMetadata()</code> to return
            our fake application, then join any voice channel and stream. Discord
            thinks you&apos;re streaming the game.
          </p>
          <CodeBlock lang="javascript" code={`let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
  id: applicationId,
  pid,
  sourceName: null,
});`} />
          <Callout type="info">
            You still need at least one other person in the voice channel for the
            stream to count. The quest tracks stream duration, not viewer count.
          </Callout>
        </Section>

        <Section delay={0.15}>
          <h3>PLAY_ACTIVITY</h3>
          <p>
            The most straightforward spoof. We find a voice channel, then send
            heartbeats every 20 seconds with a fake stream key until the quest
            is complete:
          </p>
          <CodeBlock lang="javascript" code={`const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id;
const streamKey = \`call:\${channelId}:1\`;

while (true) {
  const res = await api.post({
    url: \`/quests/\${quest.id}/heartbeat\`,
    body: { stream_key: streamKey, terminal: false },
  });
  if (res.body.progress.PLAY_ACTIVITY.value >= secondsNeeded) break;
  await new Promise((r) => setTimeout(r, 20000));
}`} />
        </Section>

        <Section delay={0.1}>
          <h2>Putting It All Together</h2>
          <p>
            The full script chains all quests sequentially — finish one, move to
            the next. It handles both <code>taskConfig</code> v1 and v2 formats,
            respects enrollment timestamps to avoid suspicious speed, and
            automatically cleans up monkey-patches when each quest completes.
          </p>
          <p>
            The entire thing runs in the browser console (or injected via a
            userscript). No external tools, no modified clients, no TOS-violating
            modifications to Discord&apos;s code — just JavaScript executing in the
            same context the client already uses.
          </p>
        </Section>

        <Section delay={0.1}>
          <h2>The Ethical Gray Zone</h2>
          <p>
            Is this cheating? Technically, yes. Discord&apos;s quest system is designed
            to drive engagement with sponsored content, and bypassing that defeats
            the purpose. But on the other hand:
          </p>
          <ul className={styles.list}>
            <li>It doesn&apos;t harm other users</li>
            <li>It doesn&apos;t exploit any security vulnerability</li>
            <li>It uses only the APIs and modules Discord itself provides</li>
            <li>The orbs have negligible real-world value</li>
          </ul>
          <p>
            Discord could patch this at any time by validating quest progress
            server-side more strictly, checking for monkey-patched stores, or
            rate-limiting progress reports. The fact that they haven&apos;t suggests
            it&apos;s either low priority or they&apos;re aware and unconcerned.
          </p>
        </Section>

        <Section delay={0.1}>
          <h2>Conclusion</h2>
          <p>
            Reverse-engineering Discord&apos;s client internals was the real payoff here.
            The orbs were just motivation. Understanding how a complex web
            application manages state, communicates with its backend, and handles
            real-time events is genuinely valuable knowledge — and it all started
            with wanting to skip a 30-minute video.
          </p>
        </Section>

      </article>
    </div>
  );
}
