import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '../../../components/Icons/SocialIcons';
import confetti from 'canvas-confetti';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Custom Drone Order',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', email: '', subject: 'Custom Drone Order', message: '' });
    }, 4000);
  };

  return (
    <section id="contact">
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">📬 Direct Connect</div>
          <h2 className="section-title">
            Contact <span>NaviDron</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Have a custom UAV project, 3D print request, P_Brothers merchandise inquiry, or corporate collaboration? Send us a message!
          </p>
        </div>

        <div className="contact-wrap">
          <div>
            <div className="contact-item">
              <div className="contact-icon">
                <Mail size={22} color="white" />
              </div>
              <div>
                <div className="contact-item-title">Official Email</div>
                <div className="contact-item-val">contact@navidron.com</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon" style={{ background: 'linear-gradient(135deg, #00c896, #00aaee)' }}>
                <Phone size={22} color="white" />
              </div>
              <div>
                <div className="contact-item-title">WhatsApp & Phone Support</div>
                <div className="contact-item-val">+91 98765 43210 (India)</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon" style={{ background: 'linear-gradient(135deg, var(--neon2), #ff00aa)' }}>
                <MapPin size={22} color="white" />
              </div>
              <div>
                <div className="contact-item-title">Headquarters & Workshop</div>
                <div className="contact-item-val">Nexfly Robotics Labs, India (Pan-India Express Shipping)</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">
                <Clock size={22} color="white" />
              </div>
              <div>
                <div className="contact-item-title">Operating Hours</div>
                <div className="contact-item-val">Monday – Saturday: 10:00 AM – 7:00 PM IST</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontSize: '.84rem', color: '#666', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Follow Our Channels
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="https://youtube.com/@pbrothers?si=zJZF7FwtwQ5c9fiL"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    padding: '.55rem 1.25rem',
                    background: '#ff0000',
                    color: 'white',
                    borderRadius: '50px',
                    fontSize: '.85rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <YoutubeIcon size={16} color="white" />
                  YouTube (P_Brothers)
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    padding: '.55rem 1.25rem',
                    background: 'linear-gradient(135deg, #f9a825, #e91e63, #9c27b0)',
                    color: 'white',
                    borderRadius: '50px',
                    fontSize: '.85rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <InstagramIcon size={16} color="white" />
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1.5rem' }}>
              Send an Instant Inquiry
            </h3>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle2 size={48} color="#00c896" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--navy)', marginBottom: '.5rem' }}>
                  Message Sent Successfully!
                </h4>
                <p style={{ color: '#4a5270', fontSize: '.9rem' }}>
                  Thank you, {formData.name}. We have logged your request and will reply shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Full Name *
                    </label>
                    <input
                      className="contact-input"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Email Address *
                    </label>
                    <input
                      className="contact-input"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="full-col">
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Subject / Topic *
                    </label>
                    <select
                      className="contact-select full-col"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    >
                      <option>Custom Drone Order</option>
                      <option>GTA 6 3D Action Figures & Merch</option>
                      <option>P_Brothers T-Shirts & Apparel</option>
                      <option>3D Print / Lithophane Request</option>
                      <option>Agricultural Drone Consultation</option>
                      <option>College / Research Project Kit</option>
                      <option>Business Collaboration</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="full-col">
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Message *
                    </label>
                    <textarea
                      className="contact-textarea"
                      placeholder="Tell us about your requirements, dimensions, target deadline, etc."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}
                >
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
