import { useCallback } from 'react';
import type { RefCallback, RefObject } from 'react';

type ReactRef<T> = RefObject<T | null> | RefCallback<T | null> | null;

export default function useMergedRef<T>(...refs: ReactRef<T>[]) {
  return useCallback((el: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(el);
      } else {
        (ref as { current: T | null }).current = el;
      }
    });
  }, refs) as RefCallback<T | null>;
}
