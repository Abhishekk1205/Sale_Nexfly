import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsData } from '../../data/productsData';
import { ShoppingCart, Star, Search, Wrench, Cpu, Printer, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductsPage({ onOpenQuote }) {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [category, setCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const c = searchParams.get('category');
    if (c) setCategory(c);
    document.title = "Drone Parts, Electronics & 3D Accessories | NaviDron Store";
  }, [searchParams]);

  const filteredProducts = productsData.filter((p) => {
    const matchesCategory = category === 'all' || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBuy = (item) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
    onOpenQuote();
  };

  return (
    <div style={{ paddingTop: '74px' }}>
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
            📦 Official NaviDron Warehouse
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Drone Parts, Electronics & <span style={{ color: 'var(--neon)' }}>3D Spares</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.7' }}>
            High-thrust brushless motors, 6S ESC stacks, DJI O3 digital HD units, and impact-absorbing 3D printed TPU mounts. Tested by pilots for pilots.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section style={{ padding: '2.5rem 2rem 1.5rem', background: 'var(--off-white)' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="uav-tabs" style={{ margin: 0 }}>
            <button className={`uav-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
              All Products
            </button>
            <button className={`uav-tab ${category === 'parts' ? 'active' : ''}`} onClick={() => setCategory('parts')}>
              <Wrench size={14} style={{ marginRight: '4px' }} /> Drone Motors & Frames
            </button>
            <button className={`uav-tab ${category === 'electronics' ? 'active' : ''}`} onClick={() => setCategory('electronics')}>
              <Cpu size={14} style={{ marginRight: '4px' }} /> Stacks & Electronics
            </button>
            <button className={`uav-tab ${category === '3d-parts' ? 'active' : ''}`} onClick={() => setCategory('3d-parts')}>
              <Printer size={14} style={{ marginRight: '4px' }} /> 3D Printed Accessories
            </button>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#888' }} />
            <input
              type="text"
              placeholder="Search components..."
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
      <section style={{ background: '#fff' }}>
        <div className="section-inner">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
              <h3>No matching products found</h3>
              <p>Try searching for a different term or clear the filter.</p>
              <button onClick={() => { setCategory('all'); setSearchTerm(''); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="card">
                  <div style={{ position: 'relative' }}>
                    <img src={p.image} alt={p.name} className="card-img" />
                    <span className="badge badge-new" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ffb300', fontSize: '.8rem', marginBottom: '.4rem' }}>
                      <Star size={14} fill="#ffb300" />
                      <span>{p.rating} / 5.0</span>
                    </div>
                    <h4 className="card-title" style={{ fontSize: '.95rem' }}>{p.name}</h4>
                    <p className="card-text">{p.desc}</p>
                    <div className="card-price" style={{ color: 'var(--neon)' }}>
                      {p.price}
                    </div>
                    <button
                      onClick={() => handleBuy(p)}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                    >
                      <ShoppingCart size={14} /> Buy / Inquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
