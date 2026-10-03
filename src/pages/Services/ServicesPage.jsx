import React, { useEffect } from 'react';
import { Rocket, Printer, Wrench, GraduationCap, Box, PenTool, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ServicesPage({ onOpenQuote }) {
  useEffect(() => {
    document.title = "Services & Solutions — Drone Engineering & 3D Print | NaviDron";
  }, []);

  const serviceList = [
    {
      icon: <Rocket size={28} color="var(--neon)" />,
      title: "Custom Drone Design & Manufacturing",
      desc: "From specialized FPV cinematography setups to heavy-lift multispectral crop sprayers. We select high-efficiency motors, carbon composite frames, calibrate PID loops, and deliver fully bound, ready-to-fly systems."
    },
    {
      icon: <Printer size={28} color="#ff00aa" />,
      title: "3D Printing on Demand (Up to 220mm)",
      desc: "Industrial additive manufacturing in PLA+, PETG, high-temp ABS, carbon-fiber nylon, and ultra-high-resolution UV resin. From single character prototypes to bulk merchandise batches."
    },
    {
      icon: <Wrench size={28} color="var(--neon)" />,
      title: "Crash Repair, Diagnostics & Tuning",
      desc: "Damaged frame arms, stripped motor bells, burned ESCs, desoldered flight controllers? Ship your drone to our workshop for complete circuit testing, motor dynamic balancing, and test-hover tuning."
    },
    {
      icon: <GraduationCap size={28} color="#00c896" />,
      title: "College & Research Project Mentorship",
      desc: "Complete hardware bundles, Mission Planner autonomous waypoint code, obstacle avoidance algorithms, full schematic PDFs, and 30-day technical support for B.Tech, M.Tech, and polytechnic students."
    },
    {
      icon: <PenTool size={28} color="#ffb300" />,
      title: "Parametric CAD & Character Sculpting",
      desc: "Need custom aerodynamic drone arms, action camera housings, or organic 3D gaming characters designed from reference photos? Our 3D modeling team delivers production-ready STL and STEP files."
    },
    {
      icon: <Box size={28} color="#bf7aff" />,
      title: "Bulk Merchandising & Creator Collabs",
      desc: "We partner with creators, streamers, and gaming teams like P_Brothers to monetize and ship custom branded 3D collectibles, t-shirts, and scale gaming assets pan-India."
    }
  ];

  const workflowSteps = [
    { step: "01", title: "Requirement & Blueprint", desc: "Share your flight specs, 3D CAD files, or project concept with our engineering desk." },
    { step: "02", title: "CAD Modeling & Fabrication", desc: "We CNC machine carbon fiber, 3D print components, and hand-solder avionics." },
    { step: "03", title: "Bench Testing & Calibration", desc: "Vibration dampening, motor sync, GPS fix checks, and test-hover validation." },
    { step: "04", title: "Insured Pan-India Delivery", desc: "Shockproof packaging, full flight logs, documentation, and ongoing tech support." }
  ];

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          minHeight: '42vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 3.5rem',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
            ⚙️ Engineering Capabilities
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Comprehensive <span style={{ color: 'var(--neon)' }}>Robotics & 3D</span> Services
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.7' }}>
            Tailored engineering workflows crafted for commercial agriculturalists, competitive drone racers, universities, and gaming creators.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div className="section-inner">
          <div className="grid-3">
            {serviceList.map((s, i) => (
              <div key={i} className="service-card" style={{ textAlign: 'left', padding: '2.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>{s.icon}</div>
                <h3 className="service-title" style={{ fontSize: '1.2rem', marginBottom: '.75rem' }}>{s.title}</h3>
                <p className="service-text" style={{ fontSize: '.9rem', lineHeight: '1.7' }}>{s.desc}</p>
                <button
                  onClick={onOpenQuote}
                  style={{
                    marginTop: '1.5rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--neon)',
                    fontWeight: 700,
                    fontSize: '.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    cursor: 'pointer'
                  }}
                >
                  Inquire About This Service <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* 4-Step Process */}
          <div style={{ marginTop: '6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div className="section-tag">🔄 How We Work</div>
              <h2 className="section-title">
                The NaviDron <span>Engineering Process</span>
              </h2>
            </div>

            <div className="grid-4">
              {workflowSteps.map((w, idx) => (
                <div key={idx} style={{ background: 'var(--off-white)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,200,255,.15)', position: 'relative' }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.5rem', fontWeight: 900, color: 'rgba(0,200,255,.25)', marginBottom: '.5rem' }}>
                    {w.step}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', color: 'var(--navy)', marginBottom: '.5rem' }}>
                    {w.title}
                  </h4>
                  <p style={{ fontSize: '.88rem', color: '#666', lineHeight: '1.6' }}>
                    {w.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: '24px', padding: '3.5rem', textAlign: 'center', color: 'white', marginTop: '5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', marginBottom: '1rem' }}>
              Ready to Build Your Custom UAV or 3D Print?
            </h3>
            <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '.95rem' }}>
              Contact Nexfly Robotics today for a free design consultation and accurate quote estimate.
            </p>
            <button onClick={onOpenQuote} className="btn btn-primary" style={{ padding: '.9rem 2.5rem' }}>
              Start Your Project Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
