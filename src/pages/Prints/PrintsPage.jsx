import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  User,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Clock,
  Ruler
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { get3DStudioItems } from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function PrintsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialFilter = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom photo upload state for Personal Character
  const [selectedPersonalSize, setSelectedPersonalSize] = useState('8 inch');

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setActiveFilter(f);
    document.title = "3D Studio — Anime, Game Characters & Custom Photo Statues | NaviDron";

    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await get3DStudioItems();
        setItems(data);
      } catch (e) {
        console.error('Error fetching 3D Studio catalog:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [searchParams]);

  const handleAddToCartItem = (item, chosenSize = null) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/anime_figure_3d.jpg'];

    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        name: item.name,
        category: item.category || '3D Studio',
        size: chosenSize || item.size || '8 inch',
        price: numPrice,
        quantity: 1,
        image: images[0]
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  const renderProductCard = (item, tagColor = '#00c8ff', defaultTag = '3D Figure') => {
    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/anime_figure_3d.jpg'];

    return (
      <div
        key={item.id}
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
            alt={item.name}
            aspectRatio="4/3"
            showThumbnails={false}
            compact={true}
          />

          {/* Badges on Top */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 4, display: 'flex', gap: '5px' }}>
            {item.badge && (
              <span className="badge badge-hot" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                {item.badge}
              </span>
            )}
          </div>

          {/* Open in New Window Quick Action */}
          <a
            href={`/prints/${item.id}`}
            target="_blank"
            rel="noreferrer"
            title="Open product details in new window"
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

        {/* Card Body */}
        <div className="card-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="card-tag" style={{ color: tagColor, margin: 0 }}>
              {item.category || defaultTag}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} color="#00c8ff" /> {item.printTime || '6h 30m'}
            </span>
          </div>

          <Link
            to={`/prints/${item.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h4
              className="card-title"
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0a0f2e',
                lineHeight: 1.35,
                marginBottom: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {item.name}
            </h4>
          </Link>

          <p className="card-text" style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, flex: 1, marginBottom: '0.85rem' }}>
            {item.desc}
          </p>

          {/* Size & Print Info Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8faff',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.76rem',
              color: '#475569',
              marginBottom: '0.85rem',
              border: '1px solid #f1f5f9'
            }}
          >
            <span><Ruler size={12} color="#00c8ff" style={{ display: 'inline', marginRight: '3px' }} /> Scale: <strong>{item.size || '8 inch'}</strong></span>
            <span>Resin: <strong>{item.layerHeight || '0.08mm'}</strong></span>
          </div>

          {/* Price & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div className="card-price" style={{ color: '#0a0f2e', fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>
              ₹{numPrice.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
              ✓ Dynamic Sizes Available
            </span>
          </div>

          {/* Dual Action Buttons: View Details and Add to Cart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <Link
              to={`/prints/${item.id}`}
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
              <Eye size={14} /> View Details
            </Link>

            <button
              onClick={() => handleAddToCartItem(item)}
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
  };

  const animeList = items.filter((i) => i.category === 'Anime');
  const gamesList = items.filter((i) => i.category === 'Game Characters');
  const personalList = items.filter((i) => i.category === 'Personal Character');

  return (
    <div style={{ paddingTop: '74px', backgroundColor: '#ffffff' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0840 0%, var(--navy) 50%, #0a1830 100%)',
          minHeight: '42vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div className="section-tag" style={{ background: 'rgba(123,47,255,.25)', color: '#bf7aff', borderColor: 'rgba(123,47,255,.4)' }}>
            🖨️ 3D Studio & Additive Prototyping
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Anime, Game Figures & <span style={{ color: '#ff00aa' }}>Personal 3D Sculptures</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.85)', maxWidth: '680px', lineHeight: '1.7' }}>
            High-precision SLA resin 3D figures: Gear 5 Luffy, Goku, GTA 6 Vice City collectibles, Valorant agents, and custom 3D person statues sculpted from your own photo. Tap any item to inspect print sizes, print times, and dynamic pricing!
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section style={{ background: 'var(--off-white)', padding: '2rem 2rem 1rem' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="uav-tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
            <button className={`uav-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
              All 3D Studio Items ({items.length})
            </button>
            <button className={`uav-tab ${activeFilter === 'anime' ? 'active' : ''}`} onClick={() => setActiveFilter('anime')}>
              🌸 Anime Characters ({animeList.length})
            </button>
            <button className={`uav-tab ${activeFilter === 'games' ? 'active' : ''}`} onClick={() => setActiveFilter('games')}>
              🎮 Game Characters ({gamesList.length})
            </button>
            <button className={`uav-tab ${activeFilter === 'personal' ? 'active' : ''}`} onClick={() => setActiveFilter('personal')}>
              👤 Personal Character of Image ({personalList.length})
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section style={{ background: '#ffffff', padding: '3rem 2rem 5rem' }}>
        <div className="section-inner">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
              <p>Loading 3D Studio catalog...</p>
            </div>
          ) : (
            <>
              {/* Personal Character Highlight Section */}
              {(activeFilter === 'all' || activeFilter === 'personal') && personalList.length > 0 && (
                <div style={{ marginBottom: '4.5rem' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div className="section-tag" style={{ background: 'rgba(255,0,170,.12)', color: '#ff00aa' }}>
                      👤 Custom Person Figures & Lithophanes
                    </div>
                    <h3 className="section-title">Personal Character of Image (Custom From Photo)</h3>
                    <p className="section-subtitle">
                      Send or upload your personal photo — our 3D artists sculpt a high-detail miniature resin statue of you, couples, or memorial keepsakes. Tap to select size and upload photo.
                    </p>
                  </div>

                  <div className="merch-grid">
                    {personalList.map((item) => renderProductCard(item, '#ff00aa', 'Personal Sculpture'))}
                  </div>
                </div>
              )}

              {/* Anime Figures */}
              {(activeFilter === 'all' || activeFilter === 'anime') && animeList.length > 0 && (
                <div style={{ marginBottom: '4.5rem' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div className="section-tag" style={{ background: 'rgba(0,200,255,.12)', color: 'var(--neon)' }}>
                      🌸 Anime Heroes & Collectibles
                    </div>
                    <h3 className="section-title">Anime Resin 3D Sculptures</h3>
                    <p className="section-subtitle">
                      Monkey D. Luffy Gear 5, Goku Super Saiyan, Naruto Sage Mode, and Tanjiro Hinokami with dynamic energy effects. Tap to view 3D print time, scale, and multi-angle photos.
                    </p>
                  </div>

                  <div className="merch-grid">
                    {animeList.map((item) => renderProductCard(item, '#00c8ff', 'Anime Series'))}
                  </div>
                </div>
              )}

              {/* Game Characters */}
              {(activeFilter === 'all' || activeFilter === 'games') && gamesList.length > 0 && (
                <div style={{ marginBottom: '4rem' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div className="section-tag" style={{ background: 'rgba(255,180,0,.15)', color: '#ffb300' }}>
                      🎮 Gaming Legends
                    </div>
                    <h3 className="section-title">GTA 6 Vice City & Valorant Agents</h3>
                    <p className="section-subtitle">
                      Jason and Lucia from GTA 6, alongside Valorant duelist Reyna and wind assassin Jett with custom display stands.
                    </p>
                  </div>

                  <div className="merch-grid">
                    {gamesList.map((item) => renderProductCard(item, '#f59e0b', 'Gaming Collectible'))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
