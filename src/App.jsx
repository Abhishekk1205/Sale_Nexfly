import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser, useClerk, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AuthModal from './components/AuthModal/AuthModal';
import QuoteModal from './components/QuoteModal/QuoteModal';

// Pages in separate folders for clean maintainability
import HomePage from './pages/Home/HomePage';
import UAVPage from './pages/UAV/UAVPage';
import ProductsPage from './pages/Products/ProductsPage';
import PrintsPage from './pages/Prints/PrintsPage';
import PBrothersPage from './pages/PBrothers/PBrothersPage';
import GalleryPage from './pages/Gallery/GalleryPage';
import ServicesPage from './pages/Services/ServicesPage';
import ContactPage from './pages/Contact/ContactPage';
import ProfilePage from './pages/Profile/ProfilePage';
import { syncUserFullDataToFirebase } from './services/firebase';

import './styles/main.css';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Clerk authentication hooks
  const { isSignedIn, user: clerkUser } = useUser();
  const clerk = useClerk();

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('navidron_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const uid = parsed.id || parsed.uid;
        if (uid) {
          const profileCached = localStorage.getItem(`navidron_profile_${String(uid).replace(/[.#$[\]/]/g, '_')}`);
          if (profileCached) {
            const prof = JSON.parse(profileCached);
            if (prof.name) parsed.name = prof.name;
            if (prof.email) parsed.email = prof.email;
          }
        }
        return parsed;
      }
    } catch (e) {}

    return null;
  });

  // Keep state in sync with Clerk authenticated user without overwriting profile changes
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const cleanUid = String(clerkUser.id).replace(/[.#$[\]/]/g, '_');
      let customName = null;
      let customEmail = null;
      try {
        const cached = localStorage.getItem(`navidron_profile_${cleanUid}`);
        if (cached) {
          const prof = JSON.parse(cached);
          if (prof.name && prof.name !== 'Google User') customName = prof.name;
          if (prof.email) customEmail = prof.email;
        }
      } catch (e) {}

      const activeUser = {
        uid: clerkUser.id,
        id: clerkUser.id,
        name: customName || clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Pilot',
        email: customEmail || clerkUser.primaryEmailAddress?.emailAddress || '',
        photoURL: clerkUser.imageUrl || null,
        isClerk: true
      };
      setUser(activeUser);
      localStorage.setItem('navidron_current_user', JSON.stringify(activeUser));
    }
  }, [isSignedIn, clerkUser]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('navidron_current_user', JSON.stringify(userData));
    syncUserFullDataToFirebase(userData);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('navidron_current_user', JSON.stringify(updatedUserData));
    syncUserFullDataToFirebase(updatedUserData);
  };

  const handleLogout = async () => {
    if (isSignedIn && clerk) {
      try {
        await clerk.signOut();
      } catch (e) {
        console.warn('Clerk sign out error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('navidron_current_user');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Separate Navbar Component with Dropdowns & Responsive Drawer */}
        <Navbar
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenQuote={() => setQuoteModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Dynamic Route Pages */}
        <Routes>
          <Route path="/" element={<HomePage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/uav" element={<UAVPage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/products" element={<ProductsPage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/prints" element={<PrintsPage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/p-brothers" element={<PBrothersPage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/services" element={<ServicesPage onOpenQuote={() => setQuoteModalOpen(true)} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/profile"
            element={
              <ProfilePage
                user={user}
                onUpdateUser={handleUpdateUser}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/sso-callback"
            element={<AuthenticateWithRedirectCallback signInForceRedirectUrl="/profile" signUpForceRedirectUrl="/profile" />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Footer */}
        <Footer />

        {/* Interactive Modals */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <QuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
