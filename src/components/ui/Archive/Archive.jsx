import { useState, useEffect } from 'react';
import { PROJECTS } from '@/data/projectsData';
import './Archive.scss';

const CATEGORIES = [
  { id: 'all', label: 'all media' },
  { id: 'projects', label: 'projects' },
];

function collectMedia() {
  const items = [];

  for (const project of PROJECTS) {
    if (project.logo) {
      items.push({
        id: `${project.id}-logo`,
        src: project.logo,
        label: `${project.title} — logo`,
        source: project.id,
        category: 'projects',
      });
    }
    if (project.image) {
      items.push({
        id: `${project.id}-image`,
        src: project.image,
        label: `${project.title} — preview`,
        source: project.id,
        category: 'projects',
      });
    }
    if (Array.isArray(project.images)) {
      project.images.forEach((img, i) => {
        if (img !== project.image) {
          items.push({
            id: `${project.id}-gallery-${i}`,
            src: img,
            label: `${project.title} — ${i + 1}`,
            source: project.id,
            category: 'projects',
          });
        }
      });
    }
  }

  return items;
}

export default function Archive({ onClose }) {
  const [media] = useState(collectMedia);
  const [category, setCategory] = useState('all');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (preview) setPreview(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose, preview]);

  const filtered = category === 'all'
    ? media
    : media.filter((m) => m.category === category);

  const uniqueSources = [...new Set(media.map((m) => m.source))];

  return (
    <div className="archive-overlay" onClick={onClose}>
      <div className="archive" onClick={(e) => e.stopPropagation()}>
        <div className="archive-bar">
          <div className="archive-bar-dots">
            <span className="archive-dot archive-dot--red" onClick={onClose} />
            <span className="archive-dot archive-dot--yellow" />
            <span className="archive-dot archive-dot--green" />
          </div>
          <span className="archive-bar-label">media gallery</span>
        </div>

        <div className="archive-body">
          <div className="archive-sidebar">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`archive-sidebar-item${category === c.id ? ' is-active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
            <div className="archive-sidebar-divider" />
            {uniqueSources.map((src) => (
              <button
                key={src}
                className={`archive-sidebar-item${category === src ? ' is-active' : ''}`}
                onClick={() => setCategory(src)}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="archive-main archive-main--gallery">
            {filtered.length === 0 ? (
              <div className="archive-empty">
                <span>no media yet</span>
              </div>
            ) : (
              <div className="archive-grid">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className={`archive-file${preview?.id === item.id ? ' is-selected' : ''}`}
                    onClick={() => setPreview(item)}
                  >
                    <div className="archive-file-preview">
                      <img
                        src={item.src}
                        alt={item.label}
                        className="archive-file-thumb"
                        loading="lazy"
                      />
                    </div>
                    <div className="archive-file-info">
                      <span className="archive-file-name">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="archive-status">
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
          <span>{category === 'all' ? `${media.length} total` : category}</span>
        </div>
      </div>

      {preview && (
        <div className="archive-preview-overlay" onClick={() => setPreview(null)}>
          <img
            src={preview.src}
            alt={preview.label}
            className="archive-preview-img"
          />
        </div>
      )}
    </div>
  );
}
