import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingCart, Sparkles, ArrowRight, Eye, Check, X, Tag, Package, ShieldCheck } from 'lucide-react';
import { getHomeProducts } from '../../../services/firebase';
import confetti from 'canvas-confetti';

export default function ActionFiguresSale({ onOpenQuote, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await getHomeProducts();
        if (mounted && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Error loading home products:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const handleAddToCartClick = (item, qty = 1, e) => {
    if (e) e.stopPropagation();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    const img = Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : (item.image || '/images/valorant_action_figures_1791059182363.jpg');

    if (onAddToCart) {
      onAddToCart({
        id: item.id || `hp-${Date.now()}`,
        productId: item.productId || item.id,
        name: item.name,
        category: item.category || 'Featured',
        price: numPrice,
        quantity: qty,
        image: img
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  const openQuickView = (item, e) => {
    if (e) e.stopPropagation();
    setQuickViewItem(item);
    setQuickViewQty(1);
    setActiveImageIdx(0);
  };

  const closeQuickView = () => {
    setQuickViewItem(null);
    setQuickViewQty(1);
    setActiveImageIdx(0);
  };

  // Filter products by category
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  // Marquee products (show products marked for marquee, fallback to first 8)
  const marqueeList = products.filter((p) => p.showInMarquee !== false);
  const marqueeItems = marqueeList.length > 0 ? marqueeList : products;

  return (
    <section id="action-figures">
      <div className="section-inner">
        {/* Section Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="section-tag">
            <Flame size={14} color="#ff3366" />
            Home Store & Hot Deals
          </div>
          <h2 className="section-title">
            Featured <span>Products & Models</span><br />
            Now on <span className="grad">Sale!</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem' }}>
            Valorant agents, GTA 6 collectibles, custom drones, anime heroes, robotics kits & gift sets — live inventory with real-time ordering and door-to-door delivery.
          </p>
        </div>

        {/* Pulsing Sale Banner */}
        <div className="sale-banner">
          <div className="sale-title">🔥 MEGA SALE — SPECIAL DISCOUNT ON ALL HOME FEATURED PRODUCTS!</div>
          <div className="sale-subtitle">
            Verified Product IDs • Fast Pan-India Delivery • Instant Online Checkout & Live Order Tracking
          </div>
        </div>

        {/* Dynamic Marquee Ticker */}
        {marqueeItems.length > 0 && (
          <div className="figure-marquee-wrap">
            <div className="figure-marquee">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => {
                const img = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || '/images/valorant_action_figures_1791059182363.jpg');
                const priceFormatted = typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : String(item.price);
                const oldPriceFormatted = item.oldPrice ? (typeof item.oldPrice === 'number' ? `₹${item.oldPrice.toLocaleString('en-IN')}` : String(item.oldPrice)) : null;

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="figure-card"
                    onClick={() => openQuickView(item)}
                    title="Click to view details & order"
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img src={img} alt={item.name} />
                      {item.productId && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(10,15,46,0.85)',
                            color: 'var(--neon)',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontFamily: 'monospace'
                          }}
                        >
                          {item.productId}
                        </span>
                      )}
                    </div>
                    <div className="figure-card-body">
                      <div className="figure-card-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div className="figure-card-price">
                        {priceFormatted}{' '}
                        {oldPriceFormatted && (
                          <small style={{ textDecoration: 'line-through', color: '#999', fontSize: '.75rem' }}>
                            {oldPriceFormatted}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              margin: '2.5rem 0 1.5rem'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'var(--neon)' : '#ffffff',
                  color: activeCategory === cat ? 'var(--navy)' : '#64748b',
                  border: activeCategory === cat ? '1px solid var(--neon)' : '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '0.45rem 1.15rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(0,255,204,0.35)' : 'none'
                }}
              >
                {cat === 'all' ? '🌟 All Products' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Products Grid (Compact Design with Product ID, Stock, & Know more) */}
        <div className="grid-3" style={{ marginTop: '1.5rem', gap: '1.5rem' }}>
          {filteredProducts.map((item) => {
            const stockCount = typeof item.quantity === 'number'
              ? item.quantity
              : (item.quantity !== undefined ? parseInt(String(item.quantity), 10) || 0 : 25);
            const isOutOfStock = stockCount <= 0;

            const numPrice = typeof item.price === 'number'
              ? item.price
              : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

            const img = Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : (item.image || '/images/valorant_action_figures_1791059182363.jpg');

            return (
              <div
                key={item.id}
                className="card"
                onClick={() => openQuickView(item)}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(10,15,46,0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Image Header with Badge and Product ID */}
                <div style={{ position: 'relative', width: '100%', height: '230px', overflow: 'hidden', background: '#f8fafc' }}>
                  <img
                    src={img}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    className="card-img"
                  />

                  {/* Top Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                    <span className="badge badge-sale" style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 800 }}>
                      {item.badge || 'SALE'}
                    </span>
                  </div>

                  {/* Product ID Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(10, 15, 46, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--neon)',
                      fontSize: '0.72rem',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 255, 204, 0.4)',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                    }}
                    title={`Product ID: ${item.productId || item.id}`}
                  >
                    ID: {item.productId || item.id}
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category & Stock Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.category || 'Featured'}
                    </span>
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

                  {/* Compact Product Name */}
                  <h4
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0a0f2e',
                      margin: '0 0 0.45rem',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </h4>

                  {/* Single Line Description with "Know more" in last */}
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748b',
                      lineHeight: 1.4,
                      marginBottom: '0.85rem',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.35rem',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {item.desc || 'High precision manufactured collectible with fine-grade finish.'}
                    </span>
                    <span
                      onClick={(e) => openQuickView(item, e)}
                      style={{
                        color: 'var(--blue)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Know more &rarr;
                    </span>
                  </div>

                  {/* Price & Actions Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f1f5f9',
                      gap: '0.65rem'
                    }}
                  >
                    <div style={{ color: 'var(--navy)', fontSize: '1.25rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
                      ₹{numPrice.toLocaleString('en-IN')}{' '}
                      {item.oldPrice && item.oldPrice > numPrice && (
                        <small style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginLeft: '3px' }}>
                          ₹{typeof item.oldPrice === 'number' ? item.oldPrice.toLocaleString('en-IN') : item.oldPrice}
                        </small>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <button
                        type="button"
                        onClick={(e) => openQuickView(item, e)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
                        title="Quick View full details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => handleAddToCartClick(item, 1, e)}
                        className="btn btn-primary"
                        style={{
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          opacity: isOutOfStock ? 0.6 : 1,
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <ShoppingCart size={13} /> {isOutOfStock ? 'Sold Out' : 'Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Store Links */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary">
            Explore All Drone & Robotics Parts <ArrowRight size={16} />
          </Link>
          <Link to="/prints" className="btn btn-secondary">
            View 3D Studio & Figures Catalog <Sparkles size={16} />
          </Link>
        </div>
      </div>

      {/* ── QUICK VIEW / ORDER MODAL ───────────────────────── */}
      {quickViewItem && (
        <div
          onClick={closeQuickView}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 46, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', padding: '1.75rem' }}>
              {/* Product Gallery & Thumbnails */}
              <div>
                {(() => {
                  const imgs = Array.isArray(quickViewItem.images) && quickViewItem.images.length > 0
                    ? quickViewItem.images
                    : [quickViewItem.image || '/images/valorant_action_figures_1791059182363.jpg'];
                  const mainImg = imgs[activeImageIdx] || imgs[0];

                  return (
                    <div>
                      <div style={{ width: '100%', height: '280px', borderRadius: '14px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <img src={mainImg} alt={quickViewItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            background: 'rgba(10,15,46,0.85)',
                            color: 'var(--neon)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontFamily: 'monospace'
                          }}
                        >
                          ID: {quickViewItem.productId || quickViewItem.id}
                        </span>
                      </div>

                      {imgs.length > 1 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                          {imgs.map((im, idx) => (
                            <img
                              key={idx}
                              src={im}
                              alt=""
                              onClick={() => setActiveImageIdx(idx)}
                              style={{
                                width: '56px',
                                height: '56px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: activeImageIdx === idx ? '2px solid var(--blue)' : '2px solid transparent'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Product Details & Order Form */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-sale" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                    {quickViewItem.badge || 'HOT'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 800, textTransform: 'uppercase' }}>
                    {quickViewItem.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy)', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                  {quickViewItem.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>
                    ₹{(typeof quickViewItem.price === 'number' ? quickViewItem.price : parseInt(String(quickViewItem.price).replace(/[^0-9]/g, ''), 10) || 0).toLocaleString('en-IN')}
                  </span>
                  {quickViewItem.oldPrice && (
                    <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.95rem' }}>
                      ₹{(typeof quickViewItem.oldPrice === 'number' ? quickViewItem.oldPrice : parseInt(String(quickViewItem.oldPrice).replace(/[^0-9]/g, ''), 10) || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                  {quickViewItem.desc || 'High precision manufactured collectible with fine-grade finish and durable composition.'}
                </p>

                {/* In-Stock Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#065f46', marginBottom: '1.25rem' }}>
                  <Check size={16} />
                  <span>
                    In Stock: <strong>{quickViewItem.quantity || 25} units available</strong>
                  </span>
                </div>

                {/* Quantity Controls & Order Button */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                        style={{ border: 'none', background: '#f8fafc', padding: '0.45rem 0.85rem', cursor: 'pointer', fontWeight: 800 }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0.45rem 1rem', fontWeight: 700, fontSize: '0.9rem', minWidth: '40px', textAlign: 'center' }}>
                        {quickViewQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickViewQty(Math.min((quickViewItem.quantity || 25), quickViewQty + 1))}
                        style={{ border: 'none', background: '#f8fafc', padding: '0.45rem 0.85rem', cursor: 'pointer', fontWeight: 800 }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCartClick(quickViewItem, quickViewQty);
                        closeQuickView();
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.75rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <ShoppingCart size={16} /> Add {quickViewQty} to Cart
                    </button>
                    {onOpenQuote && (
                      <button
                        type="button"
                        onClick={() => {
                          closeQuickView();
                          onOpenQuote();
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                      >
                        Custom Quote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
