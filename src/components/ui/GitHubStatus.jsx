import './GitHubStatus.scss';

export default function GitHubStatus() {
  return (
    <div className="gh-status">
      <span className="gh-status-dot" />
      <span className="gh-status-label">online</span>
      <a
        className="gh-status-link"
        href="https://github.com/drme-bit"
        target="_blank"
        rel="noopener noreferrer"
      >
        drme-bit ↗
      </a>
    </div>
  );
}
