import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import './Contacts.scss';

export default function Contacts() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section id="contact" ref={ref} className={`section reveal${visible ? ' is-visible' : ''}`}>
      <div className="section-inner" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
        <SectionHeader title="contact" visible={visible} />
        <h2 className="section-title">Get in<span className="section-accent"> touch</span></h2>

        <div className="contact-links">
          <a href="mailto:vacheslavtkachik@gmail.com" className="contact-link">
            <span className="contact-link-label">email</span>
            <span className="contact-link-value">vacheslavtkachik@gmail.com</span>
            <span className="contact-arrow">↗</span>
          </a>
          <a href="https://github.com/drme-bit" target="_blank" rel="noopener noreferrer" className="contact-link">
            <span className="contact-link-label">github</span>
            <span className="contact-link-value">drme-bit</span>
            <span className="contact-arrow">↗</span>
          </a>
          <a href="#" className="contact-link" style={{ pointerEvents: 'none', opacity: 0.5 }}>
            <span className="contact-link-label">resume</span>
            <span className="contact-link-value">download.pdf</span>
            <span className="contact-arrow">↗</span>
          </a>
        </div>

        <p className="contact-footnote">
          based in ukraine · available for freelance and collaboration
        </p>
      </div>
    </section>
  );
}
