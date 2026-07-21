'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiHome, FiUser, FiZap, FiBriefcase, FiGrid, FiFileText, FiStar, FiMail, FiChevronUp } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import styles from './Navbar.module.scss';

interface NavItem {
  id: string;
  label: string;
  Icon: IconType;
  href?: string;
}

const ITEMS: NavItem[] = [
  { id: 'hero', label: 'Home', Icon: FiHome },
  { id: 'about', label: 'About', Icon: FiUser },
  { id: 'skills', label: 'Skills', Icon: FiZap },
  { id: 'experience', label: 'Exp', Icon: FiBriefcase },
  { id: 'projects', label: 'Work', Icon: FiGrid },
  { id: 'blog', label: 'Blog', Icon: FiFileText, href: '/posts' },
  { id: 'reviews', label: 'Reviews', Icon: FiStar },
  { id: 'contact', label: 'Mail', Icon: FiMail },
];

interface Tooltip {
  label: string;
  x: number;
  y: number;
}

export default function Navbar() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastY = useRef(0);
  const dockRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef('hero');
  const collapsedRef = useRef(false);
  const expandBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Scroll-based hide/show + active section tracking
  useEffect(() => {
    let ticking = false;

    const updateIndicator = (activeId: string) => {
      const idx = ITEMS.findIndex((it) => it.id === activeId);
      const el = itemRefs.current[idx];
      const indicator = indicatorRef.current;
      const dock = dockRef.current;
      if (!el || !indicator || !dock) return;
      const dockRect = dock.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.left - dockRect.left - dock.clientLeft;
      indicator.style.transform = `translateX(${offset}px)`;
      indicator.style.width = `${elRect.width}px`;
    };

    const tick = () => {
      ticking = false;
      const scrollY = window.scrollY;

      // Find active section (skip route-only items like Blog)
      let best = 'hero';
      let bestScore = Infinity;
      for (const { id, href } of ITEMS) {
        if (href) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        const score = Math.abs(el.getBoundingClientRect().top);
        if (score < bestScore) {
          bestScore = score;
          best = id;
        }
      }

      // Update active class
      if (best !== activeRef.current) {
        const prevEl = itemRefs.current[ITEMS.findIndex((it) => it.id === activeRef.current)];
        const nextEl = itemRefs.current[ITEMS.findIndex((it) => it.id === best)];
        if (prevEl) prevEl.classList.remove(styles.active);
        if (nextEl) nextEl.classList.add(styles.active);
        activeRef.current = best;
      }

      // Update indicator position every tick (dock may be animating)
      updateIndicator(activeRef.current);

      // Collapse/expand on scroll
      const delta = scrollY - lastY.current;
      let shouldCollapse = collapsedRef.current;
      if (scrollY < 50) {
        shouldCollapse = false;
      } else if (delta > 10) {
        shouldCollapse = true;
      } else if (delta < -10) {
        shouldCollapse = false;
      }
      if (shouldCollapse !== collapsedRef.current) {
        collapsedRef.current = shouldCollapse;
        dockRef.current?.classList.toggle(styles.collapsed, shouldCollapse);
        expandBtnRef.current?.classList.toggle(styles['expand-btn-visible'], shouldCollapse);
      }
      lastY.current = scrollY;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleItemHover = useCallback((idx: number) => {
    const el = itemRefs.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({
      label: ITEMS[idx].label,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, []);

  const scrollTo = (id: string, href?: string) => {
    if (href) {
      window.location.href = href;
    } else if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const centerIdx = Math.floor(ITEMS.length / 2);

  return (
    <>
      <nav
        ref={dockRef}
        className={`${styles.dock} ${mounted ? styles.mounted : ''}`}
        aria-label="Main navigation"
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles['inner-glow']} />

        <div
          ref={indicatorRef}
          className={styles.indicator}
          style={{ width: 0 }}
        />

        {ITEMS.map(({ id, label, Icon, href }, i) => {
          const distFromCenter = Math.abs(i - centerIdx);
          const staggerDelay = `${distFromCenter * 25}ms`;

          return (
            <button
              key={id}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              className={`${styles.item} ${id === 'hero' ? styles.active : ''}`}
              onClick={() => scrollTo(id, href)}
              onMouseEnter={() => handleItemHover(i)}
              aria-label={label}
              aria-current={id === 'hero' ? 'true' : undefined}
              style={{ transitionDelay: staggerDelay }}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </nav>

      {tooltip && !collapsedRef.current && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}

      <button
        ref={expandBtnRef}
        className={styles['expand-btn']}
        onClick={() => {
          collapsedRef.current = false;
          dockRef.current?.classList.remove(styles.collapsed);
          expandBtnRef.current?.classList.remove(styles['expand-btn-visible']);
        }}
        aria-label="Show navigation"
      >
        <FiChevronUp className={styles['expand-icon']} />
      </button>
    </>
  );
}
