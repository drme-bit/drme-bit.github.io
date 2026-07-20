'use client';
import { useEffect, useCallback, useRef } from 'react';

interface Phase {
  id: string;
  start: number;
  end: number;
}

interface UseScrollPhaseOptions {
  phases?: Phase[];
  sectionId?: string;
}

export default function useScrollPhase({
  phases = [
    { id: 'intro', start: 0, end: 0.3 },
    { id: 'main', start: 0.3, end: 0.7 },
    { id: 'outro', start: 0.7, end: 1 },
  ],
  sectionId = '',
}: UseScrollPhaseOptions = {}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const ticking = useRef(false);
  const progressRef = useRef(0);
  const phaseRef = useRef(phases[0]?.id || 'intro');
  const phaseProgressRef = useRef(0);

  const findPhase = useCallback(
    (progress: number): Phase => {
      for (const phase of phases) {
        if (progress >= phase.start && progress < phase.end) {
          return phase;
        }
      }
      return phases[phases.length - 1];
    },
    [phases],
  );

  useEffect(() => {
    const section =
      sectionRef.current || (sectionId ? document.getElementById(sectionId) : null);
    if (!section) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollRange = sectionHeight - windowHeight;

        if (scrollRange <= 0 || sectionHeight <= windowHeight) {
          progressRef.current = 0;
          phaseRef.current = phases[0]?.id || 'intro';
          phaseProgressRef.current = 0;
          ticking.current = false;
          return;
        }

        const scrolled = window.scrollY - sectionTop;
        const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
        progressRef.current = progress;

        const phase = findPhase(progress);
        phaseRef.current = phase.id;

        const phaseRange = phase.end - phase.start;
        phaseProgressRef.current =
          phaseRange === 0
            ? 0
            : Math.max(0, Math.min(1, (progress - phase.start) / phaseRange));

        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionId, phases, findPhase]);

  const getProgress = useCallback(() => progressRef.current, []);
  const getPhase = useCallback(() => phaseRef.current, []);
  const getPhaseProgress = useCallback(() => phaseProgressRef.current, []);

  return {
    getProgress,
    getPhase,
    getPhaseProgress,
    sectionRef,
    phases,
  };
}
