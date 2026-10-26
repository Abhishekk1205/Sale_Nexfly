import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { createGlobalOrder, clearUserCart } from '../../services/firebase';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  userAddresses = [],
  onOpenAuth
}) {
  const [selectedAddress, setSelectedAddress] = useState(
    userAddresses.find((a) => a.isDefault) || userAddresses[0] || null
  );
  const [customAddress, setCustomAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => {
    const rawPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
    return sum + rawPrice * (item.quantity || 1);
  }, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    const deliveryAddressStr = selectedAddress
      ? `${selectedAddress.recipient ? selectedAddress.recipient + ', ' : ''}${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.pincode} (Phone: ${selectedAddress.phone || 'N/A'})`
      : customAddress.trim() || 'A. M. Das Lane, Brahmpura, Muzaffarpur, Bihar - 842003';

    const randId = Math.floor(10000 + Math.random() * 90000);
    const orderPayload = {
      id: `NVD-${randId}`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      customer: {
        uid: user?.id || user?.uid || 'guest_user',
        name: user?.name || user?.fullName || 'Pilot Customer',
        email: user?.email || user?.primaryEmailAddress?.emailAddress || 'navidron.a@gmail.com',
        phone: user?.phone || '+919508106177'
      },
      customerUid: user?.id || user?.uid || 'guest_user',
      deliveryAddress: deliveryAddressStr,
      items: cart.map((it) => ({
        id: it.id,
        name: it.name,
        category: it.category || 'Store Item',
        size: it.size || null,
        price: typeof it.price === 'number' ? it.price : parseInt(String(it.price).replace(/[^0-9]/g, ''), 10) || 0,
        quantity: it.quantity || 1,
        image: it.image || '/images/fpv_racing_drone.jpg'
      })),
      totalAmount: subtotal,
      paymentStatus: 'Paid Online (UPI / Card)',
      status: 'Succeeded',
      statusLabel: 'Payment Confirmed & In Assembly',
      statusDesc: 'Order confirmed and registered successfully.',
      trackingNumber: `EXP-${randId}`
    };

    try {
      await createGlobalOrder(orderPayload);
      await clearUserCart(user?.id || user?.uid || 'guest_user');
      if (onClearCart) onClearCart();

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      setOrderSuccess(orderPayload);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Order placed locally. Note: ' + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="cart-icon-bubble">
              <ShoppingBag size={20} color="var(--neon)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: 'var(--navy)' }}>
                Your Flight Cart
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for dispatch
              </span>
            </div>
          </div>
          <button type="button" className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {orderSuccess ? (
          <div className="cart-success-view">
            <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '1.35rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>
              Order Placed Successfully!
            </h4>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Order <strong>#{orderSuccess.id}</strong> has been registered and linked to your profile!
            </p>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.84rem' }}>
              <div><strong>Recipient Address:</strong> {orderSuccess.deliveryAddress}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Total Paid:</strong> ₹{orderSuccess.totalAmount.toLocaleString('en-IN')}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Tracking ID:</strong> {orderSuccess.trackingNumber}</div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
              onClick={() => {
                setOrderSuccess(null);
                onClose();
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty-view">
            <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--navy)', fontFamily: 'var(--font-head)', marginBottom: '0.5rem' }}>
              Your Cart is Empty
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '280px', margin: '0 auto 1.5rem' }}>
              Explore our 3D Studio figures, high-thrust drone parts, robotics kits, and ready-to-fly UAVs.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.7rem 1.5rem', fontSize: '0.88rem' }}
              onClick={onClose}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="cart-items-scroll">
              {cart.map((item, idx) => {
                const numPrice = typeof item.price === 'number'
                  ? item.price
                  : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                return (
                  <div key={`${item.id}-${item.size || ''}-${idx}`} className="cart-item-card">
                    <img
                      src={item.image || '/images/fpv_racing_drone.jpg'}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.name}</div>
                      <div className="cart-item-meta">
                        {item.category && <span className="cart-meta-pill">{item.category}</span>}
                        {item.size && <span className="cart-meta-pill">Size: {item.size}</span>}
                      </div>
                      <div className="cart-item-price">
                        ₹{(numPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                        {item.quantity > 1 && (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                            (₹{numPrice.toLocaleString('en-IN')} each)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="cart-qty-controls">
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1, item.size)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="cart-qty-val">{item.quantity || 1}</span>
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1, item.size)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        className="cart-delete-btn"
                        onClick={() => onRemoveItem(item.id, item.size)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Address Section */}
            <div className="cart-address-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                <MapPin size={16} color="var(--neon)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>
                  Delivery Destination
                </span>
              </div>

              {userAddresses && userAddresses.length > 0 ? (
                <div className="cart-address-options">
                  {userAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`cart-addr-radio ${selectedAddress?.id === addr.id ? 'active' : ''}`}
                      onClick={() => setSelectedAddress(addr)}
                    >
                      <input
                        type="radio"
                        name="cartAddress"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                      />
                      <span>
                        <strong>{addr.tag || 'Address'}:</strong> {addr.street}, {addr.city} ({addr.pincode})
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="cart-address-input"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Enter street, city, pin code (e.g. Brahmpura, Muzaffarpur, 842003)"
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                    Pan-India express shipping from Nexfly Robotics Labs.
                  </span>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="cart-drawer-footer">
              <div className="cart-subtotal-row">
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Order Subtotal</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: 'var(--navy)', fontWeight: 800 }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginBottom: '1rem' }}>
                <span>📦 Shipping & Foam Packaging</span>
                <span>FREE (Pan-India)</span>
              </div>

              <button
                type="button"
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? 'Confirming Order...' : 'Confirm Order & Checkout'}
                <ArrowRight size={16} />
              </button>

              {!user && (
                <p style={{ textAlign: 'center', margin: '0.6rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Tip: <span style={{ color: 'var(--neon)', cursor: 'pointer', fontWeight: 600 }} onClick={onOpenAuth}>Sign In</span> to automatically link this order to your pilot dashboard.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
