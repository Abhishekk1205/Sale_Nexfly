import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Flame, Sparkles, Send } from 'lucide-react';

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
                3D Prints <ChevronDown className="chevron" />
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
                <span style={{ fontSize: '.84rem', color: 'var(--neon)', fontWeight: 700 }} className="nav-user-greeting">
                  Hi, {user.name}
                </span>
                <button className="btn-nav-outline" onClick={onLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="btn-nav-outline" onClick={onOpenAuth}>
                Login
              </button>
            )}

            <button className="btn-nav" onClick={onOpenQuote}>
              <Send size={14} />
              <span>Quote</span>
            </button>
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
            <span>🖨️ 3D Prints & Action Figures</span>
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
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '.85rem 1.5rem' }}
            onClick={() => {
              setMobileOpen(false);
              onOpenQuote();
            }}
          >
            <Send size={16} /> Get a Custom Quote
          </button>
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
              Sign Out ({user.name})
            </button>
          )}
        </div>
      </div>
    </>
  );
}
