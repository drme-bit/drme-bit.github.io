import './SectionTitle.scss';

export default function SectionTitle({ title, accent, description, visible }) {
  return (
    <div className={`section-title-block${visible ? ' is-visible' : ''}`}>
      <h2 className="section-title-heading">
        {title}
        {accent && <span className="section-title-accent">{accent}</span>}
      </h2>
      {description && <p className="section-title-desc">{description}</p>}
    </div>
  );
}
