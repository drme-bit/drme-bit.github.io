'use client';

import { useEffect, useRef } from 'react';
import styles from './ProjectModal.module.scss';

type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  image?: string;
  desc: string;
  fullDesc?: string;
  tech: string[];
  url?: string;
  repo?: string;
}

interface OriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  originRect?: OriginRect | null;
}

const STATUS_META: Record<ProjectStatus, { icon: string; cls: string; label: string }> = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

const APPLE_SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)';

function animateToCard(
  modal: HTMLElement | null,
  overlay: HTMLElement | null,
  originRect: OriginRect | undefined,
  onDone: () => void,
) {
  if (!modal || !originRect) { onDone(); return; }
  const modalRect = modal.getBoundingClientRect();
  const cardCx = originRect.left + originRect.width / 2;
  const cardCy = originRect.top + originRect.height / 2;
  const modalCx = modalRect.left + modalRect.width / 2;
  const modalCy = modalRect.top + modalRect.height / 2;
  const dx = cardCx - modalCx;
  const dy = cardCy - modalCy;
  const sx = originRect.width / modalRect.width;
  const sy = originRect.height / modalRect.height;

  modal.style.transition = `transform 0.35s ${APPLE_SPRING}, opacity 0.25s ease`;
  modal.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  modal.style.opacity = '0';

  if (overlay) {
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
  }

  setTimeout(onDone, 350);
}

export default function ProjectModal({ project, onClose, originRect }: ProjectModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef<boolean>(false);
  const meta = STATUS_META[project.status] || STATUS_META.ARCHIVED;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const modal = modalRef.current;

    if (originRect && modal) {
      const modalRect = modal.getBoundingClientRect();
      const cardCx = originRect.left + originRect.width / 2;
      const cardCy = originRect.top + originRect.height / 2;
      const modalCx = modalRect.left + modalRect.width / 2;
      const modalCy = modalRect.top + modalRect.height / 2;
      const dx = cardCx - modalCx;
      const dy = cardCy - modalCy;
      const sx = originRect.width / modalRect.width;
      const sy = originRect.height / modalRect.height;

      modal.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      modal.style.opacity = '0';
      modal.style.transformOrigin = 'center center';
      modal.getBoundingClientRect();
      modal.style.transition = `transform 0.5s ${APPLE_SPRING}, opacity 0.35s ease`;
      modal.style.transform = 'translate(0, 0) scale(1, 1)';
      modal.style.opacity = '1';

      if (overlayRef.current) {
        overlayRef.current.style.transition = 'opacity 0.4s ease';
        overlayRef.current.style.opacity = '0';
        overlayRef.current.getBoundingClientRect();
        overlayRef.current.style.opacity = '1';
      }
    }

    const handleClose = () => {
      if (closingRef.current) return;
      closingRef.current = true;
      animateToCard(modal, overlayRef.current, originRect ?? undefined, onClose);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    animateToCard(modalRef.current, overlayRef.current, originRect ?? undefined, onClose);
  };

  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const links: Array<{ label: string; url: string }> = [];
  if (project.url && project.url !== '#') {
    links.push({ label: 'live site', url: project.url });
  }
  if (project.repo) {
    links.push({ label: 'source code', url: project.repo });
  }

  return (
    <div className={styles.projectModalOverlay} ref={overlayRef} onClick={handleOverlay}>
      <div className={styles.projectModal} ref={modalRef}>
        <div className={styles.projectModalBar}>
          <div className={styles.projectModalDots} onClick={handleClose}>
            <span className={`${styles.projectModalDot} ${styles.projectModalDotRed}`} />
            <span className={`${styles.projectModalDot} ${styles.projectModalDotYellow}`} />
            <span className={`${styles.projectModalDot} ${styles.projectModalDotGreen}`} />
          </div>
          <span className={styles.projectModalLabel}>{project.id}</span>
        </div>

        <div className={styles.projectModalBody}>
          <div className={styles.projectModalGallery}>
            {project.image ? (
              <img src={project.image} alt={project.title} className={styles.projectModalImg} />
            ) : (
              <div className={styles.projectModalPlaceholder} />
            )}
          </div>

          <div className={styles.projectModalInfo}>
            <div className={styles.projectModalHeader}>
              <h3 className={styles.projectModalTitle}>{project.title}</h3>
              <span className={`${styles.projectBadge} ${styles[meta.cls.replace('badge--', 'badge')]}`}>
                <span className={styles.projectBadgeDot}>{meta.icon}</span>
                {meta.label}
              </span>
            </div>

            <div className={styles.projectModalDesc}>
              <p>{project.fullDesc || project.desc}</p>
            </div>

            <div className={styles.projectModalMeta}>
              <div className={styles.projectModalTech}>
                {project.tech.map((t) => (
                  <span key={t} className={styles.projectTechTag}>{t}</span>
                ))}
              </div>

              {links.length > 0 && (
                <div className={styles.projectModalLinks}>
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.projectModalLink}
                    >
                      {link.label === 'source code' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      )}
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
