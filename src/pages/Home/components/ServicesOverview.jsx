import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ServicesOverview({ onOpenQuote }) {
  const services = [
    {
      icon: "🚁",
      title: "Drone Design & Build",
      text: "Custom drone engineering from scratch based on flight mission requirements. We build FPV racers, agricultural sprayers, and camera platforms."
    },
    {
      icon: "🖨️",
      title: "3D Print on Demand",
      text: "Industrial-grade 3D printing in PLA, PETG, ABS, and high-detail SLA UV Resin. Any STL/CAD file or concept up to 220mm envelope."
    },
    {
      icon: "🛠️",
      title: "Repair & Tuning Service",
      text: "Crash diagnostics, carbon arm replacement, motor rewinding, ESC replacement, PID tuning, and firmware updates for all multirotors."
    },
    {
      icon: "🎓",
      title: "College Project Support",
      text: "End-to-end guidance for B.Tech / M.Tech / Diploma engineering projects. Includes kit, wiring diagrams, code libraries, and mentor review."
    },
    {
      icon: "📦",
      title: "Parts & Electronics Store",
      text: "Verified brushless motors, stacks, flight controllers, digital HD video transmitters, antennas, and LiPo batteries with fast shipping."
    },
    {
      icon: "✏️",
      title: "3D CAD & Modeling",
      text: "Professional parametric 3D CAD modeling in SolidWorks and organic sculpting in Blender for game characters, mechanical enclosures, and prototypes."
    }
  ];

  return (
    <section id="services">
      <div className="section-inner">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">⚙️ What We Offer</div>
          <h2 className="section-title">
            Our Core <span>Services</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 3.5rem' }}>
            Comprehensive aerospace and additive manufacturing solutions — from blueprint consultation to flight testing and doorstep delivery.
          </p>
        </div>

        <div className="service-cards">
          {services.map((s, idx) => (
            <div key={idx} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-text">{s.text}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to="/services" className="btn btn-primary" style={{ marginRight: '1rem' }}>
            Explore All Services & Workflows <ArrowRight size={16} />
          </Link>
          <button onClick={onOpenQuote} className="btn btn-outline">
            Request Service Quote
          </button>
        </div>
      </div>
    </section>
  );
}
