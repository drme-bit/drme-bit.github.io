import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
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
          <FiSearch/>
        </button>
      )}

      {(state === 'open' || state === 'hiding') && (
        <form className="searchbar-form" onSubmit={handleSubmit}>
         <FiSearch className="searchbar-icon"/>
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
