'use client';

import { useState, useEffect, useCallback } from 'react';
import { PROJECTS } from '@/data/projectsData';
import { FiX, FiGrid, FiFolder } from 'react-icons/fi';
import styles from './Archive.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface MediaItem {
  id: string;
  src: string;
  label: string;
  source: string;
  sourceTitle: string;
  category: string;
}

interface ProjectFilter {
  id: string;
  label: string;
  logo?: string | null;
}

interface ArchiveProps {
  onClose: () => void;
}

/* ─── Helpers ────────────────────────────────────────────── */

function collectMedia(): MediaItem[] {
  const items: MediaItem[] = [];

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
      project.images.forEach((img: string, i: number) => {
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

/* ─── Archive ────────────────────────────────────────────── */

export default function Archive({ onClose }: ArchiveProps) {
  const [media] = useState(collectMedia);
  const [filter, setFilter] = useState('all');
  const [previewIdx, setPreviewIdx] = useState(-1);

  const filtered = filter === 'all'
    ? media
    : media.filter((m) => m.source === filter);

  const uniqueSources = [...new Set(media.map((m) => m.source))];

  const openPreview = useCallback((idx: number) => setPreviewIdx(idx), []);
  const closePreview = useCallback(() => setPreviewIdx(-1), []);

  const prevPreview = useCallback(() => {
    setPreviewIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
  }, [filtered.length]);

  const nextPreview = useCallback(() => {
    setPreviewIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
  }, [filtered.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
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

  const projectFilters: ProjectFilter[] = uniqueSources.map((src) => {
    const p = PROJECTS.find((pr) => pr.id === src);
    return { id: src, label: p?.title || src, logo: p?.logo };
  });

  return (
    <div className={styles['archive-overlay']} onClick={onClose}>
      <div className={styles.archive} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles['archive-header']}>
          <div className={styles['archive-header-left']}>
            <div className={styles['archive-dots']}>
              <span className={`${styles['archive-dot']} ${styles['archive-dot--red']}`} onClick={onClose} />
              <span className={`${styles['archive-dot']} ${styles['archive-dot--yellow']}`} />
              <span className={`${styles['archive-dot']} ${styles['archive-dot--green']}`} />
            </div>
            <span className={styles['archive-title']}>~/media</span>
          </div>
          <button className={styles['archive-close']} onClick={onClose}>
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={styles['archive-body']}>
          {/* Sidebar */}
          <div className={styles['archive-sidebar']}>
            <button
              className={`${styles['archive-nav-item']}${filter === 'all' ? ` ${styles['is-active']}` : ''}`}
              onClick={() => setFilter('all')}
            >
              <FiGrid size={14} />
              <span>All</span>
              <span className={styles['archive-nav-count']}>{media.length}</span>
            </button>

            <div className={styles['archive-nav-divider']} />

            {projectFilters.map((p: ProjectFilter) => {
              const count = media.filter((m) => m.source === p.id).length;
              return (
                <button
                  key={p.id}
                  className={`${styles['archive-nav-item']}${filter === p.id ? ` ${styles['is-active']}` : ''}`}
                  onClick={() => setFilter(p.id)}
                >
                  {p.logo ? (
                    <img src={p.logo} alt="" className={styles['archive-nav-icon']} />
                  ) : (
                    <FiFolder size={14} />
                  )}
                  <span className={styles['archive-nav-label']}>{p.id}</span>
                  <span className={styles['archive-nav-count']}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className={styles['archive-content']}>
            <div className={styles['archive-grid']}>
              {filtered.map((item: MediaItem, idx: number) => (
                <button
                  key={item.id}
                  className={styles['archive-card']}
                  onClick={() => openPreview(idx)}
                >
                  <div className={styles['archive-card-img']}>
                    <img src={item.src} alt={item.label} loading="lazy" />
                  </div>
                  <div className={styles['archive-card-meta']}>
                    <span className={styles['archive-card-name']}>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className={styles['archive-empty']}>
                <span>No media found</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className={styles['archive-status']}>
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span>
          <span className={styles['archive-status-sep']}>/</span>
          <span>{media.length} total</span>
        </div>
      </div>

      {/* Preview Overlay */}
      {previewIdx >= 0 && filtered[previewIdx] && (
        <div className={styles['archive-preview']} onClick={closePreview}>
          <div className={styles['archive-preview-header']} onClick={(e) => e.stopPropagation()}>
            <span className={styles['archive-preview-label']}>{filtered[previewIdx].label}</span>
            <span className={styles['archive-preview-counter']}>{previewIdx + 1} / {filtered.length}</span>
            <button className={styles['archive-preview-close']} onClick={closePreview}>
              <FiX size={18} />
            </button>
          </div>

          <div className={styles['archive-preview-body']} onClick={(e) => e.stopPropagation()}>
            <button
              className={`${styles['archive-preview-zone']} ${styles['archive-preview-zone--prev']}`}
              onClick={prevPreview}
            >
              <div className={styles['archive-preview-zone-shadow']} />
            </button>

            <img
              src={filtered[previewIdx].src}
              alt={filtered[previewIdx].label}
              className={styles['archive-preview-img']}
            />

            <button
              className={`${styles['archive-preview-zone']} ${styles['archive-preview-zone--next']}`}
              onClick={nextPreview}
            >
              <div className={styles['archive-preview-zone-shadow']} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
