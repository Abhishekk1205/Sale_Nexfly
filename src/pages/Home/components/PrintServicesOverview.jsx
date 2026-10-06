import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Check } from 'lucide-react';

export default function PrintServicesOverview({ onOpenQuote }) {
  const serviceCards = [
    {
      icon: "🖼️",
      title: "Lithophanes",
      price: "From ₹399",
      img: "/images/3d_print_lithophane.jpg",
      text: "Transform cherished photographs into illuminated 3D translucent artwork. Sizes up to 220mm, flat, curved, or 360° cylindrical lamps.",
      link: "/prints?filter=lithophane"
    },
    {
      icon: "🎮",
      title: "Gaming Collectibles",
      price: "From ₹599",
      img: "/images/valorant_action_figures_1791059182363.jpg",
      text: "GTA 6, Valorant, Minecraft, Call of Duty characters. Museum-grade resin printing with ultra-fine layer resolution down to 0.05mm.",
      link: "/prints?filter=gta6"
    },
    {
      icon: "🌸",
      title: "Anime Figures",
      price: "From ₹649",
      img: "/images/anime_figure_3d.jpg",
      text: "Dragon Ball, One Piece, Demon Slayer, Naruto, Attack on Titan. Highly expressive character poses with custom energy effect accessories.",
      link: "/prints?filter=anime"
    },
    {
      icon: "🎁",
      title: "Gift Combos & Packs",
      price: "From ₹999",
      img: "/images/3d_printed_gift_pack.jpg",
      text: "Curated multi-piece gift sets in presentation boxes. Perfect for birthdays, festivals, milestones, and gaming tournaments.",
      link: "/prints?filter=gifts"
    },
    {
      icon: "🔧",
      title: "Drone & RC 3D Parts",
      price: "From ₹199",
      img: "/images/fpv_racing_drone.jpg",
      text: "Impact-resistant TPU GoPro mounts, arm bumper guards, antenna holders, custom canopies for high-speed drone pilots.",
      link: "/products?category=3d-parts"
    },
    {
      icon: "✏️",
      title: "CAD & Custom Design",
      price: "Get Quote",
      img: "/images/lithophane_3d_print_1791059239454.jpg",
      text: "Got an idea or 2D sketch? Our industrial design team models it in SolidWorks / Blender and prints it to your exact measurements.",
      link: "/services"
    }
  ];

  return (
    <section id="print-services">
      <div className="section-inner">
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">🖨️ 3D Print Services</div>
          <h2 className="section-title">
            Professional <span>3D Printing</span> Services
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 3rem' }}>
            From intricate photo lithophanes to large-scale action figures — up to 220mm. High-strength PLA+, PETG, Carbon-fiber nylon, and ultra-detail UV Resin.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="print-grid">
          {serviceCards.map((card, i) => (
            <div key={i} className="print-card">
              <img src={card.img} alt={card.title} className="print-card-img" />
              <div className="print-card-body">
                <div className="print-icon">{card.icon}</div>
                <h3 className="print-card-title">{card.title}</h3>
                <p className="print-card-text">{card.text}</p>
                <div className="print-card-price">{card.price}</div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={onOpenQuote}
                    className="btn btn-primary"
                    style={{ padding: '.55rem 1.25rem', fontSize: '.82rem' }}
                  >
                    Order Now
                  </button>
                  <Link
                    to={card.link}
                    className="btn btn-outline"
                    style={{ padding: '.55rem 1rem', fontSize: '.82rem' }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Specs & Capabilities Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
            borderRadius: '24px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(10,15,46,.25)'
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '1.8rem',
              color: 'white',
              marginBottom: '.75rem'
            }}
          >
            Nexfly Industrial 3D Print Capabilities
          </h3>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Operating professional SLA resin and enclosed multi-material FDM printers.
          </p>

          <div className="grid-4 capabilities-grid" style={{ marginTop: '2.5rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--neon)', fontWeight: 900 }}>
                220mm
              </div>
              <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)', marginTop: '.25rem' }}>
                Max Print Envelope
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--neon)', fontWeight: 900 }}>
                0.05mm
              </div>
              <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)', marginTop: '.25rem' }}>
                Ultra Layer Resolution
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--neon)', fontWeight: 900 }}>
                15+
              </div>
              <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)', marginTop: '.25rem' }}>
                Colors & Material Types
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.2rem', color: 'var(--neon)', fontWeight: 900 }}>
                24hr
              </div>
              <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)', marginTop: '.25rem' }}>
                Express Dispatch Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
