import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/*  Auto-cleanup needs globals, which we don't enable — register it explicitly.  */
afterEach(() => {
  cleanup();
});

/*  jsdom lacks matchMedia — polyfill so components using it don't crash.  */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

/*  jsdom doesn't implement SVG path geometry — polyfill so GSAP path animations don't throw.  */
type SvgWithPathGeometry = SVGElement & { getTotalLength?: () => number };
if (typeof SVGElement !== 'undefined' && !(SVGElement.prototype as SvgWithPathGeometry).getTotalLength) {
  (SVGElement.prototype as SvgWithPathGeometry).getTotalLength = () => 0;
}

/*  jsdom 30 doesn't attach localStorage (sessionStorage works). Provide an in-memory store.  */
if (typeof window !== 'undefined' && typeof window.localStorage === 'undefined') {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => [...store.keys()][i] ?? null,
      get length() {
        return store.size;
      },
    },
  });
}
