import { useState, useRef, useEffect, useCallback } from 'react';
import './SearchBar.scss';

export default function SearchBar({ onSearch }) {
  const [state, setState] = useState('closed'); // closed | open | hiding
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const timers = useRef([]);

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
    (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      setState('hiding');
      onSearch?.();
      setTimeout(reset, 300);
    },
    [input, onSearch, reset],
  );

  return (
    <div className={`searchbar state-${state}`}>
      {state === 'closed' && (
        <button className="searchbar-trigger" onClick={() => setState('open')} aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>
      )}

      {(state === 'open' || state === 'hiding') && (
        <form className="searchbar-form" onSubmit={handleSubmit}>
          <svg className="searchbar-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className="searchbar-input"
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
