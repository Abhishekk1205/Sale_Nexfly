import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { uavCategories } from '../../data/uavData';
import {
  Rocket,
  Send,
  CheckCircle2,
  Shield,
  Battery,
  Gauge,
  Cpu,
  ExternalLink,
  Eye,
  ShoppingCart,
  Compass,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function UAVPage({ onOpenQuote, onAddToCart }) {
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
    <div style={{ paddingTop: '74px', backgroundColor: '#ffffff' }}>
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
            From 140+ km/h FPV racing drones to 25L agricultural spraying hexacopters. Tap any drone to view all components used, live telemetry, and dynamically add GPS or Long-Range links with real-time price calculation!
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/uav/uav-apex-5" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Rocket size={16} /> Explore Apex 5" FPV Details
            </Link>
            <a href="#models" className="btn btn-white">
              Explore Available Fleet
            </a>
          </div>
        </div>
      </div>

      {/* Categories Navigator */}
      <section style={{ padding: '3rem 2rem 1.5rem', background: 'var(--off-white)', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-inner">
          <div className="uav-tabs" style={{ justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
      <section id="models" style={{ background: '#ffffff', padding: '3.5rem 2rem 5rem' }}>
        <div className="section-inner">
          <div className="drone-panel" style={{ marginBottom: '4.5rem' }}>
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

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button onClick={onOpenQuote} className="btn btn-primary">
                  Order Custom {selectedCategory.title} Airframe
                </button>
              </div>
            </div>
          </div>

          {/* Sub-models Available in this category */}
          <div style={{ marginTop: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-tag">📦 Tuned Airframes</div>
              <h3 className="section-title">
                Ready-to-Ship & Custom <span>{selectedCategory.title}</span> Builds
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
                Tap on any airframe below to view full components used (Frame, FC/ESC, Motors, VTX) and test our live interactive price calculator for GPS & Telemetry upgrades!
              </p>
            </div>

            <div className="grid-3">
              {selectedCategory.models.map((mod, i) => {
                const modId = `uav-${mod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                const images = [
                  mod.img || selectedCategory.image,
                  "/images/hero_drone_bg.jpg",
                  "/images/college_project_drone.jpg"
                ];

                return (
                  <div
                    key={i}
                    className="card"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(10,15,46,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                  >
                    {/* Multi-Photo Sliding Carousel Header */}
                    <div style={{ position: 'relative' }}>
                      <ImageSlider
                        images={images}
                        alt={mod.name}
                        aspectRatio="4/3"
                        showThumbnails={false}
                        compact={true}
                      />

                      {/* Badge */}
                      <span
                        className="badge badge-new"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          zIndex: 4,
                          fontSize: '0.68rem',
                          padding: '3px 8px'
                        }}
                      >
                        CONFIG #{i + 1}
                      </span>

                      {/* Open in New Window Quick Action */}
                      <a
                        href={`/uav/${modId}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open drone details in new window"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 4,
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          color: '#0a0f2e',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <div className="card-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="card-tag" style={{ color: 'var(--neon)', margin: '0 0 0.35rem' }}>
                        {selectedCategory.title}
                      </div>

                      <Link
                        to={`/uav/${modId}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h4
                          className="card-title"
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: '#0a0f2e',
                            marginBottom: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          {mod.name}
                        </h4>
                      </Link>

                      <p className="card-text" style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, flex: 1, marginBottom: '0.85rem' }}>
                        {mod.desc}
                      </p>

                      {/* Speed & Weight Strip */}
                      <div
                        style={{
                          margin: '0.5rem 0 0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '.82rem',
                          color: '#475569',
                          backgroundColor: '#f8faff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9'
                        }}
                      >
                        <span><Gauge size={12} color="#00c8ff" style={{ display: 'inline', marginRight: '3px' }} /> <strong>Speed:</strong> {mod.speed}</span>
                        <span><strong>Weight:</strong> {mod.weight}</span>
                      </div>

                      {/* Price */}
                      <div className="card-price" style={{ color: '#0a0f2e', fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.85rem' }}>
                        {mod.price}
                      </div>

                      {/* Dual Action Buttons: View Details & Add to Cart */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <Link
                          to={`/uav/${modId}`}
                          style={{
                            padding: '0.65rem 0.4rem',
                            borderRadius: '8px',
                            border: '1.5px solid #00c8ff',
                            backgroundColor: 'rgba(0,200,255,0.06)',
                            color: '#0077b6',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            textDecoration: 'none',
                            textAlign: 'center'
                          }}
                        >
                          <Eye size={14} /> View Details & Add-ons
                        </Link>

                        <button
                          onClick={() => {
                            const numPrice = parseInt(String(mod.price).replace(/[^0-9]/g, ''), 10) || 14999;
                            if (onAddToCart) {
                              onAddToCart({
                                id: modId,
                                name: mod.name,
                                category: selectedCategory.title,
                                price: numPrice,
                                quantity: 1,
                                image: images[0]
                              });
                            } else {
                              onOpenQuote();
                            }
                          }}
                          style={{
                            padding: '0.65rem 0.4rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#0a0f2e',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer'
                          }}
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
