import { useEffect, useState } from 'react';
import './GitHubStatus.scss';

const USERNAME = 'drme-bit';

export default function GitHubStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`https://api.github.com/users/${USERNAME}`)
      .then((r) => r.json())
      .then((u) => setData({ repos: u.public_repos, followers: u.followers }))
      .catch(() => { /* network error */ });
  }, []);

  return (
    <div className="gh-status">
      <span className="gh-status-dot" />
      <span className="gh-status-label">online</span>
      <a
        className="gh-status-link"
        href={`https://github.com/${USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {USERNAME} ↗
      </a>
      {data && (
        <span className="gh-stats">
          <span className="gh-stat">{data.repos} repos</span>
          <span className="gh-stat-sep">·</span>
          <span className="gh-stat">{data.followers} followers</span>
        </span>
      )}
    </div>
  );
}
