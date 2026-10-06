import React, { useState } from 'react';
import { X, CheckCircle2, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuoteModal({ isOpen, onClose }) {
  const [purpose, setPurpose] = useState('FPV Racing');
  const [budget, setBudget] = useState('₹15,000 – ₹50,000');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    } catch (err) {}
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,15,46,.85)',
        backdropFilter: 'blur(12px)',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))',
          border: '1px solid rgba(0,200,255,.3)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '560px',
          width: '100%',
          position: 'relative',
          color: 'white',
          boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 50px rgba(0,200,255,.2)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,.1)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,200,150,.2)', border: '2px solid #00c896', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#00c896' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              Quote Request Received!
            </h3>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem', lineHeight: '1.6' }}>
              Thank you, {name || 'Pilot'}. Nexfly Robotics engineering team will analyze your requirements and reach out via WhatsApp / Email within 4 business hours.
            </p>
          </div>
        ) : (
          <>
            <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
              ⚡ Fast Turnaround
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', fontWeight: 900, marginBottom: '.4rem' }}>
              Request a <span style={{ color: 'var(--neon)' }}>Custom Quote</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.88rem', marginBottom: '1.75rem' }}>
              Whether you need an FPV racer, agricultural sprayer, GTA 6 custom action figure or lithophane gift — tell us your vision!
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="modal-form-row">
                <div>
                  <label className="form-label" style={{ fontSize: '.75rem' }}>Project Type *</label>
                  <select
                    className="form-select"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  >
                    <option>FPV Racing Drone</option>
                    <option>Agricultural Drone</option>
                    <option>Toy / Starter Drone</option>
                    <option>College / Research Drone</option>
                    <option>RC Scale Aircraft</option>
                    <option>GTA 6 3D Action Figure / Merch</option>
                    <option>3D Lithophane / Gift Box</option>
                    <option>Custom 3D Drone Parts</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '.75rem' }}>Budget Range *</label>
                  <select
                    className="form-select"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                  >
                    <option>Under ₹5,000</option>
                    <option>₹5,000 – ₹15,000</option>
                    <option>₹15,000 – ₹50,000</option>
                    <option>₹50,000 – ₹1,00,000</option>
                    <option>Above ₹1,00,000</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-row">
                <div>
                  <label className="form-label" style={{ fontSize: '.75rem' }}>Your Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '.75rem' }}>WhatsApp / Phone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '.75rem' }}>Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '.75rem' }}>Specifications & Notes</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="e.g. 5-inch analog FPV build, 150mm Jason action figure, custom battery requirements, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '.5rem', justifyContent: 'center' }}
              >
                <Send size={16} /> Submit Custom Quote Request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
