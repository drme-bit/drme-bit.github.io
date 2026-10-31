'use client';

import CodeBlock from '@/shared/ui/CodeBlock/CodeBlock';
import {
  Article,
  Section,
  H2,
  H3,
  P,
  C,
  Callout,
  Grid2,
  MiniCard,
} from '../ui/Article';

export default function PostContent() {
  return (
    <Article>
      <Section>
        <div className="flex flex-col gap-4">
          <H2>What are Discord Orbs?</H2>
          <P>
            Discord introduced &quot;Orbs&quot; — a virtual currency you earn by completing
            in-app quests. Watch a sponsored stream for 30 minutes? Earn orbs.
            Play a featured game for an hour? Earn orbs. These orbs can be spent
            on profile cosmetics, which makes them genuinely desirable.
          </P>
          <P>
            The problem: most quests require you to actually sit there and do
            the thing. Watch a 30-minute stream of a game you don&apos;t care about.
            Leave a game running for an hour. It&apos;s tedious, and most people
            don&apos;t have the time or patience for it.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>The Idea</H2>
          <P>
            Discord runs entirely in the browser (or Electron, which is just a
            browser). All the logic — quest tracking, progress reporting, heartbeats
            — happens in JavaScript. That means it&apos;s all accessible, inspectable,
            and ultimately, spoofable.
          </P>
          <P>
            The approach is simple: intercept Discord&apos;s internal stores and API
            calls, fake the data they expect, and let the quest system think
            you&apos;re actually doing the thing.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Step 1: Accessing Webpack Modules</H2>
          <P>
            Discord bundles its client with webpack. All the internal modules
            — stores, utilities, API clients — are accessible through webpack&apos;s
            module system. The trick is to tap into the chunk loading mechanism:
          </P>
          <CodeBlock lang="javascript" code={`let wpRequire = webpackChunkdiscord_app.push(
  [[Symbol()], {}, (r) => r]
);
webpackChunkdiscord_app.pop();`} />
          <P>
            This gives us <C>wpRequire</C> — a handle to webpack&apos;s internal
            require function. From here, we can iterate over all loaded modules
            and find the ones we need by looking for specific exported functions.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Step 2: Finding the Right Stores</H2>
          <P>
            Discord uses a Flux-like architecture. Key stores we need:
          </P>
          <Grid2>
            {[
              { title: 'QuestsStore', desc: 'Holds all quest data, progress, enrollment status' },
              { title: 'RunningGameStore', desc: 'Tracks which games are running on your system' },
              { title: 'ApplicationStreamingStore', desc: 'Provides active stream metadata for streaming quests' },
              { title: 'FluxDispatcher', desc: 'The event bus — dispatches actions and subscribes to events' },
            ].map((s) => (
              <MiniCard key={s.title} title={s.title} desc={s.desc} />
            ))}
          </Grid2>
          <P>
            Each store is found by scanning webpack modules for their signature
            methods. Discord&apos;s module exports have inconsistent naming (<C>Z</C>,
            <C>ZP</C>, <C>Ay</C>, etc.) across builds, so we check for both patterns:
          </P>
          <CodeBlock lang="javascript" code={`let QuestsStore = Object.values(wpRequire.c).find(
  (x) => x?.exports?.Z?.__proto__?.getQuest,
)?.exports.Z;`} />
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Step 3: Spoofing Each Quest Type</H2>
          <P>
            Discord has four main quest types, each requiring a different spoofing
            strategy:
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H3>WATCH_VIDEO</H3>
          <P>
            The simplest one. Discord sends video progress timestamps to their
            API. We just need to POST fake timestamps at a reasonable pace:
          </P>
          <CodeBlock lang="javascript" code={`await api.post({
  url: \`/quests/\${quest.id}/video-progress\`,
  body: {
    timestamp: Math.min(secondsNeeded, timestamp + Math.random()),
  },
});`} />
          <Callout tone="tip" label="Pacing">
            The key is pacing. Sending the full timestamp immediately would look
            suspicious. Instead, we advance by a few seconds every second, simulating
            real-time playback.
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H3>PLAY_ON_DESKTOP</H3>
          <P>
            This one is more involved. Discord checks if a game is running by
            querying the <C>RunningGameStore</C>. We need to:
          </P>
          <ol className="m-0 flex list-decimal list-inside flex-col gap-1.5 p-0 text-[0.86rem] leading-[1.7] text-[var(--text-secondary)] marker:font-mono marker:text-[var(--text-ghost)]">
            <li>Fetch the application metadata from Discord&apos;s API</li>
            <li>Create a fake game entry with a random PID</li>
            <li>Monkey-patch <C>getRunningGames()</C> to return our fake game</li>
            <li>Dispatch a <C>RUNNING_GAMES_CHANGE</C> event</li>
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
          <Callout tone="warn" label="Desktop only">
            This only works in the Discord desktop app (Electron), not in the
            browser. Discord&apos;s browser client doesn&apos;t have access to the
            running games API.
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H3>STREAM_ON_DESKTOP</H3>
          <P>
            Similar to PLAY_ON_DESKTOP, but we spoof the streaming metadata instead.
            We monkey-patch <C>getStreamerActiveStreamMetadata()</C> to return
            our fake application, then join any voice channel and stream. Discord
            thinks you&apos;re streaming the game.
          </P>
          <CodeBlock lang="javascript" code={`let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
  id: applicationId,
  pid,
  sourceName: null,
});`} />
          <Callout tone="info" label="Note">
            You still need at least one other person in the voice channel for the
            stream to count. The quest tracks stream duration, not viewer count.
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H3>PLAY_ACTIVITY</H3>
          <P>
            The most straightforward spoof. We find a voice channel, then send
            heartbeats every 20 seconds with a fake stream key until the quest
            is complete:
          </P>
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
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Putting It All Together</H2>
          <P>
            The full script chains all quests sequentially — finish one, move to
            the next. It handles both <C>taskConfig</C> v1 and v2 formats,
            respects enrollment timestamps to avoid suspicious speed, and
            automatically cleans up monkey-patches when each quest completes.
          </P>
          <P>
            The entire thing runs in the browser console (or injected via a
            userscript). No external tools, no modified clients, no TOS-violating
            modifications to Discord&apos;s code — just JavaScript executing in the
            same context the client already uses.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>The Ethical Gray Zone</H2>
          <P>
            Is this cheating? Technically, yes. Discord&apos;s quest system is designed
            to drive engagement with sponsored content, and bypassing that defeats
            the purpose. But on the other hand:
          </P>
          <ul className="m-0 flex list-disc list-inside flex-col gap-1.5 p-0 text-[0.86rem] leading-[1.7] text-[var(--text-secondary)] marker:text-[var(--text-ghost)]">
            <li>It doesn&apos;t harm other users</li>
            <li>It doesn&apos;t exploit any security vulnerability</li>
            <li>It uses only the APIs and modules Discord itself provides</li>
            <li>The orbs have negligible real-world value</li>
          </ul>
          <P>
            Discord could patch this at any time by validating quest progress
            server-side more strictly, checking for monkey-patched stores, or
            rate-limiting progress reports. The fact that they haven&apos;t suggests
            it&apos;s either low priority or they&apos;re aware and unconcerned.
          </P>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <H2>Conclusion</H2>
          <P>
            Reverse-engineering Discord&apos;s client internals was the real payoff here.
            The orbs were just motivation. Understanding how a complex web
            application manages state, communicates with its backend, and handles
            real-time events is genuinely valuable knowledge — and it all started
            with wanting to skip a 30-minute video.
          </P>
        </div>
      </Section>
    </Article>
  );
}
