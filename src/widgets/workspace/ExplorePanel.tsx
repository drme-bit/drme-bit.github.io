'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';
import type { NavSectionLink } from '@/shared/config/navTypes';
import { useNav } from '@/app/providers/NavProvider';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import styles from './ExplorePanel.module.scss';
import ScrollProgressBar from '@/shared/ui/ScrollProgressBar/ScrollProgressBar';

const DEFAULT_SECTIONS: NavSectionLink[] = [
  { id: 'about', label: 'About', type: 'section', targetId: 'about' },
  { id: 'experience', label: 'Experience', type: 'section', targetId: 'experience' },
  { id: 'projects', label: 'Projects', type: 'section', targetId: 'projects' },
  { id: 'contact', label: 'Contact', type: 'section', targetId: 'contact' },
];

export default function ExplorePanel({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { active, pageConfig, setActiveSection, visitedSectionIds } = useNav();
  const sections = useMemo(() => {
    const contextualSections = pageConfig?.contextItems?.filter(
      (item): item is NavSectionLink => item.type === 'section',
    );
    return contextualSections?.length ? contextualSections : DEFAULT_SECTIONS;
  }, [pageConfig]);

  const navigateToSection = (section: NavSectionLink) => {
    setActiveSection(section.id);
    if (pageConfig?.onSectionClick) {
      pageConfig.onSectionClick(section.id);
    } else if (pathname === '/') {
      scrollToTarget(`#${section.targetId}`);
    } else {
      router.push(`/#${section.targetId}`);
    }
    onNavigate();
  };

  const currentSection = sections.find((section) => section.id === active.sectionId);
  const visitedCount = sections.filter((section) => visitedSectionIds.includes(section.id)).length;

  return (
    <div className={styles.root}>
      <div className={styles.progressBlock}>
        <ScrollProgressBar />
        <div className={styles.progressMeta}>
          <span>{visitedCount} of {sections.length} sections explored</span>
          <span>click to jump</span>
        </div>
      </div>
      <div className={styles.currentSection} aria-live="polite">
        <span>Reading now</span>
        <strong>{currentSection?.label ?? 'Choose a section'}</strong>
      </div>
      <div className={styles.sectionHeading}>
        <span>On this page</span>
        <small>{sections.length} sections</small>
      </div>
      <nav className={styles.sectionList} aria-label="Page sections">
        {sections.map((section) => {
          const isActive = active.sectionId === section.id;
          const isVisited = visitedSectionIds.includes(section.id);
          return (
            <button
              key={section.id}
              type="button"
              className={styles.sectionLink}
              data-active={isActive}
              data-visited={isVisited}
              aria-label={`${section.label}${isVisited ? ', explored' : ', not explored'}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={() => navigateToSection(section)}
            >
              <span className={styles.visitMark} data-visited={isVisited} aria-hidden="true">
                {isVisited && <Check size={12} />}
              </span>
              <span>{section.label}</span>
              <ArrowUpRight size={13} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
