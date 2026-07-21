'use client';

import { useEffect } from 'react';
import { useNav } from '@/providers/NavProvider';

type SectionObserverOptions = {
  /** Prepended to each section id when querying DOM (e.g. "section-") */
  prefix?: string;
  threshold?: number;
};

/**
 * Tracks which section is in view and updates NavProvider active state.
 */
export default function useSectionObserver(
  sectionIds: string[],
  options?: SectionObserverOptions,
) {
  const { setActiveSection } = useNav();
  const prefix = options?.prefix ?? '';
  const threshold = options?.threshold ?? 0.3;

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(`${prefix}${id}`);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [sectionIds, prefix, threshold, setActiveSection]);
}
