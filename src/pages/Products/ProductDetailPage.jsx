import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Package,
  Layers,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Star,
  Share2,
  Tag,
  Wrench,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getDroneAccessories,
  getRoboticsKits,
  INITIAL_DRONE_ACCESSORIES,
  INITIAL_ROBOTICS_KITS
} from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function ProductDetailPage({ onAddToCart, onOpenQuote }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [parts, kits] = await Promise.all([
          getDroneAccessories(),
          getRoboticsKits()
        ]);
        const combined = [
          ...parts.map((p) => ({ ...p, isKit: false })),
          ...kits.map((k) => ({ ...k, isKit: true, category: k.kitType || 'Robotics Kit' }))
        ];

        let found = combined.find((p) => p.id === id);
        if (!found) {
          const fallbackCombined = [
            ...INITIAL_DRONE_ACCESSORIES.map((p) => ({ ...p, isKit: false })),
            ...INITIAL_ROBOTICS_KITS.map((k) => ({ ...k, isKit: true, category: k.kitType || 'Robotics Kit' }))
          ];
          found = fallbackCombined.find((p) => p.id === id) || fallbackCombined[0];
        }
        setProduct(found);
        document.title = `${found?.name || 'Product Details'} | NaviDron Store`;
      } catch (e) {
        console.error('Error fetching product details:', e);
        const fallback = INITIAL_ROBOTICS_KITS[0];
        setProduct({ ...fallback, isKit: true });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#00c8ff', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontWeight: 600 }}>Loading Drone Part & Robotics Kit Specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '70vh', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested item could not be found in our warehouse.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Warehouse Catalog
        </Link>
      </div>
    );
  }

  const numPrice = typeof product.price === 'number'
    ? product.price
    : parseInt(String(product.price).replace(/[^0-9]/g, ''), 10) || 1299;

  const totalPrice = numPrice * quantity;
  const stockCount = typeof product.quantity === 'number' ? product.quantity : 35;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || '/images/college_project_drone.jpg'];

  const boxItems = Array.isArray(product.boxIncludes) && product.boxIncludes.length > 0
    ? product.boxIncludes
    : [
        `1x ${product.name}`,
        "1x High-Tensile Mounting Hardware & Standoff Pack",
        "1x NaviDron Component Wiring Schematic & Testing Guide",
        "1x Quality Assurance & Authenticity Card"
      ];

  const specsList = Array.isArray(product.specs) && product.specs.length > 0
    ? product.specs
    : [
        { label: "Category", val: product.category || (product.isKit ? "Robotics Kit" : "Drone Part") },
        { label: "Brand", val: product.brand || "NaviDron Robotics" },
        { label: "Warranty", val: "6 Months Replacement Warranty" },
        { label: "Condition", val: "Brand New, Factory Sealed & QC Tested" }
      ];

  const handleAddToCart = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}

    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        category: product.category || (product.isKit ? 'Robotics Kit' : 'Drone Component'),
        brand: product.brand || 'NaviDron Robotics',
        price: numPrice,
        quantity: quantity,
        image: images[0]
      });
    } else if (onOpenQuote) {
      onOpenQuote();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ paddingTop: '84px', backgroundColor: '#ffffff', minHeight: '100vh', color: '#0a0f2e' }}>
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafcff' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link to="/products" style={{ color: '#64748b', textDecoration: 'none' }}>Drone Parts & Robotics</Link>
            <span>/</span>
            <span style={{ color: '#0a0f2e', fontWeight: 600 }}>{product.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleCopyLink}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share Product'}
            </button>

            <a
              href={`/products/${product.id}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#00c8ff',
                backgroundColor: 'rgba(0,200,255,0.08)',
                border: '1px solid rgba(0,200,255,0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={13} /> Open in New Window
            </a>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem 4.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT: Multi-Photo Slider Gallery */}
          <div>
            <div style={{ position: 'sticky', top: '100px' }}>
              <ImageSlider
                images={images}
                alt={product.name}
                aspectRatio="4/3"
                showThumbnails={true}
              />

              {/* Verified Quality & Warehouse Dispatch Strip */}
              <div
                style={{
                  marginTop: '1.75rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8faff',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  textAlign: 'center'
                }}
              >
                <div>
                  <ShieldCheck size={20} color="#00c8ff" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>Genuine Brand</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>100% Original Components</div>
                </div>
                <div>
                  <Truck size={20} color="#10b981" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>Fast Express Delivery</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Dispatches within 24 hours</div>
                </div>
                <div>
                  <RotateCcw size={20} color="#ff00aa" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>Quality Guarantee</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Tested on hardware jig</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Brand, Stock, Box Includes & Specs */}
          <div>
            {/* Tag, Brand & Stock Quantity Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#00c8ff',
                  backgroundColor: 'rgba(0,200,255,0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}
              >
                {product.category || (product.isKit ? 'Robotics Kit' : 'Drone Component')}
              </span>

              {/* STOCK QUANTITY BADGE */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: stockCount > 5 ? '#065f46' : '#991b1b',
                  backgroundColor: stockCount > 5 ? '#d1fae5' : '#fee2e2',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Package size={13} /> In Stock: <strong>{stockCount} units</strong> available
              </span>

              <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} color="#10b981" /> NaviDron Warehouse Verified
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
                fontWeight: 900,
                color: '#0a0f2e',
                lineHeight: 1.25,
                marginBottom: '0.6rem'
              }}
            >
              {product.name}
            </h1>

            {/* BRAND DETAILS (Explicitly highlighted as requested) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem',
                backgroundColor: '#f8faff',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <span style={{ color: '#475569' }}>
                Brand / Manufacturer:
              </span>
              <span
                style={{
                  color: '#0077b6',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Tag size={14} color="#00c8ff" /> {product.brand || (product.isKit ? 'NaviDron Robotics Edu' : 'T-Motor Aviation')}
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={14} fill="#f59e0b" />
                <span>4.8 / 5.0</span>
                <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>(84 verified makers)</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '1.75rem' }}>
              {product.desc}
            </p>

            {/* WHAT'S IN THE BOX SECTION */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <Package size={18} color="#00c8ff" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e', margin: 0 }}>
                  What's In The Box ({boxItems.length} Components Included)
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.5rem' }}>
                {boxItems.map((boxIt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.84rem',
                      color: '#334155',
                      padding: '0.35rem 0'
                    }}
                  >
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{boxIt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TECHNICAL SPECIFICATIONS TABLE */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                marginBottom: '1.75rem',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ backgroundColor: '#f8faff', padding: '0.75rem 1rem', fontWeight: 800, color: '#0a0f2e', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={16} color="#00c8ff" /> Technical Specifications & Parameters
              </div>
              {specsList.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '0.65rem 1rem',
                    borderBottom: sIdx === specsList.length - 1 ? 'none' : '1px solid #f1f5f9',
                    backgroundColor: sIdx % 2 === 0 ? '#ffffff' : '#fafcff'
                  }}
                >
                  <span style={{ color: '#64748b', fontWeight: 500 }}>{spec.label}:</span>
                  <span style={{ fontWeight: 700, color: '#0a0f2e' }}>{spec.val}</span>
                </div>
              ))}
            </div>

            {/* Pricing Strip & Quantity */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: '14px',
                backgroundColor: '#f8faff',
                border: '1.5px solid #e2e8f0',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Price ({quantity} {quantity > 1 ? 'Units' : 'Unit'}):
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 900, color: '#0a0f2e' }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    (₹{numPrice.toLocaleString('en-IN')} / unit)
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: '34px', height: '34px', backgroundColor: '#ffffff', color: '#0a0f2e', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ width: '38px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                    style={{ width: '34px', height: '34px', backgroundColor: '#ffffff', color: '#0a0f2e', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS: Add to Cart and Buy Option */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #00c8ff',
                  color: '#0077b6',
                  fontFamily: 'var(--font-head)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(0,200,255,0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,200,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ShoppingCart size={18} /> Add to Flight Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#00c8ff',
                  backgroundImage: 'linear-gradient(135deg, #00c8ff 0%, #0066ff 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontFamily: 'var(--font-head)',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,102,255,0.35)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,102,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,102,255,0.35)';
                }}
              >
                <Zap size={18} /> Buy Now (Instant Checkout)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
