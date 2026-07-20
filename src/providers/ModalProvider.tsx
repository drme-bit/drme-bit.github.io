'use client';

import { useState, useCallback, useContext, createContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import styles from './ModalProvider.module.scss';

interface ModalConfig {
  content: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showClose?: boolean;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal(): ModalContextType {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = useCallback(
    ({ content, className, onClose, showClose = true }: ModalConfig) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsClosing(false);
      onCloseRef.current = onClose ?? null;
      setModal({ content, className, showClose });
    },
    [],
  );

  const closeModal = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      onCloseRef.current?.();
      onCloseRef.current = null;
      setModal(null);
      setIsClosing(false);
    }, 200);
  }, [isClosing]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modal, closeModal]);

  const visible = modal && !isClosing;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {(visible || isClosing) &&
        createPortal(
          <div
            className={`${styles.overlay}${isClosing ? ` ${styles['overlay--closing']}` : ''}`}
            onClick={closeModal}
          >
            <div
              className={`${styles.panel}${isClosing ? ` ${styles['panel--closing']}` : ''} ${modal?.className ?? ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {modal?.showClose !== false && (
                <button
                  className={styles.closeBtn}
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <FiX size={16} />
                </button>
              )}
              {modal?.content}
            </div>
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}
