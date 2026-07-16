import { FiHeart } from 'react-icons/fi';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-text">
          built with <FiHeart size={11} className="footer-heart" /> by drme
        </span>
        <a
          href="https://ko-fi.com/drmebit"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-kofi"
        >
          <img
            src="https://storage.ko-fi.com/cdn/kratom2/logo/normal-NoshandBG-transparent.png"
            alt="Ko-fi"
            className="footer-kofi-img"
            loading="lazy"
          />
          <span>buy me a coffee</span>
        </a>
      </div>
    </footer>
  );
}
