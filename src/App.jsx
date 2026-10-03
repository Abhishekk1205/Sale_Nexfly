import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

import './styles/main.css';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
