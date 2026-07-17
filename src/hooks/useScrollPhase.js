import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useScrollPhase — Detects scroll phases for multi-stage animations.
 * Throttled to ~30fps to avoid excessive re-renders.
 */
export default function useScrollPhase({
  phases = [
    { id: 'intro', start: 0, end: 0.3 },
    { id: 'main', start: 0.3, end: 0.7 },
    { id: 'outro', start: 0.7, end: 1 },
  ],
  sectionId = '',
} = {}) {
  const [currentPhase, setCurrentPhase] = useState(phases[0]?.id || 'intro');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const sectionRef = useRef(null);
  const ticking = useRef(false);
  const lastUpdate = useRef(0);

  const findPhase = useCallback(
    (progress) => {
      for (const phase of phases) {
        if (progress >= phase.start && progress < phase.end) {
          return phase;
        }
      }
      return phases[phases.length - 1];
    },
    [phases]
  );

  const calculatePhaseProgress = useCallback(
    (progress, phase) => {
      const phaseRange = phase.end - phase.start;
      if (phaseRange === 0) return 0;
      return Math.max(0, Math.min(1, (progress - phase.start) / phaseRange));
    },
    []
  );

  useEffect(() => {
    const section = sectionRef.current || (sectionId ? document.getElementById(sectionId) : null);
    if (!section) return;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const now = performance.now();
        // Throttle to ~30fps (33ms)
        if (now - lastUpdate.current < 33) {
          ticking.current = false;
          return;
        }
        lastUpdate.current = now;

        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const scrollableHeight = rect.height - windowHeight;

        if (scrollableHeight <= 0) {
          setOverallProgress(0);
          setCurrentPhase(phases[0]?.id || 'intro');
          setPhaseProgress(0);
          ticking.current = false;
          return;
        }

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
        setOverallProgress(progress);

        const phase = findPhase(progress);
        setCurrentPhase(phase.id);

        const phaseProg = calculatePhaseProgress(progress, phase);
        setPhaseProgress(phaseProg);

        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionId, phases, findPhase, calculatePhaseProgress]);

  const isInPhase = useCallback(
    (phaseId) => currentPhase === phaseId,
    [currentPhase]
  );

  const getPhaseIndex = useCallback(
    () => phases.findIndex((p) => p.id === currentPhase),
    [phases, currentPhase]
  );

  const isPastPhase = useCallback(
    (phaseId) => {
      const phaseIndex = phases.findIndex((p) => p.id === phaseId);
      return getPhaseIndex() > phaseIndex;
    },
    [phases, getPhaseIndex]
  );

  return {
    currentPhase,
    phaseProgress,
    overallProgress,
    sectionRef,
    isInPhase,
    isPastPhase,
    getPhaseIndex,
    phases,
  };
}
