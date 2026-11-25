import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Video,
  Smartphone,
  Package,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Radio,
  Flame,
  Search,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getPBrothersConfig,
  savePBrothersConfig,
  getPBrothersProducts,
  savePBrothersProduct,
  deletePBrothersProduct,
  parseYouTubeVideoId
} from '../../services/firebase';

export default function PBrothersAdminPortal() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return (
      sessionStorage.getItem('navidron_pbrothers_authenticated') === 'true' ||
      sessionStorage.getItem('navidron_admin_authenticated') === 'true'
    );
  });

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'video' | 'shorts'

  // Data States
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Video Form
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [liveBadgeText, setLiveBadgeText] = useState('🔴 STREAMING LIVE');
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Shorts Form (Up to 3 shorts)
  const [shortsList, setShortsList] = useState([
    { id: 'short-1', title: '', url: '', videoId: '' },
    { id: 'short-2', title: '', url: '', videoId: '' },
    { id: 'short-3', title: '', url: '', videoId: '' }
  ]);
  const [isSavingShorts, setIsSavingShorts] = useState(false);

  // Product Edit / Add Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    productId: '',
    category: 'GTA 6 Figures',
    price: 999,
    oldPrice: 1449,
    size: '20cm',
    sizesStr: '15cm, 20cm, 24cm',
    quantity: 30,
    image: '/images/gta6_merchandise_banner_1791059157486.jpg',
    desc: '',
    badge: 'LIMITED DROP',
    makerWorldUrl: ''
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load P_Brothers data
  const loadData = async () => {
    setLoading(true);
    try {
      const [cfg, prods] = await Promise.all([
        getPBrothersConfig(),
        getPBrothersProducts()
      ]);
      setConfig(cfg);
      setVideoUrl(cfg.featuredVideoUrl || `https://www.youtube.com/watch?v=${cfg.featuredVideoId || 'QdBZY2fkU-0'}`);
      setVideoTitle(cfg.featuredVideoTitle || 'GTA 6 Official Trailer / P_Brothers Video');
      setIsLive(!!cfg.isLive);
      setLiveBadgeText(cfg.liveBadgeText || '🔴 STREAMING LIVE');

      const initialShorts = [
        { id: 'short-1', title: '', url: '', videoId: '' },
        { id: 'short-2', title: '', url: '', videoId: '' },
        { id: 'short-3', title: '', url: '', videoId: '' }
      ];
      if (Array.isArray(cfg.shorts) && cfg.shorts.length > 0) {
        cfg.shorts.forEach((s, idx) => {
          if (idx < 3) initialShorts[idx] = { ...s };
        });
      }
      setShortsList(initialShorts);
      setProducts(prods || []);
    } catch (e) {
      console.error('Error loading P_Brothers admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginId.trim();
    const cleanPass = loginPass.trim();

    // Specific credentials requested by user:
    // Admin ID: Priyanshu
    // Password: Nexfly_1205
    const isPriyanshu = (cleanId.toLowerCase() === 'priyanshu' && cleanPass === 'Nexfly_1205');
    const isSuperAdmin = (
      (cleanId.toLowerCase() === 'admin@nexfly.com' || cleanId.toLowerCase() === 'admin1@nexfly.com') &&
      cleanPass === 'Abhi@2076'
    );

    if (isPriyanshu || isSuperAdmin) {
      sessionStorage.setItem('navidron_pbrothers_authenticated', 'true');
      sessionStorage.setItem('navidron_pbrothers_user', isPriyanshu ? 'Priyanshu (P_Brothers)' : cleanId);
      setIsAuthenticated(true);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    } else {
      setLoginError('Invalid Admin ID or Password. Please check credentials.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('navidron_pbrothers_authenticated');
    sessionStorage.removeItem('navidron_pbrothers_user');
    setIsAuthenticated(false);
  };

  // Save Video Config
  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setIsSavingVideo(true);
    try {
      const parsedId = parseYouTubeVideoId(videoUrl);
      const updatedConfig = {
        ...config,
        featuredVideoUrl: videoUrl.trim(),
        featuredVideoId: parsedId,
        featuredVideoTitle: videoTitle.trim(),
        isLive: isLive,
        liveBadgeText: liveBadgeText.trim()
      };
      await savePBrothersConfig(updatedConfig);
      setConfig(updatedConfig);
      showToast('✅ Featured Video & Live Stream broadcast updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save video settings: ' + err.message);
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Save YouTube Shorts (Up to 3)
  const handleSaveShorts = async (e) => {
    e.preventDefault();
    setIsSavingShorts(true);
    try {
      const cleanShorts = shortsList.map((s, idx) => ({
        id: s.id || `short-${idx + 1}`,
        title: (s.title || '').trim(),
        url: (s.url || '').trim(),
        videoId: parseYouTubeVideoId(s.url || s.videoId || '')
      }));

      const updatedConfig = {
        ...config,
        shorts: cleanShorts
      };
      await savePBrothersConfig(updatedConfig);
      setConfig(updatedConfig);
      showToast('✅ YouTube Shorts updated successfully! Visible at the end of P_Brothers page.');
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save shorts: ' + err.message);
    } finally {
      setIsSavingShorts(false);
    }
  };

  // Open Product Modal
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name || '',
        productId: prod.productId || prod.id || '',
        category: prod.category || 'GTA 6 Figures',
        price: prod.price || 999,
        oldPrice: prod.oldPrice || '',
        size: prod.size || '20cm',
        sizesStr: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || '15cm, 20cm, 24cm'),
        quantity: typeof prod.quantity === 'number' ? prod.quantity : 25,
        image: prod.image || '/images/gta6_merchandise_banner_1791059157486.jpg',
        desc: prod.desc || '',
        badge: prod.badge || 'LIMITED DROP',
        makerWorldUrl: prod.makerWorldUrl || ''
      });
    } else {
      setEditingProduct(null);
      const randId = Math.floor(10 + Math.random() * 90);
      setProductForm({
        name: '',
        productId: `PBRO-GTA-${randId}`,
        category: 'GTA 6 Figures',
        price: 999,
        oldPrice: 1449,
        size: '20cm',
        sizesStr: '15cm, 20cm, 24cm',
        quantity: 30,
        image: '/images/gta6_merchandise_banner_1791059157486.jpg',
        desc: '',
        badge: 'LIMITED DROP',
        makerWorldUrl: ''
      });
    }
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    setIsSavingProduct(true);
    try {
      const parsedSizes = productForm.sizesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...(editingProduct || {}),
        name: productForm.name.trim(),
        productId: productForm.productId.trim() || `PBRO-${Date.now()}`,
        category: productForm.category,
        brand: 'P_Brothers × NaviDron',
        price: parseInt(String(productForm.price).replace(/[^0-9]/g, ''), 10) || 799,
        oldPrice: productForm.oldPrice ? parseInt(String(productForm.oldPrice).replace(/[^0-9]/g, ''), 10) || 0 : 0,
        size: productForm.size || (parsedSizes[0] || 'Standard'),
        sizes: parsedSizes.length > 0 ? parsedSizes : ['Standard'],
        quantity: parseInt(String(productForm.quantity), 10) || 20,
        image: productForm.image.trim() || '/images/gta6_merchandise_banner_1791059157486.jpg',
        images: [productForm.image.trim() || '/images/gta6_merchandise_banner_1791059157486.jpg'],
        desc: productForm.desc.trim(),
        badge: productForm.badge.trim(),
        makerWorldUrl: productForm.makerWorldUrl.trim()
      };

      const saved = await savePBrothersProduct(payload);
      setProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== saved.id);
        return [saved, ...filtered];
      });
      setIsProductModalOpen(false);
      showToast(`✅ Product "${saved.name}" saved to P_Brothers catalog!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save product: ' + err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the P_Brothers catalog?`)) {
      return;
    }
    try {
      await deletePBrothersProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`🗑️ Removed "${name}" from catalog.`);
    } catch (err) {
      console.error(err);
      showToast('❌ Error deleting product: ' + err.message);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      (p.name || '').toLowerCase().includes(q) ||
      (p.productId || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchQ && matchCat;
  });

  // Current preview video ID
  const previewVideoId = parseYouTubeVideoId(videoUrl);

  // ── Render Login Screen if Not Authenticated ───────────────────
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #090014 0%, #0a0f2e 50%, #1a0022 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#ffffff',
          fontFamily: 'var(--font-body, system-ui, sans-serif)'
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(255, 0, 170, 0.35)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 35px rgba(255,0,170,0.2)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center'
          }}
        >
          {/* Logo & Header */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff00aa 0%, #7928ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 25px rgba(255,0,170,0.4)'
            }}
          >
            <Flame size={32} color="#ffffff" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,0,170,0.15)',
              border: '1px solid rgba(255,0,170,0.3)',
              color: '#ff00aa',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '999px',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <span>🎮 Creator Partner Portal</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', margin: '0 0 0.5rem', fontWeight: 900 }}>
            P_Brothers <span style={{ color: '#ff00aa' }}>Admin</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Exclusive control deck for Priyanshu: manage GTA 6 products, featured live streams, and YouTube shorts.
          </p>

          {loginError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.7rem',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textAlign: 'left'
              }}
            >
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Admin ID
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Priyanshu"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff00aa 0%, #9900ff 100%)',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-head)',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(255,0,170,0.35)',
                transition: 'all 0.2s'
              }}
            >
              Sign In to P_Brothers Admin
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.78rem', color: '#64748b' }}>
            Official collaboration between <strong style={{ color: '#fff' }}>P_Brothers YouTube</strong> & <strong style={{ color: '#00c8ff' }}>NaviDron</strong>.
          </div>
        </div>
      </div>
    );
  }

  // ── Render Authenticated Dashboard ────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0f2e', color: '#f8fafc', paddingTop: '74px', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0f172a',
            border: '1.5px solid #ff00aa',
            color: '#ffffff',
            padding: '0.8rem 1.25rem',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(255,0,170,0.3)',
            fontWeight: 700,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <div style={{ background: 'linear-gradient(180deg, rgba(24, 0, 51, 0.8) 0%, rgba(10, 15, 46, 0.95) 100%)', borderBottom: '1px solid rgba(255,0,170,0.25)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff00aa 0%, #7928ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255,0,170,0.4)'
              }}
            >
              <Flame size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.35rem', fontWeight: 900 }}>
                  P_Brothers × GTA 6 <span style={{ color: '#ff00aa' }}>Admin Portal</span>
                </h2>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,0,170,0.15)', color: '#ff00aa', border: '1px solid rgba(255,0,170,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                  Priyanshu Deck
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Restricted to P_Brothers GTA 6 Merch Products, Featured Video / Live Stream, & YouTube Shorts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/p-brothers"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(0, 200, 255, 0.1)',
                border: '1px solid rgba(0, 200, 255, 0.3)',
                color: '#00c8ff',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <Eye size={15} /> Preview Live Page <ExternalLink size={12} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: '10px',
              border: activeTab === 'products' ? '1.5px solid #ff00aa' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: activeTab === 'products' ? 'rgba(255,0,170,0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'products' ? '#ff00aa' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Package size={17} /> 1. GTA 6 Products & Merch ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: '10px',
              border: activeTab === 'video' ? '1.5px solid #ff00aa' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: activeTab === 'video' ? 'rgba(255,0,170,0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'video' ? '#ff00aa' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Video size={17} /> 2. Main Screen Video / Live Stream
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shorts')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.4rem',
              borderRadius: '10px',
              border: activeTab === 'shorts' ? '1.5px solid #ff00aa' : '1px solid rgba(255,255,255,0.1)',
              backgroundColor: activeTab === 'shorts' ? 'rgba(255,0,170,0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'shorts' ? '#ff00aa' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Smartphone size={17} /> 3. YouTube Shorts (3 at page bottom)
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* TAB 1: PRODUCTS & MERCH */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>
                  GTA 6 Action Figures & P_Brothers Streetwear Merch
                </h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                  These products are featured on the <strong>P_Brothers GTA 6</strong> tab. Add new items, update stock, sizes, and pricing.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={loadData}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenProductModal()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'linear-gradient(135deg, #ff00aa 0%, #9900ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255,0,170,0.3)'
                  }}
                >
                  <Plus size={16} /> Add New P_Brothers Merch
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search GTA 6 figures, t-shirts, product IDs..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'GTA 6 Figures', 'T-Shirts & Apparel'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: categoryFilter === cat ? '1px solid #ff00aa' : '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: categoryFilter === cat ? 'rgba(255,0,170,0.2)' : 'rgba(255,255,255,0.04)',
                      color: categoryFilter === cat ? '#ff00aa' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', height: '180px', backgroundColor: '#020617', overflow: 'hidden' }}>
                    <img
                      src={prod.image || '/images/gta6_merchandise_banner_1791059157486.jpg'}
                      alt={prod.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#ff00aa',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {prod.badge || 'EXCLUSIVE'}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: '#00c8ff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}
                    >
                      ID: {prod.productId || prod.id}
                    </span>
                  </div>

                  <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: '#ff00aa', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                      {prod.category}
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
                      {prod.name}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0.85rem', flex: 1 }}>
                      {prod.desc || 'Official GTA 6 Vice City licensed merchandise item.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '4px', color: '#cbd5e1' }}>
                        Sizes: {Array.isArray(prod.sizes) ? prod.sizes.join(', ') : prod.size}
                      </span>
                      <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '2px 7px', borderRadius: '4px' }}>
                        Stock: {prod.quantity || 25} units
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                          ₹{(prod.price || 999).toLocaleString('en-IN')}
                        </span>
                        {prod.oldPrice ? (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through', marginLeft: '6px' }}>
                            ₹{prod.oldPrice}
                          </span>
                        ) : null}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenProductModal(prod)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            fontWeight: 700
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          style={{
                            padding: '0.45rem 0.65rem',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MAIN SCREEN VIDEO & LIVE STREAM */}
        {activeTab === 'video' && (
          <div style={{ maxWidth: '900px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>
                Main Screen Featured Video & Live Stream Broadcaster
              </h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Update the primary video player on the P_Brothers page. Input any YouTube URL, trailer, video ID, or live stream link.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1.5px solid rgba(255,0,170,0.3)',
                borderRadius: '16px',
                padding: '1.75rem',
                marginBottom: '2rem'
              }}
            >
              <form onSubmit={handleSaveVideo}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    YouTube Video URL or Live Stream Link <span style={{ color: '#ff00aa' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=QdBZY2fkU-0 or https://youtu.be/..."
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Parsed YouTube ID: <strong style={{ color: '#00c8ff' }}>{previewVideoId}</strong>
                  </span>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Broadcast / Video Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g., GTA 6 Official Trailer 1 & Vice City Lore Breakdown"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1.5px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Live Stream Mode Switch */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 0, 170, 0.08)',
                    border: '1px solid rgba(255, 0, 170, 0.25)',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#ffffff' }}>
                      <Radio size={16} color="#ff00aa" />
                      <span>Live Stream Mode (P_Brothers Livestream)</span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      When enabled, a glowing red "🔴 STREAMING LIVE" banner appears above the video player.
                    </p>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => setIsLive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#ff00aa' }}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: isLive ? '#ff00aa' : '#cbd5e1' }}>
                      {isLive ? '🔴 Stream is LIVE' : 'Offline / Normal Video'}
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingVideo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #ff00aa 0%, #9900ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(255,0,170,0.35)'
                  }}
                >
                  <Save size={16} /> {isSavingVideo ? 'Updating Broadcast...' : 'Save & Publish Main Video'}
                </button>
              </form>
            </div>

            {/* Live Preview Container */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Eye size={18} color="#00c8ff" />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Live Player Preview:</span>
              </div>
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255,0,170,0.3)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(255,0,170,0.2)'
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000' }}>
                  <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    src={`https://www.youtube-nocookie.com/embed/${previewVideoId}?autoplay=0&rel=0`}
                    title="P_Brothers Video Preview"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: YOUTUBE SHORTS (UP TO 3) */}
        {activeTab === 'shorts' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.4rem', fontWeight: 800 }}>
                YouTube Shorts Manager (Up to 3 Shorts)
              </h3>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Configure up to 3 YouTube Shorts. These will be highlighted in vertical 9:16 cards right at the end of the P_Brothers GTA 6 page!
              </p>
            </div>

            <form onSubmit={handleSaveShorts}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[0, 1, 2].map((idx) => {
                  const short = shortsList[idx] || { id: `short-${idx + 1}`, title: '', url: '', videoId: '' };
                  const shortVideoId = parseYouTubeVideoId(short.url || short.videoId || '');

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        border: '1.5px solid rgba(255,0,170,0.25)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ff00aa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Smartphone size={16} /> YouTube Short #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#00c8ff', fontFamily: 'monospace' }}>
                          ID: {shortVideoId || 'None'}
                        </span>
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                          Short URL or Video ID
                        </label>
                        <input
                          type="text"
                          value={short.url || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setShortsList((prev) => {
                              const copy = [...prev];
                              copy[idx] = {
                                ...copy[idx],
                                url: val,
                                videoId: parseYouTubeVideoId(val)
                              };
                              return copy;
                            });
                          }}
                          placeholder="e.g. https://www.youtube.com/shorts/..."
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(2, 6, 23, 0.7)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                          Short Caption / Title
                        </label>
                        <input
                          type="text"
                          value={short.title || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setShortsList((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], title: val };
                              return copy;
                            });
                          }}
                          placeholder="e.g. GTA 6 Vice City Real Life 3D Map Leak!"
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(2, 6, 23, 0.7)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            fontSize: '0.84rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* 9:16 Vertical Preview Frame */}
                      <div
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#000',
                          border: '1px solid rgba(255,255,255,0.15)',
                          marginTop: 'auto'
                        }}
                      >
                        <div style={{ position: 'relative', paddingBottom: '140%', height: 0 }}>
                          {shortVideoId ? (
                            <iframe
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                              src={`https://www.youtube-nocookie.com/embed/${shortVideoId}?autoplay=0&rel=0`}
                              title={`Short #${idx + 1}`}
                              allowFullScreen
                            />
                          ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                              Enter YouTube Short URL to preview
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={isSavingShorts}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #ff00aa 0%, #9900ff 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255,0,170,0.35)'
                }}
              >
                <Save size={16} /> {isSavingShorts ? 'Publishing Shorts...' : 'Save & Publish 3 YouTube Shorts'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem'
          }}
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#0a0f2e',
              border: '1.5px solid rgba(255,0,170,0.4)',
              borderRadius: '20px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 35px rgba(255,0,170,0.25)',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="#ff00aa" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: 800 }}>
                  {editingProduct ? 'Edit P_Brothers Product' : 'Add New GTA 6 Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Product Name <span style={{ color: '#ff00aa' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Jason — GTA 6 Dual Pistols"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Product ID <span style={{ color: '#00c8ff' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.productId}
                    onChange={(e) => setProductForm((p) => ({ ...p, productId: e.target.value }))}
                    placeholder="e.g. PBRO-GTA-01"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#00c8ff',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="GTA 6 Figures">GTA 6 Figures</option>
                    <option value="T-Shirts & Apparel">T-Shirts & Apparel</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="e.g. LIMITED DROP / CREATOR SIGNATURE"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Price (₹) <span style={{ color: '#ff00aa' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="999"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Old MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={(e) => setProductForm((p) => ({ ...p, oldPrice: e.target.value }))}
                    placeholder="1449"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                    Available Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm((p) => ({ ...p, quantity: e.target.value }))}
                    placeholder="30"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(2, 6, 23, 0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                  Available Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={productForm.sizesStr}
                  onChange={(e) => setProductForm((p) => ({ ...p, sizesStr: e.target.value }))}
                  placeholder="e.g. 15cm, 20cm, 24cm or S, M, L, XL, XXL"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                  Image URL / Path
                </label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="/images/gta6_merchandise_banner_1791059157486.jpg"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                  MakerWorld .STL Link (Admin Reference for 3D Prints)
                </label>
                <input
                  type="text"
                  value={productForm.makerWorldUrl}
                  onChange={(e) => setProductForm((p) => ({ ...p, makerWorldUrl: e.target.value }))}
                  placeholder="https://makerworld.com/en/models/210340"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '3px' }}>
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={productForm.desc}
                  onChange={(e) => setProductForm((p) => ({ ...p, desc: e.target.value }))}
                  placeholder="Official collectible description..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(2, 6, 23, 0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ff00aa 0%, #9900ff 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255,0,170,0.35)'
                  }}
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

