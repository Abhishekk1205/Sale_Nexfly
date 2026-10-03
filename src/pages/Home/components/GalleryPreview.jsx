import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, ZoomIn } from 'lucide-react';
import { galleryData } from '../../../data/galleryData';

export default function GalleryPreview() {
  const [selectedImg, setSelectedImg] = useState(null);

  // Take the first 7 showcase items
  const previewItems = galleryData.slice(0, 7);

  return (
    <section id="gallery-preview" style={{ background: '#fff', padding: '5rem 2rem' }}>
      <div className="section-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-tag">📸 Visual Showcase</div>
            <h2 className="section-title">
              Our Work in <span>Action</span>
            </h2>
          </div>
          <Link to="/gallery" className="btn btn-outline">
            View Full Gallery <ArrowRight size={16} />
          </Link>
        </div>

        <div className="gallery-grid">
          {previewItems.map((item, idx) => (
            <div
              key={item.id}
              className={`gallery-item ${idx === 0 ? 'large' : ''}`}
              onClick={() => setSelectedImg(item)}
            >
              <img src={item.image} alt={item.title} />
              <div className="gallery-item-overlay">
                <ZoomIn size={32} />
              </div>
            </div>
          ))}
        </div>
      </div>

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
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: 'var(--neon)' }}>{selectedImg.title}</h3>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem' }}>{selectedImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
