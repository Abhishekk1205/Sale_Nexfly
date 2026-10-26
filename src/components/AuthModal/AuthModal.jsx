import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUserProfile, syncUserFullDataToFirebase } from '../../services/firebase';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Sign in / Register with Email & Password (Formal User Login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsAuthorizing(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUid = 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
      
      let resolvedName = name.trim();
      if (!resolvedName) {
        const saved = await getUserProfile(cleanUid);
        if (saved?.name && saved.name.trim()) {
          resolvedName = saved.name.trim();
        } else {
          const emailPrefix = cleanEmail.split('@')[0].split(/[._-]/)[0];
          resolvedName = emailPrefix ? (emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)) : 'Pilot';
        }
      }

      const userObj = {
        uid: cleanUid,
        id: cleanUid,
        name: resolvedName,
        email: cleanEmail
      };

      try {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      } catch (err) {}

      await syncUserFullDataToFirebase(userObj);
      onLoginSuccess(userObj);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div
      id="auth-modal"
      className="open"
      onClick={(e) => {
        if (e.target.id === 'auth-modal') onClose();
      }}
    >
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <h2 className="auth-title">Welcome to NaviDron</h2>
        <p className="auth-subtitle">
          Sign in to access your profile, track UAV orders, and manage saved delivery addresses.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#f87171',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Auth Tabs */}
        <div className="auth-tabs" style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={isAuthorizing}>
            {isAuthorizing ? (
              'Authenticating...'
            ) : tab === 'login' ? (
              'Sign In with Email'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
