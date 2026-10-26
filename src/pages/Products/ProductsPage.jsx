import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Star, Search, Wrench, Cpu, Printer, Sparkles, Check, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDroneAccessories, getRoboticsKits } from '../../services/firebase';

export default function ProductsPage({ onOpenQuote, onAddToCart }) {
  const [searchParams] = useSearchParams();
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
      (p.desc || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleBuy = (item) => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const numPrice = typeof item.price === 'number'
      ? item.price
      : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;

    if (onAddToCart) {
      onAddToCart({
        id: item.id,
        name: item.name,
        category: item.category || (item.isKit ? 'Robotics Kit' : 'Drone Component'),
        price: numPrice,
        quantity: 1,
        image: item.image || '/images/fpv_racing_drone.jpg'
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
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
            📦 Official NaviDron Warehouse & Robotics Labs
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, marginBottom: '1rem' }}>
            Drone Parts, Electronics & <span style={{ color: 'var(--neon)' }}>Robotics Kits</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: '650px', lineHeight: '1.7' }}>
            High-thrust brushless motors, 6S ESC stacks, DJI O3 digital HD units, robot car chassis, Arduino/ESP32 kits, and impact-absorbing 3D mounts. Controlled & priced directly from our Operations Hub.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section style={{ padding: '2.5rem 2rem 1.5rem', background: 'var(--off-white)' }}>
        <div className="section-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="uav-tabs" style={{ margin: 0 }}>
            <button className={`uav-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
              All Items ({products.length})
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

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: '#888' }} />
            <input
              type="text"
              placeholder="Search components or kits..."
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
              <p>Loading live components from database...</p>
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
                return (
                  <div key={p.id} className="card">
                    <div style={{ position: 'relative' }}>
                      <img src={p.image} alt={p.name} className="card-img" />
                      <span className="badge badge-new" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        {p.isKit ? 'ROBOTICS KIT' : 'DRONE PART'}
                      </span>
                      {p.quantity !== undefined && (
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#10b981', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>
                          {p.quantity > 0 ? `${p.quantity} in stock` : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="card-tag" style={{ color: p.isKit ? '#10b981' : 'var(--neon)' }}>
                        {p.category || (p.isKit ? 'Robotics Kit' : 'Drone Component')}
                      </div>
                      <h4 className="card-title" style={{ fontSize: '.95rem' }}>{p.name}</h4>
                      <p className="card-text">{p.desc}</p>
                      <div className="card-price" style={{ color: 'var(--navy)' }}>
                        ₹{numPrice.toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => handleBuy(p)}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '.75rem', padding: '.65rem 1rem', fontSize: '.84rem' }}
                      >
                        <ShoppingCart size={14} /> Add to Flight Cart
                      </button>
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
