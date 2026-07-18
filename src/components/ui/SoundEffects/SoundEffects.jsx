import { useEffect } from 'react';
import useReducedMotion from '@/hooks/useReducedMotion';
import SoundManager from './SoundManager';

const manager = new SoundManager();

export default function SoundEffects() {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    manager.setReducedMotion(prefersReduced);
  }, [prefersReduced]);

  useEffect(() => {
    manager.attach();
    return () => manager.detach();
  }, []);

  return null;
}
