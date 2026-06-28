import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import './Contacts.scss';

export default function Contacts() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section id="contact" ref={ref} className={`section reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
        <div className="section-label">// contact</div>
        <h2 className="section-title">Get in<span className="section-accent"> touch</span></h2>

        <div className="contact-links">
          <a href="mailto:hello@drme-bit.dev" className="contact-link">
            <span className="contact-link-label">email</span>
            <span className="contact-link-value">hello@drme-bit.dev</span>
            <span className="contact-arrow">↗</span>
          </a>
          <a href="https://github.com/drme-bit" target="_blank" rel="noopener noreferrer" className="contact-link">
            <span className="contact-link-label">github</span>
            <span className="contact-link-value">drme-bit</span>
            <span className="contact-arrow">↗</span>
          </a>
          <a href="#" className="contact-link">
            <span className="contact-link-label">resume</span>
            <span className="contact-link-value">download.pdf</span>
            <span className="contact-arrow">↗</span>
          </a>
        </div>

        <p className="contact-footnote">
          based in berlin · available for freelance and collaboration
        </p>
      </div>
    </section>
  );
}
