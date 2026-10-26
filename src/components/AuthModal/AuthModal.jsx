import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useClerk } from '@clerk/clerk-react';
import { signInWithGoogle, getUserProfile, syncUserFullDataToFirebase } from '../../services/firebase';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clerk = useClerk();

  if (!isOpen) return null;

  // Option 1: Continue with Google
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsAuthorizing(true);
    try {
      // 1. If Clerk is configured and openSignIn is available, trigger Clerk Google Auth
      if (clerk && clerk.openSignIn) {
        onClose();
        clerk.openSignIn({
          appearance: {
            variables: {
              colorPrimary: '#00c8ff'
            }
          },
          afterSignInUrl: '/profile',
          afterSignUpUrl: '/profile',
          fallbackRedirectUrl: '/profile'
        });
        return;
      }

      // 2. Fallback to Firebase Google Provider
      const res = await signInWithGoogle();
      if (res && res.user) {
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch (err) {}
        onLoginSuccess(res.user);
        onClose();
      } else if (res && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Option 2: Sign in / Register with Email & Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsAuthorizing(true);

    try {
      const cleanUid = 'user_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let resolvedName = name.trim();
      if (!resolvedName) {
        const saved = await getUserProfile(cleanUid);
        resolvedName = saved?.name || email.split('@')[0];
      }

      const userObj = {
        uid: cleanUid,
        id: cleanUid,
        name: resolvedName,
        email: email.trim().toLowerCase()
      };

      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      await syncUserFullDataToFirebase(userObj);
      onLoginSuccess(userObj);
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed.');
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

        {/* Option 1: Continue with Google */}
        <button
          type="button"
          className="auth-btn-google-primary"
          onClick={handleGoogleAuth}
          disabled={isAuthorizing}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* Option 2: Email & Password */}
        <div className="auth-tabs">
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
                placeholder="Enter your full name"
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
              placeholder="name@example.com"
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
              placeholder="••••••••"
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
