import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  Radio,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function UAVPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') || 'fpv';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

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

      {/* Categories Navigator & Search */}
      <section style={{ padding: '2rem 2rem 1.5rem', background: 'var(--off-white)', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="uav-tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
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

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#888' }} />
            <input
              type="text"
              placeholder="Search by Product ID, drone name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '.65rem 1rem .65rem 2.5rem',
                borderRadius: '50px',
                border: '1.5px solid rgba(0,200,255,.3)',
                background: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '.9rem'
              }}
            />
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
              {selectedCategory.models
                .filter((mod) => {
                  if (!searchTerm.trim()) return true;
                  const q = searchTerm.toLowerCase();
                  const modId = `uav-${mod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                  return (
                    (mod.name || '').toLowerCase().includes(q) ||
                    (mod.desc || '').toLowerCase().includes(q) ||
                    (mod.brand || '').toLowerCase().includes(q) ||
                    (mod.productId || mod.id || modId).toLowerCase().includes(q)
                  );
                })
                .map((mod, i) => {
                const modId = `uav-${mod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                const images = [
                  mod.img || selectedCategory.image,
                  "/images/hero_drone_bg.jpg",
                  "/images/college_project_drone.jpg"
                ];

                const isOutOfStock = typeof mod.quantity === 'number'
                  ? mod.quantity <= 0
                  : (mod.quantity !== undefined ? parseInt(String(mod.quantity), 10) <= 0 : false);

                return (
                  <div
                    key={i}
                    className="card"
                    onClick={() => navigate(`/uav/${modId}`)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(10,15,46,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
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
                        className={isOutOfStock ? "badge" : "badge badge-new"}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          zIndex: 4,
                          fontSize: '0.68rem',
                          padding: '3px 8px',
                          fontWeight: 800,
                          backgroundColor: isOutOfStock ? '#ef4444' : undefined,
                          color: isOutOfStock ? '#ffffff' : undefined
                        }}
                      >
                        {isOutOfStock ? 'OUT OF STOCK' : `CONFIG #${i + 1}`}
                      </span>

                      {/* Open in New Window Quick Action */}
                      <a
                        href={`/uav/${modId}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open drone details in new window"
                        onClick={(e) => e.stopPropagation()}
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

                    {/* Card Body - Clean & Compact */}
                    <div className="card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Aircraft Category & Product ID */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '4px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00c8ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {selectedCategory.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#0369a1',
                            backgroundColor: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}
                          title="Product ID / SKU"
                        >
                          ID: {mod.productId || mod.id || modId}
                        </span>
                      </div>

                      {/* Name & Stock Quantity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <Link
                          to={`/uav/${modId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
                        >
                          <h4
                            className="card-title"
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: '#0a0f2e',
                              lineHeight: 1.35,
                              margin: 0,
                              cursor: 'pointer',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                            title={mod.name}
                          >
                            {mod.name}
                          </h4>
                        </Link>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: isOutOfStock ? '#ffffff' : '#065f46',
                            backgroundColor: isOutOfStock ? '#ef4444' : '#d1fae5',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          {isOutOfStock ? 'Out of Stock' : (mod.quantity ? `${mod.quantity} in stock` : 'Ready to Fly')}
                        </span>
                      </div>

                      {/* Single Line Description with "Know more" in last */}
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          lineHeight: 1.4,
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.35rem',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                          title={mod.desc}
                        >
                          {mod.desc || 'High-performance prebuilt UAV flight system.'}
                        </span>
                        <Link
                          to={`/uav/${modId}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#0077b6',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            flexShrink: 0,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          Know more &rarr;
                        </Link>
                      </div>

                      {/* Price & Actions Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                        <div className="card-price" style={{ color: '#0a0f2e', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                          {mod.price}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link
                            to={`/uav/${modId}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '0.45rem 0.65rem',
                              borderRadius: '7px',
                              border: '1.5px solid #00c8ff',
                              backgroundColor: 'rgba(0,200,255,0.06)',
                              color: '#0077b6',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Eye size={13} /> Know more
                          </Link>

                          {isOutOfStock ? (
                            <button
                              type="button"
                              disabled
                              style={{
                                padding: '0.45rem 0.65rem',
                                borderRadius: '7px',
                                border: 'none',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 700,
                                fontSize: '0.74rem',
                                cursor: 'not-allowed',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Out of Stock
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const numPrice = parseInt(String(mod.price).replace(/[^0-9]/g, ''), 10) || 14999;
                                if (onAddToCart) {
                                  onAddToCart({
                                    id: modId,
                                    productId: mod.productId || mod.id || modId,
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
                                padding: '0.45rem 0.75rem',
                                borderRadius: '7px',
                                border: 'none',
                                backgroundColor: '#0a0f2e',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <ShoppingCart size={13} /> Add
                            </button>
                          )}
                        </div>
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
