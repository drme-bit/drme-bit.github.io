'use client';

import { FiHeart } from 'react-icons/fi';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles['site-footer']}>
      <div className={styles['footer-inner']}>
        <span className={styles['footer-text']}>
          built with <FiHeart size={11} className={styles['footer-heart']} /> by drme
        </span>
        <a
          href="https://ko-fi.com/drmebit"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['footer-kofi']}
        >
          <img
            src="https://storage.ko-fi.com/cdn/kratom2/logo/normal-NoshandBG-transparent.png"
            alt="Ko-fi"
            className={styles['footer-kofi-img']}
            loading="lazy"
          />
          <span>buy me a coffee</span>
        </a>
      </div>
    </footer>
  );
}
