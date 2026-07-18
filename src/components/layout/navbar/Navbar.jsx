import { useState, useEffect, useRef, useCallback } from 'react';
import { FiHome, FiUser, FiZap, FiBriefcase, FiGrid, FiUsers, FiStar, FiMail, FiChevronUp } from 'react-icons/fi';
import styles from './Navbar.module.scss';

const ITEMS = [
  { id: 'hero', label: 'Home', Icon: FiHome },
  { id: 'about', label: 'About', Icon: FiUser },
  { id: 'skills', label: 'Skills', Icon: FiZap },
  { id: 'experience', label: 'Exp', Icon: FiBriefcase },
  { id: 'projects', label: 'Work', Icon: FiGrid },
  { id: 'blog', label: 'Blog', Icon: FiUsers },
  { id: 'reviews', label: 'Reviews', Icon: FiStar },
  { id: 'contact', label: 'Mail', Icon: FiMail },
];

const MAGNETIC_RADIUS = 120;
const MAGNETIC_MAX_SCALE = 1.45;

export default function Navbar() {
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [tooltip, setTooltip] = useState(null);
  const [mounted, setMounted] = useState(false);
  const lastY = useRef(0);
  const dockRef = useRef(null);
  const itemRefs = useRef([]);
  const indicatorRef = useRef(null);
  const activeRef = useRef('hero');
  const collapsedRef = useRef(false);
  const expandBtnRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Active section + collapse + indicator — all DOM-direct, zero React re-renders
  useEffect(() => {
    let ticking = false;

    const updateIndicator = (activeId) => {
      const idx = ITEMS.findIndex((it) => it.id === activeId);
      const el = itemRefs.current[idx];
      const indicator = indicatorRef.current;
      if (!el || !indicator) return;

      const dock = dockRef.current;
      if (!dock) return;
      const dockRect = dock.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      indicator.style.transform = `translateX(${elRect.left - dockRect.left}px)`;
      indicator.style.width = `${elRect.width}px`;
    };

    const tick = () => {
      ticking = false;
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      let best = 'hero';
      let bestScore = Infinity;

      for (const { id } of ITEMS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const score = Math.abs(rect.top);
        if (score < bestScore) {
          bestScore = score;
          best = id;
        }
      }

      // Update active class via DOM
      if (best !== activeRef.current) {
        const prevEl = itemRefs.current[ITEMS.findIndex((it) => it.id === activeRef.current)];
        const nextEl = itemRefs.current[ITEMS.findIndex((it) => it.id === best)];
        if (prevEl) prevEl.classList.remove(styles.active);
        if (nextEl) nextEl.classList.add(styles.active);
        activeRef.current = best;
      }

      // Update indicator
      updateIndicator(best);

      // Collapse/expand via DOM
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
        expandBtnRef.current?.classList.toggle(styles.expandBtnVisible, shouldCollapse);
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

  const handleMouseMove = useCallback((e) => {
    const dock = dockRef.current;
    if (!dock) return;
    const dockRect = dock.getBoundingClientRect();
    const mouseX = e.clientX - dockRect.left;
    const mouseY = e.clientY - dockRect.top;

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenterX = rect.left - dockRect.left + rect.width / 2;
      const itemCenterY = rect.top - dockRect.top + rect.height / 2;
      const dx = mouseX - itemCenterX;
      const dy = mouseY - itemCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - dist / MAGNETIC_RADIUS);
      const scale = 1 + (MAGNETIC_MAX_SCALE - 1) * influence * influence;
      el.style.transform = `scale(${scale}) translateY(${-2 * influence}px)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    itemRefs.current.forEach((el) => {
      if (el) el.style.transform = '';
    });
    setHoveredIdx(-1);
    setTooltip(null);
  }, []);

  const handleItemHover = useCallback((idx) => {
    setHoveredIdx(idx);
    const el = itemRefs.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({
      label: ITEMS[idx].label,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const centerIdx = Math.floor(ITEMS.length / 2);

  return (
    <>
      <nav
        ref={dockRef}
        className={`${styles.dock} ${mounted ? styles.mounted : ''}`}
        aria-label="Main navigation"
        onMouseMove={!collapsedRef.current ? handleMouseMove : undefined}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.innerGlow} />

        <div
          ref={indicatorRef}
          className={styles.indicator}
          style={{ width: 0 }}
        />

        {ITEMS.map(({ id, label, Icon }, i) => {
          const distFromCenter = Math.abs(i - centerIdx);
          const staggerDelay = collapsedRef.current
            ? `${distFromCenter * 30 + 50}ms`
            : `${distFromCenter * 25}ms`;

          return (
            <button
              key={id}
              ref={(el) => (itemRefs.current[i] = el)}
              type="button"
              className={`${styles.item} ${id === 'hero' ? styles.active : ''} ${hoveredIdx === i ? styles.hovered : ''}`}
              onClick={() => scrollTo(id)}
              onMouseEnter={() => !collapsedRef.current && handleItemHover(i)}
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
        className={styles.expandBtn}
        onClick={() => {
          collapsedRef.current = false;
          dockRef.current?.classList.remove(styles.collapsed);
          expandBtnRef.current?.classList.remove(styles.expandBtnVisible);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        aria-label="Show navigation"
      >
        <FiChevronUp className={styles.expandIcon} />
      </button>
    </>
  );
}
