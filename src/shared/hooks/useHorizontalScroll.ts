'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLenis } from 'lenis/react'; // или '@studio-freight/react-lenis'
import useIsMobile from './useIsMobile';

interface UseHorizontalScrollOptions {
  itemCount?: number;
  firstItemDelay?: number;
  snapThreshold?: number;
}

export default function useHorizontalScroll({
  itemCount = 1,
  firstItemDelay = 0.2,
  snapThreshold = 0.15,
}: UseHorizontalScrollOptions = {}) {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLElement | null>(null);

  const currentProgressRef = useRef(0);
  const currentIndexRef = useRef(0);
  const rafId = useRef<number | null>(null);

  const isDragging = useRef(false);
  const isSnapping = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Получаем инстанс для ручного скролла
  const lenis = useLenis();

  // Ищем трек один раз
  useEffect(() => {
    if (containerRef.current) {
      trackRef.current = containerRef.current.querySelector('[data-track]');
    }
  }, []);

  // Железобетонный расчет абсолютной позиции для скролла
  const getTargetScrollForIndex = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return 0;

      // getBoundingClientRect().top + window.scrollY всегда дает точное расстояние от верха документа
      const rect = el.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;

      const windowHeight = window.innerHeight;
      const deadZone = windowHeight * firstItemDelay;
      const scrollRange = el.offsetHeight - windowHeight;
      const effectiveRange = Math.max(1, scrollRange - deadZone);

      return absoluteTop + deadZone + (index / (itemCount - 1)) * effectiveRange;
    },
    [itemCount, firstItemDelay],
  );

  // Снаппинг (доводка)
  const snapToNearest = useCallback(() => {
    if (isSnapping.current || isDragging.current) return;

    const currentProgress = currentProgressRef.current;
    const nearestIndex = Math.round(currentProgress * (itemCount - 1));
    const exactProgress = nearestIndex / (itemCount - 1);

    if (Math.abs(currentProgress - exactProgress) < snapThreshold) return;

    const targetScroll = getTargetScrollForIndex(nearestIndex);
    if (Math.abs(window.scrollY - targetScroll) < 10) return;

    isSnapping.current = true;

    if (lenis) {
      lenis.scrollTo(targetScroll, {
        duration: 0.8,
        lock: true,
        onComplete: () => {
          isSnapping.current = false;
        },
      });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      setTimeout(() => {
        isSnapping.current = false;
      }, 800);
    }
  }, [itemCount, snapThreshold, getTargetScrollForIndex, lenis]);

  // Основной цикл: работает всегда, считывает реальную позицию DOM
  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const deadZone = windowHeight * firstItemDelay;
    const scrollRange = el.offsetHeight - windowHeight;

    let currentProgress = 0;

    if (scrollRange > 0) {
      // -rect.top показывает, на сколько пикселей мы проскроллили ВНИЗ относительно верха секции
      const scrolledPastTop = -rect.top;
      const effectiveScrolled = Math.max(0, scrolledPastTop - deadZone);
      const effectiveRange = Math.max(1, scrollRange - deadZone);
      currentProgress = Math.max(0, Math.min(1, effectiveScrolled / effectiveRange));
    }

    currentProgressRef.current = currentProgress;

    // Двигаем сам трек напрямую в DOM для 60 FPS
    const track = trackRef.current || (el.querySelector('[data-track]') as HTMLElement);
    if (track) {
      const offset = -currentProgress * (itemCount - 1) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    const newIndex = Math.round(currentProgress * (itemCount - 1));
    const clampedIndex = Math.max(0, Math.min(itemCount - 1, newIndex));

    // Обновляем состояния только при реальном изменении индекса
    if (currentIndexRef.current !== clampedIndex) {
      currentIndexRef.current = clampedIndex;
      setCurrentIndex(clampedIndex);
    }

    setProgress(currentProgress);
    rafId.current = requestAnimationFrame(tick);
  }, [itemCount, firstItemDelay]);

  // Запуск цикла анимации
  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [tick]);

  // Отслеживание окончания скроллинга для доводки
  useEffect(() => {
    const onScroll = () => {
      if (isDragging.current || isSnapping.current) return;

      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = setTimeout(() => {
        snapToNearest();
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [snapToNearest]);

  const scrollTo = useCallback(
    (index: number) => {
      const targetScroll = getTargetScrollForIndex(index);
      if (lenis) {
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    },
    [getTargetScrollForIndex, lenis],
  );

  return {
    progress,
    currentIndex,
    containerRef,
    scrollTo,
    scrollNext: useCallback(() => scrollTo(currentIndexRef.current + 1), [scrollTo]),
    scrollPrev: useCallback(() => scrollTo(currentIndexRef.current - 1), [scrollTo]),
    handlers: {
      onPointerDown: () => {
        if (!isMobile) isDragging.current = true;
      },
      onPointerMove: () => {},
      onPointerUp: () => {
        if (!isMobile) {
          isDragging.current = false;
          snapToNearest();
        }
      },
      onPointerLeave: () => {
        if (!isMobile) {
          isDragging.current = false;
          snapToNearest();
        }
      },
    },
  };
}
