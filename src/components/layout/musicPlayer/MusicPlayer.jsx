import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import './MusicPlayer.scss';

/*
  Background music player — visually aligned with the iso-terrain scene:
  black surface, hairline white/cyan borders, monochrome cover art, cyan
  reserved for the active/progress state only.

  Behavioral fixes vs. the original:
  - No play()/load() race: a version counter guards against a stale play()
    promise resolving after the user has already switched tracks again.
  - The "just appeared" panel only opens on a manual action (toggle, next,
    prev, dismiss-and-reopen via tab). Auto-advance on track end never
    re-opens a panel the user closed — it advances silently in the background.
  - Pauses on tab hidden, resumes only if it was actually playing before
    (a manual pause stays paused when you come back).
  - The "start on first interaction" listeners detach themselves the moment
    they've fired once, instead of lingering until unmount.
*/

const TRACKS = [
  { title: 'Stillness', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { title: 'Drift', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { title: 'Haze', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { title: 'Fade', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  { title: 'Piano Study', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
  { title: 'Dusk', artist: 'Ambient', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
];

function generateCover(title) {
  const c = document.createElement('canvas');
  c.width = 100; c.height = 100;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 100, 100);

  const pattern = title.length % 4;
  x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    x.beginPath();
    x.arc(50 + Math.cos(a) * 20, 50 + Math.sin(a) * 20, 8 + i * 3, 0, Math.PI * 2);
    x.stroke();
  }
  x.strokeStyle = 'rgba(94,200,216,0.55)'; x.lineWidth = 1.3;
  if (pattern === 0) {
    x.beginPath(); x.arc(50, 50, 28, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(50, 50, 14, 0, Math.PI * 2); x.stroke();
  } else if (pattern === 1) {
    for (let i = 0; i < 3; i++) {
      const y = 22 + i * 28;
      x.beginPath(); x.moveTo(15, y); x.lineTo(85, y); x.stroke();
    }
  } else if (pattern === 2) {
    x.beginPath(); x.moveTo(50, 22); x.lineTo(78, 68); x.lineTo(22, 68); x.closePath(); x.stroke();
  } else {
    x.beginPath(); x.moveTo(50, 22); x.lineTo(78, 50); x.lineTo(50, 78); x.lineTo(22, 50); x.closePath(); x.stroke();
  }
  x.fillStyle = 'rgba(255,255,255,0.08)';
  x.font = 'bold 40px -apple-system, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(title.charAt(0), 50, 51);
  return c.toDataURL();
}

function formatTime(s) {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const closeTimer = useRef(null);
  const startedRef = useRef(false);
  const versionRef = useRef(0); // guards against stale play() races on fast track switches
  const wasPlayingBeforeHidden = useRef(false);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  const track = TRACKS[idx];
  const cover = useMemo(() => generateCover(track.title), [track.title]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    clearTimeout(closeTimer.current);
  }, []);

  // only call this from a manual user action — never from the auto-advance path
  const openPanelTemporarily = useCallback(() => {
    setPanelOpen(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closePanel, 5000);
  }, [closePanel]);

  const loadAndMaybePlay = useCallback((trackIdx, shouldPlay) => {
    const a = audioRef.current;
    if (!a) return;
    const myVersion = ++versionRef.current;
    a.src = TRACKS[trackIdx].src;
    a.load();
    if (!shouldPlay) return;
    a.play()
      .then(() => {
        if (versionRef.current === myVersion) setPlaying(true);
        // if a newer track switch happened meanwhile, just let it play silently —
        // the next loadAndMaybePlay call already owns the audio element's state
      })
      .catch(() => {
        if (versionRef.current === myVersion) setPlaying(false);
      });
  }, []);

  const goToTrack = useCallback((nextIdx, { manual }) => {
    setIdx(nextIdx);
    loadAndMaybePlay(nextIdx, startedRef.current);
    if (manual) openPanelTemporarily();
  }, [loadAndMaybePlay, openPanelTemporarily]);

  const handleNext = useCallback((opts = { manual: true }) => {
    goToTrack((idx + 1) % TRACKS.length, opts);
  }, [idx, goToTrack]);

  const handlePrev = useCallback(() => {
    goToTrack((idx - 1 + TRACKS.length) % TRACKS.length, { manual: true });
  }, [idx, goToTrack]);

  const idxRef = useRef(idx);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  // audio element lifecycle — created once; ended/timeupdate read idxRef so they
  // always act on the current track even though this effect never re-runs
  useEffect(() => {
    const a = new Audio();
    a.loop = false;
    a.volume = 0.06;
    audioRef.current = a;

    const onEnded = () => {
      const nextIdx = (idxRef.current + 1) % TRACKS.length;
      goToTrack(nextIdx, { manual: false });
    };
    const onTimeUpdate = () => setProgress({ current: a.currentTime, duration: a.duration || 0 });

    a.addEventListener('ended', onEnded);
    a.addEventListener('timeupdate', onTimeUpdate);
    a.src = TRACKS[0].src;

    return () => {
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('timeupdate', onTimeUpdate);
      a.pause();
      a.src = '';
    };
    // goToTrack is stable (only depends on loadAndMaybePlay/openPanelTemporarily,
    // both useCallback with stable deps), so this is safe to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start on first user interaction with the page (autoplay policies)
  useEffect(() => {
    const start = () => {
      startedRef.current = true;
      const a = audioRef.current;
      if (!a) return;
      a.play().then(() => setPlaying(true)).catch(() => {});
      detach();
    };
    const detach = () => {
      document.removeEventListener('click', start);
      document.removeEventListener('touchstart', start);
      document.removeEventListener('keydown', start);
    };
    document.addEventListener('click', start);
    document.addEventListener('touchstart', start);
    document.addEventListener('keydown', start);
    return detach;
  }, []);

  // pause on hidden tab, resume only if it was actually playing before
  useEffect(() => {
    const onVisibility = () => {
      const a = audioRef.current;
      if (!a) return;
      if (document.hidden) {
        wasPlayingBeforeHidden.current = playing;
        if (playing) a.pause();
      } else if (wasPlayingBeforeHidden.current) {
        a.play().then(() => setPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [playing]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      startedRef.current = true;
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
    openPanelTemporarily();
  };

  const handleTabClick = () => {
    if (panelOpen) closePanel();
    else openPanelTemporarily();
  };

  if (dismissed) return null;

  const pct = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

  return (
    <div className="mp-wrap">
      {panelOpen && (
        <div className="mp-panel"
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={openPanelTemporarily}
        >
          <img src={cover} alt="" className="mp-cover" />
          <div className="mp-body">
            <div className="mp-title">{track.title}</div>
            <div className="mp-artist">{track.artist}</div>

            <div className="mp-progress-track">
              <div className="mp-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="mp-time">
              <span>{formatTime(progress.current)}</span>
              <span>{formatTime(progress.duration)}</span>
            </div>

            <div className="mp-controls">
              <button className="mp-btn" onClick={handlePrev} aria-label="Previous track">
                <PrevIcon />
              </button>
              <button className="mp-btn-primary" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button className="mp-btn" onClick={() => handleNext({ manual: true })} aria-label="Next track">
                <NextIcon />
              </button>
            </div>
          </div>
          <button className="mp-close" onClick={() => setDismissed(true)} aria-label="Close player">
            <CloseIcon />
          </button>
        </div>
      )}

      <button className="mp-tab" onClick={handleTabClick} aria-label="Toggle player">
        {playing ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
      </button>
    </div>
  );
}

function PlayIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 4 L20 12 L6 20 Z" fill="currentColor" />
    </svg>
  );
}
function PauseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M5 4 L16 12 L5 20 Z" fill="currentColor" />
      <rect x="17" y="4" width="3" height="16" fill="currentColor" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M19 4 L8 12 L19 20 Z" fill="currentColor" />
      <rect x="4" y="4" width="3" height="16" fill="currentColor" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 5 L19 19 M19 5 L5 19" />
    </svg>
  );
}