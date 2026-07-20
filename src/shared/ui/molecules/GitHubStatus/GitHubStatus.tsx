'use client';

import { useEffect, useState } from 'react';
import styles from './GitHubStatus.module.scss';

const USERNAME = 'drme-bit';

interface GitHubData {
  repos: number;
  followers: number;
}

export default function GitHubStatus() {
  const [data, setData] = useState<GitHubData | null>(null);

  useEffect(() => {
    fetch(`https://api.github.com/users/${USERNAME}`)
      .then((r) => r.json())
      .then((u: { public_repos: number; followers: number }) => setData({ repos: u.public_repos, followers: u.followers }))
      .catch(() => { /* network error */ });
  }, []);

  return (
    <div className={styles.ghStatus}>
      <span className={styles.ghStatusDot} />
      <span className={styles.ghStatusLabel}>online</span>
      <a
        className={styles.ghStatusLink}
        href={`https://github.com/${USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {USERNAME} ↗
      </a>
      {data && (
        <span className={styles.ghStats}>
          <span className={styles.ghStat}>{data.repos} repos</span>
          <span className={styles.ghStatSep}>·</span>
          <span className={styles.ghStat}>{data.followers} followers</span>
        </span>
      )}
    </div>
  );
}
