import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Sparkles, Flame, Play } from 'lucide-react';
import { YoutubeIcon } from '../../../components/Icons/SocialIcons';
import { pBrothersData } from '../../../data/pBrothersData';
import { printsData } from '../../../data/printsData';
import confetti from 'canvas-confetti';

export default function PBrothersPromo({ onOpenQuote }) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('figures'); // 'figures' | 'tshirts'

  const handleOrderClick = (itemName) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
    onOpenQuote();
  };

  return (
    <section id="gta-collab">
      <div className="gta-inner">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            className="section-tag"
            style={{
              background: 'rgba(123,47,255,.25)',
              color: '#bf7aff',
              borderColor: 'rgba(123,47,255,.4)'
            }}
          >
            <Sparkles size={14} style={{ color: '#ff00aa' }} />
            Exclusive YouTube Collaboration
          </div>
          <h2 className="section-title" style={{ color: 'white' }}>
            GTA 6 × P_Brothers <span style={{ color: '#ff00aa' }}>Merchandise</span>
          </h2>
          <p
            className="section-subtitle"
            style={{ color: 'rgba(255,255,255,.75)', margin: '0 auto' }}
          >
            In official partnership with YouTuber <strong>Priyanshu (P_Brothers)</strong> — bringing Vice City to life with precision 3D printed collectibles, game assets, and exclusive streetwear T-Shirts!
          </p>
        </div>

        {/* Big Screen Video / Banner Showcase */}
        <div className="gta-banner">
          {isPlayingVideo ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src="https://www.youtube-nocookie.com/embed/QdBZY2fkU-0?autoplay=1&rel=0"
                title="GTA 6 Trailer / P_Brothers Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src="/images/gta6_merchandise_banner_1791059157486.jpg"
                alt="GTA 6 Vice City Merchandise Banner"
                className="gta-banner-img"
              />
              <div className="gta-overlay">
                <div>
                  <div className="gta-badge">
                    <Flame size={14} /> LIMITED DROP — OFFICIAL P_BROTHERS COLLAB
                  </div>
                  <h3 className="gta-title">
                    GTA 6 Vice City 3D Figures & Streetwear
                  </h3>
                  <p className="gta-subtitle">
                    Crafted with extreme attention to detail up to 220mm size. Plus premium 240 GSM heavy cotton Vice City graphic tees & hoodies.
                  </p>
                  <div className="gta-actions">
                    <button
                      className="btn btn-yt"
                      onClick={() => setIsPlayingVideo(true)}
                    >
                      <Play size={16} fill="white" /> Watch GTA 6 Trailer & Breakdown
                    </button>
                    <a
                      href={pBrothersData.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-white"
                    >
                      <YoutubeIcon size={18} color="#ff0000" />
                      Visit P_Brothers Channel ({pBrothersData.subscribers})
                    </a>
                    <Link to="/p-brothers" className="btn btn-glow">
                      Explore Full Collab Page →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Creator & Brand Profiles */}
        <div className="collab-grid">
          <div className="collab-card">
            <img
              src="/images/gta6_merchandise_banner_1791059157486.jpg"
              alt="Priyanshu from P_Brothers"
              className="collab-avatar"
              style={{ objectPosition: 'top' }}
            />
            <div className="collab-name">P_Brothers (Priyanshu)</div>
            <div className="collab-handle">@PBrothers — Official YouTube Partner</div>
            <p className="collab-desc">
              Priyanshu is your premier creator for everything GTA 6, gaming secrets, Vice City leaks, and gaming gear. In official synergy with NaviDron, P_Brothers drops exclusive 3D printed game figures & limited streetwear tees!
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <a
                href={pBrothersData.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="yt-btn"
              >
                <YoutubeIcon size={16} color="white" />
                Subscribe on YouTube ({pBrothersData.subscribers})
              </a>
              <Link to="/p-brothers" className="btn-nav-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,.4)' }}>
                View Merch Range
              </Link>
            </div>
          </div>

          <div className="collab-card">
            <img
              src="/images/nexfly_robotics_logo_1791059250216.jpg"
              alt="Nexfly Robotics"
              className="collab-avatar"
            />
            <div className="collab-name">Nexfly Robotics & NaviDron</div>
            <div className="collab-handle">@navidron.com — High Precision Engineering</div>
            <p className="collab-desc">
              Powering the physical manufacturing behind the collaboration. Utilizing industrial SLA resin printers and FDM technology for museum-grade 3D character prints, plus custom drone frame fabrication and premium merchandise printing.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button
                onClick={onOpenQuote}
                className="btn btn-primary"
                style={{ padding: '.55rem 1.4rem', fontSize: '.84rem' }}
              >
                Request Custom 3D Figure
              </button>
              <Link to="/prints" className="btn btn-outline" style={{ color: 'white', borderColor: 'var(--neon)', padding: '.55rem 1.4rem', fontSize: '.84rem' }}>
                All 3D Prints
              </Link>
            </div>
          </div>
        </div>

        {/* Category Switcher: 3D Figures vs T-Shirts */}
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.08)', borderRadius: '50px', padding: '4px', border: '1px solid rgba(255,255,255,.15)' }}>
            <button
              onClick={() => setActiveTab('figures')}
              style={{
                padding: '.65rem 1.8rem',
                borderRadius: '50px',
                fontFamily: 'var(--font-head)',
                fontSize: '.85rem',
                fontWeight: 700,
                background: activeTab === 'figures' ? 'linear-gradient(135deg, #ff00aa, #7b2fff)' : 'transparent',
                color: 'white',
                transition: 'var(--transition)'
              }}
            >
              🎮 3D Printed Action Figures
            </button>
            <button
              onClick={() => setActiveTab('tshirts')}
              style={{
                padding: '.65rem 1.8rem',
                borderRadius: '50px',
                fontFamily: 'var(--font-head)',
                fontSize: '.85rem',
                fontWeight: 700,
                background: activeTab === 'tshirts' ? 'linear-gradient(135deg, #ff00aa, #7b2fff)' : 'transparent',
                color: 'white',
                transition: 'var(--transition)'
              }}
            >
              👕 GTA 6 & P_Brothers T-Shirts
            </button>
          </div>
        </div>

        {/* 3D Action Figures Grid */}
        {activeTab === 'figures' && (
          <div className="grid-4" style={{ marginTop: '2.5rem' }}>
            {printsData.gta6Figures.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  background: 'rgba(255,255,255,.05)',
                  borderColor: 'rgba(255,0,170,.3)',
                  backdropFilter: 'blur(10px)',
                  color: 'white'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={item.image} alt={item.name} className="card-img" />
                  <span
                    className="badge"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #ff00aa, #7b2fff)',
                      color: 'white'
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <div className="card-body" style={{ background: 'rgba(10,15,46,.4)' }}>
                  <div className="card-tag" style={{ color: '#ff00aa' }}>{item.category}</div>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '.95rem' }}>{item.name}</h3>
                  <p className="card-text" style={{ color: 'rgba(255,255,255,.7)', fontSize: '.84rem' }}>
                    {item.desc}
                  </p>
                  <div className="card-price" style={{ color: 'var(--neon)' }}>
                    {item.price}{' '}
                    {item.oldPrice && (
                      <small style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,.4)' }}>
                        {item.oldPrice}
                      </small>
                    )}
                  </div>
                  <button
                    onClick={() => handleOrderClick(item.name)}
                    className="btn btn-glow"
                    style={{ width: '100%', padding: '.65rem 1rem', fontSize: '.82rem', marginTop: '.75rem' }}
                  >
                    <ShoppingCart size={14} /> Order 3D Figure
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* T-Shirts & Apparel Grid */}
        {activeTab === 'tshirts' && (
          <div className="merch-grid">
            {printsData.tshirtsMerch.map((tee) => (
              <div key={tee.id} className="merch-card">
                <span className="merch-badge">{tee.badge}</span>
                <div className="merch-img-wrap">
                  <img src={tee.image} alt={tee.name} />
                </div>
                <div className="merch-body">
                  <span className="merch-tag">{tee.category}</span>
                  <h4 className="merch-title">{tee.name}</h4>
                  <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.7)', lineHeight: '1.5', margin: '.4rem 0' }}>
                    {tee.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '.3rem', margin: '.5rem 0', flexWrap: 'wrap' }}>
                    {tee.sizes.map((s) => (
                      <span key={s} style={{ fontSize: '.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,.1)', color: 'white' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="merch-price">
                    {tee.price}{' '}
                    <small style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,.4)', fontSize: '.8rem' }}>
                      {tee.oldPrice}
                    </small>
                  </div>
                  <button
                    onClick={() => handleOrderClick(tee.name)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '.6rem 1rem', fontSize: '.82rem' }}
                  >
                    <ShoppingCart size={14} /> Buy T-Shirt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link
            to="/p-brothers"
            className="btn btn-white"
            style={{ padding: '.9rem 2.5rem', fontSize: '1rem', fontWeight: 900 }}
          >
            🔥 View Entire P_Brothers × GTA 6 Store Collection →
          </Link>
        </div>
      </div>
    </section>
  );
}
