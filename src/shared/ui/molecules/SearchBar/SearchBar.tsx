'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from './SearchBar.module.scss';

interface SearchBarProps {
  onSearch?: () => void;
}

type SearchBarState = 'closed' | 'open' | 'hiding';

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [state, setState] = useState<SearchBarState>('closed');
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setInput('');
    setState('closed');
  }, [clearTimers]);

  useEffect(() => {
    if (state === 'open') inputRef.current?.focus();
  }, [state]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      setState('hiding');
      onSearch?.();
      setTimeout(reset, 300);
    },
    [input, onSearch, reset],
  );

  return (
    <div className={`${styles.searchbar} ${styles[`state${state.charAt(0).toUpperCase() + state.slice(1)}`]}`}>
      {state === 'closed' && (
        <button className={styles.searchbarTrigger} onClick={() => setState('open')} aria-label="Search">
          <FiSearch />
        </button>
      )}

      {(state === 'open' || state === 'hiding') && (
        <form className={styles.searchbarForm} onSubmit={handleSubmit}>
          <FiSearch className={styles.searchbarIcon} />
          <input
            ref={inputRef}
            className={styles.searchbarInput}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search…"
            autoFocus
            onBlur={() => { if (!input) reset(); }}
          />
        </form>
      )}
    </div>
  );
}
