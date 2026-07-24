'use client';

import {
  FiGithub, FiSend,
  FiLinkedin, FiMail, FiArrowUpRight,
} from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa'
import type { IconType } from 'react-icons';
import { SOCIAL_LINKS } from '../lib/constants';
import styles from './SocialLinks.module.scss';

const ICON: Record<string, IconType> = {
  github: FiGithub,
  telegram: FiSend,
  discord: FaDiscord,
  linkedin: FiLinkedin,
  email: FiMail,
};

export default function SocialLinks() {
  return (
    <div className={styles.social}>
      <h3 className={styles.title}>
        <span className={styles.prompt}>$</span> social
      </h3>
      <div className={styles.bento}>
        {SOCIAL_LINKS.map((link, i) => {
          const Icon = ICON[link.id];
          return (
            <a
              key={link.id}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={styles.card}
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={styles.icon}>
                <Icon size={20} />
              </span>
              <span className={styles.label}>{link.label}</span>
              <span className={styles.arrow}>
                <FiArrowUpRight size={10} />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
