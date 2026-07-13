import { useState, useEffect } from 'react';
import styles from './Navbar.module.scss';

const ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('hero');

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

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {ITEMS.map((item, i) => (
        <span key={item.id} className={styles.item}>
          {i > 0 && <span className={styles.sep}>/</span>}
          <button
            type="button"
            className={`${styles.link} ${active === item.id ? styles.active : ''}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
