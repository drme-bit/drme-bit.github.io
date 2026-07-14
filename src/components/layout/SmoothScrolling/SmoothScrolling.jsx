import { useEffect, useState } from 'react';
import { ReactLenis } from "lenis/react";

function SmoothScrolling({ children }) {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  // On touch devices we enable a *light* smooth scroll via syncTouch so the
  // scroll-linked animations feel the same as on desktop (where Lenis smooths
  // the wheel). We keep the lerp gentle and inertia modest so it stays snappy
  // and doesn't feel "draggy" or laggy on lower-end phones.
  const lenisOptions = touch
    ? {
        lerp: 0.12,
        syncTouch: true,
        syncTouchLerp: 0.09,
        touchInertiaMultiplier: 18,
      }
    : {
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
      };

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}

export { SmoothScrolling };
