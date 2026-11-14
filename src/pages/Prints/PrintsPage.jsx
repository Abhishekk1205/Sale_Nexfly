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
  Ruler,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { get3DStudioItems } from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function PrintsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialFilter = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
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
    const isItemOutOfStock = typeof item.quantity === 'number'
      ? item.quantity <= 0
      : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) <= 0 : false);
    if (isItemOutOfStock) return;

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
        productId: item.productId || item.id,
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

    const isOutOfStock = typeof item.quantity === 'number'
      ? item.quantity <= 0
      : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) <= 0 : false);

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/anime_figure_3d.jpg'];

    return (
      <div
        key={item.id}
        className="card"
        onClick={() => navigate(`/prints/${item.id}`)}
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
            alt={item.name}
            aspectRatio="4/3"
            showThumbnails={false}
            compact={true}
          />

          {/* Badges on Top */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 4, display: 'flex', gap: '5px' }}>
            {isOutOfStock ? (
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  fontWeight: 800,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '20px'
                }}
              >
                OUT OF STOCK
              </span>
            ) : (
              item.badge && (
                <span className="badge badge-hot" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                  {item.badge}
                </span>
              )
            )}
          </div>

          {/* Open in New Window Quick Action */}
          <a
            href={`/prints/${item.id}`}
            target="_blank"
            rel="noreferrer"
            title="Open product details in new window"
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
          {/* Category & Product ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ff00aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {item.category || '3D Studio'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#be185d',
                backgroundColor: '#fdf2f8',
                border: '1px solid #fbcfe8',
                padding: '1px 6px',
                borderRadius: '4px'
              }}
              title="Product ID / SKU"
            >
              ID: {item.productId || item.id}
            </span>
          </div>

          {/* Name & Stock Quantity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Link
              to={`/prints/${item.id}`}
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
                title={item.name}
              >
                {item.name}
              </h4>
            </Link>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: isOutOfStock ? '#ffffff' : (stockCount > 5 ? '#065f46' : '#991b1b'),
                backgroundColor: isOutOfStock ? '#ef4444' : (stockCount > 5 ? '#d1fae5' : '#fee2e2'),
                padding: '2px 7px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isOutOfStock ? 'Out of Stock' : `${stockCount} in stock`}
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
              title={item.desc}
            >
              {item.desc || 'High-precision FDM 3D printed figure.'}
            </span>
            <Link
              to={`/prints/${item.id}`}
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
              ₹{numPrice.toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Link
                to={`/prints/${item.id}`}
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
                    handleAddToCartItem(item);
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
  };

  const matchesSearch = (item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.desc || '').toLowerCase().includes(q) ||
      (item.brand || '').toLowerCase().includes(q) ||
      (item.productId || item.id || '').toLowerCase().includes(q)
    );
  };

  const filteredItems = items.filter(matchesSearch);
  const animeList = filteredItems.filter((i) => i.category === 'Anime');
  const gamesList = filteredItems.filter((i) => i.category === 'Game Characters');
  const personalList = filteredItems.filter((i) => i.category === 'Personal Character');

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

      {/* Filter Tabs & Search */}
      <section style={{ background: 'var(--off-white)', padding: '2rem 2rem 1rem' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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

          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#888' }} />
            <input
              type="text"
              placeholder="Search by Product ID, figure name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '.65rem 1rem .65rem 2.5rem',
                borderRadius: '50px',
                border: '1.5px solid rgba(255,0,170,.3)',
                background: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '.9rem'
              }}
            />
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
