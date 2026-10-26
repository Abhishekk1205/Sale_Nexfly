import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  RefreshCw,
  Download,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getUserProfile,
  saveUserProfile,
  getUserAddresses,
  saveUserAddresses,
  getUserOrders,
  saveUserOrders,
  isFirebaseOnline,
  syncUserFullDataToFirebase,
  getEffectiveUserId,
  getStorageKey,
  DEFAULT_USER_PROFILE,
  DEFAULT_ADDRESSES,
  DEFAULT_ORDERS,
  RTDB_URL
} from '../../services/firebase';

export default function ProfilePage({
  user,
  onUpdateUser,
  onOpenAuth,
  cart = [],
  onOpenCart,
  onUpdateQuantity,
  onRemoveItem
}) {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'addresses' | 'orders' | 'cart'
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Profile / Contact state - initialized directly from cache so data never reverts on reload
  const [profile, setProfile] = useState(() => {
    const uid = getEffectiveUserId(user);
    try {
      const cached = localStorage.getItem(getStorageKey('profile', uid));
      if (cached) {
        return { ...DEFAULT_USER_PROFILE, ...JSON.parse(cached) };
      }
    } catch (e) {}
    return {
      ...DEFAULT_USER_PROFILE,
      name: user?.name || DEFAULT_USER_PROFILE.name,
      email: user?.email || DEFAULT_USER_PROFILE.email
    };
  });

  // Addresses state - initialized directly from cache
  const [addresses, setAddresses] = useState(() => {
    const uid = getEffectiveUserId(user);
    try {
      const cached = localStorage.getItem(getStorageKey('addresses', uid));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ADDRESSES;
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: 'Home',
    recipient: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  // Orders state - initialized directly from cache
  const [orders, setOrders] = useState(() => {
    const uid = getEffectiveUserId(user);
    try {
      const cached = localStorage.getItem(getStorageKey('orders', uid));
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ORDERS;
  });

  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'Delivered' | 'Succeeded' | 'Cancelled'
  const [orderSearch, setOrderSearch] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Load all user data from Firebase / LocalStorage on mount
  useEffect(() => {
    async function loadData() {
      const uid = getEffectiveUserId(user);
      try {
        const [profData, addrData, orderData] = await Promise.all([
          getUserProfile(uid),
          getUserAddresses(uid),
          getUserOrders(uid)
        ]);

        if (profData) {
          if (user?.name && user.name !== 'Google User' && !profData.name) {
            profData.name = user.name;
          }
          setProfile(profData);
        }
        if (addrData && Array.isArray(addrData) && addrData.length > 0) {
          setAddresses(addrData);
        }
        if (orderData && Array.isArray(orderData) && orderData.length > 0) {
          setOrders(orderData);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    }
    loadData();
  }, [user]);

  // Sync / Save Contact Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSyncing(true);
    const uid = getEffectiveUserId(user);
    try {
      const res = await saveUserProfile(uid, profile);
      // Immediately notify parent App so Navbar greeting updates to "Hii, [Name]"
      if (onUpdateUser) {
        onUpdateUser({
          ...(user || {}),
          id: uid,
          uid: uid,
          name: profile.name,
          email: profile.email
        });
      }
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
      if (res && res.error) {
        if (res.error.toLowerCase().includes('permission') || res.error.toLowerCase().includes('denied') || res.error.includes('403')) {
          showToast('⚠️ Saved locally! In Firestore > Rules tab, set allow read, write: if true;');
        } else {
          showToast('⚠️ Firestore: ' + res.error);
        }
      } else {
        showToast('✅ Profile saved & synced to Cloud Firestore!');
      }
    } catch (err) {
      showToast('❌ Error: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Add / Edit Address
  const handleOpenAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({ ...addr });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        tag: 'Home',
        recipient: profile.name || '',
        phone: profile.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: addresses.length === 0
      });
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSyncing(true);
    const uid = getEffectiveUserId(user);

    let updated = [...addresses];
    if (editingAddressId) {
      updated = updated.map((item) =>
        item.id === editingAddressId ? { ...addressForm, id: editingAddressId } : item
      );
    } else {
      const newAddr = {
        ...addressForm,
        id: `addr-${Date.now()}`
      };
      if (newAddr.isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.unshift(newAddr);
    }

    if (addressForm.isDefault) {
      updated = updated.map((a) =>
        a.id === (editingAddressId || updated[0].id)
          ? { ...a, isDefault: true }
          : { ...a, isDefault: false }
      );
    }

    setAddresses(updated);
    await saveUserAddresses(uid, updated);
    setShowAddressModal(false);
    setSyncing(false);
    showToast('✅ Delivery address saved to Firebase!');
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    setSyncing(true);
    const uid = getEffectiveUserId(user);
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    await saveUserAddresses(uid, updated);
    setSyncing(false);
    showToast('🗑️ Address deleted.');
  };

  const handleSetDefaultAddress = async (id) => {
    setSyncing(true);
    const uid = getEffectiveUserId(user);
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updated);
    await saveUserAddresses(uid, updated);
    setSyncing(false);
    showToast('⭐ Default delivery address updated.');
  };


  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    if (orderFilter !== 'all' && ord.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchItem = ord.items.some((it) => it.name.toLowerCase().includes(q));
      return matchId || matchItem;
    }
    return true;
  });

  return (
    <div className="profile-page-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="profile-toast-floating">
          <Sparkles size={18} className="neon-text" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Hero */}
      <div className="profile-hero-section">
        <div className="profile-hero-inner">
          <div className="profile-breadcrumbs">
            <Link to="/" className="profile-back-link">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <span className="profile-bc-sep">/</span>
            <span className="profile-bc-current">User Profile & Orders</span>
          </div>

          <div className="profile-header-card">
            <div className="profile-avatar-block">
              <div className="profile-avatar-glow">
                <div className="profile-avatar-letters">
                  {profile.name
                    ? profile.name.slice(0, 2).toUpperCase()
                    : user?.email
                    ? user.email.slice(0, 2).toUpperCase()
                    : 'ND'}
                </div>
              </div>
              <div className="profile-user-summary">
                <div className="profile-greeting-tag">
                  <span className="pulse-dot"></span>
                  {user ? 'Verified Pilot' : 'Guest Account'}
                </div>
                <h1 className="profile-user-title">
                  Hii, <span className="profile-neon-name">{profile.name || user?.name || (user?.email ? user.email.split('@')[0] : 'Pilot')}</span>
                </h1>
                <p className="profile-user-email">
                  <Mail size={14} /> {profile.email || user?.email || 'No email registered'}
                  <span className="profile-member-pill">
                    <ShieldCheck size={12} /> {profile.badge || 'Pilot Member'}
                  </span>
                </p>
              </div>
            </div>

          </div>

          {/* Quick Metrics */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box" onClick={() => setActiveTab('orders')}>
              <div className="stat-box-icon"><Package size={20} /></div>
              <div className="stat-box-val">{orders.length}</div>
              <div className="stat-box-lbl">Total Orders</div>
            </div>
            <div className="profile-stat-box" onClick={() => setActiveTab('addresses')}>
              <div className="stat-box-icon"><MapPin size={20} /></div>
              <div className="stat-box-val">{addresses.length}</div>
              <div className="stat-box-lbl">Saved Addresses</div>
            </div>
            <div className="profile-stat-box" onClick={() => { setActiveTab('orders'); setOrderFilter('Delivered'); }}>
              <div className="stat-box-icon stat-icon-green"><CheckCircle size={20} /></div>
              <div className="stat-box-val">
                {orders.filter((o) => o.status === 'Delivered').length}
              </div>
              <div className="stat-box-lbl">Delivered</div>
            </div>
            <div className="profile-stat-box" onClick={() => { setActiveTab('orders'); setOrderFilter('Cancelled'); }}>
              <div className="stat-box-icon stat-icon-red"><XCircle size={20} /></div>
              <div className="stat-box-val">
                {orders.filter((o) => o.status === 'Cancelled').length}
              </div>
              <div className="stat-box-lbl">Cancelled & Refunded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabs */}
      <div className="profile-body-container">
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 200, 255, 0.08), rgba(0, 100, 255, 0.04))',
            border: '1px solid rgba(0, 200, 255, 0.25)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <strong style={{ color: 'var(--neon)', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                👋 Sign In to Sync Across Devices
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Sign in with Google or Email to link orders, delivery addresses and cloud data to your account.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
              onClick={onOpenAuth}
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="profile-tabs-header">
          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <User size={18} />
            <span>Contact & Details</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            type="button"
            className={`profile-tab-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={18} />
            <span>Flight Cart ({cart.length})</span>
          </button>
        </div>

        {/* ── TAB 1: CONTACT DETAILS ───────────────────────── */}
        {activeTab === 'contact' && (
          <div className="profile-tab-content fade-in">
            <div className="profile-card-section">
              <div className="section-title-bar">
                <div>
                  <h2 className="section-main-title">Personal & Contact Details</h2>
                  <p className="section-main-desc">
                    Your details are synced with Firebase and link your custom drone orders, 3Dstudio drops, and dispatch notifications.
                  </p>
                </div>
                <div className="firebase-badge-pill">
                  <ShieldCheck size={14} /> Linked to Firebase User
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-form-grid">
                <div className="form-group-field">
                  <label className="form-field-label">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="profile-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                  <span className="field-hint">
                    This updates your greeting across the navbar.
                  </span>
                </div>

                <div className="form-group-field">
                  <label className="form-field-label">
                    Primary Email <span className="req-star">*</span>
                  </label>
                  <input
                    type="email"
                    className="profile-input"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                  <span className="field-hint">Used for order receipts and Firebase authentication.</span>
                </div>

                <div className="form-group-field">
                  <label className="form-field-label">
                    Primary Contact Number (WhatsApp) <span className="req-star">*</span>
                  </label>
                  <input
                    type="tel"
                    className="profile-input"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                  <span className="field-hint">For instant dispatch tracking & delivery updates.</span>
                </div>

                <div className="form-group-field">
                  <label className="form-field-label">Alternate / Emergency Contact</label>
                  <input
                    type="tel"
                    className="profile-input"
                    value={profile.altPhone}
                    onChange={(e) => setProfile({ ...profile, altPhone: e.target.value })}
                  />
                  <span className="field-hint">Backup contact if primary is unreachable during delivery.</span>
                </div>


                <div className="form-submit-row full-width">
                  <button
                    type="submit"
                    className="profile-submit-btn"
                    disabled={syncing}
                  >
                    <Check size={18} />
                    {syncing ? 'Saving to Firebase...' : 'Save & Update Profile'}
                  </button>
                  <span className="auto-save-note">
                    🔒 Protected with Firebase Cloud Security Rules
                  </span>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: DELIVERY ADDRESSES ────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="profile-tab-content fade-in">
            <div className="profile-card-section">
              <div className="section-title-bar">
                <div>
                  <h2 className="section-main-title">Delivery Addresses</h2>
                  <p className="section-main-desc">
                    Manage your shipping destinations for custom drone deliveries and 3Dstudio merchandise.
                  </p>
                </div>
                <button
                  type="button"
                  className="profile-add-btn"
                  onClick={() => handleOpenAddressModal()}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="empty-state-card">
                  <MapPin size={48} className="empty-state-icon" />
                  <h3>No Delivery Addresses Saved Yet</h3>
                  <p>Add your home or workshop address to enable one-click checkout.</p>
                  <button
                    type="button"
                    className="profile-add-btn"
                    onClick={() => handleOpenAddressModal()}
                  >
                    <Plus size={16} /> Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="addresses-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-card ${addr.isDefault ? 'default-address' : ''}`}
                    >
                      <div className="address-header-row">
                        <span className="address-tag-pill">{addr.tag}</span>
                        {addr.isDefault && (
                          <span className="default-badge">
                            <CheckCircle size={13} /> Default Address
                          </span>
                        )}
                      </div>

                      <h3 className="address-recipient-name">{addr.recipient}</h3>
                      <p className="address-phone-line">
                        <Phone size={14} /> {addr.phone}
                      </p>

                      <div className="address-body-text">
                        <p>{addr.street}</p>
                        {addr.landmark && <p className="landmark-text">Landmark: {addr.landmark}</p>}
                        <p>
                          <strong>{addr.city}</strong>, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>
                      </div>

                      <div className="address-actions-footer">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            className="address-action-link"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          className="address-action-icon-btn"
                          title="Edit Address"
                          onClick={() => handleOpenAddressModal(addr)}
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          type="button"
                          className="address-action-icon-btn delete-btn"
                          title="Delete Address"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: ORDER HISTORY ─────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="profile-tab-content fade-in">
            <div className="profile-card-section">
              <div className="section-title-bar">
                <div>
                  <h2 className="section-main-title">Order History & Tracking</h2>
                  <p className="section-main-desc">
                    View real-time status of your orders: Delivered, Succeeded (Active), and Cancelled after payment (Refunded).
                  </p>
                </div>

              </div>

              {/* Order Filter & Search Controls */}
              <div className="orders-toolbar">
                <div className="order-filter-pills">
                  <button
                    type="button"
                    className={`filter-pill ${orderFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('all')}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill pill-delivered ${orderFilter === 'Delivered' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('Delivered')}
                  >
                    🟢 Delivered ({orders.filter((o) => o.status === 'Delivered').length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill pill-succeeded ${orderFilter === 'Succeeded' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('Succeeded')}
                  >
                    🔵 Succeeded ({orders.filter((o) => o.status === 'Succeeded').length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill pill-cancelled ${orderFilter === 'Cancelled' ? 'active' : ''}`}
                    onClick={() => setOrderFilter('Cancelled')}
                  >
                    🔴 Cancelled after payment ({orders.filter((o) => o.status === 'Cancelled').length})
                  </button>
                </div>

                <div className="order-search-box">
                  <input
                    type="text"
                    className="order-search-input"
                    placeholder="Search by Order ID or item..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="empty-state-card">
                  <Package size={48} className="empty-state-icon" />
                  <h3>No Orders Found</h3>
                  <p>There are no orders matching your current filter.</p>
                  <button
                    type="button"
                    className="profile-add-btn"
                    onClick={() => setOrderFilter('all')}
                  >
                    View All Orders
                  </button>
                </div>
              ) : (
                <div className="orders-cards-stack">
                  {filteredOrders.map((ord) => {
                    const isDelivered = ord.status === 'Delivered';
                    const isCancelled = ord.status === 'Cancelled';
                    const isSucceeded = ord.status === 'Succeeded';

                    return (
                      <div
                        key={ord.id}
                        className={`order-record-card ${
                          isDelivered
                            ? 'card-status-delivered'
                            : isCancelled
                            ? 'card-status-cancelled'
                            : 'card-status-succeeded'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="order-card-header">
                          <div className="order-card-meta">
                            <span className="order-id-code">#{ord.id}</span>
                            <span className="order-date-text">
                              Placed on {new Date(ord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="order-payment-tag">{ord.paymentStatus}</span>
                          </div>

                          {/* Status Badge */}
                          <div className="order-status-badge-wrap">
                            {isDelivered && (
                              <span className="status-badge-pill badge-green">
                                <CheckCircle size={15} /> Delivered
                              </span>
                            )}
                            {isSucceeded && (
                              <span className="status-badge-pill badge-cyan">
                                <Clock size={15} /> Succeeded / In Dispatch
                              </span>
                            )}
                            {isCancelled && (
                              <span className="status-badge-pill badge-red">
                                <XCircle size={15} /> Cancelled after payment
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Special Refund Alert for Cancelled Orders */}
                        {isCancelled && (
                          <div className="refund-banner-box">
                            <div className="refund-banner-title">
                              <AlertCircle size={16} /> Refund Processed
                            </div>
                            <p className="refund-banner-desc">
                              {ord.statusDesc}
                            </p>
                            {ord.refundInfo && (
                              <div className="refund-pill-highlight">
                                💰 {ord.refundInfo}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Order Status Message for Active / Delivered Orders */}
                        {!isCancelled && ord.statusDesc && (
                          <div className="order-status-desc-banner">
                            <span className="desc-dot"></span>
                            <span>{ord.statusDesc}</span>
                            {ord.trackingNumber && (
                              <span className="tracking-inline-code">
                                Tracking: {ord.trackingNumber}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Items Stack */}
                        <div className="order-items-container">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="order-single-item-row">
                              <div className="order-item-thumb">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.target.src = '/favicon.png';
                                  }}
                                />
                              </div>
                              <div className="order-item-info">
                                <h4 className="order-item-title">{item.name}</h4>
                                <span className="order-item-cat">{item.category}</span>
                              </div>
                              <div className="order-item-qty">Qty: {item.quantity}</div>
                              <div className="order-item-price">
                                ₹{item.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="order-card-footer">
                          <div className="order-shipping-summary">
                            <MapPin size={14} />
                            <span>
                              Deliver to: <strong>{ord.deliveryAddress}</strong>
                            </span>
                          </div>

                          <div className="order-total-and-cta">
                            <div className="order-total-amount">
                              <span className="total-label">Total Amount</span>
                              <span className="total-value">
                                ₹{ord.totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="order-action-buttons">
                              <button
                                type="button"
                                className="order-btn-outline"
                                onClick={() =>
                                  showToast(`📄 Invoice for #${ord.id} generated!`)
                                }
                              >
                                <Download size={14} /> Invoice
                              </button>
                              {isDelivered && (
                                <Link to="/prints" className="order-btn-accent">
                                  Re-order Item
                                </Link>
                              )}
                              {isSucceeded && (
                                <button
                                  type="button"
                                  className="order-btn-accent"
                                  onClick={() =>
                                    showToast(`🚚 Package #${ord.id} is with courier partner!`)
                                  }
                                >
                                  Track Live
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: FLIGHT CART ───────────────────────────── */}
        {activeTab === 'cart' && (
          <div className="profile-tab-content fade-in">
            <div className="profile-card-section">
              <div className="section-title-bar">
                <div>
                  <h2 className="section-main-title">Personal Cart & Items</h2>
                  <p className="section-main-desc">
                    Connected with your user database. Review items, select quantities, and proceed to confirmed checkout.
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                    onClick={onOpenCart}
                  >
                    Open Checkout Drawer
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="empty-state-card">
                  <ShoppingCart size={48} className="empty-state-icon" />
                  <h3>Your Cart is Currently Empty</h3>
                  <p>Discover our high-precision FPV components, robotics kits, and 3D studio figures.</p>
                  <Link to="/products" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', marginTop: '1rem', display: 'inline-block' }}>
                    Browse Warehouse
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map((item, idx) => {
                    const numPrice = typeof item.price === 'number'
                      ? item.price
                      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
                    return (
                      <div
                        key={`${item.id}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1rem',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={item.image || '/images/fpv_racing_drone.jpg'}
                            alt={item.name}
                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.95rem' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                              {item.category} {item.size ? `• Size: ${item.size}` : ''}
                            </div>
                            <div style={{ fontWeight: 800, color: 'var(--neon)', marginTop: '4px' }}>
                              ₹{(numPrice * (item.quantity || 1)).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '3px 8px' }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, (item.quantity || 1) - 1, item.size)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 800 }}
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, (item.quantity || 1) + 1, item.size)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 800 }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem && onRemoveItem(item.id, item.size)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                            title="Remove from cart"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 800 }}
                      onClick={onOpenCart}
                    >
                      Proceed to Place Order →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT ADDRESS ───────────────────────── */}
      {showAddressModal && (
        <div className="profile-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="profile-modal-form">
              <div className="address-tag-selector">
                {['Home', 'Office', 'Workshop', 'Other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-btn ${addressForm.tag === t ? 'active' : ''}`}
                    onClick={() => setAddressForm({ ...addressForm, tag: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="modal-input-row">
                <div className="modal-field">
                  <label>Recipient Name *</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={addressForm.recipient}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, recipient: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>Contact Phone *</label>
                  <input
                    type="tel"
                    className="profile-input"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label>Flat, House no., Building, Apartment *</label>
                <input
                  type="text"
                  className="profile-input"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, street: e.target.value })
                  }
                  required
                />
              </div>

              <div className="modal-field">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  className="profile-input"
                  value={addressForm.landmark}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, landmark: e.target.value })
                  }
                />
              </div>

              <div className="modal-input-row three-cols">
                <div className="modal-field">
                  <label>City *</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>State *</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="modal-field">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, pincode: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, isDefault: e.target.checked })
                    }
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn-save" disabled={syncing}>
                  {syncing ? 'Saving to Firebase...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
