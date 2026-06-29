import './SectionHeader.scss';

export default function SectionHeader({ title, number, visible }) {
  return (
    <div className={`section-header${visible ? ' is-visible' : ''}`}>
      <span className="section-header-line" />
      {number && <span className="section-header-number">{number}</span>}
      <span className="section-header-text">// {title}</span>
      <span className="section-header-line" />
    </div>
  );
}
