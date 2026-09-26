'use client';

import { useEffect, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from './lenisStore';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollingProps {
  children: ReactNode;
}

// ScrollTrigger updates only when Lenis actually scrolls — no permanent
// 60fps ticker loop burning CPU while the page sits still.
function ScrollSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    setLenis(lenis);
    const onScroll = (): void => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);
    return () => {
      lenis.off('scroll', onScroll);
      setLenis(null);
    };
  }, [lenis]);

  return null;
}

function SmoothScrolling({ children }: SmoothScrollingProps) {
  useEffect(() => {
    gsap.ticker.lagSmoothing(0);
    // iOS Safari: the collapsing address bar fires resizes mid-scroll —
    // don't let them nudge pinned/scrubbed triggers.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Fresh reload always starts at the top. Safari restores the previous
    // scroll position on reload — waking up mid-portal shows the flight's
    // end state (zoom done, violet field) before anything was scrolled,
    // which reads as a broken intro. Back/forward navigation is untouched.
    try {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav?.type === 'reload') {
        history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
      }
    } catch {
      /* private mode etc. — default behavior stays */
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    // Late fonts/images shift layout after the initial measurements:
    // without this, scrub choreography stays misaligned until something
    // else forces a refresh (the classic "scroll to the end and back").
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready
        .then(() => {
          ScrollTrigger.refresh();
        })
        .catch(() => {});
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.14,
        smoothWheel: true,
        infinite: false,
        // Route anchor clicks (portal "View work", footer links) through
        // Lenis instead of the browser's abrupt jump.
        anchors: true,
      }}
    >
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}

export { SmoothScrolling };
