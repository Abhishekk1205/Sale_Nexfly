import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function ImageSlider({
  images = [],
  alt = "Product Photo",
  aspectRatio = "4/3",
  showThumbnails = true,
  className = "",
  compact = false
}) {
  const imageList = Array.isArray(images) && images.length > 0
    ? images
    : ['/images/fpv_racing_drone.jpg'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prevImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handleThumbClick = (idx, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(idx);
  };

  const activeSrc = imageList[currentIndex] || imageList[0];

  return (
    <div className={`navidron-image-slider ${className}`} style={{ width: '100%', position: 'relative' }}>
      {/* Main Image Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio,
          borderRadius: compact ? '10px' : '16px',
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          boxShadow: compact ? 'none' : '0 10px 30px rgba(0,0,0,0.06)'
        }}
      >
        <img
          src={activeSrc}
          alt={`${alt} - view ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/fpv_racing_drone.jpg';
          }}
        />

        {/* Multi-Photo Slide Arrows (Show only if > 1 image) */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous Photo"
              style={{
                position: 'absolute',
                top: '50%',
                left: compact ? '6px' : '14px',
                transform: 'translateY(-50%)',
                width: compact ? '28px' : '38px',
                height: compact ? '28px' : '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: '#0a0f2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.06)',
                zIndex: 3,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00c8ff';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.color = '#0a0f2e';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft size={compact ? 16 : 22} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next Photo"
              style={{
                position: 'absolute',
                top: '50%',
                right: compact ? '6px' : '14px',
                transform: 'translateY(-50%)',
                width: compact ? '28px' : '38px',
                height: compact ? '28px' : '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: '#0a0f2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.06)',
                zIndex: 3,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00c8ff';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.color = '#0a0f2e';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight size={compact ? 16 : 22} />
            </button>

            {/* Slide Indicator Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: compact ? '6px' : '12px',
                right: compact ? '6px' : '12px',
                backgroundColor: 'rgba(10, 15, 46, 0.78)',
                color: '#ffffff',
                backdropFilter: 'blur(6px)',
                padding: compact ? '2px 7px' : '4px 10px',
                borderRadius: '20px',
                fontSize: compact ? '0.68rem' : '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                zIndex: 2
              }}
            >
              {currentIndex + 1} / {imageList.length}
            </div>
          </>
        )}

        {/* Lightbox Trigger (if not compact) */}
        {!compact && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            title="Expand Fullscreen"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              color: '#1e293b',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'background-color 0.2s'
            }}
          >
            <Maximize2 size={16} />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      {showThumbnails && imageList.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            marginTop: '0.85rem',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'thin'
          }}
        >
          {imageList.map((imgSrc, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleThumbClick(idx, e)}
                style={{
                  width: '68px',
                  height: '52px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  padding: 0,
                  border: isActive ? '2.5px solid #00c8ff' : '1.5px solid #e2e8f0',
                  boxShadow: isActive ? '0 0 10px rgba(0,200,255,0.45)' : 'none',
                  opacity: isActive ? 1 : 0.65,
                  cursor: 'pointer',
                  flexShrink: 0,
                  backgroundColor: '#f8faff',
                  transition: 'all 0.2s ease'
                }}
              >
                <img
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/fpv_racing_drone.jpg';
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Dot Indicators for compact mode */}
      {!showThumbnails && imageList.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '5px',
            position: 'absolute',
            bottom: '8px',
            left: 0,
            right: 0,
            zIndex: 2
          }}
        >
          {imageList.map((_, idx) => (
            <span
              key={idx}
              onClick={(e) => handleThumbClick(idx, e)}
              style={{
                width: idx === currentIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: idx === currentIndex ? '#00c8ff' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 15, 46, 0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>

          <img
            src={activeSrc}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}
    </div>
  );
}
