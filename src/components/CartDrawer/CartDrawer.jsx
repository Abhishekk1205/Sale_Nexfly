import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, CheckCircle2, Calendar, Clock, AlertCircle } from 'lucide-react';
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
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(userAddresses.length === 0);
  const [recipientName, setRecipientName] = useState(user?.name || user?.fullName || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || user?.primaryEmailAddress?.emailAddress || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [customLandmark, setCustomLandmark] = useState('');
  const [addressError, setAddressError] = useState('');
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

  // Delivery Rule: ₹169 per order. FREE if order subtotal is Rs 1,000 or above.
  const isFreeDelivery = subtotal >= 1000;
  const deliveryFee = cart.length > 0 ? (isFreeDelivery ? 0 : 169) : 0;
  const gstAmount = Math.round((subtotal + deliveryFee) * 0.18);
  const totalAmount = subtotal + deliveryFee + gstAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setAddressError('');

    let finalDeliveryAddressStr = '';
    let finalRecipient = recipientName.trim() || user?.name || user?.fullName || '';
    let finalPhone = contactPhone.trim() || user?.phone || '';
    let finalEmail = contactEmail.trim() || user?.email || user?.primaryEmailAddress?.emailAddress || '';

    // Validate delivery address selection & required fields
    if (selectedAddress && !useCustomAddress) {
      finalRecipient = selectedAddress.recipient?.trim() || finalRecipient;
      finalPhone = selectedAddress.phone?.trim() || finalPhone;
      const addrStreet = selectedAddress.street || '';
      const addrCity = selectedAddress.city || '';
      const addrPincode = selectedAddress.pincode || '';
      const addrLandmark = selectedAddress.landmark ? `, Landmark: ${selectedAddress.landmark}` : '';
      const addrState = selectedAddress.state ? `, ${selectedAddress.state}` : '';

      if (!addrStreet || !addrCity || !addrPincode) {
        setAddressError('The selected address is incomplete. Please choose or enter a complete address.');
        return;
      }
      finalDeliveryAddressStr = `${finalRecipient ? finalRecipient + ', ' : ''}${addrStreet}${addrLandmark}, ${addrCity}${addrState} - ${addrPincode} (Contact: ${finalPhone || 'N/A'})`;
    } else {
      // Must give complete address
      if (!finalRecipient || finalRecipient.length < 2) {
        setAddressError('Please enter the recipient full name.');
        return;
      }
      if (!finalPhone || finalPhone.replace(/[^0-9]/g, '').length < 10) {
        setAddressError('Please enter a valid 10-digit contact mobile phone number.');
        return;
      }
      if (!finalEmail || !finalEmail.includes('@') || !finalEmail.includes('.')) {
        setAddressError('Please enter a valid contact email address for order notifications.');
        return;
      }
      if (!streetAddress.trim() || streetAddress.trim().length < 5) {
        setAddressError('Please enter complete house/flat, building, and street/area address.');
        return;
      }
      if (!city.trim() || city.trim().length < 2) {
        setAddressError('Please enter your city.');
        return;
      }
      if (!pincode.trim() || pincode.replace(/[^0-9]/g, '').length < 6) {
        setAddressError('Please enter a valid 6-digit postal PIN code.');
        return;
      }

      finalDeliveryAddressStr = `${finalRecipient}, ${streetAddress.trim()}${customLandmark.trim() ? ', Landmark: ' + customLandmark.trim() : ''}, ${city.trim()}${stateName.trim() ? ', ' + stateName.trim() : ''} - ${pincode.trim()} (Phone: ${finalPhone}, Email: ${finalEmail})`;
    }

    if (!finalPhone || finalPhone.replace(/[^0-9]/g, '').length < 10) {
      setAddressError('Please provide a valid 10-digit contact phone number.');
      return;
    }
    if (!finalEmail || !finalEmail.includes('@')) {
      setAddressError('Please provide a valid contact email address.');
      return;
    }

    setIsPlacingOrder(true);

    const randId = Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const orderDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const orderTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const orderDateTime = `${orderDate} at ${orderTime}`;
    const orderTimestamp = now.getTime();

    const orderPayload = {
      id: `NVD-${randId}`,
      date: now.toISOString().split('T')[0],
      orderDate,
      orderTime,
      orderDateTime,
      orderTimestamp,
      createdAt: now.toISOString(),
      customer: {
        uid: user?.id || user?.uid || 'guest_user',
        name: finalRecipient,
        email: finalEmail,
        phone: finalPhone
      },
      customerUid: user?.id || user?.uid || 'guest_user',
      deliveryAddress: finalDeliveryAddressStr,
      items: cart.map((it) => ({
        id: it.id,
        productId: it.productId || it.id,
        name: it.name,
        category: it.category || 'Store Item',
        brand: it.brand || null,
        size: it.size || null,
        material: it.material || null,
        strength: it.strength || it.infill || null,
        infill: it.infill || it.strength || null,
        printTime: it.printTime || null,
        customEngraving: it.customEngraving || null,
        uploadedPhoto: it.uploadedPhoto || it.customPhoto || null,
        selectedAddOns: it.selectedAddOns || null,
        price: typeof it.price === 'number' ? it.price : parseInt(String(it.price).replace(/[^0-9]/g, ''), 10) || 0,
        quantity: it.quantity || 1,
        image: it.image || '/images/fpv_racing_drone.jpg'
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      gstAmount: gstAmount,
      gstRate: '18%',
      tax: gstAmount,
      totalAmount: totalAmount,
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
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.95rem' }}>
                  Order #{orderSuccess.id}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px' }}>
                  {orderSuccess.status || 'Confirmed'}
                </span>
              </div>

              {/* Order Date & Time display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.55rem 0.75rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontSize: '0.8rem' }}>
                  <Calendar size={14} color="#2563eb" />
                  <span><strong>Date:</strong> {orderSuccess.orderDate || new Date(orderSuccess.createdAt || orderSuccess.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontSize: '0.8rem' }}>
                  <Clock size={14} color="#2563eb" />
                  <span><strong>Time:</strong> {orderSuccess.orderTime || new Date(orderSuccess.createdAt || orderSuccess.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                </div>
              </div>

              <div style={{ marginBottom: '0.4rem', color: '#334155' }}>
                <strong>Recipient Address:</strong> {orderSuccess.deliveryAddress}
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.45rem', marginTop: '0.45rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: '2px' }}>
                  <span>Items Subtotal:</span>
                  <span>₹{(orderSuccess.subtotal ?? orderSuccess.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: '2px' }}>
                  <span>Delivery:</span>
                  <span style={{ fontWeight: 700, color: orderSuccess.deliveryFee === 0 ? '#16a34a' : '#0f172a' }}>
                    {orderSuccess.deliveryFee === 0 ? 'FREE (Above ₹1,000)' : `₹${orderSuccess.deliveryFee ?? 169}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#b45309', marginBottom: '4px' }}>
                  <span>GST (18%):</span>
                  <span>+₹{(orderSuccess.gstAmount ?? Math.round((orderSuccess.totalAmount || 0) * 0.18)).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>Total Paid:</span>
                  <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 900 }}>₹{orderSuccess.totalAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem' }}>
                <span><strong>Tracking ID:</strong> {orderSuccess.trackingNumber}</span>
                <span><strong>Payment:</strong> UPI / Card Online</span>
              </div>
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
                      <div className="cart-item-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '3px 0' }}>
                        {(item.productId || item.id) && (
                          <span className="cart-meta-pill" style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                            ID: {item.productId || item.id}
                          </span>
                        )}
                        {item.category && <span className="cart-meta-pill">{item.category}</span>}
                        {item.size && <span className="cart-meta-pill">Size: {item.size}</span>}
                        {item.material && (
                          <span className="cart-meta-pill" style={{ color: '#047857', background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                            {item.material}
                          </span>
                        )}
                        {item.strength && (
                          <span className="cart-meta-pill" style={{ color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd' }}>
                            {item.strength}
                          </span>
                        )}
                        {item.uploadedPhoto && (
                          <span className="cart-meta-pill" style={{ color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a' }}>
                            📷 Photo Attached
                          </span>
                        )}
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

            {/* Free Delivery Incentive / Status Banner */}
            <div
              style={{
                margin: '0.75rem 1rem 0.25rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                backgroundColor: isFreeDelivery ? 'rgba(16, 185, 129, 0.08)' : 'rgba(2, 132, 199, 0.06)',
                border: `1.5px solid ${isFreeDelivery ? 'rgba(16, 185, 129, 0.3)' : 'rgba(2, 132, 199, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <span style={{ fontWeight: 800, color: isFreeDelivery ? '#047857' : '#0369a1' }}>
                {isFreeDelivery
                  ? '🎉 FREE Delivery Unlocked! (Order above ₹1,000)'
                  : `🚚 Add ₹${(1000 - subtotal).toLocaleString('en-IN')} more to get FREE Delivery`}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isFreeDelivery ? '#059669' : '#0284c7' }}>
                {isFreeDelivery ? '₹0 Delivery' : 'Standard ₹169'}
              </span>
            </div>

            {/* Delivery Address Section */}
            <div className="cart-address-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="var(--neon)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy)' }}>
                    Particular Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                </div>

                {userAddresses && userAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomAddress(!useCustomAddress);
                      if (!useCustomAddress) setSelectedAddress(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {useCustomAddress ? 'Select Saved Address' : '+ New Address'}
                  </button>
                )}
              </div>

              {/* Validation Error Banner */}
              {addressError && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#991b1b',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>{addressError}</span>
                </div>
              )}

              {/* Saved Addresses Options */}
              {userAddresses && userAddresses.length > 0 && !useCustomAddress ? (
                <div className="cart-address-options">
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    Select a destination address for this dispatch:
                  </div>
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
                        <strong>{addr.tag || 'Saved Address'}:</strong> {addr.street}{addr.landmark ? `, Landmark: ${addr.landmark}` : ''}, {addr.city} ({addr.pincode})
                        {addr.recipient && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Recipient: {addr.recipient} {addr.phone ? `(${addr.phone})` : ''}</div>}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                /* Complete Detailed Address Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Full Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="cart-address-input"
                        value={recipientName}
                        onChange={(e) => {
                          setRecipientName(e.target.value);
                          if (addressError) setAddressError('');
                        }}
                        placeholder="Recipient Name"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        Contact Phone <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="cart-address-input"
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value);
                          if (addressError) setAddressError('');
                        }}
                        placeholder="10-digit Mobile No."
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                      Contact Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="cart-address-input"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        if (addressError) setAddressError('');
                      }}
                      placeholder="e.g. pilot@example.com (For Order Tracking)"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                      House / Flat / Street / Area <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="cart-address-input"
                      value={streetAddress}
                      onChange={(e) => {
                        setStreetAddress(e.target.value);
                        if (addressError) setAddressError('');
                      }}
                      placeholder="Flat/House No., Building Name, Street, Locality"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.45rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        City <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="cart-address-input"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (addressError) setAddressError('');
                        }}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        State
                      </label>
                      <input
                        type="text"
                        className="cart-address-input"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        PIN Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="cart-address-input"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          if (addressError) setAddressError('');
                        }}
                        placeholder="6 Digits"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      className="cart-address-input"
                      value={customLandmark}
                      onChange={(e) => setCustomLandmark(e.target.value)}
                      placeholder="e.g. Near City Hospital / Metro Gate 2"
                    />
                  </div>

                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.1rem' }}>
                    🛡️ Verified Pan-India delivery via express insured courier with live SMS & WhatsApp tracking.
                  </span>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="cart-drawer-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b', marginBottom: '0.35rem' }}>
                <span>Items Subtotal (Excl. GST):</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '0.35rem' }}>
                <span>🚚 Delivery:</span>
                <span style={{ fontWeight: 800, color: deliveryFee === 0 ? '#16a34a' : '#0f172a' }}>
                  {deliveryFee === 0 ? 'FREE (Above ₹1,000)' : `₹${deliveryFee}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#b45309', marginBottom: '0.65rem' }}>
                <span>🧾 GST (18% on total bill):</span>
                <span style={{ fontWeight: 700 }}>+₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1.5px solid #e2e8f0', marginBottom: '0.95rem' }}>
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>Final Total Bill Amount:</span>
                <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.35rem', color: 'var(--navy)', fontWeight: 900 }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
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
