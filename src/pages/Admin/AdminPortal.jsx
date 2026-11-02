import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShoppingBag,
  Package,
  Wrench,
  Printer,
  Compass,
  Users,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Cpu,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  User,
  Image as ImageIcon,
  Edit3,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ImageSlider from '../../components/ImageSlider/ImageSlider';

const VALID_ADMIN_ACCOUNTS = [
  { id: 'admin@nexfly.com', pass: 'Abhi@2076', display: 'Admin@nexfly.com' },
  { id: 'admin1@nexfly.com', pass: 'Abhi@2076', display: 'Admin1@nexfly.com' }
];
import {
  getAllOrders,
  updateOrderStatus,
  get3DStudioItems,
  save3DStudioItem,
  delete3DStudioItem,
  getDroneAccessories,
  saveDroneAccessory,
  deleteDroneAccessory,
  getRoboticsKits,
  saveRoboticsKit,
  deleteRoboticsKit,
  getUAVPreBuilt,
  saveUAVPreBuilt,
  deleteUAVPreBuilt,
  getUAVCustomOrders,
  updateUAVCustomOrderStatus,
  getAllUsers,
  isFirebaseOnline
} from '../../services/firebase';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('navidron_admin_authenticated') === 'true';
  });
  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    return sessionStorage.getItem('navidron_admin_user') || 'Admin@nexfly.com';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('orders'); // 'profile' | 'orders' | 'items' | '3dstudio' | 'uav' | 'users'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Data states
  const [orders, setOrders] = useState([]);
  const [threeDItems, setThreeDItems] = useState([]);
  const [droneParts, setDroneParts] = useState([]);
  const [roboticsKits, setRoboticsKits] = useState([]);
  const [uavPreBuilt, setUavPreBuilt] = useState([]);
  const [uavCustomOrders, setUavCustomOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Sub-tabs & filters
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [itemsSubTab, setItemsSubTab] = useState('drone'); // 'drone' | 'robotics'
  const [threeDSubTab, setThreeDSubTab] = useState('all'); // 'all' | 'Anime' | 'Game Characters' | 'Personal Character'
  const [uavSubTab, setUavSubTab] = useState('prebuilt'); // 'prebuilt' | 'custom'

  // Modal states for adding new items
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('3dstudio'); // '3dstudio' | 'drone' | 'robotics' | 'uav'
  const [newPhotosList, setNewPhotosList] = useState([]);
  const [addPhotoInput, setAddPhotoInput] = useState('');
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'Anime',
    brand: '',
    kitType: 'Chassis & Base',
    type: 'FPV Drone',
    price: '',
    quantity: '',
    size: '8 inch',
    image: '',
    images: [],
    desc: '',
    flightTime: '',
    range: ''
  });

  // Modal states for updating photos on existing products
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [editingPhotoTarget, setEditingPhotoTarget] = useState(null); // { item, type, images: [] }
  const [editPhotoInput, setEditPhotoInput] = useState('');

  // Modal state for editing existing product details (Name, Desc, Category, Price, Stock, Brand, Specs)
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [editingProductTarget, setEditingProductTarget] = useState(null); // { item, type }
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    price6Inch: '',
    price8Inch: '',
    price10Inch: '',
    quantity: '',
    desc: '',
    size: '',
    material: '',
    infill: '25% Strength',
    printTime: '',
    speed: '',
    flightTime: '',
    range: ''
  });

  // Lightbox for reviewing customer uploaded photos & packaging pics
  const [enlargedOrderPhoto, setEnlargedOrderPhoto] = useState(null);

  const handleOpenEditProduct = (item, type) => {
    setEditingProductTarget({ item, type });
    const p8 = typeof item.price8Inch === 'number' && item.price8Inch > 0
      ? item.price8Inch
      : (typeof item.price === 'number' ? item.price : parseInt(String(item.price || '899').replace(/[^0-9]/g, ''), 10) || 899);
    const p6 = typeof item.price6Inch === 'number' && item.price6Inch > 0
      ? item.price6Inch
      : (item.sizeOptions?.find((s) => s.size.includes('6'))?.price || Math.max(299, p8 - 250));
    const p10 = typeof item.price10Inch === 'number' && item.price10Inch > 0
      ? item.price10Inch
      : (item.sizeOptions?.find((s) => s.size.includes('10'))?.price || (p8 + 450));

    setEditProductForm({
      name: item.name || '',
      category: item.category || '',
      brand: item.brand || '',
      price: type === '3dstudio' ? p8 : (item.price || 0),
      price6Inch: p6,
      price8Inch: p8,
      price10Inch: p10,
      quantity: typeof item.quantity === 'number' ? item.quantity : 20,
      desc: item.desc || '',
      size: item.size || '8 inch',
      material: item.material || 'FDM Tough PLA (Hard Plastic) / TPU (Soft & Flexible)',
      infill: '25% Strength',
      printTime: item.printTime || '6h 30m',
      speed: item.speed || '',
      flightTime: item.flightTime || '',
      range: item.range || ''
    });
    setEditProductModalOpen(true);
  };

  const handleSaveProductDetails = async (e) => {
    if (e) e.preventDefault();
    if (!editingProductTarget) return;
    const { item, type } = editingProductTarget;

    const numPrice = typeof editProductForm.price === 'number'
      ? editProductForm.price
      : parseInt(String(editProductForm.price).replace(/[^0-9]/g, ''), 10) || 0;
    const numQty = typeof editProductForm.quantity === 'number'
      ? editProductForm.quantity
      : parseInt(String(editProductForm.quantity).replace(/[^0-9]/g, ''), 10) || 0;

    const p6 = parseInt(String(editProductForm.price6Inch).replace(/[^0-9]/g, ''), 10) || Math.max(299, numPrice - 250);
    const p8 = parseInt(String(editProductForm.price8Inch).replace(/[^0-9]/g, ''), 10) || numPrice;
    const p10 = parseInt(String(editProductForm.price10Inch).replace(/[^0-9]/g, ''), 10) || (numPrice + 450);

    const updatedItem = {
      ...item,
      name: editProductForm.name,
      category: editProductForm.category,
      brand: editProductForm.brand,
      price: type === '3dstudio' ? p8 : numPrice,
      price6Inch: p6,
      price8Inch: p8,
      price10Inch: p10,
      sizes: ["6 inch", "8 inch", "10 inch"],
      sizeOptions: type === '3dstudio' ? [
        { size: "6 inch (150mm)", price: p6, printTime: "3h 45m", weight: "120g" },
        { size: "8 inch (200mm)", price: p8, printTime: "6h 30m", weight: "240g" },
        { size: "10 inch (250mm)", price: p10, printTime: "11h 15m", weight: "420g" }
      ] : item.sizeOptions,
      quantity: numQty,
      desc: editProductForm.desc,
      size: editProductForm.size || '8 inch',
      material: editProductForm.material,
      infill: '25% Strength',
      printTime: editProductForm.printTime,
      speed: editProductForm.speed,
      flightTime: editProductForm.flightTime,
      range: editProductForm.range
    };

    setActionLoading(true);
    try {
      if (type === '3dstudio') {
        await save3DStudioItem(updatedItem);
        setThreeDItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'drone') {
        await saveDroneAccessory(updatedItem);
        setDroneParts((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'robotics') {
        await saveRoboticsKit(updatedItem);
        setRoboticsKits((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'uav') {
        await saveUAVPreBuilt(updatedItem);
        setUavPreBuilt((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      }
      showToast(`💾 Successfully updated details for "${updatedItem.name}"!`);
      setEditProductModalOpen(false);
    } catch (err) {
      showToast(`❌ Error updating product: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPhotoManager = (item, type) => {
    const images = Array.isArray(item.images) && item.images.length > 0
      ? [...item.images]
      : [item.image || '/images/fpv_racing_drone.jpg'];
    setEditingPhotoTarget({ item, type, images });
    setEditPhotoInput('');
    setPhotoModalOpen(true);
  };

  const handleAddPhotoToTarget = () => {
    if (!editPhotoInput.trim()) return;
    const url = editPhotoInput.trim();
    setEditingPhotoTarget((prev) => ({
      ...prev,
      images: [...prev.images, url]
    }));
    setEditPhotoInput('');
  };

  const handleRemovePhotoFromTarget = (indexToRemove) => {
    if (editingPhotoTarget.images.length <= 1) {
      alert('Product must have at least one photo.');
      return;
    }
    setEditingPhotoTarget((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSetPrimaryPhoto = (indexToPrimary) => {
    setEditingPhotoTarget((prev) => {
      const selected = prev.images[indexToPrimary];
      const rest = prev.images.filter((_, idx) => idx !== indexToPrimary);
      return {
        ...prev,
        images: [selected, ...rest]
      };
    });
  };

  const handleSavePhotoUpdates = async () => {
    if (!editingPhotoTarget) return;
    const { item, type, images } = editingPhotoTarget;
    const updatedItem = {
      ...item,
      image: images[0],
      images: images
    };

    setActionLoading(true);
    try {
      if (type === '3dstudio') {
        await save3DStudioItem(updatedItem);
        setThreeDItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'drone') {
        await saveDroneAccessory(updatedItem);
        setDroneParts((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'robotics') {
        await saveRoboticsKit(updatedItem);
        setRoboticsKits((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      } else if (type === 'uav') {
        await saveUAVPreBuilt(updatedItem);
        setUavPreBuilt((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
      }
      showToast(`📸 Updated ${images.length} photos for "${item.name}"!`);
      setPhotoModalOpen(false);
    } catch (err) {
      showToast(`❌ Error saving photos: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAddModal = (type) => {
    setModalType(type);
    setNewPhotosList([]);
    setAddPhotoInput('');
    setNewItemForm({
      name: '',
      category: type === '3dstudio' ? 'Anime' : 'Motors',
      brand: type === '3dstudio' ? 'P_Brothers × NaviDron 3D' : type === 'robotics' ? 'NaviDron Robotics' : 'NaviDron AeroLab',
      kitType: 'Chassis & Base',
      type: 'FPV Drone',
      price: '',
      quantity: '',
      size: '8 inch',
      image: '',
      images: [],
      desc: '',
      flightTime: '',
      range: ''
    });
    setShowAddModal(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ords, prints, parts, kits, uavs, customs, usrs] = await Promise.all([
        getAllOrders(),
        get3DStudioItems(),
        getDroneAccessories(),
        getRoboticsKits(),
        getUAVPreBuilt(),
        getUAVCustomOrders(),
        getAllUsers()
      ]);
      setOrders(ords);
      setThreeDItems(prints);
      setDroneParts(parts);
      setRoboticsKits(kits);
      setUavPreBuilt(uavs);
      setUavCustomOrders(customs);
      setUsersList(usrs);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    const cleanId = (loginEmail || '').trim().toLowerCase();
    const cleanPass = (loginPassword || '').trim();

    const matched = VALID_ADMIN_ACCOUNTS.find(
      (acc) => acc.id === cleanId && acc.pass === cleanPass
    );

    if (matched) {
      sessionStorage.setItem('navidron_admin_authenticated', 'true');
      sessionStorage.setItem('navidron_admin_user', matched.display);
      setIsAuthenticated(true);
      setCurrentAdminUser(matched.display);
      setLoginError('');
      showToast(`Access granted. Welcome, ${matched.display}`);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    } else {
      setLoginError('Access Denied: Invalid Admin ID or Password. Verify your credentials.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('navidron_admin_authenticated');
    sessionStorage.removeItem('navidron_admin_user');
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    showToast('Admin session locked successfully.');
  };

  useEffect(() => {
    document.title = "Admin Portal — NaviDron Operations & Catalog";
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // ── ORDER MANAGEMENT ──────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`✅ Order #${orderId} status updated to "${newStatus}".`);
    } catch (err) {
      showToast(`❌ Error updating order: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── INLINE ITEM SAVE ──────────────────────────────────────────
  const handleSave3DItemInline = async (item) => {
    setActionLoading(true);
    try {
      const p8 = typeof item.price8Inch === 'number' && item.price8Inch > 0
        ? item.price8Inch
        : (typeof item.price === 'number' ? item.price : 899);
      const p6 = typeof item.price6Inch === 'number' && item.price6Inch > 0
        ? item.price6Inch
        : Math.max(299, p8 - 250);
      const p10 = typeof item.price10Inch === 'number' && item.price10Inch > 0
        ? item.price10Inch
        : (p8 + 450);

      const updated = {
        ...item,
        price: p8,
        price6Inch: p6,
        price8Inch: p8,
        price10Inch: p10,
        sizes: ["6 inch", "8 inch", "10 inch"],
        sizeOptions: [
          { size: "6 inch (150mm)", price: p6, printTime: "3h 45m", weight: "120g" },
          { size: "8 inch (200mm)", price: p8, printTime: "6h 30m", weight: "240g" },
          { size: "10 inch (250mm)", price: p10, printTime: "11h 15m", weight: "420g" }
        ],
        infill: "25% Strength"
      };

      await save3DStudioItem(updated);
      setThreeDItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(`💾 Saved 3D Figure "${updated.name}" (6": ₹${p6}, 8": ₹${p8}, 10": ₹${p10}, Stock: ${updated.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete3DItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this 3D product from catalog?')) return;
    setActionLoading(true);
    try {
      await delete3DStudioItem(id);
      setThreeDItems((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ 3D Studio product deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDronePartInline = async (item) => {
    setActionLoading(true);
    try {
      await saveDroneAccessory(item);
      showToast(`💾 Saved part "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDronePart = async (id) => {
    if (!window.confirm('Delete this drone accessory?')) return;
    setActionLoading(true);
    try {
      await deleteDroneAccessory(id);
      setDroneParts((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ Drone accessory deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveRoboticsKitInline = async (item) => {
    setActionLoading(true);
    try {
      await saveRoboticsKit(item);
      showToast(`💾 Saved robotics kit "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoboticsKit = async (id) => {
    if (!window.confirm('Delete this robotics kit?')) return;
    setActionLoading(true);
    try {
      await deleteRoboticsKit(id);
      setRoboticsKits((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ Robotics kit deleted.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUAVPreBuiltInline = async (item) => {
    setActionLoading(true);
    try {
      await saveUAVPreBuilt(item);
      showToast(`💾 Saved UAV "${item.name}" (Price: ₹${item.price}, Stock: ${item.quantity})`);
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUAVPreBuilt = async (id) => {
    if (!window.confirm('Delete this Pre-Built UAV from store?')) return;
    setActionLoading(true);
    try {
      await deleteUAVPreBuilt(id);
      setUavPreBuilt((prev) => prev.filter((i) => i.id !== id));
      showToast('🗑️ UAV removed from store.');
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── ADD NEW PRODUCT SUBMISSION ────────────────────────────────
  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    const priceVal = typeof newItemForm.price === 'number' ? newItemForm.price : parseInt(newItemForm.price, 10) || 0;
    const qtyVal = typeof newItemForm.quantity === 'number' ? newItemForm.quantity : parseInt(newItemForm.quantity, 10) || 0;
    const finalImages = newPhotosList.length > 0
      ? newPhotosList
      : (newItemForm.image ? [newItemForm.image] : ['/images/fpv_racing_drone.jpg']);

    const cleanedPayload = {
      ...newItemForm,
      price: priceVal,
      quantity: qtyVal,
      image: finalImages[0],
      images: finalImages
    };

    try {
      if (modalType === '3dstudio') {
        const p8 = priceVal || 899;
        const p6 = Math.max(299, p8 - 250);
        const p10 = p8 + 450;
        const created = await save3DStudioItem({
          ...cleanedPayload,
          id: `3d-${Date.now()}`,
          price: p8,
          price6Inch: p6,
          price8Inch: p8,
          price10Inch: p10,
          sizes: ["6 inch", "8 inch", "10 inch"],
          sizeOptions: [
            { size: "6 inch (150mm)", price: p6, printTime: "3h 45m", weight: "120g" },
            { size: "8 inch (200mm)", price: p8, printTime: "6h 30m", weight: "240g" },
            { size: "10 inch (250mm)", price: p10, printTime: "11h 15m", weight: "420g" }
          ],
          infill: "25% Strength"
        });
        setThreeDItems((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to 3DStudio catalog with ${finalImages.length} photos!`);
      } else if (modalType === 'drone') {
        const created = await saveDroneAccessory({
          ...cleanedPayload,
          id: `part-${Date.now()}`
        });
        setDroneParts((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Drone Accessories catalog with ${finalImages.length} photos!`);
      } else if (modalType === 'robotics') {
        const created = await saveRoboticsKit({
          ...cleanedPayload,
          id: `kit-${Date.now()}`
        });
        setRoboticsKits((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Robotics Kits catalog with ${finalImages.length} photos!`);
      } else if (modalType === 'uav') {
        const created = await saveUAVPreBuilt({
          ...cleanedPayload,
          id: `uav-${Date.now()}`
        });
        setUavPreBuilt((prev) => [created, ...prev]);
        showToast(`🎉 Added "${created.name}" to Pre-Built UAV catalog with ${finalImages.length} photos!`);
      }

      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}

      setShowAddModal(false);
      setNewPhotosList([]);
      setAddPhotoInput('');
      setNewItemForm({
        name: '',
        category: 'Anime',
        brand: '',
        kitType: 'Chassis & Base',
        type: 'FPV Drone',
        price: '',
        quantity: '',
        size: '8 inch',
        image: '',
        images: [],
        desc: '',
        flightTime: '',
        range: ''
      });
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Total calculated revenue
  const totalRevenue = orders.reduce((acc, o) => {
    const raw = typeof o.totalAmount === 'number' ? o.totalAmount : parseInt(String(o.totalAmount || 0).replace(/[^0-9]/g, ''), 10) || 0;
    return acc + raw;
  }, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = (o.id || '').toLowerCase().includes(q);
      const matchCust = (o.customer?.name || o.customer?.email || '').toLowerCase().includes(q);
      const matchAddr = (o.deliveryAddress || '').toLowerCase().includes(q);
      return matchId || matchCust || matchAddr;
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        {toastMessage && (
          <div className="profile-toast-floating">
            <Sparkles size={18} className="neon-text" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="admin-lock-card fade-in">
          <div style={{ textAlign: 'center' }}>
            <div className="admin-lock-badge">
              <Lock size={13} />
              <span>NexFly Security Gate</span>
            </div>
            <h1 className="admin-lock-title">
              Admin <span>Portal Access</span>
            </h1>
            <p className="admin-lock-subtitle">
              Restricted control deck. Enter your administrative credentials to manage store catalog, orders, and user operations.
            </p>
          </div>

          {loginError && (
            <div className="admin-lock-error" style={{ marginBottom: '1.25rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="admin-lock-form">
            <div className="admin-lock-input-group">
              <label>
                <User size={14} />
                <span>Admin ID / Email</span>
              </label>
              <div className="admin-lock-input-wrap">
                <Mail size={16} className="input-icon-left" />
                <input
                  type="text"
                  autoComplete="username"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="admin-lock-input-group">
              <label>
                <KeyRound size={14} />
                <span>Access Password</span>
              </label>
              <div className="admin-lock-input-wrap">
                <Lock size={16} className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-lock-btn"
            >
              <Unlock size={17} />
              <span>Authenticate & Enter Deck</span>
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              to="/"
              style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--neon)')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Toast */}
      {toastMessage && (
        <div className="profile-toast-floating">
          <Sparkles size={18} className="neon-text" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="admin-top-hero">
        <div className="admin-hero-inner">
          <div>
            <div className="admin-badge-live">
              <span className="pulse-dot"></span>
              Command & Catalog Admin Portal
            </div>
            <h1 className="admin-title-head">
              NaviDron <span>Operations Control</span>
            </h1>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              Manage users, track dispatch addresses in <code>Order</code> collection, and decide live catalog prices & stock for 3D Studio, Drone Accessories, Robotics Kits, and UAVs.
            </p>
          </div>

          <div className="admin-hero-stats">
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{orders.length}</div>
              <div className="admin-metric-lbl">Total Orders</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{usersList.length}</div>
              <div className="admin-metric-lbl">Total Users</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="admin-metric-lbl">Total Volume</div>
            </div>
            <div className="admin-hero-metric">
              <div className="admin-metric-num">{threeDItems.length + droneParts.length + roboticsKits.length + uavPreBuilt.length}</div>
              <div className="admin-metric-lbl">Live Catalog</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navbar */}
      <nav className="admin-nav-bar">
        <div className="admin-nav-inner">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <ShieldCheck size={18} />
            <span>Admin Profile</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
            <span className="admin-count-pill">{orders.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Wrench size={18} />
            <span>Items (Parts & Kits)</span>
            <span className="admin-count-pill">{droneParts.length + roboticsKits.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === '3dstudio' ? 'active' : ''}`}
            onClick={() => setActiveTab('3dstudio')}
          >
            <Printer size={18} />
            <span>3DStudio</span>
            <span className="admin-count-pill">{threeDItems.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'uav' ? 'active' : ''}`}
            onClick={() => setActiveTab('uav')}
          >
            <Compass size={18} />
            <span>UAV (Pre-Built & Custom)</span>
            <span className="admin-count-pill">{uavPreBuilt.length + uavCustomOrders.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Users</span>
            <span className="admin-count-pill">{usersList.length}</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ffcc', display: 'inline-block' }}></span>
              <span>{currentAdminUser}</span>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleAdminLogout}
              title="Lock Portal & Sign Out"
            >
              <LogOut size={14} />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <div className="admin-body-wrap">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <RefreshCw size={36} className="spin-icon" color="var(--neon)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#94a3b8' }}>Loading live database...</p>
          </div>
        ) : (
          <>
            {/* ── TAB 1: ADMIN PROFILE ─────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Administrator Identity & System Status
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Master credentials, operations hub address, and live system status.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-action-primary"
                    onClick={loadAllData}
                    disabled={actionLoading}
                  >
                    <RefreshCw size={15} className={actionLoading ? 'spin-icon' : ''} />
                    Refresh Cloud Data
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Official Admin Contact
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#fff' }}>
                      <Mail size={16} color="var(--neon)" />
                      <strong>navidron.a@gmail.com</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                      <Phone size={16} color="#10b981" />
                      <span>+91 9508106177</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Hangar & Workshop Location
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                      <MapPin size={18} color="#ff00aa" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>A. M. Das Lane, Brahmpura, Muzaffarpur, Bihar, Pincode: 842003</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Live System Collections
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {['users', 'Order', '3DStudio', 'DroneAccessories', 'Robotics_Kits', 'UAV_PreBuilt', 'UAV_Custom'].map((col) => (
                        <span key={col} style={{ fontSize: '0.75rem', background: 'rgba(0,200,255,0.15)', color: 'var(--neon)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/"
                    className="btn btn-outline"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    View Customer Website <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </Link>
                  <Link
                    to="/profile"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    Go To Personal Profile
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB 2: ORDERS ────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Live User Orders & Delivery Addresses
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Stored globally in root collection <code>Order</code> with complete recipient details and particular delivery addresses.
                    </p>
                  </div>

                  {/* Search and status filters */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search order ID, customer, address..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: '#fff',
                          padding: '0.45rem 0.85rem 0.45rem 2rem',
                          fontSize: '0.82rem',
                          minWidth: '220px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    >
                      <option value="all">All Statuses ({orders.length})</option>
                      <option value="Succeeded">Succeeded / Confirmed</option>
                      <option value="In Assembly">In Assembly</option>
                      <option value="Dispatched">Dispatched / In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                    <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>No orders match the current filter or search criteria.</p>
                  </div>
                ) : (
                  <div className="admin-orders-list">
                    {filteredOrders.map((ord) => {
                      const amount = typeof ord.totalAmount === 'number'
                        ? ord.totalAmount
                        : parseInt(String(ord.totalAmount || 0).replace(/[^0-9]/g, ''), 10) || 0;
                      return (
                        <div key={ord.id} className="admin-order-box">
                          <div className="admin-order-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span className="admin-order-id-badge">#{ord.id}</span>
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                Date: {ord.date || ord.createdAt?.split('T')[0] || 'Today'}
                              </span>
                              {ord.type && (
                                <span style={{ fontSize: '0.7rem', padding: '2px 7px', background: 'rgba(0,200,255,0.15)', color: 'var(--neon)', borderRadius: '4px', fontWeight: 700 }}>
                                  {ord.type}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                                Total: ₹{amount.toLocaleString('en-IN')}
                              </span>
                              <select
                                className="admin-status-dropdown"
                                value={ord.status || 'Succeeded'}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                disabled={actionLoading}
                              >
                                <option value="Succeeded">🔵 Succeeded / Confirmed</option>
                                <option value="In Assembly">⚙️ In Assembly</option>
                                <option value="Dispatched">🚚 Dispatched / In Transit</option>
                                <option value="Delivered">🟢 Delivered</option>
                                <option value="Cancelled">🔴 Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="admin-order-grid-details">
                            {/* Customer Contact */}
                            <div>
                              <div className="admin-order-section-lbl">Customer Contact</div>
                              <div style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 700 }}>
                                {ord.customer?.name || 'Customer'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                {ord.customer?.email || 'No email'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>
                                {ord.customer?.phone || '+91 9508106177'}
                              </div>
                            </div>

                            {/* Particular Delivery Address */}
                            <div>
                              <div className="admin-order-section-lbl">Particular Delivery Address</div>
                              <div className="admin-order-address-box">
                                <MapPin size={15} color="#ff00aa" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                                {typeof ord.deliveryAddress === 'object'
                                  ? `${ord.deliveryAddress.street || ''}${ord.deliveryAddress.landmark ? ', Landmark: ' + ord.deliveryAddress.landmark : ''}, ${ord.deliveryAddress.city || ''} (${ord.deliveryAddress.pincode || ''})`
                                  : ord.deliveryAddress || 'Address on file'}
                              </div>
                            </div>

                            {/* Payment details */}
                            <div>
                              <div className="admin-order-section-lbl">Payment Mode</div>
                              <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>
                                {ord.paymentStatus || 'Paid Online'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                Tracking: <code>{ord.trackingNumber || `EXP-${ord.id}`}</code>
                              </div>
                            </div>
                          </div>

                          {/* Items Breakdown with Product Pictures & User Uploaded Photos */}
                          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="admin-order-section-lbl" style={{ marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>📦 Packaging & Products Manifest ({ord.items?.length || 0} items)</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Inspect photos & specs before packing</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {(ord.items || []).map((it, idx) => {
                                const itImage = it.image || '/images/fpv_racing_drone.jpg';
                                const userUploadedPhoto = it.uploadedPhoto || it.customPhoto || it.customImage;
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.65rem',
                                      padding: '0.75rem',
                                      background: 'rgba(255,255,255,0.03)',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(255,255,255,0.08)'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                                      {/* Product Image Thumbnail */}
                                      <div
                                        style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0, cursor: 'pointer', background: '#0a0f2e' }}
                                        onClick={() => setEnlargedOrderPhoto({ url: itImage, title: it.name, subtitle: `Catalog Product Image &bull; Order #${ord.id}` })}
                                        title="Click to view enlarged"
                                      >
                                        <img
                                          src={itImage}
                                          alt={it.name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          onError={(e) => { e.target.src = '/images/fpv_racing_drone.jpg'; }}
                                        />
                                        <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 4px', borderRadius: '4px 0 0 0' }}>
                                          {it.quantity || 1}x
                                        </span>
                                      </div>

                                      {/* Item Details & Specs */}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                                            {it.name}
                                          </div>
                                          <span style={{ color: 'var(--neon)', fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                            ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                                          {it.category && (
                                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: '#cbd5e1' }}>
                                              {it.category}
                                            </span>
                                          )}
                                          {it.size && (
                                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(0,200,255,0.15)', borderRadius: '4px', color: 'var(--neon)', fontWeight: 700 }}>
                                              Scale: {it.size}
                                            </span>
                                          )}
                                          {it.material && (
                                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(16,185,129,0.15)', borderRadius: '4px', color: '#10b981', fontWeight: 700 }}>
                                              Material: {it.material}
                                            </span>
                                          )}
                                          {(it.strength || it.infill) && (
                                            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(56,189,248,0.15)', borderRadius: '4px', color: '#38bdf8', fontWeight: 700 }}>
                                              Strength: {it.strength || it.infill}
                                            </span>
                                          )}
                                        </div>

                                        {it.customEngraving && (
                                          <div style={{ fontSize: '0.74rem', color: '#f59e0b', marginTop: '0.3rem' }}>
                                            🏷️ Custom Engraving: &ldquo;<strong>{it.customEngraving}</strong>&rdquo;
                                          </div>
                                        )}

                                        {it.selectedAddOns && Array.isArray(it.selectedAddOns) && it.selectedAddOns.length > 0 && (
                                          <div style={{ fontSize: '0.74rem', color: '#a78bfa', marginTop: '0.25rem' }}>
                                            ⚡ UAV Installed Add-ons: {it.selectedAddOns.join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Prominent Customer Uploaded Photo for Custom Portrait / 3D Lithophane */}
                                    {userUploadedPhoto && (
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.85rem',
                                          background: 'rgba(245, 158, 11, 0.1)',
                                          border: '1.5px solid rgba(245, 158, 11, 0.45)',
                                          borderRadius: '8px',
                                          padding: '0.65rem 0.85rem'
                                        }}
                                      >
                                        <div
                                          style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #f59e0b', flexShrink: 0, cursor: 'pointer' }}
                                          onClick={() => setEnlargedOrderPhoto({ url: userUploadedPhoto, title: `Customer Uploaded Photo for ${it.name}`, subtitle: `Order #${ord.id} &bull; ${ord.customer?.name || 'Customer'}` })}
                                          title="Click to view full image"
                                        >
                                          <img
                                            src={userUploadedPhoto}
                                            alt="Customer Upload"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📷 CUSTOMER ATTACHED PHOTO FOR 3D LITHOPHANE / SCULPT
                                          </div>
                                          <p style={{ margin: '0.15rem 0 0.45rem', fontSize: '0.73rem', color: '#cbd5e1' }}>
                                            Customer provided this personal image for custom 3D printing. Use it to print model & confirm before dispatch packaging.
                                          </p>
                                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button
                                              type="button"
                                              onClick={() => setEnlargedOrderPhoto({ url: userUploadedPhoto, title: `Customer Uploaded Photo for ${it.name}`, subtitle: `Order #${ord.id} &bull; ${ord.customer?.name || 'Customer'}` })}
                                              style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '3px 9px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                              View Full Photo
                                            </button>
                                            <a
                                              href={userUploadedPhoto}
                                              target="_blank"
                                              rel="noreferrer"
                                              download={`order-${ord.id}-user-photo.png`}
                                              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 9px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none' }}
                                            >
                                              Download Image
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: ITEMS (DRONE PARTS & ROBOTICS KITS) ──── */}
            {activeTab === 'items' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      Drone Parts & Robotics Kits
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Decide prices, stock quantities, and add new components. Changes immediately update customer store pages.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      <button
                        type="button"
                        onClick={() => setItemsSubTab('drone')}
                        style={{
                          background: itemsSubTab === 'drone' ? 'var(--neon)' : 'transparent',
                          color: itemsSubTab === 'drone' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Drone Parts ({droneParts.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemsSubTab('robotics')}
                        style={{
                          background: itemsSubTab === 'robotics' ? 'var(--neon)' : 'transparent',
                          color: itemsSubTab === 'robotics' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Robotics Kits ({roboticsKits.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      className="admin-btn-action-primary"
                      onClick={() => handleOpenAddModal(itemsSubTab === 'drone' ? 'drone' : 'robotics')}
                    >
                      <Plus size={16} /> Add {itemsSubTab === 'drone' ? 'Drone Part' : 'Robotics Kit'}
                    </button>
                  </div>
                </div>

                {/* Drone Parts Sub-Tab */}
                {itemsSubTab === 'drone' && (
                  <div className="admin-items-grid">
                    {droneParts.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <ImageSlider
                            images={item.images || [item.image]}
                            alt={item.name}
                            aspectRatio="16/9"
                            compact={true}
                            showThumbnails={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.category || 'Parts'}
                          </span>
                          <a
                            href={`/products/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.72rem', color: 'var(--neon)', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                            title="Preview Customer Detail Page"
                          >
                            <ExternalLink size={12} /> Detail Page
                          </a>
                        </div>

                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Action buttons: Edit Details and Update Photos */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '0.65rem 0' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'var(--neon)',
                              color: 'var(--neon)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenEditProduct(item, 'drone')}
                          >
                            <Edit3 size={13} /> Edit Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenPhotoManager(item, 'drone')}
                          >
                            <ImageIcon size={13} /> Photos ({(item.images || [item.image]).length})
                          </button>
                        </div>

                        {/* Inline editable price & quantity */}
                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setDroneParts((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Quantity / Stock</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setDroneParts((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveDronePartInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price/Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteDronePart(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Robotics Kits Sub-Tab */}
                {itemsSubTab === 'robotics' && (
                  <div className="admin-items-grid">
                    {roboticsKits.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <ImageSlider
                            images={item.images || [item.image]}
                            alt={item.name}
                            aspectRatio="16/9"
                            compact={true}
                            showThumbnails={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.kitType || 'Kit'}
                          </span>
                          <a
                            href={`/products/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.72rem', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                            title="Preview Customer Detail Page"
                          >
                            <ExternalLink size={12} /> Detail Page
                          </a>
                        </div>

                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Action buttons: Edit Details and Update Photos */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '0.65rem 0' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: '#10b981',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenEditProduct(item, 'robotics')}
                          >
                            <Edit3 size={13} /> Edit Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenPhotoManager(item, 'robotics')}
                          >
                            <ImageIcon size={13} /> Photos ({(item.images || [item.image]).length})
                          </button>
                        </div>

                        {/* Inline editable price & quantity */}
                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setRoboticsKits((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Quantity / Stock</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setRoboticsKits((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveRoboticsKitInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price/Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteRoboticsKit(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: 3D STUDIO ─────────────────────────────── */}
            {activeTab === '3dstudio' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      3D Studio Catalog & Sizes
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Anime figures, game characters (GTA 6 / Valorant), and personal custom image portraits with size and price options.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      {['all', 'Anime', 'Game Characters', 'Personal Character'].map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setThreeDSubTab(sub)}
                          style={{
                            background: threeDSubTab === sub ? 'var(--neon)' : 'transparent',
                            color: threeDSubTab === sub ? 'var(--navy)' : '#94a3b8',
                            border: 'none',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {sub === 'all' ? 'All' : sub}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="admin-btn-action-primary"
                      onClick={() => handleOpenAddModal('3dstudio')}
                    >
                      <Plus size={16} /> Add 3D Figure
                    </button>
                  </div>
                </div>

                <div className="admin-items-grid">
                  {threeDItems
                    .filter((it) => threeDSubTab === 'all' || it.category === threeDSubTab)
                    .map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <ImageSlider
                            images={item.images || [item.image]}
                            alt={item.name}
                            aspectRatio="16/9"
                            compact={true}
                            showThumbnails={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#ff00aa', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.category || '3D Studio'}
                          </span>
                          <a
                            href={`/prints/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.72rem', color: '#ff00aa', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                            title="Preview Customer Detail Page"
                          >
                            <ExternalLink size={12} /> Detail Page
                          </a>
                        </div>

                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>

                        {/* Action buttons: Edit Details and Update Photos */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '0.65rem 0' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: '#ff00aa',
                              color: '#ff00aa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenEditProduct(item, '3dstudio')}
                          >
                            <Edit3 size={13} /> Edit Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenPhotoManager(item, '3dstudio')}
                          >
                            <ImageIcon size={13} /> Photos ({(item.images || [item.image]).length})
                          </button>
                        </div>

                        {/* Inline price & stock editing with independent 6", 8", 10" sizes */}
                        <div style={{ background: 'rgba(0, 200, 255, 0.05)', border: '1px solid rgba(0, 200, 255, 0.2)', borderRadius: '8px', padding: '0.65rem', margin: '0.5rem 0' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00c8ff', marginBottom: '0.35rem' }}>
                            💰 Prices by Size (25% Density):
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '0.45rem' }}>
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>6" (₹)</label>
                              <input
                                type="number"
                                className="admin-input-field"
                                style={{ padding: '0.35rem', fontSize: '0.8rem' }}
                                value={item.price6Inch ?? item.sizeOptions?.find((s) => s.size.includes('6'))?.price ?? Math.max(299, (item.price || 899) - 200)}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setThreeDItems((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, price6Inch: val } : i))
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#00c8ff', fontWeight: 700 }}>8" (₹)</label>
                              <input
                                type="number"
                                className="admin-input-field"
                                style={{ padding: '0.35rem', fontSize: '0.8rem' }}
                                value={item.price8Inch ?? item.price ?? 899}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setThreeDItems((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, price8Inch: val, price: val } : i))
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>10" (₹)</label>
                              <input
                                type="number"
                                className="admin-input-field"
                                style={{ padding: '0.35rem', fontSize: '0.8rem' }}
                                value={item.price10Inch ?? item.sizeOptions?.find((s) => s.size.includes('10'))?.price ?? ((item.price || 899) + 400)}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setThreeDItems((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, price10Inch: val } : i))
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Stock / Qty</label>
                              <input
                                type="number"
                                className="admin-input-field"
                                style={{ padding: '0.35rem', fontSize: '0.8rem' }}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setThreeDItems((prev) =>
                                    prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Density</label>
                              <input
                                type="text"
                                disabled
                                className="admin-input-field"
                                style={{ padding: '0.35rem', fontSize: '0.8rem', opacity: 0.7 }}
                                value="25% Strength"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSave3DItemInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Changes
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDelete3DItem(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── TAB 5: UAV (PRE-BUILT & CUSTOM) ─────────────── */}
            {activeTab === 'uav' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      UAV Aircraft & Custom Flight Orders
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Ready-to-fly Prebuilt UAVs (RC Planes & Drones) and custom drone order requests from users.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '3px' }}>
                      <button
                        type="button"
                        onClick={() => setUavSubTab('prebuilt')}
                        style={{
                          background: uavSubTab === 'prebuilt' ? 'var(--neon)' : 'transparent',
                          color: uavSubTab === 'prebuilt' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Pre-Built UAVs ({uavPreBuilt.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUavSubTab('custom')}
                        style={{
                          background: uavSubTab === 'custom' ? 'var(--neon)' : 'transparent',
                          color: uavSubTab === 'custom' ? 'var(--navy)' : '#94a3b8',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Custom UAV Orders ({uavCustomOrders.length})
                      </button>
                    </div>

                    {uavSubTab === 'prebuilt' && (
                      <button
                        type="button"
                        className="admin-btn-action-primary"
                        onClick={() => handleOpenAddModal('uav')}
                      >
                        <Plus size={16} /> Add Pre-Built UAV
                      </button>
                    )}
                  </div>
                </div>

                {/* Prebuilt UAVs */}
                {uavSubTab === 'prebuilt' && (
                  <div className="admin-items-grid">
                    {uavPreBuilt.map((item) => (
                      <div key={item.id} className="admin-prod-card">
                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                          <ImageSlider
                            images={item.images || [item.image]}
                            alt={item.name}
                            aspectRatio="16/9"
                            compact={true}
                            showThumbnails={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {item.type || 'UAV'}
                          </span>
                          <a
                            href={`/uav/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.72rem', color: 'var(--neon)', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                            title="Preview Customer Detail Page"
                          >
                            <ExternalLink size={12} /> Detail Page
                          </a>
                        </div>

                        <div className="admin-prod-title">{item.name}</div>
                        <div className="admin-prod-desc">{item.desc}</div>
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                          ⏱ Flight Time: {item.flightTime || '10 mins'} | 📡 Range: {item.range || '2 km'}
                        </div>

                        {/* Action buttons: Edit Details and Update Photos */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '0.65rem 0' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'var(--neon)',
                              color: 'var(--neon)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenEditProduct(item, 'uav')}
                          >
                            <Edit3 size={13} /> Edit Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '0.45rem',
                              fontSize: '0.78rem',
                              borderColor: 'rgba(255,255,255,0.2)',
                              color: '#cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleOpenPhotoManager(item, 'uav')}
                          >
                            <ImageIcon size={13} /> Photos ({(item.images || [item.image]).length})
                          </button>
                        </div>

                        <div className="admin-inline-inputs">
                          <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.price}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setUavPreBuilt((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                                );
                              }}
                            />
                          </div>
                          <div className="admin-input-group">
                            <label>Stock Qty</label>
                            <input
                              type="number"
                              className="admin-input-field"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setUavPreBuilt((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, quantity: val } : i))
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem' }}
                            onClick={() => handleSaveUAVPreBuiltInline(item)}
                            disabled={actionLoading}
                          >
                            <Save size={13} style={{ marginRight: '4px' }} /> Save Price & Stock
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.45rem 0.65rem', borderColor: '#ef4444', color: '#ef4444' }}
                            onClick={() => handleDeleteUAVPreBuilt(item.id)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom UAV Orders */}
                {uavSubTab === 'custom' && (
                  <div>
                    {uavCustomOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                        <Compass size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No custom UAV requests submitted yet.</p>
                      </div>
                    ) : (
                      <div className="admin-orders-list">
                        {uavCustomOrders.map((ord) => (
                          <div key={ord.id} className="admin-order-box">
                            <div className="admin-order-header">
                              <div>
                                <span className="admin-order-id-badge">#{ord.id}</span>
                                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                  Custom Order Request • {ord.createdAt?.split('T')[0] || 'Recent'}
                                </span>
                              </div>
                              <select
                                className="admin-status-dropdown"
                                value={ord.status || 'Pending Review'}
                                onChange={async (e) => {
                                  await updateUAVCustomOrderStatus(ord.id, e.target.value);
                                  setUavCustomOrders((prev) =>
                                    prev.map((o) => (o.id === ord.id ? { ...o, status: e.target.value } : o))
                                  );
                                  showToast(`Status updated to "${e.target.value}"`);
                                }}
                              >
                                <option value="Pending Review">⏳ Pending Review</option>
                                <option value="In Assembly">⚙️ In Assembly / Sourcing</option>
                                <option value="Flight Tested">✈️ Flight Tested & Bench OK</option>
                                <option value="Dispatched">🚚 Dispatched</option>
                                <option value="Delivered">🟢 Delivered</option>
                              </select>
                            </div>

                            <div className="admin-order-grid-details">
                              <div>
                                <div className="admin-order-section-lbl">Client Contact</div>
                                <div style={{ color: '#fff', fontWeight: 700 }}>{ord.customerName || ord.name || 'Client'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ord.customerEmail || ord.email}</div>
                                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{ord.customerPhone || ord.phone || '+91 9508106177'}</div>
                              </div>
                              <div>
                                <div className="admin-order-section-lbl">Specifications</div>
                                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                                  Type: <strong>{ord.droneType || 'Custom Drone'}</strong> | Frame: <strong>{ord.frameSize || '5 inch'}</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                  {ord.purpose || ord.notes || 'Custom build requirements'}
                                </div>
                              </div>
                              <div>
                                <div className="admin-order-section-lbl">Estimated Price</div>
                                <div style={{ color: 'var(--neon)', fontWeight: 800, fontSize: '1rem' }}>
                                  ₹{(ord.estimatedPrice || ord.price || 14999).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 6: USERS ─────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="admin-panel-card fade-in">
                <div className="admin-card-header-bar">
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                      User Management & Customer Support
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                      Every user registered in <code>users</code> collection with their profile details, saved delivery addresses, order counts, and active carts.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-action-primary"
                    onClick={loadAllData}
                  >
                    <RefreshCw size={15} /> Refresh Users
                  </button>
                </div>

                <div className="admin-users-grid">
                  {usersList.map((usr) => (
                    <div key={usr.id} className="admin-user-card">
                      <div className="admin-user-avatar-row">
                        <div className="admin-user-initials">
                          {usr.name ? usr.name.slice(0, 2).toUpperCase() : 'ND'}
                        </div>
                        <div>
                          <div className="admin-user-name">{usr.name || 'Pilot User'}</div>
                          <div className="admin-user-email">{usr.email || 'No email registered'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-all' }}>
                            UID: <code>{usr.id}</code>
                          </div>
                        </div>
                      </div>

                      {usr.phone && (
                        <div className="admin-user-contact-row">
                          <Phone size={14} color="#10b981" />
                          <span>{usr.phone}</span>
                        </div>
                      )}

                      {/* User Stats: Addresses, Orders, Cart */}
                      <div className="admin-user-stats-strip">
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.addressesCount}</div>
                          <div className="admin-user-stat-lbl">Addresses</div>
                        </div>
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.ordersCount}</div>
                          <div className="admin-user-stat-lbl">Orders</div>
                        </div>
                        <div className="admin-user-mini-stat">
                          <div className="admin-user-stat-num">{usr.cartCount}</div>
                          <div className="admin-user-stat-lbl">In Cart</div>
                        </div>
                      </div>

                      {/* Saved addresses snippet */}
                      {usr.addresses && usr.addresses.length > 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.85rem' }}>
                          <MapPin size={12} color="var(--neon)" style={{ display: 'inline', marginRight: '4px' }} />
                          {usr.addresses[0].street}{usr.addresses[0].landmark ? `, Landmark: ${usr.addresses[0].landmark}` : ''}, {usr.addresses[0].city} ({usr.addresses[0].pincode})
                        </div>
                      )}

                      {/* Assist actions */}
                      <div className="admin-user-assist-btns">
                        <a
                          href={`https://wa.me/${(usr.phone || '919508106177').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${usr.name || ''}, this is NaviDron Support regarding your orders and UAV configuration.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn-assist admin-btn-wa"
                        >
                          <Phone size={13} /> Assist on WhatsApp
                        </a>

                        <a
                          href={`mailto:${usr.email || 'navidron.a@gmail.com'}?subject=NaviDron%20Customer%20Assistance`}
                          className="admin-btn-assist admin-btn-mail"
                        >
                          <Mail size={13} /> Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL: ADD NEW ITEM ───────────────────────────── */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', color: '#fff', margin: 0, fontSize: '1.25rem' }}>
                Add New {modalType === '3dstudio' ? '3D Studio Figure' : modalType === 'drone' ? 'Drone Part' : modalType === 'robotics' ? 'Robotics Kit' : 'Pre-Built UAV'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="admin-modal-form-grid">
              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Item Name *</label>
                <input
                  type="text"
                  className="profile-input"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  placeholder=""
                  required
                />
              </div>

              {/* Category for 3D Studio */}
              {modalType === '3dstudio' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Category *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="Anime">Anime</option>
                    <option value="Game Characters">Game Characters</option>
                    <option value="Personal Character">Personal Character of Image</option>
                  </select>
                </div>
              )}

              {/* Size for 3D Studio */}
              {modalType === '3dstudio' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Figure Size *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.size}
                    onChange={(e) => setNewItemForm({ ...newItemForm, size: e.target.value })}
                  >
                    <option value="6 inch">6 inch (Compact)</option>
                    <option value="8 inch">8 inch (Standard)</option>
                    <option value="10 inch">10 inch (Large Scale)</option>
                  </select>
                </div>
              )}

              {/* Type for UAV */}
              {modalType === 'uav' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Aircraft Type *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.type}
                    onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value })}
                  >
                    <option value="FPV Drone">FPV Drone</option>
                    <option value="RC Plane">RC Scale Airplane</option>
                    <option value="Agri Drone">Agricultural Drone</option>
                    <option value="Toy Drone">Toy / Micro Drone</option>
                  </select>
                </div>
              )}

              {/* Kit Type for Robotics */}
              {modalType === 'robotics' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Kit Type *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.kitType}
                    onChange={(e) => setNewItemForm({ ...newItemForm, kitType: e.target.value })}
                  >
                    <option value="Chassis & Base">Chassis & Base</option>
                    <option value="Microcontrollers & IoT">Microcontrollers (ESP32/Arduino)</option>
                    <option value="Motors & Wheels">Motors & Wheels</option>
                    <option value="Learning Kits">Complete Learning Kits</option>
                  </select>
                </div>
              )}

              {/* Drone Category for Drone Parts */}
              {modalType === 'drone' && (
                <div>
                  <label className="form-field-label" style={{ color: '#cbd5e1' }}>Category *</label>
                  <select
                    className="profile-input"
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  >
                    <option value="Motors">Motors</option>
                    <option value="Electronics">Electronics (ESC/FC/DJI O3)</option>
                    <option value="Frames">Frames</option>
                    <option value="3D Parts">3D Printed Parts</option>
                    <option value="Agricultural Parts">Agricultural Parts</option>
                  </select>
                </div>
              )}

              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Price (₹) *</label>
                <input
                  type="number"
                  className="profile-input"
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                  placeholder=""
                  required
                />
              </div>

              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Stock Quantity *</label>
                <input
                  type="number"
                  className="profile-input"
                  value={newItemForm.quantity}
                  onChange={(e) => setNewItemForm({ ...newItemForm, quantity: e.target.value === '' ? '' : parseInt(e.target.value, 10) || 0 })}
                  placeholder=""
                  required
                />
              </div>

              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Primary Image URL / Asset Path *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="profile-input"
                    value={newItemForm.image}
                    onChange={(e) => setNewItemForm({ ...newItemForm, image: e.target.value })}
                    placeholder="e.g. /images/fpv_racing_drone.jpg or https://..."
                    required={newPhotosList.length === 0}
                  />
                  <button
                    type="button"
                    className="admin-btn-assist"
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', whiteSpace: 'nowrap', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      if (newItemForm.image.trim() && !newPhotosList.includes(newItemForm.image.trim())) {
                        setNewPhotosList([...newPhotosList, newItemForm.image.trim()]);
                      }
                    }}
                  >
                    + Add to Gallery
                  </button>
                </div>
              </div>

              {/* Multi-Photo Input for New Item */}
              <div className="full-span" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label className="form-field-label" style={{ color: '#cbd5e1', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ImageIcon size={14} color="#38bdf8" /> Multiple Photos Gallery ({newPhotosList.length} photos)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>First photo is Cover / Primary</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <input
                    type="text"
                    className="profile-input"
                    value={addPhotoInput}
                    onChange={(e) => setAddPhotoInput(e.target.value)}
                    placeholder="Paste additional image URL (e.g. /images/drone_flying_sunset.jpg)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (addPhotoInput.trim()) {
                          setNewPhotosList([...newPhotosList, addPhotoInput.trim()]);
                          if (!newItemForm.image) setNewItemForm({ ...newItemForm, image: addPhotoInput.trim() });
                          setAddPhotoInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="admin-btn-assist"
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1.1rem', whiteSpace: 'nowrap', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      if (addPhotoInput.trim()) {
                        setNewPhotosList([...newPhotosList, addPhotoInput.trim()]);
                        if (!newItemForm.image) setNewItemForm({ ...newItemForm, image: addPhotoInput.trim() });
                        setAddPhotoInput('');
                      }
                    }}
                  >
                    Add Photo
                  </button>
                </div>

                {newPhotosList.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {newPhotosList.map((photo, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)', background: '#0f172a' }}>
                        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/fpv_racing_drone.jpg'; }} />
                        {idx === 0 && (
                          <span style={{ position: 'absolute', top: 0, left: 0, background: '#0284c7', color: '#fff', fontSize: '9px', padding: '1px 4px', fontWeight: 700, borderRadius: '0 0 4px 0' }}>COVER</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setNewPhotosList(newPhotosList.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.75)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    No extra photos added yet. Add multiple photos so customers can slide and view angles on the detail page.
                  </p>
                )}
              </div>

              <div className="full-span">
                <label className="form-field-label" style={{ color: '#cbd5e1' }}>Description</label>
                <textarea
                  rows={3}
                  className="profile-textarea"
                  value={newItemForm.desc}
                  onChange={(e) => setNewItemForm({ ...newItemForm, desc: e.target.value })}
                  placeholder=""
                />
              </div>

              <div className="full-span" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-save"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PHOTO GALLERY MANAGER ───────────────────────────── */}
      {photoModalOpen && editingPhotoTarget && (
        <div className="admin-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '680px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', color: '#fff', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={18} color="#38bdf8" /> Manage Product Photos
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  {editingPhotoTarget.item.name} &bull; <span style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{editingPhotoTarget.type}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Live Preview Slider */}
              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1', marginBottom: '0.4rem', display: 'block' }}>
                  Customer Live Slider Preview ({editingPhotoTarget.images.length} Photos)
                </label>
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#0a0f2e' }}>
                  <ImageSlider
                    images={editingPhotoTarget.images}
                    alt={editingPhotoTarget.item.name}
                    height="200px"
                  />
                </div>
              </div>

              {/* Add New Photo Input */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label className="form-field-label" style={{ color: '#cbd5e1', marginBottom: '0.4rem', display: 'block' }}>
                  Add Another Photo to this Product
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="profile-input"
                    value={editPhotoInput}
                    onChange={(e) => setEditPhotoInput(e.target.value)}
                    placeholder="Enter image URL or local path (e.g. /images/fpv_racing_drone.jpg)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPhotoToTarget();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoToTarget}
                    className="admin-btn-action-primary"
                    style={{ whiteSpace: 'nowrap', padding: '0.55rem 1.1rem' }}
                  >
                    + Add Photo
                  </button>
                </div>

                {/* Quick suggestions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Presets:</span>
                  {[
                    '/images/fpv_racing_drone.jpg',
                    '/images/hero_drone_bg.jpg',
                    '/images/drone_flying_sunset.jpg',
                    '/images/drone_farming_action.jpg'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (!editingPhotoTarget.images.includes(preset)) {
                          setEditingPhotoTarget((prev) => ({
                            ...prev,
                            images: [...prev.images, preset]
                          }));
                        }
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      + {preset.replace('/images/', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Thumbnails List with Reorder / Delete */}
              <div>
                <label className="form-field-label" style={{ color: '#cbd5e1', marginBottom: '0.4rem', display: 'block' }}>
                  Current Photos in Gallery (Drag order or click to set Cover)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {editingPhotoTarget.images.map((photo, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid #0284c7' : '1px solid rgba(255,255,255,0.12)',
                        background: '#090d24',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ height: '90px', width: '100%', position: 'relative' }}>
                        <img
                          src={photo}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/images/fpv_racing_drone.jpg'; }}
                        />
                        {idx === 0 && (
                          <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#0284c7', color: '#fff', fontSize: '9px', padding: '2px 5px', fontWeight: 700, borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                            PRIMARY COVER
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoFromTarget(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239,68,68,0.85)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ padding: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#060a1f' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>#{idx + 1}</span>
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #38bdf8',
                              color: '#38bdf8',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '0.68rem',
                              cursor: 'pointer'
                            }}
                          >
                            Set Cover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setPhotoModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="modal-btn-save"
                  onClick={handleSavePhotoUpdates}
                  disabled={actionLoading}
                  style={{ background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={14} />
                  {actionLoading ? 'Saving Changes...' : `Save Photos (${editingPhotoTarget.images.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT DETAILS & DESCRIPTION ────────── */}
      {editProductModalOpen && editingProductTarget && (
        <div className="admin-modal-overlay" onClick={() => setEditProductModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Edit3 size={20} className="neon-text" />
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
                    Edit Product Details & Description
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                    Updating: <strong style={{ color: '#fff' }}>{editingProductTarget.item?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setEditProductModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductDetails} className="admin-modal-body">
              {/* Product Name */}
              <div className="admin-input-group" style={{ marginBottom: '0.9rem' }}>
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  className="admin-input-field"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Gojo Satoru 3D Figure"
                />
              </div>

              {/* Category & Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div className="admin-input-group">
                  <label>Category / Type</label>
                  <input
                    type="text"
                    className="admin-input-field"
                    value={editProductForm.category}
                    onChange={(e) => setEditProductForm((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Anime, Frame, ESC, Drone"
                  />
                </div>
                <div className="admin-input-group">
                  <label>Brand / Manufacturer</label>
                  <input
                    type="text"
                    className="admin-input-field"
                    value={editProductForm.brand}
                    onChange={(e) => setEditProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g. NexFly Studio, T-Motor"
                  />
                </div>
              </div>

              {/* Price & Quantity (Separate prices for 6", 8", 10" sizes for 3D Studio) */}
              {editingProductTarget.type === '3dstudio' ? (
                <div style={{ background: 'rgba(0, 200, 255, 0.06)', border: '1.5px solid rgba(0, 200, 255, 0.25)', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.9rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--neon)', marginBottom: '0.55rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span>💰 Separate Prices per Model Size (25% Density):</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>All with 25% Strength Infill</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem', color: '#38bdf8' }}>6 inch (150mm) ₹ *</label>
                      <input
                        type="number"
                        required
                        className="admin-input-field"
                        value={editProductForm.price6Inch}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, price6Inch: e.target.value }))}
                      />
                    </div>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem', color: '#38bdf8' }}>8 inch (200mm) ₹ *</label>
                      <input
                        type="number"
                        required
                        className="admin-input-field"
                        value={editProductForm.price8Inch}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, price8Inch: e.target.value, price: e.target.value }))}
                      />
                    </div>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem', color: '#38bdf8' }}>10 inch (250mm) ₹ *</label>
                      <input
                        type="number"
                        required
                        className="admin-input-field"
                        value={editProductForm.price10Inch}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, price10Inch: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="admin-input-group">
                    <label style={{ fontSize: '0.75rem' }}>Stock / In-Stock Units *</label>
                    <input
                      type="number"
                      required
                      className="admin-input-field"
                      value={editProductForm.quantity}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                  <div className="admin-input-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      className="admin-input-field"
                      value={editProductForm.price}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="admin-input-group">
                    <label>Stock / In-Stock Units *</label>
                    <input
                      type="number"
                      required
                      className="admin-input-field"
                      value={editProductForm.quantity}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="admin-input-group" style={{ marginBottom: '0.9rem' }}>
                <label>Comprehensive Product Description</label>
                <textarea
                  rows={4}
                  className="admin-input-field"
                  style={{ resize: 'vertical', lineHeight: 1.5 }}
                  value={editProductForm.desc}
                  onChange={(e) => setEditProductForm((prev) => ({ ...prev, desc: e.target.value }))}
                  placeholder="Provide rich details about material quality, craftsmanship, technical specifications, and compatibility..."
                />
              </div>

              {/* Dynamic Specifics for 3D Studio Items */}
              {editingProductTarget.type === '3dstudio' && (
                <div style={{ background: 'rgba(255,0,170,0.06)', border: '1px solid rgba(255,0,170,0.2)', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.9rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff00aa', marginBottom: '0.65rem' }}>
                    🖨️ FDM 3D Printing & Filament Specs (All 25% Density)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem' }}>Core Infill / Density</label>
                      <input
                        type="text"
                        disabled
                        className="admin-input-field"
                        style={{ opacity: 0.8 }}
                        value="25% Strength"
                      />
                    </div>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem' }}>Estimated Print Time</label>
                      <input
                        type="text"
                        className="admin-input-field"
                        value={editProductForm.printTime}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, printTime: e.target.value }))}
                        placeholder="e.g. 6h 30m"
                      />
                    </div>
                  </div>
                  <div className="admin-input-group">
                    <label style={{ fontSize: '0.75rem' }}>Filament Materials (FDM)</label>
                    <input
                      type="text"
                      className="admin-input-field"
                      value={editProductForm.material}
                      onChange={(e) => setEditProductForm((prev) => ({ ...prev, material: e.target.value }))}
                      placeholder="e.g. FDM Tough PLA (Hard Plastic) / TPU (Soft & Flexible)"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Specifics for UAVs */}
              {editingProductTarget.type === 'uav' && (
                <div style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.9rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon)', marginBottom: '0.65rem' }}>
                    ✈️ UAV Flight Performance Specifications
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem' }}>Flight Time</label>
                      <input
                        type="text"
                        className="admin-input-field"
                        value={editProductForm.flightTime}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, flightTime: e.target.value }))}
                        placeholder="e.g. 18 mins"
                      />
                    </div>
                    <div className="admin-input-group">
                      <label style={{ fontSize: '0.75rem' }}>Radio / Video Range</label>
                      <input
                        type="text"
                        className="admin-input-field"
                        value={editProductForm.range}
                        onChange={(e) => setEditProductForm((prev) => ({ ...prev, range: e.target.value }))}
                        placeholder="e.g. 3.5 km"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setEditProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-save"
                  disabled={actionLoading}
                  style={{ background: 'var(--neon)', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Save size={14} />
                  {actionLoading ? 'Saving...' : 'Save Product Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX: CUSTOMER UPLOADED PHOTO & PACKAGING PICS ────────── */}
      {enlargedOrderPhoto && (
        <div
          className="admin-modal-overlay"
          style={{ zIndex: 99999, background: 'rgba(3, 7, 24, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setEnlargedOrderPhoto(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0a0f2e',
              border: '1.5px solid var(--neon)',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>
                  {enlargedOrderPhoto.title || 'Order Image'}
                </h4>
                <div
                  style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}
                  dangerouslySetInnerHTML={{ __html: enlargedOrderPhoto.subtitle || '' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={enlargedOrderPhoto.url}
                  download="order_attachment.png"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setEnlargedOrderPhoto(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ maxWidth: '85vw', maxHeight: '72vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', borderRadius: '8px', background: '#000' }}>
              <img
                src={enlargedOrderPhoto.url}
                alt={enlargedOrderPhoto.title || 'Enlarged'}
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
