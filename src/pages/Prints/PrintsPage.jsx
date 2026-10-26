import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, Flame, Check, ArrowRight, User, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { get3DStudioItems } from '../../services/firebase';

export default function PrintsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom photo upload state for Personal Character
  const [customPhotoName, setCustomPhotoName] = useState('');
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

    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        name: item.name,
        category: item.category || '3D Studio',
        size: chosenSize || item.size || '8 inch',
        price: numPrice,
        quantity: 1,
        image: item.image || '/images/anime_figure_3d.jpg'
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  const animeList = items.filter((i) => i.category === 'Anime');
  const gamesList = items.filter((i) => i.category === 'Game Characters');
  const personalList = items.filter((i) => i.category === 'Personal Character');

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0840 0%, var(--navy) 50%, #0a1830 100%)',
          minHeight: '45vh',
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
            High-precision resin 3D figures: Gear 5 Luffy, Goku, GTA 6 Vice City collectibles, Valorant agents, and custom 3D person statues sculpted from your own photo.
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
      <section style={{ background: '#fff', padding: '3rem 2rem 5rem' }}>
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
                      👤 Custom Person Figures
                    </div>
                    <h3 className="section-title">Personal Character of Image (Custom From Photo)</h3>
                    <p className="section-subtitle">
                      Send or upload your personal photo — our 3D artists sculpt a high-detail miniature resin statue of you, couples, or memorial keepsakes.
                    </p>
                  </div>

                  <div className="merch-grid">
                    {personalList.map((item) => {
                      const numPrice = typeof item.price === 'number'
                        ? item.price
                        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={item.id} className="card" style={{ background: 'var(--off-white)' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={item.image} alt={item.name} className="card-img" />
                            <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              {item.badge || 'CUSTOM PHOTO'}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="card-tag" style={{ color: '#ff00aa' }}>Personal Sculpture</div>
                            <h4 className="card-title">{item.name}</h4>
                            <p className="card-text">{item.desc}</p>

                            <div style={{ margin: '0.75rem 0' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                                Select Figure Size:
                              </label>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {['6 inch', '8 inch', '12 inch', 'Custom Scale'].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedPersonalSize(s)}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '3px 9px',
                                      borderRadius: '6px',
                                      border: selectedPersonalSize === s ? '1.5px solid #ff00aa' : '1px solid #cbd5e1',
                                      background: selectedPersonalSize === s ? 'rgba(255,0,170,0.1)' : '#fff',
                                      color: selectedPersonalSize === s ? '#ff00aa' : '#334155',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="card-price" style={{ color: 'var(--navy)' }}>
                              ₹{numPrice.toLocaleString('en-IN')}
                            </div>

                            <button
                              onClick={() => handleAddToCartItem(item, selectedPersonalSize)}
                              className="btn btn-glow"
                              style={{ width: '100%', marginTop: '.75rem', padding: '.7rem 1rem', fontSize: '.85rem' }}
                            >
                              <ShoppingCart size={15} /> Order Custom Figure ({selectedPersonalSize})
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                      Monkey D. Luffy Gear 5, Goku Super Saiyan, Naruto Sage Mode, and Tanjiro Hinokami with dynamic energy effects.
                    </p>
                  </div>

                  <div className="merch-grid">
                    {animeList.map((item) => {
                      const numPrice = typeof item.price === 'number'
                        ? item.price
                        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={item.id} className="card" style={{ background: 'var(--off-white)' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={item.image} alt={item.name} className="card-img" />
                            <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              {item.badge || 'ANIME'}
                            </span>
                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'var(--neon)', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>
                              Size: {item.size || '8 inch'}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="card-tag" style={{ color: '#00c896' }}>Anime Series</div>
                            <h4 className="card-title">{item.name}</h4>
                            <p className="card-text">{item.desc}</p>
                            <div className="card-price" style={{ color: 'var(--navy)' }}>
                              ₹{numPrice.toLocaleString('en-IN')}
                            </div>
                            <button
                              onClick={() => handleAddToCartItem(item)}
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                            >
                              <ShoppingCart size={15} /> Add to Flight Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                    {gamesList.map((item) => {
                      const numPrice = typeof item.price === 'number'
                        ? item.price
                        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={item.id} className="card" style={{ background: 'var(--off-white)' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={item.image} alt={item.name} className="card-img" />
                            <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              {item.badge || 'GAMING'}
                            </span>
                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#ff00aa', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>
                              Size: {item.size || '8 inch'}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="card-tag" style={{ color: '#ff00aa' }}>Gaming Collectibles</div>
                            <h4 className="card-title">{item.name}</h4>
                            <p className="card-text">{item.desc}</p>
                            <div className="card-price" style={{ color: 'var(--navy)' }}>
                              ₹{numPrice.toLocaleString('en-IN')}
                            </div>
                            <button
                              onClick={() => handleAddToCartItem(item)}
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                            >
                              <ShoppingCart size={15} /> Add to Flight Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
