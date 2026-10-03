import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { uavCategories } from '../../../data/uavData';
import { Send, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UAVOverview({ onOpenQuote }) {
  const [activeTabId, setActiveTabId] = useState('fpv');
  const [formData, setFormData] = useState({
    purpose: 'FPV Racing',
    budget: '₹15,000 – ₹50,000',
    name: '',
    email: '',
    phone: '',
    features: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const currentCategory = uavCategories.find(c => c.id === activeTabId) || uavCategories[0];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {}
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        purpose: 'FPV Racing',
        budget: '₹15,000 – ₹50,000',
        name: '',
        email: '',
        phone: '',
        features: '',
        notes: ''
      });
    }, 4000);
  };

  return (
    <section id="uav">
      <div className="section-inner">
        <div>
          <div className="section-tag">🚁 UAV Systems</div>
          <h2 className="section-title">
            Custom <span>Drones</span> &<br />
            RC Aircraft
          </h2>
          <p className="section-subtitle">
            From blazing-fast FPV racers to precision agricultural sprayers — we build drones tailored exactly to your operational needs. Every airframe is hand-crafted and tuned by Nexfly Robotics.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="uav-tabs">
          {uavCategories.map((cat) => (
            <button
              key={cat.id}
              className={`uav-tab ${cat.id === activeTabId ? 'active' : ''}`}
              onClick={() => setActiveTabId(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Drone Panel */}
        <div className="drone-panel">
          <div className="drone-showcase-img">
            <img src={currentCategory.image} alt={currentCategory.title} />
          </div>

          <div>
            <div className="section-tag">{currentCategory.tagline}</div>
            <h3 className="section-title" style={{ fontSize: '1.85rem' }}>
              {currentCategory.title}
            </h3>
            <p style={{ color: '#4a5270', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              {currentCategory.desc}
            </p>

            <div className="drone-spec-list">
              {currentCategory.specs.map((spec, i) => (
                <div key={i} className="drone-spec">
                  <span className="drone-spec-key">{spec.key}</span>
                  <span className="drone-spec-val">{spec.val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
              <button onClick={onOpenQuote} className="btn btn-primary">
                Customize This Drone
              </button>
              <Link to={`/uav?tab=${currentCategory.id}`} className="btn btn-outline">
                Learn More & View Models <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Embedded Custom Drone Builder Form */}
        <div className="customize-wrap" id="customize-form" style={{ marginTop: '4rem' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="form-title">🛠️ Build Your Custom Drone</h3>
            <p className="form-subtitle">
              Tell us your requirements and flight parameters. Nexfly Robotics will architect your complete UAV solution.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,.05)', borderRadius: '16px' }}>
                <CheckCircle2 size={48} color="#00c896" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: 'white', marginBottom: '.5rem' }}>
                  Custom Drone Request Submitted!
                </h4>
                <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '.9rem' }}>
                  Our lead UAV engineer will contact you shortly with component options and schematic estimate.
                </p>
              </div>
            ) : (
              <form className="form-grid" onSubmit={handleFormSubmit}>
                <div className="form-field">
                  <label className="form-label">Purpose *</label>
                  <select
                    className="form-select"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                  >
                    <option>FPV Racing</option>
                    <option>Agriculture / Crop Spraying</option>
                    <option>Photography / Cinematic</option>
                    <option>Payload / Delivery</option>
                    <option>College / Research Project</option>
                    <option>RC Aerobatics / Hobby</option>
                    <option>Search & Rescue / Survey</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Budget Range *</label>
                  <select
                    className="form-select"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  >
                    <option>Under ₹5,000</option>
                    <option>₹5,000 – ₹15,000</option>
                    <option>₹15,000 – ₹50,000</option>
                    <option>₹50,000 – ₹1,00,000</option>
                    <option>Above ₹1,00,000</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Your Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">WhatsApp / Phone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Special Features</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. GPS rescue, DJI O3, 6S power, thermal camera..."
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className="form-field full">
                  <label className="form-label">Additional Project Details</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Describe specific use case, environmental conditions, frame size requirements, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="form-field full">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    🚁 Submit Custom Order Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
