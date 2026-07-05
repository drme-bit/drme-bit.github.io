import { useEffect, useState } from 'react';
import { ReactLenis } from "lenis/react";

function SmoothScrolling({ children }) {
  const [touch, setTouch] = useState(true);
  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const lenisOptions = {
    lerp: touch ? 0 : 0.1,
    duration: touch ? 0 : 1.5,
    smoothTouch: false,
    touchInertiaMultiplier: touch ? 1 : 0,
    smooth: !touch,
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}

export { SmoothScrolling };