import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Star,
  Search,
  Wrench,
  Cpu,
  Printer,
  Sparkles,
  Check,
  Layers,
  ExternalLink,
  Eye,
  Package,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDroneAccessories, getRoboticsKits } from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function ProductsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get('category') || 'all';
  const [category, setCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const c = searchParams.get('category');
    if (c) setCategory(c);
    document.title = "Drone Parts, Electronics & Robotics Kits | NaviDron Store";

    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [droneParts, kits] = await Promise.all([
          getDroneAccessories(),
          getRoboticsKits()
        ]);
        const combined = [
          ...droneParts.map((p) => ({ ...p, isKit: false, type: 'drone' })),
          ...kits.map((k) => ({ ...k, isKit: true, type: 'robotics', category: k.kitType || 'Robotics Kit' }))
        ];
        setProducts(combined);
      } catch (e) {
        console.error('Error fetching live products catalog:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [searchParams]);

  const filteredProducts = products.filter((p) => {
    let matchesCategory = true;
    if (category === 'robotics') {
      matchesCategory = p.isKit === true;
    } else if (category === 'parts') {
      matchesCategory = (p.category || '').toLowerCase().includes('motor') || (p.category || '').toLowerCase().includes('frame') || (p.category || '').toLowerCase().includes('part');
    } else if (category === 'electronics') {
      matchesCategory = (p.category || '').toLowerCase().includes('electronic') || (p.category || '').toLowerCase().includes('microcontroller') || (p.category || '').toLowerCase().includes('iot');
    } else if (category === '3d-parts') {
      matchesCategory = (p.category || '').toLowerCase().includes('3d');
    } else if (category !== 'all') {
      matchesCategory = (p.category || '').toLowerCase().includes(category.toLowerCase());
    }

    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.desc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.productId || p.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleBuy = (item) => {
    if (typeof item.quantity === 'number' && item.quantity <= 0) return;
    if (item.quantity !== undefined && parseInt(String(item.quantity), 10) <= 0) return;
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.image || '/images/fpv_racing_drone.jpg'];

    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        name: item.name,
        category: item.category || (item.isKit ? 'Robotics Kit' : 'Drone Component'),
        brand: item.brand || 'NaviDron Robotics',
        price: numPrice,
        quantity: 1,
        image: images[0]
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  return (
    <div style={{ paddingTop: '74px', backgroundColor: '#ffffff' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          padding: '5rem 2rem 3.5rem',
          color: 'white'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="section-tag" style={{ background: 'rgba(0,200,255,.15)', color: 'var(--neon)' }}>
            📦 Official NaviDron Warehouse & Robotics Labs
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Drone Parts, Electronics & <span style={{ color: 'var(--neon)' }}>Robotics Kits</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.85)', maxWidth: '680px', lineHeight: '1.7' }}>
            High-output brushless motors, carbon fiber airframes, wireless SpeedyBee stacks, and complete Arduino & ESP32-CAM robotics development kits. Tap any component to see brand details, quantity, and what's in the box!
          </p>
        </div>
      </div>

      {/* Category Pills & Search Navigator */}
      <section style={{ background: 'var(--off-white)', padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="uav-tabs" style={{ margin: 0, flexWrap: 'wrap' }}>
            <button className={`uav-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
              All Products ({products.length})
            </button>
            <button className={`uav-tab ${category === 'parts' ? 'active' : ''}`} onClick={() => setCategory('parts')}>
              <Wrench size={14} style={{ marginRight: '4px' }} /> Drone Parts
            </button>
            <button className={`uav-tab ${category === 'robotics' ? 'active' : ''}`} onClick={() => setCategory('robotics')}>
              <Layers size={14} style={{ marginRight: '4px' }} /> Robotics Kits
            </button>
            <button className={`uav-tab ${category === 'electronics' ? 'active' : ''}`} onClick={() => setCategory('electronics')}>
              <Cpu size={14} style={{ marginRight: '4px' }} /> Stacks & Electronics
            </button>
            <button className={`uav-tab ${category === '3d-parts' ? 'active' : ''}`} onClick={() => setCategory('3d-parts')}>
              <Printer size={14} style={{ marginRight: '4px' }} /> 3D Accessories
            </button>
          </div>

          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#888' }} />
            <input
              type="text"
              placeholder="Search by Product ID, component, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '.65rem 1rem .65rem 2.5rem',
                borderRadius: '50px',
                border: '1.5px solid rgba(0,200,255,.3)',
                background: 'white',
                fontFamily: 'var(--font-body)',
                fontSize: '.9rem'
              }}
            />
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section style={{ background: '#ffffff', padding: '3rem 2rem 5rem' }}>
        <div className="section-inner">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
              <p>Loading live components from warehouse...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
              <h3>No matching products found</h3>
              <p>Try searching for a different term or clear the filter.</p>
              <button onClick={() => { setCategory('all'); setSearchTerm(''); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid-4">
              {filteredProducts.map((p) => {
                const numPrice = typeof p.price === 'number'
                  ? p.price
                  : parseInt(String(p.price).replace(/[^0-9]/g, ''), 10) || 0;

                const images = Array.isArray(p.images) && p.images.length > 0
                  ? p.images
                  : [p.image || '/images/fpv_racing_drone.jpg'];

                const stockCount = typeof p.quantity === 'number' ? p.quantity : 30;

                return (
                  <div
                    key={p.id}
                    className="card"
                    onClick={() => navigate(`/products/${p.id}`)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(10,15,46,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                  >
                    {/* Multi-Photo Sliding Carousel Header */}
                    <div style={{ position: 'relative' }}>
                      <ImageSlider
                        images={images}
                        alt={p.name}
                        aspectRatio="4/3"
                        showThumbnails={false}
                        compact={true}
                      />

                      {/* Badges on Top */}
                      <span
                        className="badge badge-new"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          zIndex: 4,
                          fontSize: '0.68rem',
                          padding: '3px 8px'
                        }}
                      >
                        {p.isKit ? 'ROBOTICS KIT' : 'DRONE PART'}
                      </span>

                      {/* Open in New Window Quick Action */}
                      <a
                        href={`/products/${p.id}`}
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
                          {p.category || (p.isKit ? 'Robotics Kit' : 'Component')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: '#0369a1',
                            backgroundColor: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}
                          title="Product ID / SKU"
                        >
                          ID: {p.productId || p.id}
                        </span>
                      </div>

                      {/* Name & Stock Quantity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <Link
                          to={`/products/${p.id}`}
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
                            title={p.name}
                          >
                            {p.name}
                          </h4>
                        </Link>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: stockCount <= 0 ? '#ffffff' : (stockCount > 5 ? '#065f46' : '#991b1b'),
                            backgroundColor: stockCount <= 0 ? '#ef4444' : (stockCount > 5 ? '#d1fae5' : '#fee2e2'),
                            padding: '2px 7px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          {stockCount <= 0 ? 'Out of Stock' : `${stockCount} in stock`}
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
                          title={p.desc}
                        >
                          {p.desc || 'High performance genuine component.'}
                        </span>
                        <Link
                          to={`/products/${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: '#0077b6',
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

                      {/* Price & Action Row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                        <div className="card-price" style={{ color: '#0a0f2e', fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                          ₹{numPrice.toLocaleString('en-IN')}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link
                            to={`/products/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              padding: '0.45rem 0.65rem',
                              borderRadius: '7px',
                              border: '1.5px solid #00c8ff',
                              backgroundColor: 'rgba(0,200,255,0.06)',
                              color: '#0077b6',
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

                          {stockCount <= 0 ? (
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
                                handleBuy(p);
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
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
