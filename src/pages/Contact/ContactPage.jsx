import React, { useEffect } from 'react';
import ContactSection from '../Home/components/ContactSection';
import { ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact Us — NaviDron & Nexfly Robotics | India";
  }, []);

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 3.5rem',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
            📬 We're Here to Help
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Get in Touch with <span style={{ color: 'var(--neon)' }}>NaviDron</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.7' }}>
            Have a custom drone requirement, bulk 3D printing order, or questions about the official P_Brothers GTA 6 merchandise? We respond promptly!
          </p>
        </div>
      </div>

      {/* Main Contact Section */}
      <ContactSection />

      {/* Trust & Guarantee Highlights */}
      <section style={{ background: 'var(--off-white)', padding: '3.5rem 2rem' }}>
        <div className="section-inner">
          <div className="grid-3">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,200,255,.15)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,200,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon)' }}>
                <Truck size={26} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--navy)', marginBottom: '.2rem' }}>
                  Pan-India Express Shipping
                </h4>
                <p style={{ fontSize: '.84rem', color: '#666' }}>
                  Shockproof foam packaging with insured courier tracking.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,200,255,.15)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,0,170,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff00aa' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--navy)', marginBottom: '.2rem' }}>
                  Quality Bench Tested
                </h4>
                <p style={{ fontSize: '.84rem', color: '#666' }}>
                  Every drone and 3D print is inspected before dispatch.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,200,255,.15)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,200,150,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00c896' }}>
                <Headphones size={26} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--navy)', marginBottom: '.2rem' }}>
                  Dedicated Tech Support
                </h4>
                <p style={{ fontSize: '.84rem', color: '#666' }}>
                  WhatsApp guidance for flight binding and project questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
