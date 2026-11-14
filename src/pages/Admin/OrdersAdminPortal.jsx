import React from 'react';
import AdminPortal from './AdminPortal';

/**
 * Orders & Logistics Admin Portal
 * Limited access deck for managing:
 * - Store Orders (Status updating: Pending -> Confirmed -> In Production -> Dispatched -> Delivered)
 * - Customer contact details, delivery addresses with nearby landmarks, WhatsApp & direct call links
 * - Customer uploaded custom print photos & lithophane previews
 * - UAV Custom Build Order quotation requests
 *
 * Restricted: Product Catalog modification and User Logins are completely hidden.
 */
export default function OrdersAdminPortal() {
  return <AdminPortal mode="orders" />;
}

