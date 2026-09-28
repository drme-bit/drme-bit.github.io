'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { guestIdentity } from './identity';

export interface Viewer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface PresenceContextValue {
  selfId: string | null;
  viewers: Viewer[];
  ready: boolean;
}

const PresenceContext = createContext<PresenceContextValue>({
  selfId: null,
  viewers: [],
  ready: false,
});

const HEARTBEAT_MS = 15000;
const CURSOR_THROTTLE_MS = 120;
const CURSOR_MIN_DIST_PX = 6;
const STALE_MS = 45000;
const MAX_VIEWERS = 11;

function firebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

/*  Live presence over Firestore: anonymous auth, one doc per browser,
    heartbeat + throttled cursor broadcast, 45s staleness window.
    Everything lazy-loads — if Firebase is unreachable the site simply
    shows no presence and nothing else changes.  */

export function PresenceProvider({ children }: { children: ReactNode }) {
  const [selfId, setSelfId] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [ready, setReady] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!firebaseConfigured()) return;
    let cancelled = false;

    (async () => {
      try {
        const [{ db }, { getAuth, signInAnonymously }] = await Promise.all([
          import('@/shared/config/firebase'),
          import('firebase/auth'),
        ]);
        const {
          collection,
          doc,
          setDoc,
          deleteDoc,
          onSnapshot,
          query,
          orderBy,
          limit,
          serverTimestamp,
        } = await import('firebase/firestore');

        const cred = await signInAnonymously(getAuth());
        if (cancelled) return;
        const uid = cred.user.uid;
        const { name, color } = guestIdentity(uid);
        const docRef = doc(db, 'presence', uid);
        setSelfId(uid);

        const beat = (x: number | null, y: number | null) =>
          setDoc(
            docRef,
            {
              name,
              color,
              x: x ?? -100,
              y: y ?? -100,
              page: window.location.pathname,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          ).catch(() => {});

        await beat(null, null);

        const q = query(collection(db, 'presence'), orderBy('updatedAt', 'desc'), limit(MAX_VIEWERS + 1));
        const unsub = onSnapshot(
          q,
          (snap) => {
            if (cancelled) return;
            const now = Date.now();
            const list: Viewer[] = [];
            snap.forEach((d) => {
              if (d.id === uid || list.length >= MAX_VIEWERS) return;
              const v = d.data() as Partial<Viewer> & { updatedAt?: { toMillis?: () => number } };
              const seen = typeof v.updatedAt?.toMillis === 'function' ? v.updatedAt.toMillis() : 0;
              if (now - seen > STALE_MS) return;
              if (typeof v.name !== 'string' || typeof v.color !== 'string') return;
              list.push({
                id: d.id,
                name: v.name,
                color: v.color,
                x: typeof v.x === 'number' ? v.x : -100,
                y: typeof v.y === 'number' ? v.y : -100,
              });
            });
            setViewers(list);
            setReady(true);
          },
          () => {},
        );

        let lastSent = 0;
        let lastX = -1e9;
        let lastY = -1e9;
        const onMove = (e: MouseEvent) => {
          const now = Date.now();
          if (now - lastSent < CURSOR_THROTTLE_MS) return;
          if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < CURSOR_MIN_DIST_PX) return;
          lastSent = now;
          lastX = e.clientX;
          lastY = e.clientY;
          void beat(e.clientX, e.clientY);
        };
        const heartbeat = window.setInterval(() => {
          void beat(lastX > -1e8 ? lastX : null, lastY > -1e8 ? lastY : null);
        }, HEARTBEAT_MS);
        const bye = () => {
          deleteDoc(docRef).catch(() => {});
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('beforeunload', bye);
        stopRef.current = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('beforeunload', bye);
          window.clearInterval(heartbeat);
          unsub();
          bye();
        };
      } catch {
        /* Firebase unreachable — presence stays off, site unaffected. */
      }
    })();

    return () => {
      cancelled = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ selfId, viewers, ready }), [selfId, viewers, ready]);
  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence(): PresenceContextValue {
  return useContext(PresenceContext);
}
