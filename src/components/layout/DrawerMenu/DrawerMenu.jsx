import { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiZap, FiBriefcase, FiGrid, FiUsers, FiStar, FiMail, FiFileText } from 'react-icons/fi';
import './DrawerMenu.scss';

const SECTIONS = [
  { id: 'hero', label: 'Home', Icon: FiHome },
  { id: 'about', label: 'About', Icon: FiUser },
  { id: 'skills', label: 'Skills', Icon: FiZap },
  { id: 'experience', label: 'Experience', Icon: FiBriefcase },
  { id: 'projects', label: 'Projects', Icon: FiGrid },
  { id: 'blog', label: 'Blog', Icon: FiUsers },
  { id: 'reviews', label: 'Reviews', Icon: FiStar },
  { id: 'contact', label: 'Contact', Icon: FiMail },
];

const PAGES = [
  { path: '/', label: 'Home', Icon: FiHome },
  { path: '/posts', label: 'Posts', Icon: FiFileText },
];

export default function DrawerMenu({ open, onToggle, onClose }) {
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const isMainPage = location.pathname === '/';

  const handleSectionClick = (id) => {
    onClose();
    if (isMainPage) {
      document.getElementById(id)?.scrollIntoView();
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const handlePageClick = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <button className={`drawer-trigger${open ? ' is-open' : ''}`} onClick={onToggle} aria-label="Toggle navigation">
        <span className="drawer-trigger-line" />
        <span className="drawer-trigger-line" />
        <span className="drawer-trigger-line" />
      </button>

      <div className={`drawer-overlay${open ? ' is-open' : ''}`} onClick={onClose} />

      <div ref={panelRef} className={`drawer-panel${open ? ' is-open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-header-cursor">{'>'}</span> navigation
        </div>

        <div className="drawer-section">
          <div className="drawer-section-label">// pages</div>
          <nav className="drawer-nav">
            {PAGES.map(({ path, label, Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  className={`drawer-link${isActive ? ' is-active' : ''}`}
                  onClick={() => handlePageClick(path)}
                >
                  <Icon className="drawer-link-icon" />
                  <span className="drawer-link-label">{label}</span>
                  {isActive && <span className="drawer-link-cursor">_</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {isMainPage && (
          <div className="drawer-section">
            <div className="drawer-section-label">// sections</div>
            <nav className="drawer-nav">
              {SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className="drawer-link"
                  onClick={() => handleSectionClick(id)}
                >
                  <Icon className="drawer-link-icon" />
                  <span className="drawer-link-label">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="drawer-footer">
          <span className="drawer-footer-text">esc to close</span>
        </div>
      </div>
    </>
  );
}
