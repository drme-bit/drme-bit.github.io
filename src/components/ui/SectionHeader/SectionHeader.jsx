import './SectionHeader.scss';

export default function SectionHeader({ title, visible }) {
  return (
    <div className={`section-header${visible ? ' is-visible' : ''}`}>
      <span className="section-header-line" />
      <span className="section-header-text">// {title}</span>
      <span className="section-header-line" />
    </div>
  );
}
