import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Clock,
  Ruler,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  Star,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { get3DStudioItems, INITIAL_3D_STUDIO } from '../../services/firebase';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function PrintDetailPage({ onAddToCart, onOpenQuote }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(1); // default 8 inch
  const [quantity, setQuantity] = useState(1);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState(null);
  const [engravingText, setEngravingText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchItem = async () => {
      setLoading(true);
      try {
        const catalog = await get3DStudioItems();
        let found = catalog.find((i) => i.id === id);
        if (!found) {
          found = INITIAL_3D_STUDIO.find((i) => i.id === id) || INITIAL_3D_STUDIO[0];
        }
        setItem(found);
        document.title = `${found?.name || '3D Product Details'} | NaviDron 3D Studio`;
      } catch (e) {
        console.error('Error loading 3D product:', e);
        const fallback = INITIAL_3D_STUDIO.find((i) => i.id === id) || INITIAL_3D_STUDIO[0];
        setItem(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#00c8ff', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontWeight: 600 }}>Loading 3D Product Specifications...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '70vh', textAlign: 'center', background: '#ffffff' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested 3D product could not be located.</p>
        <Link to="/prints" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to 3D Studio
        </Link>
      </div>
    );
  }

  const basePrice = typeof item.price === 'number'
    ? item.price
    : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 899;

  const sizeOptions = item.sizeOptions || [
    { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 45m", weight: "120g" },
    { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 30m", weight: "240g" },
    { size: "10 inch (250mm)", priceOffset: 750, printTime: "11h 15m", weight: "420g" },
    { size: "12 inch (300mm)", priceOffset: 1300, printTime: "18h 40m", weight: "710g" }
  ];

  const currentOption = sizeOptions[selectedSizeIndex] || sizeOptions[0];
  const unitPrice = basePrice + (currentOption.priceOffset || 0);
  const totalPrice = unitPrice * quantity;

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/images/anime_figure_3d.jpg'];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (_) {}

    if (onAddToCart) {
      onAddToCart({
        id: `${item.id}-${currentOption.size.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: item.name,
        category: item.category || '3D Studio',
        size: currentOption.size,
        printTime: currentOption.printTime,
        price: unitPrice,
        quantity: quantity,
        image: images[0],
        customEngraving: engravingText || undefined,
        hasCustomPhoto: !!uploadedPhotoPreview
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
            <Link to="/prints" style={{ color: '#64748b', textDecoration: 'none' }}>3D Studio</Link>
            <span>/</span>
            <span style={{ color: '#0a0f2e', fontWeight: 600 }}>{item.name}</span>
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
              href={`/prints/${item.id}`}
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
                alt={item.name}
                aspectRatio="4/3"
                showThumbnails={true}
              />

              {/* Quality & Production Guarantees */}
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
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>8K High-Definition</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Micro-layer SLA cure</div>
                </div>
                <div>
                  <Truck size={20} color="#10b981" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>Break-Proof Box</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Custom foam encased</div>
                </div>
                <div>
                  <RotateCcw size={20} color="#ff00aa" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>7-Day Guarantee</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Free reprint if defect</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Specs, Size Calculator & Buy Controls */}
          <div>
            {/* Category & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
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
                {item.category || '3D Studio'}
              </span>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    backgroundColor: '#ff00aa',
                    padding: '3px 9px',
                    borderRadius: '20px'
                  }}
                >
                  {item.badge}
                </span>
              )}

              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Ready to Print & Dispatch
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
                fontWeight: 900,
                color: '#0a0f2e',
                lineHeight: 1.25,
                marginBottom: '0.6rem'
              }}
            >
              {item.name}
            </h1>

            {/* Brand & Rating Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>
                Studio / Brand: <strong style={{ color: '#0a0f2e' }}>{item.brand || 'P_Brothers × NaviDron 3D'}</strong>
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={14} fill="#f59e0b" />
                <span>4.9 / 5.0</span>
                <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>(128 verified prints)</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '1.75rem' }}>
              {item.desc}
            </p>

            {/* SIZE SELECTION & DYNAMIC PRICE CALCULATOR */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.75rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0a0f2e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Ruler size={16} color="#00c8ff" /> Select Print Size (Scale):
                </label>
                <span style={{ fontSize: '0.78rem', color: '#00c8ff', fontWeight: 700 }}>
                  Larger sizes include more material & fine-layer detail
                </span>
              </div>

              {/* Size Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {sizeOptions.map((opt, idx) => {
                  const isSelected = idx === selectedSizeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #00c8ff' : '1.5px solid #cbd5e1',
                        backgroundColor: isSelected ? 'rgba(0, 200, 255, 0.08)' : '#ffffff',
                        color: isSelected ? '#0077b6' : '#334155',
                        fontWeight: 700,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 12px rgba(0,200,255,0.25)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>{opt.size}</div>
                      <div style={{ fontSize: '0.72rem', color: isSelected ? '#0284c7' : '#64748b', marginTop: '2px' }}>
                        {opt.priceOffset === 0 ? 'Base Price' : `+₹${opt.priceOffset}`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Live Print Metrics Breakdown */}
              <div
                style={{
                  backgroundColor: '#f8faff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '0.75rem',
                  fontSize: '0.82rem'
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="#00c8ff" /> Estimated Print Time:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    {currentOption.printTime || '6h 30m'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} color="#10b981" /> Cured Solid Weight:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    ~{currentOption.weight || '240g'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} color="#ff00aa" /> Layer Precision:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    {item.layerHeight || '0.08mm Fine'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Custom Photo Upload Section (if Personal Character or customer wishes to customize) */}
            {(item.category === 'Personal Character' || item.id.includes('custom') || item.id.includes('litho')) && (
              <div
                style={{
                  backgroundColor: '#fff5fb',
                  border: '1.5px dashed #ff00aa',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Upload size={17} color="#ff00aa" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#9d0208' }}>
                    Attach Photo For 3D Sculpting (Required for Personalized Keepsakes)
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Upload a clear portrait or full-body photo. Our digital 3D modelers will replicate facial features, clothes, and hair.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #ff00aa',
                      color: '#ff00aa',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={14} /> Choose Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>

                  {uploadedPhotoPreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={uploadedPhotoPreview}
                        alt="Preview"
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ff00aa' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                        ✓ Photo attached successfully!
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.85rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                    Optional Custom Name Engraving Plaque:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Happy 25th Birthday Priyanshu!"
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Material & Print Details Table */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                marginBottom: '1.75rem',
                fontSize: '0.84rem'
              }}
            >
              <div style={{ backgroundColor: '#f8faff', padding: '0.75rem 1rem', fontWeight: 800, color: '#0a0f2e', borderBottom: '1px solid #e2e8f0' }}>
                🖨️ Additive Manufacturing Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Resin Material:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>{item.material || 'SLA UV Tough Polymer (Grey)'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Layer Precision:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>{item.layerHeight || '0.08mm Ultra-Fine Detail'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Internal Core:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>{item.infill || '100% Solid Impact Resistant'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem' }}>
                <span style={{ color: '#64748b' }}>Surface Finishing:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>Hand-Sanded & Matte UV Sealed</span>
              </div>
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
                  Total Price ({quantity} {quantity > 1 ? 'Units' : 'Unit'} — {currentOption.size}):
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', fontWeight: 900, color: '#0a0f2e' }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    (₹{unitPrice.toLocaleString('en-IN')} / item)
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Qty:</span>
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
                    onClick={() => setQuantity((q) => q + 1)}
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
