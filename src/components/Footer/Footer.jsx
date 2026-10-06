import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, WhatsAppIcon } from '../Icons/SocialIcons';
import confetti from 'canvas-confetti';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (err) {}
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div className="nav-logo" style={{ marginBottom: '1rem' }}>
              <img
                src="/favicon.png"
                alt="NaviDron"
                style={{ height: '42px', width: '42px', borderRadius: '50%', objectFit: 'contain' }}
              />
              <span className="nav-logo-text" style={{ color: 'white' }}>
                NAVI<span style={{ color: 'var(--neon)' }}>DRON</span>
              </span>
            </div>
            <p className="footer-brand-desc">
              NaviDron by Nexfly Robotics — your premier Indian destination for custom drones, 3D printed collectibles, gaming action figures, and RC aircraft. Built with high precision engineering in India. 🇮🇳
            </p>
            <div className="footer-socials">
              <a
                href="https://youtube.com/@pbrothers?si=zJZF7FwtwQ5c9fiL"
                target="_blank"
                rel="noreferrer"
                className="footer-social"
                title="P_Brothers YouTube"
                style={{ background: '#ff0000', color: 'white' }}
              >
                <YoutubeIcon size={18} color="white" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social"
                title="Instagram"
              >
                <InstagramIcon size={18} color="white" />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="footer-social"
                title="WhatsApp Support"
              >
                <WhatsAppIcon size={18} color="white" />
              </a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">UAV Products</div>
            <Link to="/uav?tab=fpv" className="footer-link">FPV Racing Drones</Link>
            <Link to="/uav?tab=agri" className="footer-link">Agricultural Drones</Link>
            <Link to="/uav?tab=toy" className="footer-link">Toy Drones</Link>
            <Link to="/uav?tab=college" className="footer-link">College Project Drones</Link>
            <Link to="/uav?tab=rcplane" className="footer-link">RC Scale Airplanes</Link>
            <Link to="/uav" className="footer-link">Custom Drone Configurator</Link>
          </div>

          <div>
            <div className="footer-col-title">3D Prints & Merch</div>
            <Link to="/p-brothers" className="footer-link" style={{ color: '#ff00aa', fontWeight: 600 }}>
              🎮 P_Brothers GTA 6 Merch
            </Link>
            <Link to="/prints?filter=tshirts" className="footer-link">Vice City T-Shirts</Link>
            <Link to="/prints?filter=gta6" className="footer-link">GTA 6 3D Action Figures</Link>
            <Link to="/prints?filter=valorant" className="footer-link">Valorant Agents</Link>
            <Link to="/prints?filter=anime" className="footer-link">Anime & Manga Figures</Link>
            <Link to="/prints?filter=lithophane" className="footer-link">Backlit Lithophanes</Link>
            <Link to="/products?category=3d-parts" className="footer-link">Custom Drone 3D Parts</Link>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/services" className="footer-link">All Services</Link>
            <Link to="/gallery" className="footer-link">Photo & Video Gallery</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/p-brothers" className="footer-link">P_Brothers Collab</Link>
          </div>

          <div>
            <div className="footer-col-title">Newsletter</div>
            <p style={{ fontSize: '.84rem', color: 'rgba(255,255,255,.6)', marginBottom: '.75rem', lineHeight: '1.5' }}>
              Subscribe for exclusive drone deals, GTA 6 figure releases & P_Brothers giveaway alerts!
            </p>
            {subscribed ? (
              <div style={{ color: '#00c896', display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.88rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> Subscribed successfully!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="footer-nl-input">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" aria-label="Subscribe">
                  <Send size={14} />
                </button>
              </form>
            )}

            <div style={{ marginTop: '1.8rem' }}>
              <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.4rem' }}>
                Secure Payment Modes
              </p>
              <p style={{ fontSize: '.82rem', color: 'var(--neon)', fontWeight: 600 }}>
                UPI • Razorpay • NetBanking • Credit / Debit Cards
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} NaviDron by Nexfly Robotics. Official partner of P_Brothers YouTube. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
            <a href="#shipping" onClick={(e) => e.preventDefault()}>Shipping Policy</a>
            <a href="#refund" onClick={(e) => e.preventDefault()}>Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
