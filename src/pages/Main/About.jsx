import './About.scss';

export default function About() {
  return (
    <section id="about" className="section">
      <div className="section-inner">
        <div className="section-label">// about</div>
        <h2 className="section-title">Building digital<br /><span className="section-accent">products</span></h2>
        <div className="section-body">
          <p>
            Full-stack developer with a focus on creative technology and
            immersive experiences. I work across design, code, and 3D to
            craft interfaces that feel alive.
          </p>
          <p>
            Currently exploring procedural generation, spatial computing,
            and the space where code meets art.
          </p>
        </div>
        <div className="section-tags">
          {['Design', 'Engineering', '3D', 'Creative Tech'].map((t) => (
            <span key={t} className="section-tag">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
