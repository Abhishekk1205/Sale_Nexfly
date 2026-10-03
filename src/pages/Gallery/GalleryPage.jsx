import React, { useState, useEffect } from 'react';
import { galleryData } from '../../data/galleryData';
import { ZoomIn, X, Play } from 'lucide-react';

export default function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    document.title = "NaviDron Gallery — Custom Drone Builds & 3D Prints Showcase";
  }, []);

  const items = galleryData.filter(item => filter === 'all' || item.category === filter);

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Gallery Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #151b42 100%)',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 3.5rem',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
            📸 Visual Portfolio
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Flight Builds & <span style={{ color: 'var(--neon)' }}>3D Creations</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.7' }}>
            Explore our workshop outputs: customized FPV freestyle rigs, field-proven crop sprayers, GTA 6 Vice City collectibles, and backlit lithophanes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section style={{ padding: '2.5rem 2rem 1.5rem', background: 'var(--off-white)' }}>
        <div className="section-inner">
          <div className="uav-tabs" style={{ justifyContent: 'center', margin: 0 }}>
            <button className={`uav-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All Work ({galleryData.length})
            </button>
            <button className={`uav-tab ${filter === 'uav' ? 'active' : ''}`} onClick={() => setFilter('uav')}>
              🚁 FPV & RC Planes
            </button>
            <button className={`uav-tab ${filter === 'agri' ? 'active' : ''}`} onClick={() => setFilter('agri')}>
              🌾 Agricultural UAVs
            </button>
            <button className={`uav-tab ${filter === 'gta6' ? 'active' : ''}`} onClick={() => setFilter('gta6')}>
              🎮 GTA 6 & P_Brothers
            </button>
            <button className={`uav-tab ${filter === 'prints' ? 'active' : ''}`} onClick={() => setFilter('prints')}>
              🖨️ 3D Figures & Lithophanes
            </button>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ background: '#fff', padding: '4rem 2rem' }}>
        <div className="section-inner">
          <div className="gallery-grid">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`gallery-item ${item.size === 'large' ? 'large' : ''}`}
                onClick={() => setSelectedImg(item)}
              >
                <img src={item.image} alt={item.title} />
                <div className="gallery-item-overlay">
                  <ZoomIn size={36} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3500,
            background: 'rgba(10,15,46,.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setSelectedImg(null)}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImg(null)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'rgba(255,255,255,.2)',
                color: 'white',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <img
              src={selectedImg.image}
              alt={selectedImg.title}
              style={{ maxHeight: '80vh', maxWidth: '100%', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 80px rgba(0,0,0,.8)' }}
            />
            <div style={{ marginTop: '1rem', color: 'white', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: 'var(--neon)' }}>{selectedImg.title}</h3>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.92rem' }}>{selectedImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
