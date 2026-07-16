import { useState, useEffect, useRef } from 'react';
import { FiHome, FiUser, FiZap, FiBriefcase, FiGrid, FiUsers, FiStar, FiMail } from 'react-icons/fi';
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

export default function Navbar() {
  const [active, setActive] = useState('hero');
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const observers = ITEMS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y < 50) {
          setHidden(false);
        } else if (delta > 10) {
          setHidden(true);
        } else if (delta < -10) {
          setHidden(false);
        }

        lastY.current = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`${styles.dock} ${hidden ? styles.hidden : ''}`}
      aria-label="Main navigation"
    >
      <div className={styles.glow} />
      {ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`${styles.item} ${active === id ? styles.active : ''}`}
          onClick={() => scrollTo(id)}
          aria-current={active === id ? 'true' : undefined}
        >
          <Icon className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
