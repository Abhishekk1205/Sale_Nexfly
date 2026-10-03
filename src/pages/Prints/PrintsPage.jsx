import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { printsData } from '../../data/printsData';
import { pBrothersData } from '../../data/pBrothersData';
import { ShoppingCart, Sparkles, Flame, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PrintsPage({ onOpenQuote }) {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f) setActiveFilter(f);
    document.title = "3D Prints & Gaming Figures — GTA 6, Valorant, T-Shirts | NaviDron";
  }, [searchParams]);

  const handleBuy = (title) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
    onOpenQuote();
  };

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0840 0%, var(--navy) 50%, #0a1830 100%)',
          minHeight: '48vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div className="section-tag" style={{ background: 'rgba(123,47,255,.25)', color: '#bf7aff', borderColor: 'rgba(123,47,255,.4)' }}>
            🖨️ Precision Additive Prototyping
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 900, marginBottom: '1rem' }}>
            3D Prints, Figures & <span style={{ color: '#ff00aa' }}>GTA 6 Merch</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.8', marginBottom: '2rem' }}>
            Vice City 3D collectibles in collaboration with <strong>P_Brothers</strong>, 240 GSM heavy cotton streetwear T-Shirts, Valorant agents, and custom backlit photo lithophanes. Up to 220mm scale.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={onOpenQuote} className="btn btn-glow">
              <Sparkles size={16} /> Order Custom 3D Print
            </button>
            <Link to="/p-brothers" className="btn btn-white">
              View P_Brothers Drop
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <section style={{ padding: '2.5rem 2rem 1rem', background: 'var(--off-white)' }}>
        <div className="section-inner">
          <div className="uav-tabs" style={{ justifyContent: 'center' }}>
            <button className={`uav-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
              🌟 All Items
            </button>
            <button className={`uav-tab ${activeFilter === 'gta6' ? 'active' : ''}`} onClick={() => setActiveFilter('gta6')}>
              🎮 GTA 6 Figures
            </button>
            <button className={`uav-tab ${activeFilter === 'tshirts' ? 'active' : ''}`} onClick={() => setActiveFilter('tshirts')}>
              👕 T-Shirts & Apparel
            </button>
            <button className={`uav-tab ${activeFilter === 'valorant' ? 'active' : ''}`} onClick={() => setActiveFilter('valorant')}>
              ⚡ Valorant Agents
            </button>
            <button className={`uav-tab ${activeFilter === 'anime' ? 'active' : ''}`} onClick={() => setActiveFilter('anime')}>
              🌸 Anime Heroes
            </button>
            <button className={`uav-tab ${activeFilter === 'lithophane' ? 'active' : ''}`} onClick={() => setActiveFilter('lithophane')}>
              🖼️ Lithophanes
            </button>
            <button className={`uav-tab ${activeFilter === 'gifts' ? 'active' : ''}`} onClick={() => setActiveFilter('gifts')}>
              🎁 Gift Packs
            </button>
          </div>
        </div>
      </section>

      {/* Main Prints Display Section */}
      <section style={{ background: '#fff' }}>
        <div className="section-inner">
          {/* GTA 6 Figures */}
          {(activeFilter === 'all' || activeFilter === 'gta6') && (
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                  <div className="section-tag" style={{ color: '#ff00aa', borderColor: 'rgba(255,0,170,.3)' }}>
                    🔥 P_Brothers Exclusive
                  </div>
                  <h3 className="section-title">GTA 6 Vice City 3D Figures</h3>
                </div>
                <Link to="/p-brothers" style={{ color: '#ff00aa', fontWeight: 700, fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  P_Brothers Collab Hub <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid-4">
                {printsData.gta6Figures.map((item) => (
                  <div key={item.id} className="card" style={{ borderColor: 'rgba(255,0,170,.25)' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} alt={item.name} className="card-img" />
                      <span className="badge badge-gta" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        {item.badge}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="card-tag" style={{ color: '#ff00aa' }}>{item.category}</div>
                      <h4 className="card-title">{item.name}</h4>
                      <p className="card-text">{item.desc}</p>
                      <div className="card-price" style={{ color: 'var(--navy)' }}>
                        {item.price}{' '}
                        <small style={{ textDecoration: 'line-through', color: '#999' }}>{item.oldPrice}</small>
                      </div>
                      <button
                        onClick={() => handleBuy(item.name)}
                        className="btn btn-glow"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem', animation: 'none' }}
                      >
                        <ShoppingCart size={15} /> Order Figure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* T-Shirts & Apparel */}
          {(activeFilter === 'all' || activeFilter === 'tshirts') && (
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div className="section-tag">👕 Official Streetwear</div>
                <h3 className="section-title">GTA 6 & P_Brothers Graphic T-Shirts</h3>
                <p className="section-subtitle">
                  240 GSM heavy combed cotton, vibrant neon DTF screen prints, pre-shrunk bio-washed fabric for ultimate comfort.
                </p>
              </div>

              <div className="merch-grid">
                {printsData.tshirtsMerch.map((tee) => (
                  <div key={tee.id} className="card" style={{ background: 'var(--off-white)' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={tee.image} alt={tee.name} className="card-img" />
                      <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        {tee.badge}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="card-tag" style={{ color: '#ff00aa' }}>{tee.category}</div>
                      <h4 className="card-title">{tee.name}</h4>
                      <p className="card-text">{tee.desc}</p>
                      <div style={{ display: 'flex', gap: '.4rem', margin: '.75rem 0' }}>
                        {tee.sizes.map((s) => (
                          <span key={s} style={{ fontSize: '.75rem', padding: '3px 8px', borderRadius: '4px', background: 'white', border: '1px solid #ddd', fontWeight: 600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="card-price">
                        {tee.price}{' '}
                        <small style={{ textDecoration: 'line-through', color: '#999' }}>{tee.oldPrice}</small>
                      </div>
                      <button
                        onClick={() => handleBuy(tee.name)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                      >
                        <ShoppingCart size={15} /> Buy T-Shirt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valorant Squad */}
          {(activeFilter === 'all' || activeFilter === 'valorant') && (
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div className="section-tag">⚡ Radiant Squad</div>
                <h3 className="section-title">Valorant Agent Action Figures</h3>
              </div>

              <div className="grid-4">
                {printsData.valorantFigures.map((v) => (
                  <div key={v.id} className="card">
                    <img src={v.image} alt={v.name} className="card-img" />
                    <div className="card-body">
                      <div className="card-tag">Valorant</div>
                      <h4 className="card-title">{v.name}</h4>
                      <p className="card-text">{v.desc}</p>
                      <div className="card-price">
                        {v.price}{' '}
                        <small style={{ textDecoration: 'line-through', color: '#999' }}>{v.oldPrice}</small>
                      </div>
                      <button
                        onClick={() => handleBuy(v.name)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                      >
                        Order Agent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anime & Manga */}
          {(activeFilter === 'all' || activeFilter === 'anime') && (
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div className="section-tag">🌸 Otaku Zone</div>
                <h3 className="section-title">Anime & Manga 3D Figures</h3>
              </div>

              <div className="grid-4">
                {printsData.animeFigures.map((a) => (
                  <div key={a.id} className="card">
                    <img src={a.image} alt={a.name} className="card-img" />
                    <div className="card-body">
                      <div className="card-tag">Anime</div>
                      <h4 className="card-title">{a.name}</h4>
                      <p className="card-text">{a.desc}</p>
                      <div className="card-price">{a.price}</div>
                      <button
                        onClick={() => handleBuy(a.name)}
                        className="btn btn-outline"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                      >
                        Order Character
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lithophanes & Gifts */}
          {(activeFilter === 'all' || activeFilter === 'lithophane' || activeFilter === 'gifts') && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <div className="section-tag">🖼️ Keepsakes & Combos</div>
                <h3 className="section-title">Personalized Lithophanes & Gift Packs</h3>
              </div>

              <div className="grid-2">
                {printsData.lithophanes.map((l) => (
                  <div key={l.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <img src={l.image} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="card-body">
                      <div className="card-tag">Lithophane</div>
                      <h4 className="card-title">{l.name}</h4>
                      <p className="card-text">{l.desc}</p>
                      <div className="card-price">{l.price}</div>
                      <button
                        onClick={() => handleBuy(l.name)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                      >
                        Upload Photo & Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
