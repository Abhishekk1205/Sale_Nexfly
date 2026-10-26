import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  Wrench,
  Printer,
  Compass,
  Users,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Cpu,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

const VALID_ADMIN_ACCOUNTS = [
  { id: 'admin@nexfly.com', pass: 'Abhi@2076', display: 'Admin@nexfly.com' },
  { id: 'admin1@nexfly.com', pass: 'Abhi@2076', display: 'Admin1@nexfly.com' }
];
import {
  getAllOrders,
  updateOrderStatus,
  get3DStudioItems,
  save3DStudioItem,
  delete3DStudioItem,
  getDroneAccessories,
  saveDroneAccessory,
  deleteDroneAccessory,
  getRoboticsKits,
  saveRoboticsKit,
  deleteRoboticsKit,
  getUAVPreBuilt,
  saveUAVPreBuilt,
  deleteUAVPreBuilt,
  getUAVCustomOrders,
  updateUAVCustomOrderStatus,
  getAllUsers,
  isFirebaseOnline
} from '../../services/firebase';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('navidron_admin_authenticated') === 'true';
  });
  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    return sessionStorage.getItem('navidron_admin_user') || 'Admin@nexfly.com';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // 'profile' | 'orders' | 'items' | '3dstudio' | 'uav' | 'users'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Data states
  const [orders, setOrders] = useState([]);
  const [threeDItems, setThreeDItems] = useState([]);
  const [droneParts, setDroneParts] = useState([]);
  const [roboticsKits, setRoboticsKits] = useState([]);
  const [uavPreBuilt, setUavPreBuilt] = useState([]);
  const [uavCustomOrders, setUavCustomOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Sub-tabs & filters
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [itemsSubTab, setItemsSubTab] = useState('drone'); // 'drone' | 'robotics'
  const [threeDSubTab, setThreeDSubTab] = useState('all'); // 'all' | 'Anime' | 'Game Characters' | 'Personal Character'
  const [uavSubTab, setUavSubTab] = useState('prebuilt'); // 'prebuilt' | 'custom'

  // Modal states for adding new items
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('3dstudio'); // '3dstudio' | 'drone' | 'robotics' | 'uav'
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Anime',
    kitType: 'Chassis & Base',
    type: 'FPV Drone',
    price: '',
    quantity: '',
    size: '8 inch',
    image: '',
    desc: '',
    flightTime: '',
    range: ''
  });

  const handleOpenAddModal = (type) => {
    setModalType(type);
    setNewItemForm({
      name: '',
      category: type === '3dstudio' ? 'Anime' : 'Motors',
      kitType: 'Chassis & Base',
      type: 'FPV Drone',
      price: '',
      quantity: '',
      size: '8 inch',
      image: '',
      desc: '',
      flightTime: '',
      range: ''
    });
    setShowAddModal(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ords, prints, parts, kits, uavs, customs, usrs] = await Promise.all([
        getAllOrders(),
        get3DStudioItems(),
        getDroneAccessories(),
        getRoboticsKits(),
        getUAVPreBuilt(),
        getUAVCustomOrders(),
        getAllUsers()
      ]);
      setOrders(ords);
      setThreeDItems(prints);
      setDroneParts(parts);
      setRoboticsKits(kits);
      setUavPreBuilt(uavs);
      setUavCustomOrders(customs);
      setUsersList(usrs);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    const cleanId = (loginEmail || '').trim().toLowerCase();
    const cleanPass = (loginPassword || '').trim();

    const matched = VALID_ADMIN_ACCOUNTS.find(
      (acc) => acc.id === cleanId && acc.pass === cleanPass
    );

    if (matched) {
      sessionStorage.setItem('navidron_admin_authenticated', 'true');
      sessionStorage.setItem('navidron_admin_user', matched.display);
      setIsAuthenticated(true);
      setCurrentAdminUser(matched.display);
      setLoginError('');
      showToast(`Access granted. Welcome, ${matched.display}`);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    } else {
      setLoginError('Access Denied: Invalid Admin ID or Password. Verify your credentials.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('navidron_admin_authenticated');
    sessionStorage.removeItem('navidron_admin_user');
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    showToast('Admin session locked successfully.');
  };

  useEffect(() => {
    document.title = "Admin Portal — NaviDron Operations & Catalog";
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // ── ORDER MANAGEMENT ──────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`✅ Order #${orderId} status updated to "${newStatus}".`);
    } catch (err) {
      showToast(`❌ Error updating order: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── INLINE ITEM SAVE ──────────────────────────────────────────
  const handleSave3DItemInline = async (item) => {
    setActionLoading(true);
    try {
      await save3DStudioItem(item);
      showToast(`💾 Saved "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete3DItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this 3D product from catalog?')) return;
    setActionLoading(true);
    try {
      await delete3DStudioItem(id);
      setThreeDItems((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ 3D Studio product deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDronePartInline = async (item) => {
    setActionLoading(true);
    try {
      await saveDroneAccessory(item);
      showToast(`💾 Saved part "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDronePart = async (id) => {
    if (!window.confirm('Delete this drone accessory?')) return;
    setActionLoading(true);
    try {
      await deleteDroneAccessory(id);
      setDroneParts((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ Drone accessory deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRoboticsKitInline = async (item) => {
    setActionLoading(true);
    try {
      await saveRoboticsKit(item);
      showToast(`💾 Saved robotics kit "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoboticsKit = async (id) => {
    if (!window.confirm('Delete this robotics kit?')) return;
    setActionLoading(true);
    try {
      await deleteRoboticsKit(id);
      setRoboticsKits((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ Robotics kit deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUAVPreBuiltInline = async (item) => {
    setActionLoading(true);
    try {
      await saveUAVPreBuilt(item);
      showToast(`💾 Saved UAV "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUAVPreBuilt = async (id) => {
    if (!window.confirm('Delete this Pre-Built UAV from store?')) return;
    setActionLoading(true);
    try {
      await deleteUAVPreBuilt(id);
      setUavPreBuilt((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ UAV removed from store.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── ADD NEW PRODUCT SUBMISSION ────────────────────────────────
  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const priceVal = typeof newItemForm.price === 'number' ? newItemForm.price : parseInt(newItemForm.price, 10) || 0;
    const qtyVal = typeof newItemForm.quantity === 'number' ? newItemForm.quantity : parseInt(newItemForm.quantity, 10) || 0;
    const cleanedPayload = {
      ...newItemForm,
      price: priceVal,
      quantity: qtyVal
    };

    try {
      if (modalType === '3dstudio') {
        const created = await save3DStudioItem({
          ...cleanedPayload,
          id: `3d-${Date.now()}`
        });
        setThreeDItems((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to 3DStudio catalog!`);
      } else if (modalType === 'drone') {
        const created = await saveDroneAccessory({
          ...cleanedPayload,
          id: `part-${Date.now()}`
        });
        setDroneParts((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Drone Accessories catalog!`);
      } else if (modalType === 'robotics') {
        const created = await saveRoboticsKit({
          ...cleanedPayload,
          id: `kit-${Date.now()}`
        });
        setRoboticsKits((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Robotics Kits catalog!`);
      } else if (modalType === 'uav') {
        const created = await saveUAVPreBuilt({
          ...cleanedPayload,
          id: `uav-${Date.now()}`
        });
        setUavPreBuilt((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Pre-Built UAV catalog!`);
      }

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}

      setShowAddModal(false);
      setNewItemForm({
        name: '',
        category: 'Anime',
        kitType: 'Chassis & Base',
        type: 'FPV Drone',
        price: '',
        quantity: '',
        size: '8 inch',
        image: '',
        desc: '',
        flightTime: '',
        range: ''
      });
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Total calculated revenue
  const totalRevenue = orders.reduce((acc, o) => {
    const raw = typeof o.totalAmount === 'number' ? o.totalAmount : parseInt(String(o.totalAmount || 0).replace(/[^0-9]/g, ''), 10) || 0;
    return acc + raw;
  }, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = (o.id || '').toLowerCase().includes(q);
      const matchCust = (o.customer?.name || o.customer?.email || '').toLowerCase().includes(q);
      const matchAddr = (o.deliveryAddress || '').toLowerCase().includes(q);
      return matchId || matchCust || matchAddr;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        {toastMessage && (
          <div className="profile-toast-floating">
            <Sparkles size={18} className="neon-text" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="admin-lock-card fade-in">
          <div style={{ textAlign: 'center' }}>
            <div className="admin-lock-badge">
              <Lock size={13} />
              <span>NexFly Security Gate</span>
            </div>
            <h1 className="admin-lock-title">
              Admin <span>Portal Access</span>
            </h1>
            <p className="admin-lock-subtitle">
              Restricted control deck. Enter your administrative credentials to manage store catalog, orders, and user operations.
            </p>
          </div>

          {loginError && (
            <div className="admin-lock-error" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-lock-form">
            <div className="admin-lock-input-group">
              <label>
                <User size={14} />
                <span>Admin ID / Email</span>
              </label>
              <div className="admin-lock-input-wrap">
                <Mail size={16} className="input-icon-left" />
                <input
                  type="text"
                  autoComplete="username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="admin-lock-input-group">
              <label>
                <KeyRound size={14} />
                <span>Access Password</span>
              </label>
              <div className="admin-lock-input-wrap">
                <Lock size={16} className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-lock-btn"
            >
              <Unlock size={17} />
              <span>Authenticate & Enter Deck</span>
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              to="/"
              style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--neon)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Toast */}
      {toastMessage && (
        <div className="profile-toast-floating">
          <Sparkles size={18} className="neon-text" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="admin-top-hero">
        <div className="admin-hero-inner">
          <div>
            <div className="admin-badge-live">
              <span className="pulse-dot"></span>
              Command & Catalog Admin Portal
            </div>
            <h1 className="admin-title-head">
              NaviDron <span>Operations Control</span>
            </h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Manage users, track dispatch addresses in <code>Order</code> collection, and decide live catalog prices & stock for 3D Studio, Drone Accessories, Robotics Kits, and UAVs.
            </p>
          </div>

          <div className="admin-hero-stats">
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{orders.length}</div>
              <div className="admin-metric-lbl">Total Orders</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{usersList.length}</div>
              <div className="admin-metric-lbl">Total Users</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="admin-metric-lbl">Total Volume</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{threeDItems.length + droneParts.length + roboticsKits.length + uavPreBuilt.length}</div>
              <div className="admin-metric-lbl">Live Catalog</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navbar */}
      <nav className="admin-nav-bar">
        <div className="admin-nav-inner">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <ShieldCheck size={18} />
            <span>Admin Profile</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
            <span className="admin-count-pill">{orders.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Wrench size={18} />
            <span>Items (Parts & Kits)</span>
            <span className="admin-count-pill">{droneParts.length + roboticsKits.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === '3dstudio' ? 'active' : ''}`}
            onClick={() => setActiveTab('3dstudio')}
          >
            <Printer size={18} />
            <span>3DStudio</span>
            <span className="admin-count-pill">{threeDItems.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'uav' ? 'active' : ''}`}
            onClick={() => setActiveTab('uav')}
          >
            <Compass size={18} />
            <span>UAV (Pre-Built & Custom)</span>
            <span className="admin-count-pill">{uavPreBuilt.length + uavCustomOrders.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Users</span>
            <span className="admin-count-pill">{usersList.length}</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffcc', display: 'inline-block' }}></span>
              <span>{currentAdminUser}</span>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleAdminLogout}
              title="Lock Portal & Sign Out"
            >
              <LogOut size={14} />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <div className="admin-body-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <RefreshCw size={36} className="spin-icon" color="var(--neon)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8' }}>Loading live database...</p>
          </div>
        ) : (
          <>
            {/* ── TAB 1: ADMIN PROFILE ─────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Administrator Identity & System Status
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Master credentials, operations hub address, and live system status.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-action-primary"
                    onClick={loadAllData}
                    disabled={actionLoading}
                  >
                    <RefreshCw size={15} className={actionLoading ? 'spin-icon' : ''} />
                    Refresh Cloud Data
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Official Admin Contact
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#fff' }}>
                      <Mail size={16} color="var(--neon)" />
                      <strong>navidron.a@gmail.com</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                      <Phone size={16} color="#10b981" />
                      <span>+91 9508106177</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Hangar & Workshop Location
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                      <MapPin size={18} color="#ff00aa" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>A. M. Das Lane, Brahmpura, Muzaffarpur, Bihar, Pincode: 842003</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Live System Collections
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {['users', 'Order', '3DStudio', 'DroneAccessories', 'Robotics_Kits', 'UAV_PreBuilt', 'UAV_Custom'].map((col) => (
                        <span key={col} style={{ fontSize: '0.75rem', background: 'rgba(0,200,255,0.15)', color: 'var(--neon)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/"
                    className="btn btn-outline"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    View Customer Website <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </Link>
                  <Link
                    to="/profile"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Go To Personal Profile
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 2: ORDERS ────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Live User Orders & Delivery Addresses
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Stored globally in root collection <code>Order</code> with complete recipient details and particular delivery addresses.
                    </p>
                  </div>

                  {/* Search and status filters */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search order ID, customer, address..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '0.45rem 0.85rem 0.45rem 2rem',
                          fontSize: '0.82rem',
                          minWidth: '220px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    >
                      <option value="all">All Statuses ({orders.length})</option>
                      <option value="Succeeded">Succeeded / Confirmed</option>
                      <option value="In Assembly">In Assembly</option>
                      <option value="Dispatched">Dispatched / In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                    <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No orders match the current filter or search criteria.</p>
                  </div>
                ) : (
                  <div className="admin-orders-list">
                    {filteredOrders.map((ord) => {
                      const amount = typeof ord.totalAmount === 'number'
                        ? ord.totalAmount
                        : parseInt(String(ord.totalAmount || 0).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={ord.id} className="admin-order-box">
                          <div className="admin-order-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span className="admin-order-id-badge">#{ord.id}</span>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                Date: {ord.date || ord.createdAt?.split('T')[0] || 'Today'}
                              </span>
                              {ord.type && (
                                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(0,200,255,0.15)', color: 'var(--neon)', borderRadius: '4px', fontWeight: 700 }}>
                                  {ord.type}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                                Total: ₹{amount.toLocaleString('en-IN')}
                              </span>
                              <select
                                className="admin-status-dropdown"
                                value={ord.status || 'Succeeded'}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                disabled={actionLoading}
                              >
                                <option value="Succeeded">🔵 Succeeded / Confirmed</option>
                                <option value="In Assembly">⚙️ In Assembly</option>
                                <option value="Dispatched">🚚 Dispatched / In Transit</option>
                                <option value="Delivered">🟢 Delivered</option>
                                <option value="Cancelled">🔴 Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="admin-order-grid-details">
                            {/* Customer Contact */}
                            <div>
                              <div className="admin-order-section-lbl">Customer Contact</div>
                              <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>
                                {ord.customer?.name || 'Customer'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {ord.customer?.email || 'No email'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>
                                {ord.customer?.phone || '+91 9508106177'}
                              </div>
                            </div>

                            {/* Particular Delivery Address */}
                            <div>
                              <div className="admin-order-section-lbl">Particular Delivery Address</div>
                              <div className="admin-order-address-box">
                                <MapPin size={15} color="#ff00aa" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                {typeof ord.deliveryAddress === 'object'
                                  ? `${ord.deliveryAddress.street || ''}${ord.deliveryAddress.landmark ? ', Landmark: ' + ord.deliveryAddress.landmark : ''}, ${ord.deliveryAddress.city || ''} (${ord.deliveryAddress.pincode || ''})`
                                  : ord.deliveryAddress || 'Address on file'}
                              </div>
                            </div>

                            {/* Payment details */}
                            <div>
                              <div className="admin-order-section-lbl">Payment Mode</div>
                              <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                                {ord.paymentStatus || 'Paid Online'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Tracking: <code>{ord.trackingNumber || `EXP-${ord.id}`}</code>
                              </div>
                            </div>
                          </div>

                          {/* Items Breakdown */}
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                            <div className="admin-order-section-lbl">Ordered Items ({ord.items?.length || 0})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {(ord.items || []).map((it, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#e2e8f0' }}>
                                  <span>
                                    {it.quantity || 1}x <strong>{it.name}</strong> {it.size ? `(Size: ${it.size})` : ''}
                                  </span>
                                  <span style={{ color: 'var(--neon)', fontWeight: 700 }}>
                                    ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: ITEMS (DRONE PARTS & ROBOTICS KITS) ──── */}
            {activeTab === 'items' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Drone Parts & Robotics Kits
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Decide prices, stock quantities, and add new components. Changes immediately update customer store pages.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      <button
                        type="button"
                        onClick={() => setItemsSubTab('drone')}
                        style={{
                          background: itemsSubTab === 'drone' ? 'var(--neon)' : 'transparent',
                          color: itemsSubTab === 'drone' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Drone Parts ({droneParts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemsSubTab('robotics')}
                        style={{
                          background: itemsSubTab === 'robotics' ? 'var(--neon)' : 'transparent',
                          color: itemsSubTab === 'robotics' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Robotics Kits ({roboticsKits.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      className="admin-btn-action-primary"
                      onClick={() => handleOpenAddModal(itemsSubTab === 'drone' ? 'drone' : 'robotics')}
                    >
                      <Plus size={16} /> Add {itemsSubTab === 'drone' ? 'Drone Part' : 'Robotics Kit'}
                    </button>
                  </div>
                </div>

                {/* Drone Parts Sub-Tab */}
                {itemsSubTab === 'drone' && (
                  <div className="admin-items-grid">
                    {droneParts.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <img src={item.image} alt={item.name} className="admin-prod-thumb" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.category || 'Parts'}
                        </span>
                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Inline editable price & quantity */}
                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setDroneParts((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Quantity / Stock</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setDroneParts((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveDronePartInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price/Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteDronePart(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Robotics Kits Sub-Tab */}
                {itemsSubTab === 'robotics' && (
                  <div className="admin-items-grid">
                    {roboticsKits.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <img src={item.image} alt={item.name} className="admin-prod-thumb" />
                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.kitType || 'Kit'}
                        </span>
                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Inline editable price & quantity */}
                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setRoboticsKits((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Quantity / Stock</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setRoboticsKits((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveRoboticsKitInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price/Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteRoboticsKit(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: 3D STUDIO ─────────────────────────────── */}
            {activeTab === '3dstudio' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      3D Studio Catalog & Sizes
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Anime figures, game characters (GTA 6 / Valorant), and personal custom image portraits with size and price options.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      {['all', 'Anime', 'Game Characters', 'Personal Character'].map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setThreeDSubTab(sub)}
                          style={{
                            background: threeDSubTab === sub ? 'var(--neon)' : 'transparent',
                            color: threeDSubTab === sub ? 'var(--navy)' : '#94a3b8',
                            border: 'none',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {sub === 'all' ? 'All' : sub}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="admin-btn-action-primary"
                      onClick={() => handleOpenAddModal('3dstudio')}
                    >
                      <Plus size={16} /> Add 3D Figure
                    </button>
                  </div>
                </div>

                <div className="admin-items-grid">
                  {threeDItems
                    .filter((it) => threeDSubTab === 'all' || it.category === threeDSubTab)
                    .map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <img src={item.image} alt={item.name} className="admin-prod-thumb" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#ff00aa', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.category || '3D Studio'}
                          </span>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>
                            Size: {item.size || '8 inch'}
                          </span>
                        </div>

                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Inline price & stock editing */}
                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setThreeDItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Stock / Qty</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setThreeDItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Size</label>
                            <input
                              type="text"
                              className="admin-input-field"
                              value={item.size || '8 inch'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setThreeDItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, size: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSave3DItemInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDelete3DItem(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── TAB 5: UAV (PRE-BUILT & CUSTOM) ─────────────── */}
            {activeTab === 'uav' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      UAV Aircraft & Custom Flight Orders
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Ready-to-fly Prebuilt UAVs (RC Planes & Drones) and custom drone order requests from users.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      <button
                        type="button"
                        onClick={() => setUavSubTab('prebuilt')}
                        style={{
                          background: uavSubTab === 'prebuilt' ? 'var(--neon)' : 'transparent',
                          color: uavSubTab === 'prebuilt' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Pre-Built UAVs ({uavPreBuilt.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUavSubTab('custom')}
                        style={{
                          background: uavSubTab === 'custom' ? 'var(--neon)' : 'transparent',
                          color: uavSubTab === 'custom' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Custom UAV Orders ({uavCustomOrders.length})
                      </button>
                    </div>

                    {uavSubTab === 'prebuilt' && (
                      <button
                        type="button"
                        className="admin-btn-action-primary"
                        onClick={() => handleOpenAddModal('uav')}
                      >
                        <Plus size={16} /> Add Pre-Built UAV
                      </button>
                    )}
                  </div>
                </div>

                {/* Prebuilt UAVs */}
                {uavSubTab === 'prebuilt' && (
                  <div className="admin-items-grid">
                    {uavPreBuilt.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <img src={item.image} alt={item.name} className="admin-prod-thumb" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.type || 'UAV'}
                        </span>
                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                          ⏱ Flight Time: {item.flightTime || '10 mins'} | 📡 Range: {item.range || '2 km'}
                        </div>

                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setUavPreBuilt((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Stock Qty</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setUavPreBuilt((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveUAVPreBuiltInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price & Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteUAVPreBuilt(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom UAV Orders */}
                {uavSubTab === 'custom' && (
                  <div>
                    {uavCustomOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                        <Compass size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No custom UAV requests submitted yet.</p>
                      </div>
                    ) : (
                      <div className="admin-orders-list">
                        {uavCustomOrders.map((ord) => (
                          <div key={ord.id} className="admin-order-box">
                            <div className="admin-order-header">
                              <div>
                                <span className="admin-order-id-badge">#{ord.id}</span>
                                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                  Custom Order Request • {ord.createdAt?.split('T')[0] || 'Recent'}
                                </span>
                              </div>
                              <select
                                className="admin-status-dropdown"
                                value={ord.status || 'Pending Review'}
                                onChange={async (e) => {
                                  await updateUAVCustomOrderStatus(ord.id, e.target.value);
                                  setUavCustomOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: e.target.value } : o))
                                  );
                                  showToast(`Status updated to "${e.target.value}"`);
                                }}
                              >
                                <option value="Pending Review">⏳ Pending Review</option>
                                <option value="In Assembly">⚙️ In Assembly / Sourcing</option>
                                <option value="Flight Tested">✈️ Flight Tested & Bench OK</option>
                                <option value="Dispatched">🚚 Dispatched</option>
                                <option value="Delivered">🟢 Delivered</option>
                              </select>
                            </div>

                            <div className="admin-order-grid-details">
                              <div>
                                <div className="admin-order-section-lbl">Client Contact</div>
                                <div style={{ color: '#fff', fontWeight: 700 }}>{ord.customerName || ord.name || 'Client'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ord.customerEmail || ord.email}</div>
                                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{ord.customerPhone || ord.phone || '+91 9508106177'}</div>
                              </div>
                              <div>
                                <div className="admin-order-section-lbl">Specifications</div>
                                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                                  Type: <strong>{ord.droneType || 'Custom Drone'}</strong> | Frame: <strong>{ord.frameSize || '5 inch'}</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                  {ord.purpose || ord.notes || 'Custom build requirements'}
                                </div>
                              </div>
                              <div>
                                <div className="admin-order-section-lbl">Estimated Price</div>
                                <div style={{ color: 'var(--neon)', fontWeight: 800, fontSize: '1rem' }}>
                                  ₹{(ord.estimatedPrice || ord.price || 14999).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 6: USERS ─────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      User Management & Customer Support
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Every user registered in <code>users</code> collection with their profile details, saved delivery addresses, order counts, and active carts.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-action-primary"
                    onClick={loadAllData}
                  >
                    <RefreshCw size={15} /> Refresh Users
                  </button>
                </div>

                <div className="admin-users-grid">
                  {usersList.map((usr) => (
                    <div key={usr.id} className="admin-user-card">
                      <div className="admin-user-avatar-row">
                        <div className="admin-user-initials">
                          {usr.name ? usr.name.slice(0, 2).toUpperCase() : 'ND'}
                        </div>
                        <div>
                          <div className="admin-user-name">{usr.name || 'Pilot User'}</div>
                          <div className="admin-user-email">{usr.email || 'No email registered'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-all' }}>
                            UID: <code>{usr.id}</code>
                          </div>
                        </div>
                      </div>

                      {usr.phone && (
                        <div className="admin-user-contact-row">
                          <Phone size={14} color="#10b981" />
                          <span>{usr.phone}</span>
                        </div>
                      )}

                      {/* User Stats: Addresses, Orders, Cart */}
                      <div className="admin-user-stats-strip">
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.addressesCount}</div>
                          <div className="admin-user-stat-lbl">Addresses</div>
                        </div>
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.ordersCount}</div>
                          <div className="admin-user-stat-lbl">Orders</div>
                        </div>
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.cartCount}</div>
                          <div className="admin-user-stat-lbl">In Cart</div>
                        </div>
                      </div>

                      {/* Saved addresses snippet */}
                      {usr.addresses && usr.addresses.length > 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.85rem' }}>
                          <MapPin size={12} color="var(--neon)" style={{ display: 'inline', marginRight: '4px' }} />
                          {usr.addresses[0].street}{usr.addresses[0].landmark ? `, Landmark: ${usr.addresses[0].landmark}` : ''}, {usr.addresses[0].city} ({usr.addresses[0].pincode})
                        </div>
                      )}

                      {/* Assist actions */}
                      <div className="admin-user-assist-btns">
                        <a
                          href={`https://wa.me/${(usr.phone || '919508106177').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${usr.name || ''}, this is NaviDron Support regarding your orders and UAV configuration.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-assist admin-btn-wa"
                        >
                          <Phone size={13} /> Assist on WhatsApp
                        </a>

                        <a
                          href={`mailto:${usr.email || 'navidron.a@gmail.com'}?subject=NaviDron%20Customer%20Assistance`}
                          className="admin-btn-assist admin-btn-mail"
                        >
                          <Mail size={13} /> Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL: ADD NEW ITEM ───────────────────────────── */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', color: '#fff', margin: 0, fontSize: '1.25rem' }}>
                Add New {modalType === '3dstudio' ? '3D Studio Figure' : modalType === 'drone' ? 'Drone Part' : modalType === 'robotics' ? 'Robotics Kit' : 'Pre-Built UAV'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="admin-modal-form-grid">
              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Item Name *</label>
                <input
                  type="text"
                  className="profile-input"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  placeholder=""
                  required
                />
              </div>

              {/* Category for 3D Studio */}
              {modalType === '3dstudio' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Category *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="Anime">Anime</option>
                    <option value="Game Characters">Game Characters</option>
                    <option value="Personal Character">Personal Character of Image</option>
                  </select>
                </div>
              )}

              {/* Size for 3D Studio */}
              {modalType === '3dstudio' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Figure Size *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.size}
                    onChange={(e) => setNewItemForm({ ...newItemForm, size: e.target.value })}
                  >
                    <option value="6 inch">6 inch (Compact)</option>
                    <option value="8 inch">8 inch (Standard)</option>
                    <option value="12 inch">12 inch (Deluxe Masterpiece)</option>
                    <option value="Custom Scale">Custom Scale</option>
                  </select>
                </div>
              )}

              {/* Type for UAV */}
              {modalType === 'uav' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Aircraft Type *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.type}
                    onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                  >
                    <option value="FPV Drone">FPV Drone</option>
                    <option value="RC Plane">RC Scale Airplane</option>
                    <option value="Agri Drone">Agricultural Drone</option>
                    <option value="Toy Drone">Toy / Micro Drone</option>
                  </select>
                </div>
              )}

              {/* Kit Type for Robotics */}
              {modalType === 'robotics' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Kit Type *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.kitType}
                    onChange={(e) => setNewItemForm({ ...newItemForm, kitType: e.target.value })}
                  >
                    <option value="Chassis & Base">Chassis & Base</option>
                    <option value="Microcontrollers & IoT">Microcontrollers (ESP32/Arduino)</option>
                    <option value="Motors & Wheels">Motors & Wheels</option>
                    <option value="Learning Kits">Complete Learning Kits</option>
                  </select>
                </div>
              )}

              {/* Drone Category for Drone Parts */}
              {modalType === 'drone' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Category *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="Motors">Motors</option>
                    <option value="Electronics">Electronics (ESC/FC/DJI O3)</option>
                    <option value="Frames">Frames</option>
                    <option value="3D Parts">3D Printed Parts</option>
                    <option value="Agricultural Parts">Agricultural Parts</option>
                  </select>
                </div>
              )}

              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Price (₹) *</label>
                <input
                  type="number"
                  className="profile-input"
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                  placeholder=""
                  required
                />
              </div>

              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Stock Quantity *</label>
                <input
                  type="number"
                  className="profile-input"
                  value={newItemForm.quantity}
                  onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                  placeholder=""
                  required
                />
              </div>

              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Image URL / Asset Path *</label>
                <input
                  type="text"
                  className="profile-input"
                  value={newItemForm.image}
                  onChange={(e) => setNewItemForm({ ...newItemForm, image: e.target.value })}
                  placeholder=""
                  required
                />
              </div>

              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Description</label>
                <textarea
                  rows={3}
                  className="profile-textarea"
                  value={newItemForm.desc}
                  onChange={(e) => setNewItemForm({ ...newItemForm, desc: e.target.value })}
                  placeholder=""
                />
              </div>

              <div className="full-span" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-save"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
