import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Flame, Sparkles, Send, User } from 'lucide-react';

const getFirstName = (u) => {
  if (!u) return 'Pilot';
  if (u.name && u.name.trim()) {
    const firstWord = u.name.trim().split(/\s+/)[0];
    if (firstWord) return firstWord;
  }
  if (u.email && u.email.trim()) {
    const emailPrefix = u.email.trim().split('@')[0];
    const cleanEmail = emailPrefix.split(/[._-]/)[0];
    if (cleanEmail) {
      return cleanEmail.charAt(0).toUpperCase() + cleanEmail.slice(1);
    }
  }
  return 'Pilot';
};

export default function Navbar({ onOpenAuth, onOpenQuote, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <img
              src="/favicon.png"
              alt="NaviDron Logo"
            />
            <span className="nav-logo-text">
              NAVI<span>DRON</span>
            </span>
          </Link>

          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/uav" className={`nav-link ${isActive('/uav') ? 'active' : ''}`}>
                UAV <ChevronDown className="chevron" />
              </Link>
              <div className="dropdown">
                <Link to="/uav?tab=fpv">⚡ FPV Racing Drones</Link>
                <Link to="/uav?tab=agri">🌾 Agricultural Drones</Link>
                <Link to="/uav?tab=toy">🎯 Toy Drones</Link>
                <Link to="/uav?tab=college">🎓 College Project Drones</Link>
                <Link to="/uav?tab=rcplane">✈️ RC Planes</Link>
                <button
                  type="button"
                  onClick={onOpenQuote}
                  style={{ color: 'var(--neon)', fontWeight: 700 }}
                >
                  🛠️ Custom Order Request
                </button>
              </div>
            </li>

            <li className="nav-item">
              <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
                Products <ChevronDown className="chevron" />
              </Link>
              <div className="dropdown">
                <Link to="/products?category=parts">🔧 Drone Motors & Frames</Link>
                <Link to="/products?category=electronics">⚡ ESCs & Flight Controllers</Link>
                <Link to="/products?category=3d-parts">🖨️ 3D Printed Drone Parts</Link>
                <Link to="/products">📦 View All Drone Components</Link>
              </div>
            </li>

            <li className="nav-item">
              <Link to="/prints" className={`nav-link ${isActive('/prints') ? 'active' : ''}`}>
                3Dstudio <ChevronDown className="chevron" />
              </Link>
              <div className="dropdown">
                <Link to="/prints?filter=gta6">🎮 GTA 6 Vice City Figures</Link>
                <Link to="/prints?filter=tshirts">👕 GTA 6 & P_Brothers T-Shirts</Link>
                <Link to="/prints?filter=valorant">⚡ Valorant Collection</Link>
                <Link to="/prints?filter=anime">🌸 Anime Heroes</Link>
                <Link to="/prints?filter=lithophane">🖼️ Custom Lithophanes</Link>
                <Link to="/prints?filter=gifts">🎁 3D Gift Packs</Link>
              </div>
            </li>

            <li className="nav-item">
              <Link
                to="/p-brothers"
                className={`nav-link ${isActive('/p-brothers') ? 'active' : ''}`}
                style={{ color: '#ff00aa', fontWeight: 700 }}
              >
                P_Brothers
                <span className="nav-badge-pbrothers">GTA 6</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/gallery" className={`nav-link ${isActive('/gallery') ? 'active' : ''}`}>
                Gallery
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/services" className={`nav-link ${isActive('/services') ? 'active' : ''}`}>
                Services
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
                Contact
              </Link>
            </li>
          </ul>

          <div className="nav-actions">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="nav-user-badge-link"
                  title="Manage Profile, Delivery Addresses & Order History"
                >
                  <span className="nav-user-greeting">
                    Hii, {getFirstName(user)}
                  </span>
                </Link>
                <button className="btn-nav-outline" onClick={onLogout} title="Sign Out">
                  Sign Out
                </button>
              </>
            ) : (
              <button className="btn-nav-outline" onClick={onOpenAuth}>
                Login
              </button>
            )}
          </div>

          <button
            className={`nav-toggle ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <img src="/favicon.png" alt="NaviDron Logo" />
            <span className="nav-logo-text">
              NAVI<span>DRON</span>
            </span>
          </Link>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mobile-links-container">
          {user && (
            <Link
              to="/profile"
              className={`mob-link mob-link-profile ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={{
                background: 'linear-gradient(135deg, rgba(0,200,255,0.12), rgba(123,47,255,0.1))',
                borderColor: 'var(--neon)',
                padding: '0.9rem 1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--neon), var(--neon2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}>
                  {(user.name || user.email || 'Pilot').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--navy)', fontWeight: 800 }}>
                    Hii, {getFirstName(user)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 600 }}>
                    👤 Profile, Addresses & Orders
                  </div>
                </div>
              </div>
              <span className="mob-arrow">›</span>
            </Link>
          )}

          <Link to="/" className={`mob-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>🏠 Home</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link to="/uav" className={`mob-link ${isActive('/uav') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>⚡ UAV & Drones</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link to="/products" className={`mob-link ${isActive('/products') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>🔧 Drone Parts & Electronics</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link to="/prints" className={`mob-link ${isActive('/prints') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>🖨️ 3Dstudio & Action Figures</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link
            to="/p-brothers"
            className={`mob-link mob-link-highlight ${isActive('/p-brothers') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span>🎮 P_Brothers × GTA 6 Drops</span>
            <span className="mob-badge">HOT</span>
          </Link>
          <Link to="/gallery" className={`mob-link ${isActive('/gallery') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>📸 Visual Gallery</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link to="/services" className={`mob-link ${isActive('/services') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>⚙️ Robotics Services</span>
            <span className="mob-arrow">›</span>
          </Link>
          <Link to="/contact" className={`mob-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
            <span>📬 Contact & Support</span>
            <span className="mob-arrow">›</span>
          </Link>
        </div>

        <div className="mobile-menu-actions">
          {user && (
            <Link
              to="/profile"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '.85rem 1.5rem', marginBottom: '.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}
              onClick={() => setMobileOpen(false)}
            >
              <User size={16} /> My Profile & Order History
            </Link>
          )}

          {!user ? (
            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '.85rem 1.5rem' }}
              onClick={() => {
                setMobileOpen(false);
                onOpenAuth();
              }}
            >
              Sign In / Register
            </button>
          ) : (
            <button
              className="btn btn-outline"
              style={{ width: '100%', padding: '.85rem 1.5rem' }}
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
            >
              Sign Out ({getFirstName(user)})
            </button>
          )}
        </div>
      </div>
    </>
  );
}
