import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  User,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Clock,
  Ruler,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Boxes,
  RotateCcw,
  Layers,
  Wrench,
  Package,
  Gamepad2,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { get3DStudioItems } from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

const CATEGORIES = [
  { id: 'all', label: 'All 3D Products', icon: Boxes },
  { id: '3D Model', label: '3D Model', icon: User },
  { id: '3D Lithophane', label: '3D Lithophane', icon: ImageIcon },
  { id: 'Game Characters', label: 'Game Characters', icon: Gamepad2 },
  { id: 'Anime Characters', label: 'Anime Characters', icon: Flame },
  { id: 'Accessories', label: 'Accessories', icon: Wrench },
  { id: 'Others', label: 'Others', icon: Package }
];

function matchesCategory(itemCat = '', targetCat = '') {
  const it = (itemCat || '').toLowerCase();
  const tgt = (targetCat || '').toLowerCase();
  if (tgt === 'all') return true;
  if (tgt === '3d model') {
    return it.includes('3d model') || it.includes('person') || it.includes('2d to 3d');
  }
  if (tgt === '3d lithophane') {
    return it.includes('litho');
  }
  if (tgt === 'game characters') {
    return it.includes('game');
  }
  if (tgt === 'anime characters') {
    return it.includes('anime');
  }
  if (tgt === 'accessories') {
    return it.includes('access');
  }
  if (tgt === 'others') {
    return it.includes('other');
  }
  return it === tgt;
}

function getCategoryPriority(cat = '') {
  const c = (cat || '').toLowerCase();
  if (c.includes('3d model') || c.includes('person') || c.includes('2d to 3d')) return 1;
  if (c.includes('litho')) return 2;
  if (c.includes('game')) return 3;
  if (c.includes('anime')) return 4;
  if (c.includes('access')) return 5;
  return 6;
}

export default function PrintsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query params
  const paramCategory = searchParams.get('category') || searchParams.get('filter') || 'all';
  const [activeCategory, setActiveCategory] = useState(paramCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc, name
  const [priceRange, setPriceRange] = useState('all'); // all, under500, 500-1000, above1000
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('filter');
    if (cat) {
      if (cat.toLowerCase().includes('model') || cat.toLowerCase().includes('person') || cat.toLowerCase().includes('2d')) setActiveCategory('3D Model');
      else if (cat.toLowerCase().includes('litho')) setActiveCategory('3D Lithophane');
      else if (cat.toLowerCase().includes('game')) setActiveCategory('Game Characters');
      else if (cat.toLowerCase().includes('anime')) setActiveCategory('Anime Characters');
      else if (cat.toLowerCase().includes('access')) setActiveCategory('Accessories');
      else if (cat.toLowerCase().includes('other')) setActiveCategory('Others');
      else setActiveCategory(cat);
    }
    document.title = "3D Studio — 3D Models, Lithophanes, Games & Anime | NaviDron";

    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await get3DStudioItems();
        setItems(data);
      } catch (e) {
        console.error('Error fetching 3D Studio catalog:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [searchParams]);

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  const handleAddToCartItem = (item, chosenSize = null) => {
    const isItemOutOfStock = typeof item.quantity === 'number'
      ? item.quantity <= 0
      : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) <= 0 : false);
    if (isItemOutOfStock) return;

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/anime_figure_3d.jpg'];

    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        category: item.category || '3D Studio',
        size: chosenSize || item.size || '8 inch',
        price: numPrice,
        quantity: 1,
        image: images[0]
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  // Counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    CATEGORIES.forEach((c) => {
      if (c.id !== 'all') {
        counts[c.id] = items.filter((i) => matchesCategory(i.category, c.id)).length;
      }
    });
    return counts;
  }, [items]);

  // Filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (!matchesCategory(item.category, activeCategory)) {
          return false;
        }
      }

      // Stock filter
      if (inStockOnly) {
        const stock = typeof item.quantity === 'number' ? item.quantity : (parseInt(String(item.quantity || 0), 10) || 0);
        if (stock <= 0) return false;
      }

      // Price range filter
      const p = typeof item.price === 'number' ? item.price : (parseInt(String(item.price || 0).replace(/[^0-9]/g, ''), 10) || 0);
      if (priceRange === 'under500' && p >= 500) return false;
      if (priceRange === '500-1000' && (p < 500 || p > 1000)) return false;
      if (priceRange === 'above1000' && p <= 1000) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesDesc = (item.desc || '').toLowerCase().includes(q);
        const matchesBrand = (item.brand || '').toLowerCase().includes(q);
        const matchesId = (item.productId || item.id || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesId && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : (parseInt(String(a.price || 0).replace(/[^0-9]/g, ''), 10) || 0);
      const priceB = typeof b.price === 'number' ? b.price : (parseInt(String(b.price || 0).replace(/[^0-9]/g, ''), 10) || 0);

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');

      // Featured default sequence:
      // 1: 3D Model, 2: 3D Lithophane (placed directly beside 3D Model in catalog grid),
      // 3: Game Characters, 4: Anime Characters, 5: Accessories, 6: Others
      const rankA = getCategoryPriority(a.category);
      const rankB = getCategoryPriority(b.category);
      if (rankA !== rankB) return rankA - rankB;
      return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
    });
  }, [items, activeCategory, inStockOnly, priceRange, searchTerm, sortBy]);

  const resetAllFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setInStockOnly(false);
    setPriceRange('all');
    setSortBy('featured');
    setSearchParams({});
  };

  const renderProductCard = (item) => {
    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const isOutOfStock = typeof item.quantity === 'number'
      ? item.quantity <= 0
      : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) <= 0 : false);

    const stockCount = typeof item.quantity === 'number'
      ? item.quantity
      : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) || 0 : 25);

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/anime_figure_3d.jpg'];

    return (
      <div
        key={item.id}
        className="card"
        onClick={() => navigate(`/prints/${item.id}`)}
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(10,15,46,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          height: '100%'
        }}
      >
        {/* Multi-Photo Sliding Carousel Header */}
        <div style={{ position: 'relative' }}>
          <ImageSlider
            images={images}
            alt={item.name}
            aspectRatio="4/3"
            showThumbnails={false}
            compact={true}
          />

          {/* Badges on Top */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 4, display: 'flex', gap: '5px' }}>
            {isOutOfStock ? (
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  fontWeight: 800,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '20px'
                }}
              >
                OUT OF STOCK
              </span>
            ) : (
              item.badge && (
                <span className="badge badge-hot" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                  {item.badge}
                </span>
              )
            )}
          </div>

          {/* Open in New Window Quick Action */}
          <a
            href={`/prints/${item.id}`}
            target="_blank"
            rel="noreferrer"
            title="Open product details in new window"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 4,
              backgroundColor: 'rgba(255,255,255,0.92)',
              color: '#0a0f2e',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              textDecoration: 'none'
            }}
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Card Body - Clean & Compact */}
        <div className="card-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Category & Product ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {item.category || '3D Studio'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#be185d',
                backgroundColor: '#fdf2f8',
                border: '1px solid #fbcfe8',
                padding: '1px 6px',
                borderRadius: '4px'
              }}
              title="Product ID / SKU"
            >
              ID: {item.productId || item.id}
            </span>
          </div>

          {/* Name & Stock Quantity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Link
              to={`/prints/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
            >
              <h4
                className="card-title"
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#0a0f2e',
                  lineHeight: 1.35,
                  margin: 0,
                  cursor: 'pointer',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
                title={item.name}
              >
                {item.name}
              </h4>
            </Link>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: isOutOfStock ? '#ffffff' : (stockCount > 5 ? '#065f46' : '#991b1b'),
                backgroundColor: isOutOfStock ? '#ef4444' : (stockCount > 5 ? '#d1fae5' : '#fee2e2'),
                padding: '2px 7px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isOutOfStock ? 'Out of Stock' : `${stockCount} in stock`}
            </span>
          </div>

          {/* Single Line Description with "Know more" in last */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              lineHeight: 1.4,
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.35rem',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}
              title={item.desc}
            >
              {item.desc || 'High-precision FDM 3D printed figure.'}
            </span>
            <Link
              to={`/prints/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                color: '#0284c7',
                fontWeight: 700,
                fontSize: '0.78rem',
                flexShrink: 0,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Know more &rarr;
            </Link>
          </div>

          {/* Price & Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
            <div className="card-price" style={{ color: '#0a0f2e', fontSize: '1.22rem', fontWeight: 900, margin: 0 }}>
              ₹{numPrice.toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Link
                to={`/prints/${item.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '0.45rem 0.65rem',
                  borderRadius: '7px',
                  border: '1.5px solid #0284c7',
                  backgroundColor: 'rgba(2,132,199,0.06)',
                  color: '#0284c7',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Eye size={13} /> Know more
              </Link>

              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    cursor: 'not-allowed',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCartItem(item);
                  }}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '7px',
                    border: 'none',
                    backgroundColor: '#0a0f2e',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ShoppingCart size={13} /> Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Top Header Bar / Breadcrumb */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.25rem' }}>
              <Link to="/" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
              <span>/</span>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>3D Studio</span>
              {activeCategory !== 'all' && (
                <>
                  <span>/</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{activeCategory}</span>
                </>
              )}
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              3D Studio Products & Additive Manufacturing
            </h1>
          </div>

          {/* Quick Search in Bar */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={17} style={{ position: 'absolute', top: '10px', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by ID, name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.3rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Left Categories Sidebar + Right Product Catalog) */}
      <div style={{ maxWidth: '1440px', margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.75rem', alignItems: 'start' }}>
          
          {/* ════════ LEFT SIDEBAR: BROWSE CATEGORIES & FILTERS ════════ */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* drkstore.in style "BROWSE CATEGORIES" Header and Box */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div
                style={{
                  backgroundColor: '#0077b6',
                  color: '#ffffff',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  letterSpacing: '0.5px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>☰</span>
                  <span>BROWSE CATEGORIES</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1.1rem',
                        border: 'none',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                        color: isSelected ? '#0284c7' : '#334155',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease',
                        borderLeft: isSelected ? '4px solid #0077b6' : '4px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Icon size={16} color={isSelected ? '#0284c7' : '#64748b'} />
                        <span>{cat.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#e0f2fe' : '#f1f5f9',
                            color: isSelected ? '#0369a1' : '#64748b'
                          }}
                        >
                          {count}
                        </span>
                        <ChevronRight size={14} color={isSelected ? '#0284c7' : '#cbd5e1'} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section: Availability & Stock */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem 1.15rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                Availability
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer', marginBottom: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0077b6' }}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Filter Section: Price Range */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem 1.15rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                Price Filter
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under500', label: 'Under ₹500' },
                  { id: '500-1000', label: '₹500 — ₹1,000' },
                  { id: 'above1000', label: 'Above ₹1,000' }
                ].map((pr) => (
                  <label key={pr.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="priceRangeRadio"
                      checked={priceRange === pr.id}
                      onChange={() => setPriceRange(pr.id)}
                      style={{ width: '15px', height: '15px', accentColor: '#0077b6' }}
                    />
                    <span>{pr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Sort By */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem 1.15rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                Sort By
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Product Name: A to Z</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(activeCategory !== 'all' || inStockOnly || priceRange !== 'all' || sortBy !== 'featured' || searchTerm) && (
              <button
                onClick={resetAllFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <RotateCcw size={14} /> Reset All Filters
              </button>
            )}

          </aside>

          {/* ════════ RIGHT MAIN: PRODUCT LISTING CATALOG ════════ */}
          <main style={{ minWidth: 0 }}>
            {/* Category Banner Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '1.1rem 1.4rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                    {activeCategory === 'all' ? 'All 3D Studio Products' : activeCategory}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {filteredAndSortedItems.length} products
                  </span>
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  {activeCategory === 'Anime Models' && 'Anime heroes, Goku, Luffy Gear 5, Naruto, and Tanjiro high-precision SLA figures.'}
                  {activeCategory === 'Game Characters' && 'GTA 6 Jason & Lucia, Valorant agents Reyna & Jett with custom stands.'}
                  {activeCategory === '3D Lithophanes' && 'Luminous curved photo lithophanes with USB LED nightlight base.'}
                  {activeCategory === '3D Model Person (2D to 3D)' && 'Convert your 2D photo into a lifelike miniature 3D sculpted figurine.'}
                  {activeCategory === 'Accessories' && 'Articulated toys, tool organizers, desk stands, and 3D printing accessories.'}
                  {activeCategory === 'Others' && 'Mechanical iris boxes, geometric planters, and artistic desktop gadgets.'}
                  {activeCategory === 'all' && 'Browse all FDM tough PLA & SLA resin figures, lithophanes, personal statues, and accessories.'}
                </p>
              </div>

              {/* Active Filter Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {activeCategory !== 'all' && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Category: {activeCategory}
                    <button onClick={() => handleSelectCategory('all')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem', padding: 0 }}>✕</button>
                  </span>
                )}
                {inStockOnly && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#166534', fontSize: '0.8rem', padding: 0 }}>✕</button>
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Price: {priceRange}
                    <button onClick={() => setPriceRange('all')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem', padding: 0 }}>✕</button>
                  </span>
                )}
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <p style={{ fontWeight: 600 }}>Loading 3D Studio Catalog...</p>
              </div>
            ) : filteredAndSortedItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No 3D products match your filter criteria
                </p>
                <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Try choosing a different category or clearing active filters.
                </p>
                <button
                  onClick={resetAllFilters}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0077b6',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.25rem'
                }}
              >
                {filteredAndSortedItems.map((item) => renderProductCard(item))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
