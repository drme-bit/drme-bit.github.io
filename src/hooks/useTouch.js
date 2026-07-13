import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useTouch — Mobile touch gesture hook
 *
 * Provides:
 * - Tap ripple effect with position tracking
 * - Swipe detection (left/right/up/down) with momentum
 * - Long press detection with configurable duration
 * - Pinch-to-zoom tracking
 * - Touch position and velocity data
 *
 * All animations respect prefers-reduced-motion.
 */

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LONG_PRESS_DURATION = 500;

export function useTouch(options = {}) {
  const {
    swipeThreshold = SWIPE_THRESHOLD,
    swipeVelocityThreshold = SWIPE_VELOCITY_THRESHOLD,
    longPressDuration = LONG_PRESS_DURATION,
    onTap,
    onSwipe,
    onLongPress,
    onPinch,
    enabled = true,
  } = options;

  const [touchState, setTouchState] = useState({
    isTouching: false,
    tapPosition: null,
    ripplePosition: null,
    swipeDirection: null,
    isLongPressing: false,
    pinchScale: 1,
    velocity: { x: 0, y: 0 },
  });

  const touchStart = useRef(null);
  const touchStartTime = useRef(null);
  const longPressTimer = useRef(null);
  const lastTouch = useRef(null);
  const lastTouchTime = useRef(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }
  }, []);

  const getReducedMotion = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  const calculateVelocity = useCallback((start, end, duration) => {
    if (duration === 0) return { x: 0, y: 0 };
    return {
      x: (end.x - start.x) / duration,
      y: (end.y - start.y) / duration,
    };
  }, []);

  const detectSwipe = useCallback(
    (start, end, velocity) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

      if (absDx > swipeThreshold || absDy > swipeThreshold || speed > swipeVelocityThreshold) {
        if (absDx > absDy) {
          return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
      }
      return null;
    },
    [swipeThreshold, swipeVelocityThreshold]
  );

  const handleTouchStart = useCallback(
    (e) => {
      if (!enabled) return;

      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };

      touchStart.current = position;
      touchStartTime.current = Date.now();
      lastTouch.current = position;
      lastTouchTime.current = Date.now();

      setTouchState((prev) => ({
        ...prev,
        isTouching: true,
        tapPosition: position,
        ripplePosition: position,
        swipeDirection: null,
        isLongPressing: false,
      }));

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setTouchState((prev) => ({ ...prev, isLongPressing: true }));
          onLongPress(position);

          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, longPressDuration);
      }
    },
    [enabled, onLongPress, longPressDuration]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!enabled || !touchStart.current) return;

      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };

      // Clear long press if moved significantly
      if (longPressTimer.current) {
        const dx = position.x - touchStart.current.x;
        const dy = position.y - touchStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }

      // Calculate velocity for swipe momentum
      const now = Date.now();
      const timeDelta = now - (lastTouchTime.current || now);
      if (timeDelta > 0 && lastTouch.current) {
        const velocity = calculateVelocity(lastTouch.current, position, timeDelta);
        setTouchState((prev) => ({ ...prev, velocity }));
      }

      lastTouch.current = position;
      lastTouchTime.current = now;

      // Handle pinch
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          (touch2.clientX - touch1.clientX) ** 2 +
          (touch2.clientY - touch1.clientY) ** 2
        );

        if (touchState.pinchScale === 1) {
          setTouchState((prev) => ({ ...prev, pinchScale: distance / 100 }));
        } else {
          setTouchState((prev) => ({
            ...prev,
            pinchScale: distance / 100,
          }));
        }

        if (onPinch) {
          onPinch(distance / 100);
        }
      }
    },
    [enabled, touchState.pinchScale, calculateVelocity, onPinch]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!enabled || !touchStart.current) return;

      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;

      const endPosition = lastTouch.current || touchStart.current;
      const duration = Date.now() - (touchStartTime.current || Date.now());
      const velocity = calculateVelocity(touchStart.current, endPosition, duration);

      // Detect tap (short duration, small movement)
      const dx = endPosition.x - touchStart.current.x;
      const dy = endPosition.y - touchStart.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10 && duration < 300) {
        // It's a tap
        if (onTap) {
          onTap(endPosition);
        }

        // Create ripple effect
        if (!getReducedMotion()) {
          setTouchState((prev) => ({
            ...prev,
            ripplePosition: endPosition,
          }));

          // Clear ripple after animation
          setTimeout(() => {
            setTouchState((prev) => ({ ...prev, ripplePosition: null }));
          }, 600);
        }
      } else if (distance >= 10) {
        // Detect swipe
        const swipeDirection = detectSwipe(touchStart.current, endPosition, velocity);
        if (swipeDirection && onSwipe) {
          onSwipe(swipeDirection, { velocity, distance });
        }
        setTouchState((prev) => ({ ...prev, swipeDirection }));
      }

      // Apply momentum velocity for animations
      setTouchState((prev) => ({
        ...prev,
        isTouching: false,
        isLongPressing: false,
        velocity,
      }));

      touchStart.current = null;
      touchStartTime.current = null;
      lastTouch.current = null;
      lastTouchTime.current = null;
    },
    [enabled, onTap, onSwipe, detectSwipe, calculateVelocity, getReducedMotion]
  );

  // Reset pinch on touch end
  useEffect(() => {
    if (!touchState.isTouching && touchState.pinchScale !== 1) {
      const timer = setTimeout(() => {
        setTouchState((prev) => ({ ...prev, pinchScale: 1 }));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [touchState.isTouching, touchState.pinchScale]);

  return {
    ...touchState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * useTapRipple — Lightweight tap ripple effect
 * Returns handlers and ripple state for a single element
 */
export function useTapRipple(options = {}) {
  const { color = 'rgba(232, 228, 223, 0.15)', duration = 600 } = options;
  const [ripple, setRipple] = useState(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }
  }, []);

  const triggerRipple = useCallback(
    (e) => {
      if (prefersReducedMotion.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;

      setRipple({ x, y, color, key: Date.now() });

      setTimeout(() => setRipple(null), duration);
    },
    [color, duration]
  );

  const handlers = {
    onClick: triggerRipple,
    onTouchEnd: triggerRipple,
  };

  return { ripple, handlers };
}

/**
 * useSwipeDirection — Simple swipe direction detector
 */
export function useSwipeDirection(onSwipe, options = {}) {
  const { threshold = 50 } = options;
  const startRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    startRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!startRef.current) return;

      const end = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const dx = end.x - startRef.current.x;
      const dy = end.y - startRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > threshold || absDy > threshold) {
        let direction;
        if (absDx > absDy) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        onSwipe(direction);
      }

      startRef.current = null;
    },
    [onSwipe, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

export default useTouch;
