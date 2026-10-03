import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { uavCategories } from '../../data/uavData';
import { Rocket, Send, CheckCircle2, Shield, Battery, Gauge, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UAVPage({ onOpenQuote }) {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'fpv';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    document.title = "UAV Drones — FPV, Agricultural, RC Planes | NaviDron";
  }, [searchParams]);

  const selectedCategory = uavCategories.find(c => c.id === activeTab) || uavCategories[0];

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* UAV Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)',
          minHeight: '45vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
            🚁 Unmanned Aerial Systems
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Next-Gen <span style={{ color: 'var(--neon)' }}>UAV Solutions</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.8', marginBottom: '2rem' }}>
            From 140+ km/h FPV racing drones to 25L agricultural spraying hexacopters and student engineering platforms. Designed, CNC-cut, and tuned in India by Nexfly Robotics.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenQuote} className="btn btn-primary">
              <Rocket size={16} /> Request Custom Airframe
            </button>
            <a href="#models" className="btn btn-white">
              Explore Available Models
            </a>
          </div>
        </div>
      </div>

      {/* Categories Navigator */}
      <section style={{ padding: '3rem 2rem 1.5rem', background: 'var(--off-white)' }}>
        <div className="section-inner">
          <div className="uav-tabs" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            {uavCategories.map((cat) => (
              <button
                key={cat.id}
                className={`uav-tab ${activeTab === cat.id ? 'active' : ''}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Category Feature & Spec Breakdown */}
      <section id="models" style={{ background: '#fff' }}>
        <div className="section-inner">
          <div className="drone-panel" style={{ marginBottom: '4rem' }}>
            <div className="drone-showcase-img">
              <img src={selectedCategory.image} alt={selectedCategory.title} />
            </div>

            <div>
              <div className="section-tag">{selectedCategory.tagline}</div>
              <h2 className="section-title" style={{ fontSize: '2.2rem' }}>
                {selectedCategory.title}
              </h2>
              <p style={{ color: '#4a5270', marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
                {selectedCategory.desc}
              </p>

              <div className="drone-spec-list">
                {selectedCategory.specs.map((s, idx) => (
                  <div key={idx} className="drone-spec">
                    <span className="drone-spec-key">{s.key}</span>
                    <span className="drone-spec-val">{s.val}</span>
                  </div>
                ))}
              </div>

              <button onClick={onOpenQuote} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Order Custom {selectedCategory.title}
              </button>
            </div>
          </div>

          {/* Sub-models Available in this category */}
          <div style={{ marginTop: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-tag">📦 Tuned Configurations</div>
              <h3 className="section-title">
                Ready-to-Ship & Custom <span>{selectedCategory.title}</span> Builds
              </h3>
            </div>

            <div className="grid-3">
              {selectedCategory.models.map((mod, i) => (
                <div key={i} className="card">
                  <img src={mod.img} alt={mod.name} className="card-img" />
                  <div className="card-body">
                    <div className="card-tag">Config #{i + 1}</div>
                    <h4 className="card-title" style={{ fontSize: '1.1rem' }}>{mod.name}</h4>
                    <p className="card-text">{mod.desc}</p>
                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', color: '#666', borderTop: '1px solid rgba(0,200,255,.15)', paddingTop: '.75rem' }}>
                      <span><strong>Max Speed:</strong> {mod.speed}</span>
                      <span><strong>Weight:</strong> {mod.weight}</span>
                    </div>
                    <div className="card-price" style={{ color: 'var(--neon)', fontSize: '1.4rem' }}>
                      {mod.price}
                    </div>
                    <button
                      onClick={onOpenQuote}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                    >
                      Configure / Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
