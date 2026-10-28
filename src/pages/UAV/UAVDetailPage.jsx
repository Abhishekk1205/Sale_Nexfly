import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Zap,
  Rocket,
  Gauge,
  Battery,
  Radio,
  Compass,
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
  PlusCircle,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUAVPreBuilt, INITIAL_UAV_PREBUILT } from '../../services/firebase';
import { uavCategories } from '../../data/uavData';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

export default function UAVDetailPage({ onAddToCart, onOpenQuote }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drone, setDrone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDrone = async () => {
      setLoading(true);
      try {
        const uavCatalog = await getUAVPreBuilt();
        let found = uavCatalog.find((d) => d.id === id);

        // Fallback search in static categories if id is formatted from category model
        if (!found) {
          for (const cat of uavCategories) {
            for (const mod of cat.models) {
              const modId = `uav-${mod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
              if (modId === id || mod.name.toLowerCase().includes(id.toLowerCase())) {
                found = {
                  id: modId,
                  name: mod.name,
                  type: cat.title,
                  brand: "NaviDron AeroLab India",
                  price: parseInt(String(mod.price).replace(/[^0-9]/g, ''), 10) || 14999,
                  quantity: 8,
                  image: mod.img || cat.image,
                  images: [mod.img || cat.image, "/images/hero_drone_bg.jpg", "/images/college_project_drone.jpg"],
                  desc: mod.desc || cat.desc,
                  maxSpeed: mod.speed,
                  weight: mod.weight,
                  flightTime: cat.specs.find((s) => s.key.includes('Flight'))?.val || "8–12 mins",
                  range: "3.5 km",
                  components: [
                    { part: "Airframe", detail: "Full Carbon Fiber 3K Unibody Frame" },
                    { part: "Flight Controller", detail: "F405 Betaflight Wireless OSD" },
                    { part: "Motors", detail: "Brushless High-Output Motor Set" },
                    { part: "Propellers", detail: "Polycarbonate High-Efficiency Props" },
                    { part: "FPV System", detail: "Low-Latency Live Transmission Camera" },
                    { part: "Radio Link", detail: "ExpressLRS 2.4GHz Diversity RX" }
                  ],
                  availableAddons: [
                    { id: "gps", name: "M10 Precision GPS + Return-To-Home Rescue Compass", price: 1499 },
                    { id: "telemetry", name: "Long-Range Telemetry Link (915MHz TBS Crossfire / ELRS)", price: 1899 },
                    { id: "dji_o3", name: "Digital HD Upgrade (DJI O3 Air Unit 4K 60FPS Video)", price: 12499 },
                    { id: "battery", name: "Extra High-Capacity Flight Battery Pack", price: 2499 },
                    { id: "radar", name: "Autonomous Obstacle Avoidance Dual LiDAR System", price: 6999 },
                    { id: "mount", name: "TPU Action Camera Protective 30° Mount", price: 499 }
                  ]
                };
                break;
              }
            }
            if (found) break;
          }
        }

        if (!found) {
          found = INITIAL_UAV_PREBUILT.find((d) => d.id === id) || INITIAL_UAV_PREBUILT[0];
        }

        setDrone(found);
        document.title = `${found?.name || 'UAV Drone Details'} | NaviDron Aircraft Systems`;
      } catch (e) {
        console.error('Error fetching UAV details:', e);
        const fallback = INITIAL_UAV_PREBUILT[0];
        setDrone(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchDrone();
  }, [id]);

  if (loading) {
    return (
      <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#00c8ff', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontWeight: 600 }}>Loading UAV Aircraft Telemetry & Components...</p>
        </div>
      </div>
    );
  }

  if (!drone) {
    return (
      <div style={{ paddingTop: '120px', minHeight: '70vh', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <h2>Drone Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>The requested UAV model could not be found in our fleet.</p>
        <Link to="/uav" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to UAV Fleet
        </Link>
      </div>
    );
  }

  const basePrice = typeof drone.price === 'number'
    ? drone.price
    : parseInt(String(drone.price).replace(/[^0-9]/g, ''), 10) || 14999;

  const availableAddons = drone.availableAddons || [
    { id: "gps", name: "M10 Precision GPS + Return-To-Home Rescue Compass", price: 1499 },
    { id: "telemetry", name: "Long-Range Telemetry Link (915MHz TBS Crossfire / ELRS)", price: 1899 },
    { id: "dji_o3", name: "Digital HD Upgrade (DJI O3 Air Unit 4K 60FPS Video)", price: 12499 },
    { id: "battery", name: "Extra CNHL 6S 1300mAh 120C High-Discharge LiPo Battery", price: 2499 },
    { id: "radar", name: "Autonomous Obstacle Avoidance Dual LiDAR System", price: 6999 },
    { id: "bumper", name: "Heavy-Duty TPU Crash Bumper Guard Pack", price: 399 }
  ];

  // Calculate total price with active add-ons
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const matched = availableAddons.find((a) => a.id === addonId);
    return sum + (matched?.price || 0);
  }, 0);

  const unitPrice = basePrice + addonsTotal;
  const grandTotal = unitPrice * quantity;

  const images = Array.isArray(drone.images) && drone.images.length > 0
    ? drone.images
    : [drone.image || '/images/fpv_racing_drone.jpg'];

  const componentsList = Array.isArray(drone.components) && drone.components.length > 0
    ? drone.components
    : [
        { part: "Airframe", detail: "Apex 5\" T700 3K Full Carbon Fiber (5.5mm Chamfered Arms)" },
        { part: "Flight Controller", detail: "SpeedyBee F405 V4 Bluetooth Wireless Config" },
        { part: "ESC", detail: "55A 4-in-1 BLHeli_S DShot600 with TVS Protection" },
        { part: "Motors", detail: "4x T-Motor F60 PRO V 2207 1950KV Brushless Motors" },
        { part: "Propellers", detail: "HQProp Ethix S5 5.1\" Tri-Blade Durable Polycarbonate" },
        { part: "FPV Camera & VTX", detail: "Caddx Ratel 2 1200TVL Micro + 800mW Switchable VTX" },
        { part: "Radio Link", detail: "RadioMaster ExpressLRS 2.4GHz Diversity RX" }
      ];

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}

    const selectedAddonNames = selectedAddons
      .map((id) => availableAddons.find((a) => a.id === id)?.name)
      .filter(Boolean);

    if (onAddToCart) {
      onAddToCart({
        id: `${drone.id}-${selectedAddons.sort().join('-') || 'stock'}`,
        name: drone.name,
        category: drone.type || 'UAV Drone',
        price: unitPrice,
        quantity: quantity,
        image: images[0],
        customAddons: selectedAddonNames.length > 0 ? selectedAddonNames.join(', ') : 'Standard Build',
        basePrice: basePrice,
        addonsTotal: addonsTotal
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
            <Link to="/uav" style={{ color: '#64748b', textDecoration: 'none' }}>UAV Fleet</Link>
            <span>/</span>
            <span style={{ color: '#0a0f2e', fontWeight: 600 }}>{drone.name}</span>
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
              <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share Build'}
            </button>

            <a
              href={`/uav/${drone.id}`}
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

      {/* Main Showcase Grid */}
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem 4.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          
          {/* LEFT: Multi-Photo Slider Gallery & Flight Benchmarks */}
          <div>
            <div style={{ position: 'sticky', top: '100px' }}>
              <ImageSlider
                images={images}
                alt={drone.name}
                aspectRatio="4/3"
                showThumbnails={true}
              />

              {/* Aeronautical Flight Performance Benchmarks */}
              <div
                style={{
                  marginTop: '1.75rem',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  backgroundColor: '#f8faff',
                  border: '1.5px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(0,200,255,0.12)', color: '#00c8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gauge size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Top Speed</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e' }}>{drone.maxSpeed || '140+ km/h'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Battery size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Flight Time</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e' }}>{drone.flightTime || '8–12 mins'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(123,47,255,0.12)', color: '#7b2fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Radio Control Link</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e' }}>{drone.range || '3.5 km Range'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(255,0,170,0.12)', color: '#ff00aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Rocket size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Weight (Dry)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e' }}>{drone.weight || '385g'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Components Used Breakdown, Dynamic Add-ons & Live Price */}
          <div>
            {/* Header info */}
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
                {drone.type || 'FPV Aircraft'}
              </span>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#065f46',
                  backgroundColor: '#d1fae5',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={13} /> BNF / Ready-To-Fly Bench Tested
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
                fontWeight: 900,
                color: '#0a0f2e',
                lineHeight: 1.25,
                marginBottom: '0.6rem'
              }}
            >
              {drone.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>
                Manufacturer: <strong style={{ color: '#0a0f2e' }}>{drone.brand || 'NaviDron AeroLab India'}</strong>
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                <Star size={14} fill="#f59e0b" />
                <span>5.0 / 5.0</span>
                <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.78rem' }}>(Pilot Verified)</span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '1.75rem' }}>
              {drone.desc}
            </p>

            {/* ── 1. WHAT COMPONENTS HAVE BEEN USED (Bill of Materials) ── */}
            <div
              style={{
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8faff',
                  padding: '0.9rem 1.25rem',
                  fontWeight: 800,
                  color: '#0a0f2e',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={18} color="#00c8ff" />
                  <span>Components Used In This Drone Build</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ Tuned & Flashed with Betaflight 4.5
                </span>
              </div>

              <div style={{ divideY: '1px solid #f1f5f9' }}>
                {componentsList.map((comp, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '170px 1fr',
                      padding: '0.75rem 1.25rem',
                      borderBottom: cIdx === componentsList.length - 1 ? 'none' : '1px solid #f1f5f9',
                      backgroundColor: cIdx % 2 === 0 ? '#ffffff' : '#fafcff',
                      fontSize: '0.86rem'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#334155' }}>{comp.part}:</span>
                    <span style={{ color: '#0a0f2e', fontWeight: 500 }}>{comp.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. DYNAMIC ADD-ONS & LIVE PRICE CALCULATOR (GPS, Telemetry, etc.) ── */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #00c8ff',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 6px 25px rgba(0, 200, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0a0f2e', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={18} color="#00c8ff" /> Customize With Upgrades & Add-Ons
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0077b6', backgroundColor: 'rgba(0,200,255,0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                  Live Price Update
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Select modules to have them pre-installed, soldered, and bench-tested before shipping:
              </p>

              {/* Addon Checkbox Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {availableAddons.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: isChecked ? '2px solid #00c8ff' : '1.5px solid #e2e8f0',
                        backgroundColor: isChecked ? 'rgba(0, 200, 255, 0.06)' : '#fafcff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isChecked ? '0 0 12px rgba(0,200,255,0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Custom Checkbox */}
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isChecked ? '2px solid #00c8ff' : '2px solid #94a3b8',
                            backgroundColor: isChecked ? '#00c8ff' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>

                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isChecked ? '#0077b6' : '#1e293b' }}>
                            {addon.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Includes hardware mount & firmware flight tuning
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0a0f2e' }}>
                          +₹{addon.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Summary Strip */}
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  color: '#475569'
                }}
              >
                <div>
                  Base: <strong>₹{basePrice.toLocaleString('en-IN')}</strong> + Add-ons: <strong>₹{addonsTotal.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ color: '#0077b6', fontWeight: 800 }}>
                  {selectedAddons.length} {selectedAddons.length === 1 ? 'Upgrade' : 'Upgrades'} Selected
                </div>
              </div>
            </div>

            {/* Total Pricing Strip & Quantity */}
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
                  Final Drone Build Total ({quantity} {quantity > 1 ? 'Airframes' : 'Airframe'}):
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: '2.1rem', fontWeight: 900, color: '#0a0f2e' }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    (₹{unitPrice.toLocaleString('en-IN')} / drone)
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
                  padding: '1.05rem',
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
                  padding: '1.05rem',
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
