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
  Share2,
  Cpu,
  Shield,
  Check,
  Info
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
  const [selectedMaterial, setSelectedMaterial] = useState('PLA'); // 'PLA' (Hard Plastic) or 'TPU' (Soft & Flexible)
  const [showCustomPhotoSection, setShowCustomPhotoSection] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState(null);
  const [engravingText, setEngravingText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const MATERIAL_OPTIONS = [
    {
      id: 'PLA',
      name: 'PLA (Hard Plastic)',
      tag: 'RIGID & DURABLE',
      desc: 'High-precision thermoplastic hard plastic. Ideal for sharp detail statues, figures, and crisp geometries.',
      priceOffset: 0
    },
    {
      id: 'TPU',
      name: 'TPU (Soft & Flexible)',
      tag: 'ELASTIC & BENDABLE',
      desc: 'Flexible rubber-like elastomer. Bends and flexes without cracking, excellent for impact-proof parts.',
      priceOffset: 120
    }
  ];

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

  const p8 = typeof item.price8Inch === 'number' && item.price8Inch > 0
    ? item.price8Inch
    : (item.sizeOptions?.find((s) => s.size.includes('8'))?.price || basePrice);

  const p6 = typeof item.price6Inch === 'number' && item.price6Inch > 0
    ? item.price6Inch
    : (item.sizeOptions?.find((s) => s.size.includes('6'))?.price || Math.max(299, p8 - 250));

  const p10 = typeof item.price10Inch === 'number' && item.price10Inch > 0
    ? item.price10Inch
    : (item.sizeOptions?.find((s) => s.size.includes('10'))?.price || (p8 + 450));

  const sizeOptions = [
    { size: "6 inch (150mm)", price: p6, printTime: "3h 45m", weight: "120g" },
    { size: "8 inch (200mm)", price: p8, printTime: "6h 30m", weight: "240g" },
    { size: "10 inch (250mm)", price: p10, printTime: "11h 15m", weight: "420g" }
  ];

  const currentOption = sizeOptions[selectedSizeIndex] || sizeOptions[1] || sizeOptions[0];
  const currentMaterial = MATERIAL_OPTIONS.find((m) => m.id === selectedMaterial) || MATERIAL_OPTIONS[0];

  const unitPrice = currentOption.price + (currentMaterial.priceOffset || 0);
  const totalPrice = unitPrice * quantity;

  // Calculate dynamic weight & print time
  const baseWeightNum = parseInt(String(currentOption.weight || '240g').replace(/[^0-9]/g, ''), 10) || 240;
  const calculatedWeight = baseWeightNum;

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
        id: `${item.id}-${currentOption.size.replace(/[^a-zA-Z0-9]/g, '')}-25strength-${selectedMaterial}`,
        name: item.name,
        category: item.category || '3D Studio',
        brand: item.brand || 'P_Brothers × NaviDron 3D',
        size: currentOption.size,
        strength: '25% Strength',
        infill: '25%',
        material: currentMaterial.name,
        materialType: selectedMaterial,
        printTime: currentOption.printTime,
        price: unitPrice,
        quantity: quantity,
        image: images[0],
        customEngraving: engravingText || undefined,
        uploadedPhoto: uploadedPhotoPreview || undefined,
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
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>FDM Precision</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>0.2mm layer &bull; 0.4mm nozzle</div>
                </div>
                <div>
                  <Truck size={20} color="#10b981" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>PLA & TPU Materials</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Hard plastic & flexible rubber</div>
                </div>
                <div>
                  <RotateCcw size={20} color="#ff00aa" style={{ margin: '0 auto 0.35rem' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0a0f2e' }}>Quality Guarantee</div>
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
                <CheckCircle2 size={14} /> FDM Printed & Dispatched
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
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0a0f2e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Ruler size={16} color="#00c8ff" /> 1. Select Print Size (Scale):
                </label>
                <span style={{ fontSize: '0.78rem', color: '#00c8ff', fontWeight: 700 }}>
                  Larger sizes scale print volume & weight
                </span>
              </div>

              {/* Size Buttons Grid (Clean sizes without price increments) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
                {sizeOptions.map((opt, idx) => {
                  const isSelected = idx === selectedSizeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      style={{
                        padding: '0.9rem 0.6rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #00c8ff' : '1.5px solid #cbd5e1',
                        backgroundColor: isSelected ? 'rgba(0, 200, 255, 0.08)' : '#ffffff',
                        color: isSelected ? '#0077b6' : '#334155',
                        fontWeight: 800,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 12px rgba(0,200,255,0.25)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>{opt.size}</div>
                    </button>
                  );
                })}
              </div>

              {/* Casual 25% Strength Indicator */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.9rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color="#0284c7" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0a0f2e' }}>
                    Density:
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      padding: '2px 9px',
                      borderRadius: '6px'
                    }}
                  >
                    25% Strength
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Casual solid core infill — optimal durability & finish
                </span>
              </div>

              {/* 2. MATERIAL SELECTION: PLA (Hard Plastic) vs TPU (Soft Flexible) */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0a0f2e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={16} color="#10b981" /> 2. 3D Filament Material:
                  </label>
                  <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 700 }}>
                    PLA (Hard) vs TPU (Soft)
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {MATERIAL_OPTIONS.map((mat) => {
                    const isSelected = selectedMaterial === mat.id;
                    return (
                      <div
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #10b981' : '1.5px solid #cbd5e1',
                          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 0 12px rgba(16,185,129,0.2)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isSelected ? '#047857' : '#0a0f2e' }}>
                            {mat.name}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? '#047857' : '#64748b' }}>
                            {mat.priceOffset === 0 ? 'Included' : `+₹${mat.priceOffset}`}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                          {mat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Live Print Metrics Breakdown (FDM Specifications) */}
              <div
                style={{
                  backgroundColor: '#f8faff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.9rem 1.1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.85rem',
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
                    <Layers size={13} color="#10b981" /> Filament Net Weight:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    ~{calculatedWeight}g ({selectedMaterial})
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} color="#0284c7" /> Layer Precision:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    0.2mm Ultra-Fine Detail
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Cpu size={13} color="#ff00aa" /> Printer & Nozzle:
                  </span>
                  <strong style={{ color: '#0a0f2e', fontSize: '0.92rem', display: 'block', marginTop: '2px' }}>
                    Industrial FDM &bull; 0.4mm
                  </strong>
                </div>
              </div>
            </div>

            {/* Custom Photo Upload Section (Always available for Portrait / Lithophane / Custom 3D Figure) */}
            <div
              style={{
                backgroundColor: '#fffdf5',
                border: uploadedPhotoPreview ? '1.5px solid #10b981' : '1.5px dashed #f59e0b',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={17} color="#d97706" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e' }}>
                    Attach Your Photo For 3D Portrait / Lithophane / Custom Figure
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                  Displayed in Admin Packaging
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Upload your picture for a 3D curved lithophane or personalized custom figure. The image will be directly linked with your order so our technicians can prepare your print.
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
                    border: '1.5px solid #f59e0b',
                    color: '#b45309',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} /> {uploadedPhotoPreview ? 'Change Attached Photo' : 'Upload Customer Photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>

                {uploadedPhotoPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img
                      src={uploadedPhotoPreview}
                      alt="Uploaded Preview"
                      style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #10b981' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'block' }}>
                        ✓ Photo attached successfully!
                      </span>
                      <button
                        type="button"
                        onClick={() => setUploadedPhotoPreview(null)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}
                      >
                        Remove photo
                      </button>
                    </div>
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

            {/* Material & Print Details Table (100% FDM) */}
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
                🖨️ FDM 3D Manufacturing Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Printer Architecture:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>Industrial FDM (Fused Deposition Modeling)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Extrusion Nozzle:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>0.4mm High-Precision Brass Nozzle</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Layer Precision:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>0.2mm Ultra-Fine Detail</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Selected Material:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>{currentMaterial.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Core Infill / Strength:</span>
                <span style={{ fontWeight: 700, color: '#0077b6' }}>25% Strength Solid Core</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.65rem 1rem' }}>
                <span style={{ color: '#64748b' }}>Post-Processing:</span>
                <span style={{ fontWeight: 600, color: '#0a0f2e' }}>Support Removal, Heat-Deburred & Quality Verified</span>
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
