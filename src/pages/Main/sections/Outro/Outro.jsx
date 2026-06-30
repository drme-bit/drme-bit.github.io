import { useState, useEffect, useCallback } from 'react';
import './Outro.scss';

export default function Outro() {
  const [revealed, setRevealed] = useState(false);

  const handleKey = useCallback(
    (e) => { if (revealed && e.key === 'Escape') setRevealed(false); },
    [revealed],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <>
      <section id="outro" className="section section--outro" onClick={() => setRevealed(true)}>
        <span className="outro-hint">▸ I'm not supposed to be here...</span>
      </section>

      {revealed && (
        <div className="outro-overlay" onClick={() => setRevealed(false)}>
          <div className="outro-overlay-inner" onClick={(e) => e.stopPropagation()}>
            <div className="outro-logo">
              <div className="outro-logo-ring" />
              <svg viewBox="0 0 532 532" width="80" height="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" xmlns="http://www.w3.org/2000/svg">
                    <g id="a">
                    <g id="b">
                    <path id="c" d="m165 32c-57 24-105 69-131 127l248-46" fill="rgb(175, 175, 175)"/>
                    <use transform="rotate(45,266,266)" href="#c"/></g>
                    <use transform="rotate(90,266,266)" href="#b"/></g>
                    <use transform="rotate(180,266,266)" href="#a"/>
                </svg>
            </div>
            <div className="outro-brand">APERTURE SCIENCE</div>
            <p className="outro-thanks">
              When life gives you lemons, don't make lemonade!
            </p>
            <p className="outro-quote">
              &ldquo;This was a triumph.
              <br />
              I&rsquo;m making a note here: huge success.&rdquo;
            </p>
            <p className="outro-easter">the cake is a lie</p>
            <span className="outro-close">▸ click to dismiss</span>
          </div>
        </div>
      )}
    </>
  );
}
