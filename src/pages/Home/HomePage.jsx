import React, { useEffect } from 'react';
import HeroSection from './components/HeroSection';
import PBrothersPromo from './components/PBrothersPromo';
import ActionFiguresSale from './components/ActionFiguresSale';
import UAVOverview from './components/UAVOverview';
import PrintServicesOverview from './components/PrintServicesOverview';
import GalleryPreview from './components/GalleryPreview';
import ServicesOverview from './components/ServicesOverview';
import AboutNexfly from './components/AboutNexfly';
import Testimonials from './components/Testimonials';
import ContactSection from './components/ContactSection';

export default function HomePage({ onOpenQuote }) {
  useEffect(() => {
    document.title = "NaviDron — Premium Drones, 3D Prints & GTA 6 Merch | Nexfly Robotics";
  }, []);

  return (
    <main>
      <HeroSection onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      {/* Big Screen Promotion for P_Brothers channel with GTA 6 3D Printed Merchandise and T-Shirts */}
      <PBrothersPromo onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <ActionFiguresSale onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <UAVOverview onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <PrintServicesOverview onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <GalleryPreview />
      <hr className="neon-line" />

      <ServicesOverview onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <AboutNexfly onOpenQuote={onOpenQuote} />
      <hr className="neon-line" />

      <Testimonials />
      <hr className="neon-line" />

      <ContactSection />
    </main>
  );
}
