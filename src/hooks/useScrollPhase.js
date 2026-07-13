import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useScrollPhase — Detects scroll phases for multi-stage animations
 *
 * @param {Object} options
 * @param {Array} options.phases - Array of phase definitions with start/end percentages
 * @param {string} options.sectionId - ID of the section to observe
 * @returns {Object} Phase state and progress
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

  // Find which phase we're in based on progress
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

  // Calculate progress within current phase
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
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableHeight = rect.height - windowHeight;

      if (scrollableHeight <= 0) {
        setOverallProgress(0);
        setCurrentPhase(phases[0]?.id || 'intro');
        setPhaseProgress(0);
        return;
      }

      // Calculate overall progress through section
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setOverallProgress(progress);

      // Find current phase
      const phase = findPhase(progress);
      setCurrentPhase(phase.id);

      // Calculate phase-specific progress
      const phaseProg = calculatePhaseProgress(progress, phase);
      setPhaseProgress(phaseProg);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionId, phases, findPhase, calculatePhaseProgress]);

  // Helper to check if we're in a specific phase
  const isInPhase = useCallback(
    (phaseId) => {
      return currentPhase === phaseId;
    },
    [currentPhase]
  );

  // Helper to get phase index
  const getPhaseIndex = useCallback(() => {
    return phases.findIndex((p) => p.id === currentPhase);
  }, [phases, currentPhase]);

  // Helper to check if we're past a specific phase
  const isPastPhase = useCallback(
    (phaseId) => {
      const phaseIndex = phases.findIndex((p) => p.id === phaseId);
      const currentIndex = getPhaseIndex();
      return currentIndex > phaseIndex;
    },
    [phases, currentPhase, getPhaseIndex]
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
