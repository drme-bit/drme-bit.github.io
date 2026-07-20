'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface TouchState {
  isTouching: boolean;
  tapPosition: TouchPosition | null;
  ripplePosition: TouchPosition | null;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  isLongPressing: boolean;
  pinchScale: number;
  velocity: Velocity;
}

interface UseTouchOptions {
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  longPressDuration?: number;
  onTap?: (position: TouchPosition) => void;
  onSwipe?: (direction: string, data: { velocity: Velocity; distance: number }) => void;
  onLongPress?: (position: TouchPosition) => void;
  onPinch?: (scale: number) => void;
  enabled?: boolean;
}

interface TouchHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface UseTouchResult extends TouchState {
  handlers: TouchHandlers;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LONG_PRESS_DURATION = 500;

export function useTouch(options: UseTouchOptions = {}): UseTouchResult {
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

  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    tapPosition: null,
    ripplePosition: null,
    swipeDirection: null,
    isLongPressing: false,
    pinchScale: 1,
    velocity: { x: 0, y: 0 },
  });

  const touchStart = useRef<TouchPosition | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouch = useRef<TouchPosition | null>(null);
  const lastTouchTime = useRef<number | null>(null);

  const getReducedMotion = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  const calculateVelocity = useCallback((start: TouchPosition, end: TouchPosition, duration: number): Velocity => {
    if (duration === 0) return { x: 0, y: 0 };
    return {
      x: (end.x - start.x) / duration,
      y: (end.y - start.y) / duration,
    };
  }, []);

  const detectSwipe = useCallback(
    (start: TouchPosition, end: TouchPosition, velocity: Velocity): 'left' | 'right' | 'up' | 'down' | null => {
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
    [swipeThreshold, swipeVelocityThreshold],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
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

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setTouchState((prev) => ({ ...prev, isLongPressing: true }));
          onLongPress(position);

          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, longPressDuration);
      }
    },
    [enabled, onLongPress, longPressDuration],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !touchStart.current) return;

      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };

      if (longPressTimer.current) {
        const dx = position.x - touchStart.current.x;
        const dy = position.y - touchStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }

      const now = Date.now();
      const timeDelta = now - (lastTouchTime.current || now);
      if (timeDelta > 0 && lastTouch.current) {
        const velocity = calculateVelocity(lastTouch.current, position, timeDelta);
        setTouchState((prev) => ({ ...prev, velocity }));
      }

      lastTouch.current = position;
      lastTouchTime.current = now;

      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          (touch2.clientX - touch1.clientX) ** 2 +
          (touch2.clientY - touch1.clientY) ** 2,
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
    [enabled, touchState.pinchScale, calculateVelocity, onPinch],
  );

  const handleTouchEnd = useCallback(
    (_e: React.TouchEvent) => {
      if (!enabled || !touchStart.current) return;

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      const endPosition = lastTouch.current || touchStart.current;
      const duration = Date.now() - (touchStartTime.current || Date.now());
      const velocity = calculateVelocity(touchStart.current, endPosition, duration);

      const dx = endPosition.x - touchStart.current.x;
      const dy = endPosition.y - touchStart.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10 && duration < 300) {
        if (onTap) {
          onTap(endPosition);
        }

        if (!getReducedMotion()) {
          setTouchState((prev) => ({
            ...prev,
            ripplePosition: endPosition,
          }));

          setTimeout(() => {
            setTouchState((prev) => ({ ...prev, ripplePosition: null }));
          }, 600);
        }
      } else if (distance >= 10) {
        const swipeDirection = detectSwipe(touchStart.current, endPosition, velocity);
        if (swipeDirection && onSwipe) {
          onSwipe(swipeDirection, { velocity, distance });
        }
        setTouchState((prev) => ({ ...prev, swipeDirection }));
      }

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
    [enabled, onTap, onSwipe, detectSwipe, calculateVelocity, getReducedMotion],
  );

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

interface UseTapRippleOptions {
  color?: string;
  duration?: number;
}

interface Ripple {
  x: number;
  y: number;
  color: string;
  key: number;
}

export function useTapRipple(options: UseTapRippleOptions = {}) {
  const { color = 'rgba(232, 228, 223, 0.15)', duration = 600 } = options;
  const [ripple, setRipple] = useState<Ripple | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
    }
  }, []);

  const triggerRipple = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (prefersReducedMotion.current) return;

      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      let x = 0;
      let y = 0;

      if ('clientX' in e) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      }

      setRipple({ x, y, color, key: Date.now() });

      setTimeout(() => setRipple(null), duration);
    },
    [color, duration],
  );

  const handlers = {
    onClick: triggerRipple,
    onTouchEnd: triggerRipple,
  };

  return { ripple, handlers };
}

interface UseSwipeDirectionOptions {
  threshold?: number;
}

export function useSwipeDirection(
  onSwipe: (direction: string) => void,
  options: UseSwipeDirectionOptions = {},
) {
  const { threshold = 50 } = options;
  const startRef = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
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
        let direction: string;
        if (absDx > absDy) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        onSwipe(direction);
      }

      startRef.current = null;
    },
    [onSwipe, threshold],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

export default useTouch;
