import { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import useIsMobile from '@/hooks/useIsMobile';
import useReducedMotion from '@/hooks/useReducedMotion';
import './SwipeIndicator.scss';

/**
 * SwipeIndicator — Mobile swipe hint component
 *
 * Shows a subtle animated arrow prompting users to scroll/swipe.
 * Auto-hides after first interaction or timeout.
 * Only visible on touch devices.
 *
 * Usage:
 *   <SwipeIndicator text="Swipe to explore" />
 */
export default function SwipeIndicator({
  text = 'Swipe to explore',
  autoHideTimeout = 5000,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobile && !prefersReducedMotion && window.scrollY <= 100) {
      setVisible(true);
    }
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (!visible || hasInteracted) return;

    // Auto-hide after timeout
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, autoHideTimeout);

    // Hide on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasInteracted(true);
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visible, hasInteracted, autoHideTimeout]);

  if (!visible) return null;

  return (
    <div className={`swipe-indicator ${className}`} role="presentation" aria-hidden="true">
      <FiChevronDown className="swipe-indicator-icon" />
      <span className="swipe-indicator-text">{text}</span>
    </div>
  );
}
