import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';

export default function ActionFiguresSale({ onOpenQuote }) {
  const marqueeItems = [
    { name: "Valorant Agents Pack", price: "₹799", oldPrice: "₹1,199", img: "/images/valorant_action_figures_1791059182363.jpg" },
    { name: "GTA 6 — Jason", price: "₹999", oldPrice: "₹1,499", img: "/images/gta6_merchandise_banner_1791059157486.jpg" },
    { name: "Anime Hero Goku", price: "₹649", oldPrice: "₹899", img: "/images/anime_figure_3d.jpg" },
    { name: "3D Gift Pack", price: "₹1,299", oldPrice: "₹1,799", img: "/images/3d_printed_gift_pack.jpg" },
    { name: "Jett — Blade Storm", price: "₹749", oldPrice: "₹1,099", img: "/images/valorant_action_figures_1791059182363.jpg" },
    { name: "GTA 6 — Lucia", price: "₹999", oldPrice: "₹1,499", img: "/images/gta6_merchandise_banner_1791059157486.jpg" },
    { name: "Luffy Gear 5", price: "₹949", oldPrice: "₹1,399", img: "/images/anime_figure_3d.jpg" },
    { name: "Custom Figure", price: "From ₹599", oldPrice: "₹899", img: "/images/3d_printed_gift_pack.jpg" }
  ];

  return (
    <section id="action-figures">
      <div className="section-inner">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">
            <Flame size={14} color="#ff3366" />
            Gaming & Anime Collectibles
          </div>
          <h2 className="section-title">
            Epic 3D <span>Action Figures</span><br />
            Now on <span className="grad">Sale!</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem' }}>
            Valorant agents, GTA 6 Vice City characters, Sports icons, Anime heroes — precision 3D printed up to 220mm, highly detailed, hand finished.
          </p>
        </div>

        {/* Pulsing Sale Banner */}
        <div className="sale-banner">
          <div className="sale-title">🔥 MEGA SALE — UP TO 30% OFF ON ALL ACTION FIGURES!</div>
          <div className="sale-subtitle">
            GTA 6 • Valorant Agents • Anime Characters • Sports Icons • Custom 3D Printed Assets
          </div>
        </div>

        {/* Marquee Ticker */}
        <div className="figure-marquee-wrap">
          <div className="figure-marquee">
            {/* Duplicated list for seamless looping */}
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <div
                key={idx}
                className="figure-card"
                onClick={onOpenQuote}
                title="Click to order"
              >
                <img src={item.img} alt={item.name} />
                <div className="figure-card-body">
                  <div className="figure-card-name">{item.name}</div>
                  <div className="figure-card-price">
                    {item.price}{' '}
                    {item.oldPrice && (
                      <small style={{ textDecoration: 'line-through', color: '#999', fontSize: '.75rem' }}>
                        {item.oldPrice}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured 4 Cards Grid */}
        <div className="grid-4" style={{ marginTop: '3rem' }}>
          <div className="card">
            <div style={{ position: 'relative' }}>
              <img
                src="/images/valorant_action_figures_1791059182363.jpg"
                alt="Valorant Collection"
                className="card-img"
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '.5rem' }}>
                <span className="badge badge-sale">SALE</span>
                <span className="badge badge-hot">HOT</span>
              </div>
            </div>
            <div className="card-body">
              <div className="card-tag">Valorant Squad</div>
              <h3 className="card-title">Valorant Agents Full Collection</h3>
              <p className="card-text">
                Your favorite Valorant agents in ultra-detailed 3D resin prints. Choose Jett, Reyna, Omen, Chamber and more!
              </p>
              <div className="card-price">
                ₹799 <small>/ figure</small>
              </div>
              <button
                onClick={onOpenQuote}
                className="btn btn-primary"
                style={{ marginTop: '1rem', padding: '.65rem 1.4rem', fontSize: '.84rem', width: '100%' }}
              >
                <ShoppingCart size={15} /> Order Agent Figure
              </button>
            </div>
          </div>

          <div className="card">
            <div style={{ position: 'relative' }}>
              <img
                src="/images/gta6_merchandise_banner_1791059157486.jpg"
                alt="GTA 6 Vice City"
                className="card-img"
              />
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '.5rem' }}>
                <span className="badge badge-new">NEW</span>
                <span className="badge badge-gta">P_BROTHERS</span>
              </div>
            </div>
            <div className="card-body">
              <div className="card-tag">GTA 6 × P_Brothers</div>
              <h3 className="card-title">GTA 6 Vice City Legends</h3>
              <p className="card-text">
                Limited edition Jason & Lucia 3D figures in partnership with YouTuber Priyanshu. Numbered collector series.
              </p>
              <div className="card-price">
                ₹999 <small>/ figure</small>
              </div>
              <button
                onClick={onOpenQuote}
                className="btn btn-glow"
                style={{ marginTop: '1rem', padding: '.65rem 1.4rem', fontSize: '.84rem', width: '100%', animation: 'none' }}
              >
                <Sparkles size={15} /> Get GTA 6 Figure
              </button>
            </div>
          </div>

          <div className="card">
            <img
              src="/images/anime_figure_3d.jpg"
              alt="Anime Figures"
              className="card-img"
            />
            <div className="card-body">
              <div className="card-tag">Anime & Manga</div>
              <h3 className="card-title">Anime Heroes Collection</h3>
              <p className="card-text">
                DBZ Goku, One Piece Luffy Gear 5, Demon Slayer Tanjiro, Naruto Sage mode with dynamic aura effect bases.
              </p>
              <div className="card-price">
                ₹649 <small>/ figure</small>
              </div>
              <button
                onClick={onOpenQuote}
                className="btn btn-outline"
                style={{ marginTop: '1rem', padding: '.65rem 1.4rem', fontSize: '.84rem', width: '100%' }}
              >
                Order Anime Hero
              </button>
            </div>
          </div>

          <div className="card">
            <img
              src="/images/3d_printed_gift_pack.jpg"
              alt="Gift Pack"
              className="card-img"
            />
            <div className="card-body">
              <div className="card-tag">Curated Gift Sets</div>
              <h3 className="card-title">3D Gift Packs & Combos</h3>
              <p className="card-text">
                Packaged combo sets featuring multiple figures, lithophane keychains, and display bases. Ideal for gifts!
              </p>
              <div className="card-price">
                ₹1,299 <small>/ combo pack</small>
              </div>
              <button
                onClick={onOpenQuote}
                className="btn btn-secondary"
                style={{ marginTop: '1rem', padding: '.65rem 1.4rem', fontSize: '.84rem', width: '100%' }}
              >
                Get Gift Pack
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/prints" className="btn btn-secondary">
            View All 3D Figures & Collectibles <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
