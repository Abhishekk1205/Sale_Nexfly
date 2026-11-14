import React from 'react';
import AdminPortal from './AdminPortal';

/**
 * Products & Catalog Admin Portal
 * Limited access deck for managing:
 * - 3D Studio & Action Figures (Size-based pricing: 6", 8", 10", infill, materials)
 * - Drone Components, Motors, ESCs & Frames
 * - Robotics Kits & STEM project hardware
 * - UAVs & RC Planes
 *
 * Restricted: Orders and User Logins are completely hidden.
 */
export default function ProductsAdminPortal() {
  return <AdminPortal mode="products" />;
}

