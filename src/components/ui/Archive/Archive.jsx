import { useState, useEffect, useCallback } from 'react';
import { PROJECTS } from '@/data/projectsData';
import { FiX, FiGrid, FiFolder } from 'react-icons/fi';
import './Archive.scss';

function collectMedia() {
  const items = [];

  for (const project of PROJECTS) {
    if (project.logo) {
      items.push({
        id: `${project.id}-logo`,
        src: project.logo,
        label: `${project.title} — logo`,
        source: project.id,
        sourceTitle: project.title,
        category: 'projects',
      });
    }
    if (project.image) {
      items.push({
        id: `${project.id}-image`,
        src: project.image,
        label: `${project.title} — preview`,
        source: project.id,
        sourceTitle: project.title,
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
            sourceTitle: project.title,
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
  const [filter, setFilter] = useState('all');
  const [previewIdx, setPreviewIdx] = useState(-1);

  const filtered = filter === 'all'
    ? media
    : media.filter((m) => m.source === filter);

  const uniqueSources = [...new Set(media.map((m) => m.source))];

  const openPreview = useCallback((idx) => setPreviewIdx(idx), []);
  const closePreview = useCallback(() => setPreviewIdx(-1), []);

  const prevPreview = useCallback(() => {
    setPreviewIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
  }, [filtered.length]);

  const nextPreview = useCallback(() => {
    setPreviewIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
  }, [filtered.length]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') {
        if (previewIdx >= 0) closePreview();
        else onClose();
      }
      if (previewIdx >= 0) {
        if (e.key === 'ArrowLeft') prevPreview();
        if (e.key === 'ArrowRight') nextPreview();
      }
    };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose, previewIdx, closePreview, prevPreview, nextPreview]);

  const projectFilters = uniqueSources.map((src) => {
    const p = PROJECTS.find((pr) => pr.id === src);
    return { id: src, label: p?.title || src, logo: p?.logo };
  });

  return (
    <div className="archive-overlay" onClick={onClose}>
      <div className="archive" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="archive-header">
          <div className="archive-header-left">
            <div className="archive-dots">
              <span className="archive-dot archive-dot--red" onClick={onClose} />
              <span className="archive-dot archive-dot--yellow" />
              <span className="archive-dot archive-dot--green" />
            </div>
            <span className="archive-title">~/media</span>
          </div>
          <button className="archive-close" onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="archive-body">
          {/* Sidebar */}
          <div className="archive-sidebar">
            <button
              className={`archive-nav-item${filter === 'all' ? ' is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <FiGrid size={14} />
              <span>All</span>
              <span className="archive-nav-count">{media.length}</span>
            </button>

            <div className="archive-nav-divider" />

            {projectFilters.map((p) => {
              const count = media.filter((m) => m.source === p.id).length;
              return (
                <button
                  key={p.id}
                  className={`archive-nav-item${filter === p.id ? ' is-active' : ''}`}
                  onClick={() => setFilter(p.id)}
                >
                  {p.logo ? (
                    <img src={p.logo} alt="" className="archive-nav-icon" />
                  ) : (
                    <FiFolder size={14} />
                  )}
                  <span className="archive-nav-label">{p.id}</span>
                  <span className="archive-nav-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="archive-content">
            <div className="archive-grid">
              {filtered.map((item, idx) => (
                <button
                  key={item.id}
                  className="archive-card"
                  onClick={() => openPreview(idx)}
                >
                  <div className="archive-card-img">
                    <img src={item.src} alt={item.label} loading="lazy" />
                  </div>
                  <div className="archive-card-meta">
                    <span className="archive-card-name">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="archive-empty">
                <span>No media found</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="archive-status">
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
          <span className="archive-status-sep">/</span>
          <span>{media.length} total</span>
        </div>
      </div>

      {/* Preview Overlay */}
      {previewIdx >= 0 && filtered[previewIdx] && (
        <div className="archive-preview" onClick={closePreview}>
          <div className="archive-preview-header" onClick={(e) => e.stopPropagation()}>
            <span className="archive-preview-label">{filtered[previewIdx].label}</span>
            <span className="archive-preview-counter">{previewIdx + 1} / {filtered.length}</span>
            <button className="archive-preview-close" onClick={closePreview}>
              <FiX size={18} />
            </button>
          </div>

          <div className="archive-preview-body" onClick={(e) => e.stopPropagation()}>
            <button
              className="archive-preview-zone archive-preview-zone--prev"
              onClick={prevPreview}
            >
              <div className="archive-preview-zone-shadow" />
            </button>

            <img
              src={filtered[previewIdx].src}
              alt={filtered[previewIdx].label}
              className="archive-preview-img"
            />

            <button
              className="archive-preview-zone archive-preview-zone--next"
              onClick={nextPreview}
            >
              <div className="archive-preview-zone-shadow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
