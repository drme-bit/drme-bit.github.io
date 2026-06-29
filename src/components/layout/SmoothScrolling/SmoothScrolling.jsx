import { ReactLenis } from "lenis/react";

function SmoothScrolling({ children }) {
  const lenisOptions = {
    lerp: 0.1,         // Controls how smooth the scrolling is
    duration: 1.5,     // Slows down or speeds up the scrolling
    smoothTouch: true, // Disable smooth scroll on touch devices
    smooth: true,      // Smooth scroll for desktop (obviously)
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}

export { SmoothScrolling };