import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiTerminal } from 'react-icons/fi';
import './NotFound.scss';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found-page">
      <div className="nf-terminal">
        <div className="nf-terminal-bar">
          <span className="nf-terminal-dot nf-terminal-dot--red" />
          <span className="nf-terminal-dot nf-terminal-dot--yellow" />
          <span className="nf-terminal-dot nf-terminal-dot--green" />
          <span className="nf-terminal-title">bash</span>
        </div>
        <div className="nf-terminal-body">
          <div className="nf-line">
            <span className="nf-prompt">$</span>
            <span className="nf-command">curl {window.location.pathname}</span>
          </div>
          <div className="nf-line nf-output nf-error">
            <FiTerminal size={14} />
            <span>curl: (404) The resource you requested could not be found</span>
          </div>
          <div className="nf-line">
            <span className="nf-prompt">$</span>
            <span className="nf-cursor">|</span>
          </div>
        </div>
      </div>

      <div className="nf-content">
        <h1 className="nf-code">404</h1>
        <p className="nf-message">Page not found</p>
        <p className="nf-desc">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn--primary">
            <FiHome size={14} />
            <span>cd ~</span>
          </Link>
          <button onClick={() => navigate(-1)} className="nf-btn nf-btn--secondary">
            <FiArrowLeft size={14} />
            <span>cd -</span>
          </button>
        </div>
      </div>
    </div>
  );
}
