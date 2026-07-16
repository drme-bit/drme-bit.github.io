import { useState } from 'react';
import { useTerrain } from '@/contexts/TerrainContext';
import { FiPlay, FiPause, FiRotateCcw, FiSettings, FiX } from 'react-icons/fi';
import './TerrainControls.scss';

export default function TerrainControls() {
  const { paused, togglePause, speed, setSpeed, amplitude, setAmplitude, reset } = useTerrain();
  const [open, setOpen] = useState(false);

  return (
    <div className="terrain-controls">
      <button
        className="terrain-controls__toggle"
        onClick={() => setOpen((o) => !o)}
        title="Terrain settings"
      >
        {open ? <FiX /> : <FiSettings />}
      </button>

      {open && (
        <div className="terrain-controls__panel">
          <div className="terrain-controls__row">
            <button
              className={`terrain-controls__btn ${paused ? '' : 'is-active'}`}
              onClick={togglePause}
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? <FiPlay /> : <FiPause />}
            </button>
            <button className="terrain-controls__btn" onClick={reset} title="Reset">
              <FiRotateCcw />
            </button>
          </div>

          <label className="terrain-controls__label">
            <span>Speed</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
            <span className="terrain-controls__value">{speed.toFixed(1)}x</span>
          </label>

          <label className="terrain-controls__label">
            <span>Height</span>
            <input
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            />
            <span className="terrain-controls__value">{amplitude.toFixed(1)}x</span>
          </label>
        </div>
      )}
    </div>
  );
}
