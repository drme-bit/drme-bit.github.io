import { useRef, useEffect } from 'react';
import './DrawerMenu.scss';

const PAGES = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function DrawerMenu({ activePage, onNavigate, open, onToggle, onClose, onArchive }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleClick = (id) => {
    onClose();
    onNavigate(id);
  };

  return (
    <>
      <button className="drawer-trigger" onClick={onToggle} aria-label="Toggle navigation">
        <span className="drawer-trigger-line" />
        <span className="drawer-trigger-line" />
        <span className="drawer-trigger-line" />
      </button>

      <div className={`drawer-overlay${open ? ' is-open' : ''}`} onClick={onClose} />

      <div ref={panelRef} className={`drawer-panel${open ? ' is-open' : ''}`}>
        <div className="drawer-header">// nav</div>
        <nav className="drawer-nav">
          {PAGES.map((page, i) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                className={`drawer-link${isActive ? ' is-active' : ''}`}
                onClick={() => handleClick(page.id)}
              >
                <span className="drawer-link-id">{String(i + 1).padStart(2, '0')}</span>
                <span className="drawer-link-label">{page.label}</span>
                {isActive && <span className="drawer-link-cursor">_</span>}
              </button>
            );
          })}
          <div className="drawer-link-divider" />
          <button
            className="drawer-link drawer-link--archive"
            onClick={() => { onClose(); onArchive?.(); }}
          >
            <span className="drawer-link-id">~</span>
            <span className="drawer-link-label">archive</span>
          </button>
        </nav>
        <div className="drawer-footer">
          <span className="drawer-footer-text">$ close [esc]</span>
        </div>
      </div>
    </>
  );
}
