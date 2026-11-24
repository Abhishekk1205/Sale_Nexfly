import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pBrothersData } from '../../data/pBrothersData';
import { printsData } from '../../data/printsData';
import {
  Flame,
  Sparkles,
  ShoppingCart,
  Play,
  CheckCircle2,
  Radio,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { YoutubeIcon } from '../../components/Icons/SocialIcons';
import confetti from 'canvas-confetti';
import {
  getPBrothersConfig,
  getPBrothersProducts,
  INITIAL_PBROTHERS_CONFIG,
  INITIAL_PBROTHERS_PRODUCTS,
  parseYouTubeVideoId
} from '../../services/firebase';

export default function PBrothersPage({ onAddToCart, onOpenQuote }) {
  const [config, setConfig] = useState(INITIAL_PBROTHERS_CONFIG);
  const [products, setProducts] = useState(INITIAL_PBROTHERS_PRODUCTS);
  const [selectedVideo, setSelectedVideo] = useState(INITIAL_PBROTHERS_CONFIG.featuredVideoId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "P_Brothers × NaviDron — Official GTA 6 3D Figures & T-Shirts Merch";
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const [cfg, prods] = await Promise.all([
          getPBrothersConfig(),
          getPBrothersProducts()
        ]);
        if (cfg) {
          setConfig(cfg);
          if (cfg.featuredVideoId) {
            setSelectedVideo(cfg.featuredVideoId);
          }
        }
        if (Array.isArray(prods) && prods.length > 0) {
          setProducts(prods);
        }
      } catch (e) {
        console.error('Error loading P_Brothers page data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMerchBuy = (prod) => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const numPrice = typeof prod.price === 'number'
      ? prod.price
      : parseInt(String(prod.price).replace(/[^0-9]/g, ''), 10) || 799;

    const availableSize = Array.isArray(prod.sizes) && prod.sizes.length > 0
      ? prod.sizes[0]
      : (prod.size || 'Standard');

    if (onAddToCart) {
      onAddToCart({
        id: prod.id,
        productId: prod.productId || prod.id,
        name: prod.name,
        category: prod.category || 'GTA 6 × P_Brothers',
        brand: 'P_Brothers × NaviDron',
        size: availableSize,
        price: numPrice,
        quantity: 1,
        image: prod.image || prod.img || '/images/gta6_merchandise_banner_1791059157486.jpg'
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  // Separate products into 3D Figures and Streetwear T-Shirts
  const gtaFigures = products.filter(
    (p) => (p.category || '').toLowerCase().includes('figure') || (p.category || '').toLowerCase().includes('gta')
  );
  const tshirts = products.filter(
    (p) => (p.category || '').toLowerCase().includes('shirt') || (p.category || '').toLowerCase().includes('apparel')
  );

  // Shorts (up to 3) configured by the admin
  const validShorts = (config.shorts || []).filter((s) => s && (s.videoId || s.url));

  const activeVideoId = selectedVideo || config.featuredVideoId || 'QdBZY2fkU-0';

  return (
    <div style={{ paddingTop: '74px', backgroundColor: '#ffffff', color: '#0a0f2e' }}>
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

      {/* Featured Video Player & Trailer / Live Stream Breakdown */}
      <section style={{ background: '#0a0f2e', color: 'white', padding: '4.5rem 2rem' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {config.isLive ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1.5px solid #ef4444',
                  color: '#ef4444',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  marginBottom: '0.85rem'
                }}
              >
                <Radio size={15} color="#ef4444" />
                <span>{config.liveBadgeText || '🔴 STREAMING LIVE NOW'}</span>
              </div>
            ) : (
              <div className="section-tag" style={{ background: 'rgba(255,0,0,.2)', color: '#ff4444', borderColor: 'rgba(255,0,0,.4)' }}>
                ▶ YouTube Channel Broadcast
              </div>
            )}

            <h2 className="section-title" style={{ color: 'white' }}>
              Watch <span>P_Brothers</span> in Action
            </h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,.7)', margin: '0 auto' }}>
              {config.featuredVideoTitle || "Check out Priyanshu's latest GTA 6 analysis, merchandise unboxing, and secret Vice City reveals!"}
            </p>
          </div>

          {/* Main Video Frame */}
          <div style={{ maxWidth: '1000px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,.8), 0 0 50px rgba(255,0,170,.3)', border: '1.5px solid rgba(255,0,170,.35)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=0&rel=0`}
                title={config.featuredVideoTitle || "P_Brothers Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Selector Thumbnails */}
          <div className="grid-3 video-thumbnails-grid" style={{ maxWidth: '1000px', margin: '2rem auto 0' }}>
            {pBrothersData.featuredVideos.map((vid, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedVideo(vid.id)}
                style={{
                  background: activeVideoId === vid.id ? 'rgba(255,0,170,.2)' : 'rgba(255,255,255,.05)',
                  border: `1.5px solid ${activeVideoId === vid.id ? '#ff00aa' : 'rgba(255,255,255,.1)'}`,
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
              Hand-painted ultra-fine 3D display pieces of Jason, Lucia, and Vice City vehicles. Printed with precision tough solid cores.
            </p>
          </div>

          <div className="grid-4">
            {(gtaFigures.length > 0 ? gtaFigures : printsData.gta6Figures).map((fig) => {
              const numPrice = typeof fig.price === 'number'
                ? fig.price
                : parseInt(String(fig.price).replace(/[^0-9]/g, ''), 10) || 999;
              const formattedPrice = `₹${numPrice.toLocaleString('en-IN')}`;
              const availableSize = Array.isArray(fig.sizes) ? fig.sizes.join(', ') : (fig.size || '20cm');

              return (
                <div key={fig.id} className="card" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={fig.image || fig.img || '/images/gta6_merchandise_banner_1791059157486.jpg'} alt={fig.name} className="card-img" />
                    <span className="badge badge-gta" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      {fig.badge || 'GTA 6 DROP'}
                    </span>
                    {fig.productId && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(10,15,46,0.85)', color: '#00c8ff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        ID: {fig.productId}
                      </span>
                    )}
                  </div>
                  <div className="card-body" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <h4 className="card-title" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0a0f2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {fig.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ff00aa', backgroundColor: 'rgba(255,0,170,0.1)', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Scale: {availableSize}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {fig.desc}
                      </span>
                      <Link to="/prints?category=Game Characters" style={{ color: '#ff00aa', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, textDecoration: 'none' }}>
                        Know more &rarr;
                      </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                      <div className="card-price" style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                        {formattedPrice}{' '}
                        {fig.oldPrice ? (
                          <small style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>₹{fig.oldPrice}</small>
                        ) : null}
                      </div>
                      <button
                        onClick={() => handleMerchBuy(fig)}
                        className="btn btn-glow"
                        style={{ padding: '.5rem .95rem', fontSize: '.8rem', animation: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            {(tshirts.length > 0 ? tshirts : pBrothersData.tshirts).map((tee) => {
              const numPrice = typeof tee.price === 'number'
                ? tee.price
                : parseInt(String(tee.price).replace(/[^0-9]/g, ''), 10) || 799;
              const formattedPrice = `₹${numPrice.toLocaleString('en-IN')}`;
              const availableSizes = Array.isArray(tee.sizes) ? tee.sizes.join(', ') : (tee.size || 'S, M, L, XL');

              return (
                <div key={tee.id} className="card" style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={tee.image || tee.img || '/images/gta6_merchandise_banner_1791059157486.jpg'} alt={tee.name} className="card-img" />
                    <span className="badge badge-hot" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      {tee.badge || 'STREETWEAR'}
                    </span>
                    {tee.productId && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(10,15,46,0.85)', color: '#00c8ff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        ID: {tee.productId}
                      </span>
                    )}
                  </div>
                  <div className="card-body" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <h4 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0a0f2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {tee.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ff00aa', backgroundColor: 'rgba(255,0,170,0.1)', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Sizes: {availableSizes}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.35rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {tee.desc || tee.details}
                      </span>
                      <Link to="/prints?category=Accessories" style={{ color: '#ff00aa', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, textDecoration: 'none' }}>
                        Know more &rarr;
                      </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                      <div className="card-price" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy)' }}>
                        {formattedPrice}{' '}
                        {tee.oldPrice ? (
                          <small style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>₹{tee.oldPrice}</small>
                        ) : null}
                      </div>
                      <button
                        onClick={() => handleMerchBuy(tee)}
                        className="btn btn-primary"
                        style={{ padding: '.5rem .95rem', fontSize: '.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ShoppingCart size={14} /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* YOUTUBE SHORTS SHOWCASE (UP TO 3 SHORTS AT THE VERY END OF THE PAGE) */}
      {validShorts.length > 0 && (
        <section
          style={{
            background: 'linear-gradient(180deg, #0a0f2e 0%, #160026 100%)',
            padding: '5rem 2rem 6rem',
            color: '#ffffff',
            borderTop: '1.5px solid rgba(255,0,170,0.25)'
          }}
        >
          <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 0, 170, 0.15)',
                  border: '1.5px solid rgba(255, 0, 170, 0.4)',
                  color: '#ff00aa',
                  padding: '4px 14px',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                <Smartphone size={15} /> P_Brothers YouTube Shorts
              </div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 0.5rem', color: '#ffffff' }}>
                Latest Vice City <span style={{ color: '#ff00aa' }}>Shorts & Leaks</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
                Catch high-octane 60-second updates from Priyanshu: GTA 6 map secrets, figure reveals, and game Easter eggs.
              </p>
            </div>

            {/* 3 Shorts Vertical Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                justifyContent: 'center'
              }}
            >
              {validShorts.slice(0, 3).map((short, idx) => {
                const videoId = parseYouTubeVideoId(short.url || short.videoId);
                return (
                  <div
                    key={short.id || idx}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1.5px solid rgba(255, 0, 170, 0.3)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(255,0,170,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(255,0,170,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(255,0,170,0.15)';
                    }}
                  >
                    {/* 9:16 Vertical Video Frame */}
                    <div style={{ position: 'relative', paddingBottom: '145%', height: 0, backgroundColor: '#000' }}>
                      <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`}
                        title={short.title || `P_Brothers Short #${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ff00aa', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                        <Flame size={12} /> P_Brothers Short #{idx + 1}
                      </div>
                      <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.4, flex: 1 }}>
                        {short.title || 'GTA 6 Vice City Exclusive Short'}
                      </h4>

                      <a
                        href={short.url || `https://www.youtube.com/shorts/${videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255,0,170,0.12)',
                          border: '1px solid rgba(255,0,170,0.3)',
                          color: '#ff00aa',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          marginTop: 'auto'
                        }}
                      >
                        <Play size={13} fill="#ff00aa" /> Watch on YouTube Shorts <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
