import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutNexfly({ onOpenQuote }) {
  const highlights = [
    "Expert team of aeronautical and electronics engineers with 5+ years experience",
    "High-grade materials — Japanese T700 carbon fiber, impact TPU, engineering PLA & resin",
    "Comprehensive end-to-end service from concept CAD design to bench testing and maiden flight",
    "Official merchandising collaboration with YouTuber P_Brothers for gaming collectibles",
    "Pan-India insured shipping with tracking and dedicated WhatsApp support"
  ];

  return (
    <section id="about">
      <div className="section-inner">
        <div className="about-grid">
          <div className="about-img-wrap">
            <img
              src="/images/nexfly_robotics_logo_1791059250216.jpg"
              alt="Nexfly Robotics & NaviDron Team"
              className="about-img"
              style={{ background: 'var(--navy)', padding: '3.5rem', objectFit: 'contain' }}
            />
            <div className="about-img-card">
              <div className="about-img-card-num">5+</div>
              <div className="about-img-card-label">Years of Innovation</div>
            </div>
          </div>

          <div>
            <div className="section-tag">🏢 About The Founders</div>
            <h2 className="section-title">
              Nexfly <span>Robotics</span> — Powering NaviDron
            </h2>

            <p style={{ color: '#4a5270', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              Nexfly Robotics is an Indian unmanned aerial vehicle development and rapid prototyping enterprise. We believe in democratizing aerial autonomy and advanced additive manufacturing — whether helping farmers spray crops effortlessly, empowering gamers with tangible collectibles, or guiding engineering students through custom research drones.
            </p>

            <p style={{ color: '#4a5270', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              Every drone that leaves our workshop is individually calibrated, PID tuned, and bench tested. Together with our community partner <strong>P_Brothers</strong>, we are building India's most vibrant gaming merchandise and robotics ecosystem.
            </p>

            <ul className="about-list">
              {highlights.map((h, i) => (
                <li key={i} className="about-list-item">
                  <CheckCircle2 size={18} color="var(--neon)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button onClick={onOpenQuote} className="btn btn-primary">
                Partner With Us
              </button>
              <Link to="/services" className="btn btn-outline">
                Our Capabilities <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
