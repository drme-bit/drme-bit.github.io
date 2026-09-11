'use client';

import { useEffect, type ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollingProps {
  children: ReactNode;
}

function SmoothScrolling({ children }: SmoothScrollingProps) {
  useEffect(() => {

    const update = (_time: number) => {
      ScrollTrigger.update();
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(timer);
    };
  }, []);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        infinite: false,
        naiveDimensions: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export { SmoothScrolling };
