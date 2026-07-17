import { useState, useCallback, useContext, createContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import './Modal.scss';

const ModalContext = createContext(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(null);
  const timerRef = useRef(null);

  const openModal = useCallback(({ content, className, onClose, showClose = true }) => {
    clearTimeout(timerRef.current);
    setIsClosing(false);
    onCloseRef.current = onClose ?? null;
    setModal({ content, className, showClose });
  }, []);

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
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
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
      {(visible || isClosing) && createPortal(
        <div
          className={`modal-overlay${isClosing ? ' is-closing' : ''}`}
          onClick={closeModal}
        >
          <div
            className={`modal-panel ${modal.className ?? ''}${isClosing ? ' is-closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modal.showClose && (
              <button className="modal-close" onClick={closeModal}>
                <FiX size={16} />
              </button>
            )}
            {modal.content}
          </div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}
