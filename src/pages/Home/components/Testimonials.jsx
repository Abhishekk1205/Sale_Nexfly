import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      initial: "R",
      name: "Rahul S.",
      role: "FPV Freestyle Pilot, Delhi",
      color: "linear-gradient(135deg, var(--neon), var(--accent))",
      quote: "Got my 5\" custom FPV build from NaviDron — an absolute beast in the air! Super clean solder joints, buttery smooth motor tune, and survived several heavy crashes with zero frame damage."
    },
    {
      initial: "P",
      name: "Priya M.",
      role: "Gaming Enthusiast & YouTuber Fan, Mumbai",
      color: "linear-gradient(135deg, #ff00aa, var(--neon2))",
      quote: "The Valorant and GTA 6 action figures are astonishingly high quality! You can see individual weapon seams and fabric folds. The P_Brothers collab tee fits great and feels super premium."
    },
    {
      initial: "A",
      name: "Amit K.",
      role: "Precision Farm Operator, Punjab",
      color: "linear-gradient(135deg, #00c896, var(--neon))",
      quote: "We deployed the 16L AgriHawk hexacopter for our paddy fields. Saved 30% chemical cost and sprayed 15 acres per hour with zero hassle. Tech support is always one call away!"
    }
  ];

  return (
    <section style={{ background: 'var(--off-white)' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">⭐ Verified Pilots & Collectors</div>
          <h2 className="section-title">
            What Our <span>Community</span> Says
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>
            Trusted by FPV racing champions, gaming collectors, agriculturalists, and engineering institutions across India.
          </p>
        </div>

        <div className="testimonial-grid">
          {reviews.map((r, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem', color: '#ffb300' }}>
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={16} fill="#ffb300" />
                ))}
              </div>
              <p className="testimonial-text">"{r.quote}"</p>
              <div className="testimonial-author">
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: r.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}
                >
                  {r.initial}
                </div>
                <div>
                  <div className="testimonial-name">{r.name}</div>
                  <div className="testimonial-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
