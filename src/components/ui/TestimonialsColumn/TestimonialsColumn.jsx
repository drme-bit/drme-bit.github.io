import { motion } from 'motion/react';
import './TestimonialsColumn.scss';

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function TestimonialsColumn({ testimonials, duration = 10, className = '' }) {
  return (
    <div className={`testimonials-column ${className}`}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="testimonials-track"
      >
        {[0, 1].map((setIdx) => (
          <div key={setIdx} className="testimonials-set">
            {testimonials.map((review, i) => (
              <div className="testimonial-card" key={`${setIdx}-${i}`}>
                {review.header && (
                  <div className="testimonial-header">{review.header}</div>
                )}
                <p className="testimonial-text">{review.text}</p>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    {review.photoURL ? (
                      <img
                        src={review.photoURL}
                        alt={review.name}
                        className="testimonial-avatar"
                      />
                    ) : (
                      <div className="testimonial-avatar testimonial-avatar--fallback">
                        {(review.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="testimonial-info">
                      <span className="testimonial-name">{review.name}</span>
                      {review.role && <span className="testimonial-role">{review.role}</span>}
                    </div>
                  </div>
                  {review.createdAt && (
                    <span className="testimonial-time">
                      {timeAgo(review.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
