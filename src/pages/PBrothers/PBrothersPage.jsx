import React, { useState, useEffect } from 'react';
import { pBrothersData } from '../../data/pBrothersData';
import { printsData } from '../../data/printsData';
import { Flame, Sparkles, ShoppingCart, Play, CheckCircle2 } from 'lucide-react';
import { YoutubeIcon } from '../../components/Icons/SocialIcons';
import confetti from 'canvas-confetti';

export default function PBrothersPage({ onOpenQuote }) {
  const [selectedVideo, setSelectedVideo] = useState(pBrothersData.featuredVideos[0].id);

  useEffect(() => {
    document.title = "P_Brothers × NaviDron — Official GTA 6 3D Figures & T-Shirts Merch";
  }, []);

  const handleMerchBuy = (name) => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    onOpenQuote();
  };

  return (
    <div style={{ paddingTop: '74px' }}>
      {/* Collab Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #180033 0%, #0a0f2e 50%, #200028 100%)',
          minHeight: '52vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5.5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <div
            className="section-tag"
            style={{
              background: 'rgba(255,0,170,.2)',
              color: '#ff00aa',
              borderColor: 'rgba(255,0,170,.4)'
            }}
          >
            <Flame size={15} /> Official Creator Partnership
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 'clamp(2.2rem,5vw,4.2rem)',
              fontWeight: 900,
              marginBottom: '1rem',
              lineHeight: 1.15
            }}
          >
            P_Brothers × <span style={{ color: 'var(--neon)' }}>NaviDron</span><br />
            <span style={{ background: 'linear-gradient(135deg, #ff00aa, #bf7aff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GTA 6 Vice City
            </span> Drops
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,.85)', maxWidth: '700px', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            {pBrothersData.bio}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={pBrothersData.channelUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-yt"
              style={{ fontSize: '1rem', padding: '.9rem 2.2rem' }}
            >
              <YoutubeIcon size={20} color="white" />
              Subscribe to P_Brothers ({pBrothersData.subscribers})
            </a>

            <button onClick={onOpenQuote} className="btn btn-glow">
              <Sparkles size={16} /> Order GTA 6 Merch
            </button>
          </div>
        </div>
      </div>

      {/* Featured Video Player & Trailer Breakdown */}
      <section style={{ background: '#0a0f2e', color: 'white', padding: '4rem 2rem' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-tag" style={{ background: 'rgba(255,0,0,.2)', color: '#ff4444', borderColor: 'rgba(255,0,0,.4)' }}>
              ▶ YouTube Channel Broadcast
            </div>
            <h2 className="section-title" style={{ color: 'white' }}>
              Watch <span>P_Brothers</span> in Action
            </h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,.7)', margin: '0 auto' }}>
              Check out Priyanshu's latest GTA 6 analysis, merchandise unboxing, and secret Vice City reveals!
            </p>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,.8), 0 0 50px rgba(255,0,170,.3)', border: '1px solid rgba(255,0,170,.3)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=0&rel=0`}
                title="P_Brothers Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Selector Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1000px', margin: '2rem auto 0' }} className="grid-3">
            {pBrothersData.featuredVideos.map((vid, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedVideo(vid.id)}
                style={{
                  background: selectedVideo === vid.id ? 'rgba(255,0,170,.2)' : 'rgba(255,255,255,.05)',
                  border: `1.5px solid ${selectedVideo === vid.id ? '#ff00aa' : 'rgba(255,255,255,.1)'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#ff00aa', fontSize: '.8rem', fontWeight: 700 }}>
                  <Play size={14} fill="#ff00aa" /> {vid.duration} • {vid.views}
                </div>
                <h4 style={{ fontSize: '.9rem', color: 'white', marginTop: '.4rem', lineHeight: '1.4' }}>
                  {vid.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GTA 6 3D Action Figures Collection */}
      <section style={{ background: '#fff', padding: '5rem 2rem' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-tag" style={{ color: '#ff00aa', borderColor: 'rgba(255,0,170,.3)' }}>
              🎮 3D Printed Collectibles
            </div>
            <h2 className="section-title">
              Official GTA 6 <span>Action Figures</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Hand-painted or raw resin display pieces of Jason, Lucia, and Vice City vehicles. Printed on ultra-fine 0.05mm resin printers.
            </p>
          </div>

          <div className="grid-4">
            {printsData.gta6Figures.map((fig) => (
              <div key={fig.id} className="card">
                <div style={{ position: 'relative' }}>
                  <img src={fig.image} alt={fig.name} className="card-img" />
                  <span className="badge badge-gta" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {fig.badge}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-tag" style={{ color: '#ff00aa' }}>Scale: {fig.size}</div>
                  <h4 className="card-title">{fig.name}</h4>
                  <p className="card-text">{fig.desc}</p>
                  <div className="card-price" style={{ color: 'var(--navy)' }}>
                    {fig.price}{' '}
                    <small style={{ textDecoration: 'line-through', color: '#999' }}>{fig.oldPrice}</small>
                  </div>
                  <button
                    onClick={() => handleMerchBuy(fig.name)}
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
      </section>

      {/* Official T-Shirts & Streetwear Merch */}
      <section style={{ background: 'var(--off-white)', padding: '5rem 2rem' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-tag">👕 Streetwear Apparel</div>
            <h2 className="section-title">
              P_Brothers × NaviDron <span>T-Shirts & Hoodies</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Premium 240 GSM heavy combed cotton graphic tees. High-density puff & neon screen prints engineered to withstand 100+ washes.
            </p>
          </div>

          <div className="grid-3">
            {pBrothersData.tshirts.map((tee) => (
              <div key={tee.id} className="card" style={{ background: 'white' }}>
                <div style={{ position: 'relative' }}>
                  <img src={tee.img} alt={tee.name} className="card-img" />
                  <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {tee.badge}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-tag" style={{ color: '#ff00aa' }}>Apparel</div>
                  <h4 className="card-title" style={{ fontSize: '1.05rem' }}>{tee.name}</h4>
                  <p className="card-text">{tee.details}</p>
                  <div style={{ display: 'flex', gap: '.4rem', margin: '.75rem 0' }}>
                    {tee.sizes.map((s) => (
                      <span key={s} style={{ fontSize: '.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--off-white)', border: '1px solid #ccc', fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="card-price">
                    {tee.price}{' '}
                    <small style={{ textDecoration: 'line-through', color: '#999' }}>{tee.oldPrice}</small>
                  </div>
                  <button
                    onClick={() => handleMerchBuy(tee.name)}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                  >
                    <ShoppingCart size={15} /> Buy T-Shirt
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Collab Highlights */}
          <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: '24px', padding: '3rem', color: 'white', marginTop: '4rem' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', textAlign: 'center', marginBottom: '2rem' }}>
              Why Fans Love The P_Brothers × NaviDron Partnership
            </h3>
            <div className="grid-4">
              {pBrothersData.collabHighlights.map((ch, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,0,170,.2)', border: '1px solid #ff00aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ff00aa' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '.95rem', marginBottom: '.4rem' }}>{ch.title}</h4>
                  <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)' }}>{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
