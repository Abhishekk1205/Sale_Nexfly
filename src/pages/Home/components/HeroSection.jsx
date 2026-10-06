import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Rocket, Sparkles, Trophy, Award, ShieldCheck, Star } from 'lucide-react';

export default function HeroSection({ onOpenQuote }) {
  const [dronesCount, setDronesCount] = useState(0);
  const [printsCount, setPrintsCount] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;

    const timer = setInterval(() => {
      start++;
      const progress = Math.min(start / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDronesCount(Math.floor(500 * ease));
      setPrintsCount(Math.floor(1200 * ease));
      setSatisfaction(Math.floor(98 * ease));

      if (progress >= 1) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>

      {/* Floating neon particles */}
      <div className="particles-bg">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 19) % 100}%`,
              width: `${(i % 3) * 2 + 3}px`,
              height: `${(i % 3) * 2 + 3}px`,
              animationDuration: `${7 + (i % 6)}s`,
              animationDelay: `${(i * 0.4) % 5}s`
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            <span className="brand-highlight">Nexfly Robotics</span>
            <span className="presents-text">Presents</span>
          </div>

          <h1 className="hero-title">
            Fly Beyond<br />
            <span className="hl">Limits</span> with<br />
            <span className="hl2">NaviDron</span>
          </h1>

          <p className="hero-desc">
            Premium custom drones, FPV racing machines, agricultural UAVs, RC planes, and cutting-edge 3D printed collectibles. From high-altitude flight to your gaming shelf — we engineer it all.
          </p>

          <div className="hero-cta">
            <Link to="/uav" className="btn btn-primary">
              <Rocket size={18} />
              Explore Drones
            </Link>

            <Link to="/p-brothers" className="btn btn-glow">
              <Sparkles size={16} />
              🎮 GTA 6 & P_Brothers Merch
            </Link>

            <button onClick={onOpenQuote} className="btn btn-outline">
              Get Custom Quote
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">{dronesCount}+</span>
              <span className="stat-label">Drones Built</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{printsCount}+</span>
              <span className="stat-label">3D Prints Delivered</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">{satisfaction}%</span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-num" style={{ color: '#ffb300' }}>5.0★</span>
              <span className="stat-label">Customer Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-drone-wrap">
            <div className="hero-ring"></div>
            <img
              src="/images/fpv_racing_drone.jpg"
              alt="Premium FPV Racing Drone by NaviDron"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
