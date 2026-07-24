'use client';

import { useEffect } from 'react';
import type { NavPageConfig } from '@/config/navTypes';
import { useNav } from '@/providers/NavProvider';

/**
 * Registers page-specific nav config (context sections, pagination, etc.).
 * Automatically clears on unmount.
 */
export default function useNavPage(config: NavPageConfig, deps: React.DependencyList = []) {
  const { registerPage, clearPage } = useNav();

  useEffect(() => {
    registerPage(config);
    return () => clearPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
