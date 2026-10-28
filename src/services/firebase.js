// ============================================================
//  NaviDron — Firebase Cloud Firestore & Realtime Database Integration
//  Project: navidron-e2983
// ============================================================

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getDatabase,
  ref as dbRef,
  set as dbSet,
  get as dbGet,
  child as dbChild
} from 'firebase/database';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';

const RTDB_URL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  "https://navidron-e2983-default-rtdb.firebaseio.com";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5aUyHeMai2fbrXoKweK3D570LHFRSwvs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "navidron-e2983.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "navidron-e2983",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "navidron-e2983.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "857122721914",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:857122721914:web:e384436d89619b62daebc3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7RYT24EQNS",
  databaseURL: RTDB_URL
};

let app;
let auth = null;
let rtdb = null;
let db = null;
let isFirebaseOnline = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  try {
    rtdb = getDatabase(app, RTDB_URL);
  } catch (e) {}
  isFirebaseOnline = true;
} catch (error) {
  console.warn("Firebase initialization warning:", error.message);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Timeout utility to ensure calls NEVER spin/hang indefinitely
const withTimeout = (promise, ms = 3500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout (3.5s) waiting for Firebase response")), ms)
    )
  ]);
};

// ── Clean Fresh Profile Default (No fake or mock details) ──────
export const DEFAULT_USER_PROFILE = {
  name: "",
  email: "",
  phone: "",
  altPhone: "",
  memberSince: "",
  badge: "Pilot Member",
  clerkLinked: false,
  firebaseConnected: true
};

export const DEFAULT_ADDRESSES = [];

export const DEFAULT_ORDERS = [];

export const sanitizeKey = (key = 'guest_user') => {
  return String(key).replace(/[.#$[\]/]/g, '_');
};

export const getStorageKey = (prefix, uid = 'guest_user') => `navidron_${prefix}_${sanitizeKey(uid)}`;

export function getEffectiveUserId(user) {
  if (!user) {
    try {
      const saved = localStorage.getItem('navidron_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id || parsed?.uid) return sanitizeKey(parsed.id || parsed.uid);
      }
    } catch (e) {}
    return 'guest_user';
  }
  return sanitizeKey(user.id || user.uid || 'guest_user');
}

// ── Direct REST API for Cloud Firestore ────────────────────────
function toFirestoreRestValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return { arrayValue: {} };
    }
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreRestValue(item))
      }
    };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreRestValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function formatRestFields(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) {
      fields[k] = toFirestoreRestValue(v);
    }
  }
  return fields;
}

export function parseFirestoreRestValue(valObj) {
  if (!valObj) return null;
  if ('stringValue' in valObj) return valObj.stringValue;
  if ('integerValue' in valObj) return parseInt(valObj.integerValue, 10);
  if ('doubleValue' in valObj) return parseFloat(valObj.doubleValue);
  if ('booleanValue' in valObj) return valObj.booleanValue;
  if ('nullValue' in valObj) return null;
  if ('timestampValue' in valObj) return valObj.timestampValue;
  if ('arrayValue' in valObj) {
    const arr = valObj.arrayValue?.values || [];
    return arr.map(parseFirestoreRestValue);
  }
  if ('mapValue' in valObj) {
    return fromFirestoreRestFields(valObj.mapValue?.fields || {});
  }
  return null;
}

export function fromFirestoreRestFields(fields = {}) {
  const result = {};
  for (const [key, valObj] of Object.entries(fields)) {
    result[key] = parseFirestoreRestValue(valObj);
  }
  return result;
}

async function writeFirestoreRest(docPath, data) {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  const cleanPath = docPath.startsWith('/') ? docPath.slice(1) : docPath;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${cleanPath}?key=${apiKey}`;

  const fields = formatRestFields(data);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || `HTTP ${res.status}`);
    }
    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function deleteFirestoreRest(docPath) {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  const cleanPath = docPath.startsWith('/') ? docPath.slice(1) : docPath;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${cleanPath}?key=${apiKey}`;

  try {
    await fetch(url, { method: 'DELETE' });
  } catch (err) {}
}

// Clean up any stray documents or subcollection artifacts so only the single user doc appears in Firestore
async function cleanupLegacyUserDocs(uid) {
  if (!uid) return;
  const docsToDelete = [
    `users/${uid}_addresses`,
    `users/${uid}_orders`,
    `users/${uid}/addresses/all`,
    `users/${uid}/orders/all`,
    `users/${uid}/bills/all`
  ];

  for (const p of docsToDelete) {
    deleteFirestoreRest(p).catch(() => {});
  }

  if (db) {
    try {
      deleteDoc(doc(db, 'users', `${uid}_addresses`)).catch(() => {});
      deleteDoc(doc(db, 'users', `${uid}_orders`)).catch(() => {});
      deleteDoc(doc(db, 'users', uid, 'addresses', 'all')).catch(() => {});
      deleteDoc(doc(db, 'users', uid, 'orders', 'all')).catch(() => {});
      deleteDoc(doc(db, 'users', uid, 'bills', 'all')).catch(() => {});
    } catch (e) {}
  }
}

// Generate bill records from user orders
export function generateBillsFromOrders(orders = [], userProfile = {}) {
  if (!Array.isArray(orders)) return [];
  return orders.map((order, idx) => {
    const numericId = String(order.id || idx).replace(/[^0-9]/g, '') || String(1001 + idx);
    return {
      id: `BILL-${order.id || numericId}`,
      orderId: order.id || `NVD-${numericId}`,
      billNumber: `INV-2026-${numericId}`,
      date: order.date || new Date().toISOString().split('T')[0],
      customerName: userProfile.name || 'Valued Pilot',
      customerEmail: userProfile.email || '',
      totalAmount: order.totalAmount || 5499,
      tax: Math.round((order.totalAmount || 5499) * 0.18),
      paymentStatus: order.paymentStatus || 'Paid Online',
      status: 'Paid',
      itemsCount: Array.isArray(order.items) ? order.items.length : 1,
      items: order.items || [],
      issuedAt: new Date().toISOString()
    };
  });
}

// ── Synchronize Complete User Data to Firebase (Firestore) ─────
// Saves everything as 3 FIELDS (Contact, Delivery Address, Order History) inside the single user document
export async function syncUserFullDataToFirebase(user) {
  if (!user) return { success: false, reason: "No user provided" };
  const uid = getEffectiveUserId(user);

  // Check if user already has saved profile, addresses, or orders in local storage
  const cachedProfile = localStorage.getItem(getStorageKey('profile', uid));
  let existingProfile = null;
  if (cachedProfile) {
    try { existingProfile = JSON.parse(cachedProfile); } catch (e) {}
  }

  const cachedAddresses = localStorage.getItem(getStorageKey('addresses', uid));
  let existingAddresses = null;
  if (cachedAddresses) {
    try { existingAddresses = JSON.parse(cachedAddresses); } catch (e) {}
  }

  const cachedOrders = localStorage.getItem(getStorageKey('orders', uid));
  let existingOrders = null;
  if (cachedOrders) {
    try { existingOrders = JSON.parse(cachedOrders); } catch (e) {}
  }

  const cachedCart = localStorage.getItem(getStorageKey('cart', uid));
  let existingCart = [];
  if (cachedCart) {
    try {
      const parsed = JSON.parse(cachedCart);
      if (Array.isArray(parsed)) existingCart = parsed;
    } catch (e) {}
  }

  // Preserve user's updated name, email, bio, phone; never revert to default!
  const name = existingProfile?.name || user.fullName || user.name || "";
  const email = existingProfile?.email || user.primaryEmailAddress?.emailAddress || user.email || "";

  const addressesData = (existingAddresses && Array.isArray(existingAddresses))
    ? existingAddresses
    : [];

  const ordersData = (existingOrders && Array.isArray(existingOrders))
    ? existingOrders
    : [];

  const contactData = {
    ...DEFAULT_USER_PROFILE,
    ...(existingProfile || {}),
    name: name,
    email: email,
    updatedAt: new Date().toISOString()
  };

  // Purely user fields inside the document (Contact, Delivery Address, Order History, Cart)
  const documentData = {
    Contact: contactData,
    contact: contactData,
    "Delivery Address": addressesData,
    deliveryAddresses: addressesData,
    "Order History": ordersData,
    orderHistory: ordersData,
    Cart: existingCart,
    cart: existingCart,
    name: name,
    email: email,
    updatedAt: new Date().toISOString()
  };

  let firestoreOk = false;
  let lastError = null;

  // 1. Try Direct Firestore REST API
  try {
    await writeFirestoreRest(`users/${uid}`, documentData);
    firestoreOk = true;
  } catch (err) {
    lastError = err.message;
    console.warn("Firestore REST write failed:", err.message);
  }

  // 2. Try Firestore JS SDK (with 3.5s timeout)
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', uid), documentData, { merge: true }), 3500);
      firestoreOk = true;
    } catch (err) {
      if (!lastError) lastError = err.message;
      console.warn("Firestore SDK write failed:", err.message);
    }
  }

  // Clean up any legacy separate documents or subcollections
  cleanupLegacyUserDocs(uid);

  // 3. Cache locally
  localStorage.setItem(getStorageKey('profile', uid), JSON.stringify(contactData));
  localStorage.setItem(getStorageKey('addresses', uid), JSON.stringify(addressesData));
  localStorage.setItem(getStorageKey('orders', uid), JSON.stringify(ordersData));

  // Also update active session in localStorage if logged in
  const currentSession = localStorage.getItem('navidron_current_user');
  if (currentSession) {
    try {
      const parsed = JSON.parse(currentSession);
      if (contactData.name) parsed.name = contactData.name;
      if (contactData.email) parsed.email = contactData.email;
      localStorage.setItem('navidron_current_user', JSON.stringify(parsed));
    } catch (e) {}
  }

  return {
    success: firestoreOk,
    firestore: firestoreOk,
    error: lastError
  };
}

// ── Google Sign In (Firebase Provider) ─────────────────────────
export async function signInWithGoogle() {
  if (auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const userObj = {
        uid: googleUser.uid,
        id: googleUser.uid,
        name: googleUser.displayName || (googleUser.email ? googleUser.email.split('@')[0] : "Pilot"),
        email: googleUser.email || "",
        photoURL: googleUser.photoURL || null
      };

      await syncUserFullDataToFirebase(userObj);
      localStorage.setItem('navidron_current_user', JSON.stringify(userObj));
      return { success: true, user: userObj, isRealFirebase: true };
    } catch (err) {
      console.warn("Google popup error:", err.message);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "Firebase Auth not available" };
}

// ── User Profile Services ─────────────────────────────────────
export async function getUserProfile(uidOrUser = 'guest_user') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('profile', cleanId);

  // 1. Immediately return local cache if present
  const cached = localStorage.getItem(localKey);
  let localData = null;
  if (cached) {
    try {
      localData = JSON.parse(cached);
    } catch (e) {}
  }

  if (localData) {
    // Background sync from remote Firestore without blocking UI render
    if (db) {
      withTimeout(getDoc(doc(db, 'users', cleanId)), 2000)
        .then((docSnap) => {
          if (docSnap && docSnap.exists()) {
            const val = docSnap.data();
            const contact = val.Contact || val.contact || val;
            localStorage.setItem(localKey, JSON.stringify({ ...localData, ...contact }));
          }
        })
        .catch(() => {});
    }
    return { ...DEFAULT_USER_PROFILE, ...localData };
  }

  // 2. If no local cache, query Firestore SDK
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const val = docSnap.data();
        const contact = val.Contact || val.contact || val;
        localStorage.setItem(localKey, JSON.stringify(contact));
        return { ...DEFAULT_USER_PROFILE, ...contact };
      }
    } catch (e) {}
  }

  return DEFAULT_USER_PROFILE;
}

export async function saveUserProfile(uidOrUser = 'guest_user', profileData) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('profile', cleanId);
  const dataWithTimestamp = {
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local storage first
  localStorage.setItem(localKey, JSON.stringify(dataWithTimestamp));

  // 2. Also keep active session in sync
  const currentSession = localStorage.getItem('navidron_current_user');
  if (currentSession) {
    try {
      const parsed = JSON.parse(currentSession);
      parsed.name = profileData.name;
      parsed.email = profileData.email;
      localStorage.setItem('navidron_current_user', JSON.stringify(parsed));
    } catch (e) {}
  } else {
    localStorage.setItem('navidron_current_user', JSON.stringify({
      id: cleanId,
      uid: cleanId,
      name: profileData.name,
      email: profileData.email
    }));
  }

  let firestoreSaved = false;
  let lastError = null;

  const updatePayload = {
    Contact: dataWithTimestamp,
    contact: dataWithTimestamp,
    name: profileData.name || "",
    email: profileData.email || "",
    updatedAt: dataWithTimestamp.updatedAt
  };

  // 3. Try Firestore REST
  try {
    await writeFirestoreRest(`users/${cleanId}`, updatePayload);
    firestoreSaved = true;
  } catch (err) {
    lastError = err.message;
  }

  // 4. Try Firestore SDK with timeout
  if (!firestoreSaved && db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', cleanId), updatePayload, { merge: true }), 3500);
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  // Clean up any stray legacy docs
  cleanupLegacyUserDocs(cleanId);

  return { success: firestoreSaved, error: lastError };
}

// ── Delivery Addresses Services ───────────────────────────────
export async function getUserAddresses(uidOrUser = 'guest_user') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('addresses', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // If no cache, check Firestore inside user doc field
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        const list = data['Delivery Address'] || data.deliveryAddresses || data.addresses;
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {}
  }

  return DEFAULT_ADDRESSES;
}

export async function saveUserAddresses(uidOrUser = 'guest_user', addresses) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('addresses', cleanId);
  localStorage.setItem(localKey, JSON.stringify(addresses));

  let firestoreSaved = false;
  let lastError = null;
  const updatedAt = new Date().toISOString();

  const updatePayload = {
    "Delivery Address": addresses,
    deliveryAddresses: addresses,
    updatedAt
  };

  // 1. Try Firestore REST: update user doc field directly (no subcollection)
  try {
    await writeFirestoreRest(`users/${cleanId}`, updatePayload);
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  // 2. Try Firestore SDK
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', cleanId), updatePayload, { merge: true }), 3500);
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  // Clean up any stray legacy docs from users collection
  cleanupLegacyUserDocs(cleanId);

  return { success: firestoreSaved, error: lastError };
}

// ── Order History Services ────────────────────────────────────
export async function getUserOrders(uidOrUser = 'guest_user') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('orders', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // If no cache, check Firestore inside user doc field
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        const list = data['Order History'] || data.orderHistory || data.orders;
        if (Array.isArray(list) && list.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(list));
          return list;
        }
      }
    } catch (e) {}
  }

  return DEFAULT_ORDERS;
}

export async function saveUserOrders(uidOrUser = 'guest_user', orders) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('orders', cleanId);
  localStorage.setItem(localKey, JSON.stringify(orders));

  let firestoreSaved = false;
  let lastError = null;
  const updatedAt = new Date().toISOString();

  const updatePayload = {
    "Order History": orders,
    orderHistory: orders,
    updatedAt
  };

  // 1. Try Firestore REST: update user doc field directly (no subcollection)
  try {
    await writeFirestoreRest(`users/${cleanId}`, updatePayload);
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  // 2. Try Firestore SDK
  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', cleanId), updatePayload, { merge: true }), 3500);
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  // Clean up any stray legacy docs from users collection
  cleanupLegacyUserDocs(cleanId);

  return { success: firestoreSaved, error: lastError };
}

// ── User Cart Services ────────────────────────────────────────
export async function getUserCart(uidOrUser = 'guest_user') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('cart', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  // Fallback to Firestore doc field
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        const cartList = data.Cart || data.cart || [];
        if (Array.isArray(cartList)) {
          localStorage.setItem(localKey, JSON.stringify(cartList));
          return cartList;
        }
      }
    } catch (e) {}
  }

  return [];
}

export async function saveUserCart(uidOrUser = 'guest_user', cartItems = []) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('cart', cleanId);
  localStorage.setItem(localKey, JSON.stringify(cartItems));

  const updatePayload = {
    Cart: cartItems,
    cart: cartItems,
    updatedAt: new Date().toISOString()
  };

  try {
    await writeFirestoreRest(`users/${cleanId}`, updatePayload);
  } catch (e) {}

  if (db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', cleanId), updatePayload, { merge: true }), 3500);
    } catch (e) {}
  }

  return cartItems;
}

export async function addToUserCart(uidOrUser = 'guest_user', item) {
  const cart = await getUserCart(uidOrUser);
  const existingIdx = cart.findIndex((i) => i.id === item.id && (i.size || '') === (item.size || ''));

  let updated;
  if (existingIdx >= 0) {
    updated = [...cart];
    updated[existingIdx].quantity = (updated[existingIdx].quantity || 1) + (item.quantity || 1);
  } else {
    updated = [
      ...cart,
      {
        ...item,
        quantity: item.quantity || 1,
        addedAt: new Date().toISOString()
      }
    ];
  }

  await saveUserCart(uidOrUser, updated);
  return updated;
}

export async function removeFromUserCart(uidOrUser = 'guest_user', itemId, size = null) {
  const cart = await getUserCart(uidOrUser);
  const updated = cart.filter((i) => {
    if (i.id !== itemId) return true;
    if (size && (i.size || '') !== size) return true;
    return false;
  });
  await saveUserCart(uidOrUser, updated);
  return updated;
}

export async function updateUserCartQuantity(uidOrUser = 'guest_user', itemId, newQty, size = null) {
  if (newQty <= 0) {
    return removeFromUserCart(uidOrUser, itemId, size);
  }
  const cart = await getUserCart(uidOrUser);
  const updated = cart.map((i) => {
    if (i.id === itemId && (!size || (i.size || '') === size)) {
      return { ...i, quantity: newQty };
    }
    return i;
  });
  await saveUserCart(uidOrUser, updated);
  return updated;
}

export async function clearUserCart(uidOrUser = 'guest_user') {
  return saveUserCart(uidOrUser, []);
}

// ── Generic Firestore Collection Read/Write ───────────────────
export async function readFirestoreCollection(collectionName) {
  // 1. Try Firestore SDK
  if (db) {
    try {
      const snap = await withTimeout(getDocs(collection(db, collectionName)), 3500);
      if (snap && !snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn(`Firestore SDK getDocs(${collectionName}) fallback:`, e.message);
    }
  }

  // 2. Try Firestore REST
  try {
    const apiKey = firebaseConfig.apiKey;
    const projectId = firebaseConfig.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        return data.documents.map((docItem) => {
          const docId = docItem.name.split('/').pop();
          const parsed = fromFirestoreRestFields(docItem.fields || {});
          return { id: docId, ...parsed };
        });
      }
    }
  } catch (e) {
    console.warn(`Firestore REST getCollection(${collectionName}) fallback:`, e.message);
  }

  return [];
}

export async function writeFirestoreDoc(collectionName, docId, data) {
  let ok = false;
  try {
    await writeFirestoreRest(`${collectionName}/${docId}`, data);
    ok = true;
  } catch (e) {}

  if (db) {
    try {
      await withTimeout(setDoc(doc(db, collectionName, docId), data, { merge: true }), 3500);
      ok = true;
    } catch (e) {}
  }
  return ok;
}

export async function deleteFirestoreDoc(collectionName, docId) {
  try {
    await deleteFirestoreRest(`${collectionName}/${docId}`);
  } catch (e) {}

  if (db) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (e) {}
  }
}

// ── Root Collection 1: "Order" (Global Live Orders) ───────────
export async function getAllOrders() {
  const localCached = localStorage.getItem('navidron_global_orders');
  let fallback = [];
  if (localCached) {
    try { fallback = JSON.parse(localCached); } catch (e) {}
  }

  try {
    const list = await readFirestoreCollection('Order');
    if (Array.isArray(list) && list.length > 0) {
      // Sort newest first
      list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      localStorage.setItem('navidron_global_orders', JSON.stringify(list));
      return list;
    }
  } catch (e) {}

  return fallback;
}

export async function createGlobalOrder(orderData) {
  const orderId = orderData.id || `NVD-${Math.floor(10000 + Math.random() * 90000)}`;
  const cleanOrder = {
    ...orderData,
    id: orderId,
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || 'Succeeded',
    date: orderData.date || new Date().toISOString().split('T')[0]
  };

  // 1. Save to global Order collection in Firestore
  await writeFirestoreDoc('Order', orderId, cleanOrder);

  // 2. Cache in global orders local list
  const existingGlobal = await getAllOrders();
  const updatedGlobal = [cleanOrder, ...existingGlobal.filter((o) => o.id !== orderId)];
  localStorage.setItem('navidron_global_orders', JSON.stringify(updatedGlobal));

  // 3. Update customer's own Order History inside their personal document
  const customerUid = orderData.customer?.uid || orderData.customerUid;
  if (customerUid) {
    try {
      const userOrders = await getUserOrders(customerUid);
      const updatedUserOrders = [cleanOrder, ...userOrders.filter((o) => o.id !== orderId)];
      await saveUserOrders(customerUid, updatedUserOrders);
    } catch (e) {}
  }

  return cleanOrder;
}

export async function updateOrderStatus(orderId, newStatus) {
  await writeFirestoreDoc('Order', orderId, { status: newStatus, updatedAt: new Date().toISOString() });

  const existingGlobal = await getAllOrders();
  const updatedGlobal = existingGlobal.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
  localStorage.setItem('navidron_global_orders', JSON.stringify(updatedGlobal));

  // Also update user's own orders if customer UID is attached
  const target = existingGlobal.find((o) => o.id === orderId);
  const customerUid = target?.customer?.uid || target?.customerUid;
  if (customerUid) {
    try {
      const userOrders = await getUserOrders(customerUid);
      const updatedUserOrders = userOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      await saveUserOrders(customerUid, updatedUserOrders);
    } catch (e) {}
  }

  return true;
}

// ── Root Collection 2: "3DStudio" ──────────────────────────────
export const INITIAL_3D_STUDIO = [
  {
    id: "3d-luffy-gear5",
    name: "Monkey D. Luffy — Gear 5 Sun God",
    category: "Anime",
    brand: "P_Brothers × NaviDron 3D",
    price: 949,
    quantity: 25,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 45m", weight: "120g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 30m", weight: "240g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "11h 15m", weight: "420g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "18h 40m", weight: "710g" }
    ],
    image: "/images/anime_figure_3d.jpg",
    images: [
      "/images/anime_figure_3d.jpg",
      "/images/3d_printed_gift_pack.jpg",
      "/images/valorant_action_figures_1791059182363.jpg"
    ],
    printTime: "6h 30m",
    material: "SLA UV-Tough Photopolymer Resin (8K Detail)",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Whimsical Gear 5 cloud-ring sculpt with joyful laughing expression from One Piece Wano arc. Meticulously cured, hand-sanded, and coated in matte UV-resistant sealant.",
    badge: "TRENDING"
  },
  {
    id: "3d-goku-ssj",
    name: "Goku — Super Saiyan Kamehameha",
    category: "Anime",
    brand: "P_Brothers × NaviDron 3D",
    price: 849,
    quantity: 20,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 20m", weight: "115g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 15m", weight: "230g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "10h 50m", weight: "410g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "17h 50m", weight: "690g" }
    ],
    image: "/images/anime_figure_3d.jpg",
    images: [
      "/images/anime_figure_3d.jpg",
      "/images/action_figure_valorant.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "6h 15m",
    material: "SLA UV-Tough Photopolymer Resin (8K Detail)",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Iconic Dragon Ball Z protagonist with translucent golden energy wave aura piece and battle-damaged gi texture.",
    badge: "ANIME HERO"
  },
  {
    id: "3d-naruto-sage",
    name: "Naruto Uzumaki — Sage Mode Rasenshuriken",
    category: "Anime",
    brand: "P_Brothers × NaviDron 3D",
    price: 799,
    quantity: 30,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 10m", weight: "110g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "5h 50m", weight: "220g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "10h 20m", weight: "390g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "16h 30m", weight: "660g" }
    ],
    image: "/images/anime_figure_3d.jpg",
    images: [
      "/images/anime_figure_3d.jpg",
      "/images/valorant_action_figures_1791059182363.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "5h 50m",
    material: "SLA UV-Tough Photopolymer Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Toad sage cloak, orange eye markings, and translucent wind spiral Rasenshuriken hovering on custom stone stand.",
    badge: "CLASSIC"
  },
  {
    id: "3d-tanjiro-flame",
    name: "Tanjiro Kamado — Hinokami Kagura",
    category: "Anime",
    brand: "P_Brothers × NaviDron 3D",
    price: 849,
    quantity: 18,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 30m", weight: "125g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 40m", weight: "245g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "11h 30m", weight: "430g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "18h 15m", weight: "720g" }
    ],
    image: "/images/anime_figure_3d.jpg",
    images: [
      "/images/anime_figure_3d.jpg",
      "/images/action_figure_valorant.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "6h 40m",
    material: "SLA UV-Tough Photopolymer Resin + Amber Translucent Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Demon Slayer sun-breathing spiral flame dragon wrapped around the Nichirin black blade with dynamic haori folds.",
    badge: "FLAME RESIN"
  },
  {
    id: "3d-gta-jason",
    name: "Jason — GTA 6 Dual Pistols Edition",
    category: "Game Characters",
    brand: "Rockstar Fan Art × NaviDron",
    price: 999,
    quantity: 40,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "4h 00m", weight: "135g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "7h 15m", weight: "260g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "12h 45m", weight: "460g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "20h 10m", weight: "780g" }
    ],
    image: "/images/gta6_merchandise_banner_1791059157486.jpg",
    images: [
      "/images/gta6_merchandise_banner_1791059157486.jpg",
      "/images/action_figure_valorant.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "7h 15m",
    material: "SLA UV-Tough Photopolymer Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Ultra high-resolution 3D print of Jason from GTA 6. Dual pistols, Miami tactical outfit, and custom Vice City street display base.",
    badge: "LIMITED DROP"
  },
  {
    id: "3d-gta-lucia",
    name: "Lucia — GTA 6 Vice City Star",
    category: "Game Characters",
    brand: "Rockstar Fan Art × NaviDron",
    price: 999,
    quantity: 35,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 50m", weight: "130g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "7h 00m", weight: "250g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "12h 20m", weight: "450g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "19h 45m", weight: "760g" }
    ],
    image: "/images/gta6_merchandise_banner_1791059157486.jpg",
    images: [
      "/images/gta6_merchandise_banner_1791059157486.jpg",
      "/images/valorant_action_figures_1791059182363.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "7h 00m",
    material: "SLA UV-Tough Photopolymer Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "The iconic first female lead of the GTA franchise. Detailed hair sculpt, bandana, and realistic Miami palm street aesthetic.",
    badge: "BESTSELLER"
  },
  {
    id: "3d-val-jett",
    name: "Jett — Blade Storm Pose",
    category: "Game Characters",
    brand: "Riot Fan Art × NaviDron",
    price: 799,
    quantity: 22,
    size: "6 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 15m", weight: "115g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 00m", weight: "225g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "10h 30m", weight: "400g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "16h 50m", weight: "670g" }
    ],
    image: "/images/valorant_action_figures_1791059182363.jpg",
    images: [
      "/images/valorant_action_figures_1791059182363.jpg",
      "/images/action_figure_valorant.jpg",
      "/images/anime_figure_3d.jpg"
    ],
    printTime: "3h 15m",
    material: "SLA UV-Tough Photopolymer Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Wind assassin Jett captured mid-air holding signature kunai daggers on a transparent acrylic flight stand with wind swirls.",
    badge: "HOT"
  },
  {
    id: "3d-val-reyna",
    name: "Reyna — Empress Leer",
    category: "Game Characters",
    brand: "Riot Fan Art × NaviDron",
    price: 799,
    quantity: 15,
    size: "6 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "3h 15m", weight: "115g" },
      { size: "8 inch (200mm)", priceOffset: 350, printTime: "6h 00m", weight: "225g" },
      { size: "10 inch (250mm)", priceOffset: 750, printTime: "10h 30m", weight: "400g" },
      { size: "12 inch (300mm)", priceOffset: 1300, printTime: "16h 50m", weight: "670g" }
    ],
    image: "/images/action_figure_valorant.jpg",
    images: [
      "/images/action_figure_valorant.jpg",
      "/images/valorant_action_figures_1791059182363.jpg",
      "/images/anime_figure_3d.jpg"
    ],
    printTime: "3h 15m",
    material: "SLA UV-Tough Photopolymer Resin",
    layerHeight: "0.08mm Ultra-Precision",
    infill: "100% Solid Resin Core",
    desc: "Duelist Reyna glowing in radiant purple resin with ethereal eye ability accent and Soul Orb hovering by her side.",
    badge: "POPULAR"
  },
  {
    id: "3d-custom-person",
    name: "Custom 3D Person Figure Sculpt (From Your Photo)",
    category: "Personal Character",
    brand: "NaviDron Bespoke Sculpting Labs",
    price: 1499,
    quantity: 999,
    size: "8 inch",
    sizes: ["6 inch", "8 inch", "10 inch", "12 inch", "Custom Scale"],
    sizeOptions: [
      { size: "6 inch (150mm)", priceOffset: 0, printTime: "5h 30m", weight: "140g" },
      { size: "8 inch (200mm)", priceOffset: 450, printTime: "8h 45m", weight: "270g" },
      { size: "10 inch (250mm)", priceOffset: 950, printTime: "14h 20m", weight: "490g" },
      { size: "12 inch (300mm)", priceOffset: 1600, printTime: "22h 00m", weight: "820g" }
    ],
    image: "/images/3d_print_lithophane.jpg",
    images: [
      "/images/3d_print_lithophane.jpg",
      "/images/lithophane_3d_print_1791059239454.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "8h 45m",
    material: "Dual-Layer 8K SLA Resin + Personalized Wooden Display Plaque",
    layerHeight: "0.05mm Micro-Detail Precision",
    infill: "100% Solid Resin Core",
    desc: "Upload or send your photo. Our digital sculptors convert facial features, posture, and clothing into a lifelike miniature 3D statue with custom name engraving.",
    badge: "CUSTOM PHOTO"
  },
  {
    id: "3d-litho-portrait",
    name: "Custom Photo Curved Backlit Lithophane",
    category: "Personal Character",
    brand: "NaviDron Bespoke Sculpting Labs",
    price: 499,
    quantity: 999,
    size: "6 inch",
    sizes: ["4 inch", "6 inch", "8 inch", "10 inch"],
    sizeOptions: [
      { size: "4 inch (100mm)", priceOffset: 0, printTime: "2h 30m", weight: "65g" },
      { size: "6 inch (150mm)", priceOffset: 250, printTime: "4h 45m", weight: "130g" },
      { size: "8 inch (200mm)", priceOffset: 550, printTime: "8h 15m", weight: "250g" },
      { size: "10 inch (250mm)", priceOffset: 950, printTime: "13h 00m", weight: "430g" }
    ],
    image: "/images/lithophane_3d_print_1791059239454.jpg",
    images: [
      "/images/lithophane_3d_print_1791059239454.jpg",
      "/images/3d_print_lithophane.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    printTime: "4h 45m",
    material: "High-Density Translucent PLA+ / Cured Resin",
    layerHeight: "0.08mm Optical Density Shift",
    infill: "100% Solid Optical Infill",
    desc: "Turn your personal memory photo into a luminous curved 3D lithophane with integrated USB warm LED backlight stand.",
    badge: "ILLUMINATED"
  }
];

export async function get3DStudioItems() {
  const localKey = 'navidron_catalog_3dstudio';
  const cached = localStorage.getItem(localKey);
  let localList = null;
  if (cached) {
    try { localList = JSON.parse(cached); } catch (e) {}
  }

  const cloudList = await readFirestoreCollection('3DStudio');
  if (Array.isArray(cloudList) && cloudList.length > 0) {
    const normalized = cloudList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/anime_figure_3d.jpg']
    }));
    localStorage.setItem(localKey, JSON.stringify(normalized));
    return normalized;
  }

  if (localList && localList.length > 0) {
    const normalized = localList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/anime_figure_3d.jpg']
    }));
    return normalized;
  }

  // Initialize with rich preloaded catalog
  localStorage.setItem(localKey, JSON.stringify(INITIAL_3D_STUDIO));
  // Background seed to Firestore
  INITIAL_3D_STUDIO.forEach((item) => writeFirestoreDoc('3DStudio', item.id, item));
  return INITIAL_3D_STUDIO;
}

export async function save3DStudioItem(item) {
  const id = item.id || `3d-${Date.now()}`;
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/images/anime_figure_3d.jpg'];
  const cleanItem = {
    ...item,
    id,
    image: images[0] || item.image || '/images/anime_figure_3d.jpg',
    images,
    updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('3DStudio', id, cleanItem);

  const current = await get3DStudioItems();
  const updated = [cleanItem, ...current.filter((i) => i.id !== id)];
  localStorage.setItem('navidron_catalog_3dstudio', JSON.stringify(updated));
  return cleanItem;
}

export async function delete3DStudioItem(id) {
  await deleteFirestoreDoc('3DStudio', id);
  const current = await get3DStudioItems();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem('navidron_catalog_3dstudio', JSON.stringify(updated));
  return true;
}

// ── Root Collection 3: "DroneAccessories" ──────────────────────
export const INITIAL_DRONE_ACCESSORIES = [
  {
    id: "part-motor-2207",
    name: "T-Motor F60 PRO V 2207 1950KV Brushless Motor",
    category: "Motors",
    brand: "T-Motor Aviation",
    price: 1899,
    quantity: 45,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/college_project_drone.jpg"
    ],
    desc: "Premium racing motor built with titanium alloy hollow shaft, N52H curved arc magnets, and Japanese NMB bearings. 6S compatible with explosive throttle burst response.",
    boxIncludes: [
      "1x T-Motor F60 PRO V 2207 1950KV Motor",
      "1x M5 Aluminum Low-Profile Lock Nut",
      "4x M3*8mm High-Tensile Steel Hex Screws",
      "1x Washer & Spare Circlip Set"
    ],
    specs: [
      { label: "Configuration", val: "12N14P" },
      { label: "Shaft Diameter", val: "4.0mm Titanium" },
      { label: "Input Voltage", val: "4S–6S LiPo (16V–25.2V)" },
      { label: "Peak Current (60s)", val: "44.6A" },
      { label: "Max Thrust", val: "2,180g (with 5.1\" prop)" },
      { label: "Weight", val: "33.9g (with wire)" }
    ]
  },
  {
    id: "part-fc-stack",
    name: "SpeedyBee F405 V4 BLS 55A 30x30 Stack",
    category: "Electronics",
    brand: "SpeedyBee Technology",
    price: 6499,
    quantity: 18,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/college_project_drone.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "Wireless Betaflight parameter configuration via smartphone Bluetooth. 55A 4-in-1 ESC with TVS protective diode, 8-motor output support, and 4-level battery LED gauge.",
    boxIncludes: [
      "1x SpeedyBee F405 V4 Flight Controller",
      "1x SpeedyBee 55A 4-in-1 BLHeli_S ESC",
      "1x 35V 1000uF Low-ESR Filter Capacitor",
      "1x XT60 Pigtail Cable (70mm 12AWG)",
      "5x M3 Anti-Vibration Silicone Grommets",
      "1x DJI O3 6-Pin Pre-Crimped Wire Harness"
    ],
    specs: [
      { label: "MCU", val: "STM32F405 @ 168MHz" },
      { label: "IMU (Gyro)", val: "ICM42688P Dual Damping" },
      { label: "Bluetooth", val: "BLE 5.0 Wireless Config" },
      { label: "ESC Firmware", val: "BLHeli_S J-H-40 / Bluejay" },
      { label: "Continuous Current", val: "55A × 4 (Burst 70A 10s)" },
      { label: "Mounting Size", val: "30.5 × 30.5mm (M3 hole)" }
    ]
  },
  {
    id: "part-o3-unit",
    name: "DJI O3 Air Unit Digital HD Transmission",
    category: "Electronics",
    brand: "DJI Innovations",
    price: 19999,
    quantity: 8,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/rc_plane_hobby.jpg"
    ],
    desc: "State-of-the-art digital FPV transmitter with 10km transmission range, 4K/60fps video capture, 155° super-wide FOV, and 30ms ultra-low latency canvas mode OSD.",
    boxIncludes: [
      "1x DJI O3 Air Unit Transmission Module",
      "1x DJI O3 HD 1/1.7\" Camera Module",
      "1x Dual-Band Dual-Polarized Antenna (MMCX)",
      "1x 3-in-1 Coaxial Connection Cable (115mm)"
    ],
    specs: [
      { label: "Sensor Size", val: "1/1.7-inch CMOS (48MP)" },
      { label: "Video Max Res", val: "4K @ 60fps / 2.7K @ 120fps" },
      { label: "Transmission Range", val: "Up to 10 km (FCC)" },
      { label: "Latency", val: "Lowest 30 ms" },
      { label: "EIS Stabilization", val: "RockSteady + Gyroflow Log" },
      { label: "Internal Storage", val: "20 GB High-Speed Flash" }
    ]
  },
  {
    id: "part-carbon-frame",
    name: "Apex 5\" Carbon Fiber Freestyle Drone Frame",
    category: "Frames",
    brand: "NaviDron AeroLab",
    price: 2799,
    quantity: 30,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/college_project_drone.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "CNC cut 5.5mm chamfered T700 carbon arms, 7075 aluminum camera bracket standoffs, keylocked arm design, and integrated TPU antenna/action camera mount.",
    boxIncludes: [
      "4x 5.5mm T700 Carbon Fiber Arms",
      "1x 2.5mm Carbon Top Plate",
      "1x 2.0mm Carbon Main Center Plate",
      "1x 2.0mm Carbon Bottom Plate",
      "8x 7075 Aerospace Aluminum Standoffs",
      "1x Full Pack of Grade 12.9 Black Steel Screws",
      "1x NaviDron Silicone Battery Pad + Kevlar Strap"
    ],
    specs: [
      { label: "Wheelbase", val: "225mm Diagonal" },
      { label: "Arm Thickness", val: "5.5mm Chamfered Carbon" },
      { label: "Top/Bottom Plates", val: "2.0mm / 2.5mm" },
      { label: "Camera Mount", val: "19mm Micro / 20mm Nano" },
      { label: "Stack Mounting", val: "20x20mm & 30.5x30.5mm" },
      { label: "Dry Weight", val: "128g (with hardware)" }
    ]
  },
  {
    id: "part-agri-nozzle",
    name: "Electrostatic Centrifugal Spray Nozzle (Agri)",
    category: "Agricultural Parts",
    brand: "NaviDron AgriTech",
    price: 2499,
    quantity: 24,
    image: "/images/agricultural_drone.jpg",
    images: [
      "/images/agricultural_drone.jpg",
      "/images/agricultural_drone_field_1791059225277.jpg",
      "/images/college_project_drone.jpg"
    ],
    desc: "Atomizes liquid droplets down to 50–200 microns using high-speed rotary disc for uniform leaf underside coverage without clogs or chemical overspray drift.",
    boxIncludes: [
      "1x High-Speed Centrifugal Brushless Atomizer",
      "1x Integrated Speed Control ESC (PWM 12-24V)",
      "1x 8mm Quick-Connect Liquid Pipe Fitting",
      "1x Anti-Vibration Carbon Extension Bracket"
    ],
    specs: [
      { label: "Motor Speed", val: "12,000–18,000 RPM" },
      { label: "Droplet Size", val: "50–200 μm Adjustable" },
      { label: "Spray Flow Rate", val: "0.5–3.5 L/min" },
      { label: "Effective Width", val: "1.5–2.5 meters per nozzle" },
      { label: "Operating Voltage", val: "12V–24V DC" },
      { label: "Weight", val: "145g" }
    ]
  },
  {
    id: "3d-gopro-mount",
    name: "TPU Universal GoPro Hero 9/10/11/12 Camera Mount (30°)",
    category: "3D Parts",
    brand: "NaviDron 3D Prototyping",
    price: 349,
    quantity: 70,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/3d_printed_gift_pack.jpg"
    ],
    desc: "Flexible, impact-absorbing 95A TPU mount that protects expensive action cameras during high-speed freestyle crashes. Pre-angled at 30 degrees for high-speed cruising.",
    boxIncludes: [
      "1x 95A High-Toughness TPU Camera Canopy (30°)",
      "1x ND Filter Retention Lip",
      "2x M3 Mounting Screws"
    ],
    specs: [
      { label: "Material", val: "Shore 95A Polyurethane TPU" },
      { label: "Tilt Angle", val: "Fixed 30 Degrees" },
      { label: "Compatibility", val: "GoPro Hero 9, 10, 11, 12" },
      { label: "ND Filter Slot", val: "Telesin & TBS ND filter compatible" },
      { label: "Weight", val: "22g" }
    ]
  }
];

export async function getDroneAccessories() {
  const localKey = 'navidron_catalog_drone_accessories';
  const cached = localStorage.getItem(localKey);
  let localList = null;
  if (cached) {
    try { localList = JSON.parse(cached); } catch (e) {}
  }

  const cloudList = await readFirestoreCollection('DroneAccessories');
  if (Array.isArray(cloudList) && cloudList.length > 0) {
    const normalized = cloudList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/fpv_racing_drone.jpg']
    }));
    localStorage.setItem(localKey, JSON.stringify(normalized));
    return normalized;
  }

  if (localList && localList.length > 0) {
    const normalized = localList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/fpv_racing_drone.jpg']
    }));
    return normalized;
  }

  localStorage.setItem(localKey, JSON.stringify(INITIAL_DRONE_ACCESSORIES));
  INITIAL_DRONE_ACCESSORIES.forEach((item) => writeFirestoreDoc('DroneAccessories', item.id, item));
  return INITIAL_DRONE_ACCESSORIES;
}

export async function saveDroneAccessory(item) {
  const id = item.id || `acc-${Date.now()}`;
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/images/fpv_racing_drone.jpg'];
  const cleanItem = {
    ...item,
    id,
    image: images[0] || item.image || '/images/fpv_racing_drone.jpg',
    images,
    updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('DroneAccessories', id, cleanItem);

  const current = await getDroneAccessories();
  const updated = [cleanItem, ...current.filter((i) => i.id !== id)];
  localStorage.setItem('navidron_catalog_drone_accessories', JSON.stringify(updated));
  return cleanItem;
}

export async function deleteDroneAccessory(id) {
  await deleteFirestoreDoc('DroneAccessories', id);
  const current = await getDroneAccessories();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem('navidron_catalog_drone_accessories', JSON.stringify(updated));
  return true;
}

// ── Root Collection 4: "Robotics_Kits" ─────────────────────────
export const INITIAL_ROBOTICS_KITS = [
  {
    id: "kit-4wd-chassis",
    name: "4WD Smart Robot Car Chassis with Speed Encoders",
    kitType: "Chassis & Base",
    brand: "NaviDron Robotics Edu",
    price: 1299,
    quantity: 25,
    image: "/images/college_project_drone.jpg",
    images: [
      "/images/college_project_drone.jpg",
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "Dual-layer heavy acrylic chassis platform with 4 high-torque DC gear motors, all-terrain rubber grip wheels, 4x AA battery box, and optocoupler speed encoder discs for velocity feedback.",
    boxIncludes: [
      "2x Laser-Cut Solid Clear Acrylic Car Chassis Plates",
      "4x 1:48 High Torque TT DC Gear Motors",
      "4x High-Grip Rubber Wheels (65mm Diameter)",
      "4x 20-Slot Precision Speed Encoder Discs",
      "8x Acrylic Motor Mounting Fasteners",
      "1x 4x AA Battery Enclosure with Switch",
      "1x Complete Brass Standoff & Screw Set"
    ],
    specs: [
      { label: "Voltage Range", val: "3V–6V DC" },
      { label: "Gear Reduction Ratio", val: "1:48 Speed Reduction" },
      { label: "Chassis Dimensions", val: "255 × 150 × 60 mm" },
      { label: "Wheel Diameter", val: "65mm (Wide Rubber Tread)" },
      { label: "Max Load Capacity", val: "1.2 kg Payload" },
      { label: "Weight", val: "480g Total Assembly" }
    ]
  },
  {
    id: "kit-esp32-ai",
    name: "ESP32-CAM AI Surveillance & Robot Controller Kit",
    kitType: "Microcontrollers & IoT",
    brand: "Espressif Systems × NaviDron",
    price: 1899,
    quantity: 35,
    image: "/images/college_project_drone.jpg",
    images: [
      "/images/college_project_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/toy_drone_basic.jpg"
    ],
    desc: "ESP32 dual-core 240MHz Wi-Fi/Bluetooth board with 2MP OV2640 camera module, micro-SD slot, dual L298N motor driver expansion shield, and code library for streaming live rover video.",
    boxIncludes: [
      "1x ESP32-CAM AI Development Board",
      "1x OV2640 2-Megapixel High Definition Camera Module",
      "1x FT232RL USB to TTL Serial Downloader Module",
      "1x Dual Motor Driver Robot Expansion Shield",
      "1x 2.4GHz High Gain 3dBi External SMA Antenna",
      "20x Female-to-Female Jumper Wires",
      "1x Arduino IDE Video Rover Sample Code Library"
    ],
    specs: [
      { label: "Processor", val: "Xtensa 32-bit LX6 Dual-Core @ 240MHz" },
      { label: "RAM / ROM", val: "520KB SRAM + External 4MB PSRAM" },
      { label: "Wireless", val: "Wi-Fi 802.11 b/g/n + Bluetooth 4.2 BR/EDR" },
      { label: "Camera Sensor", val: "OV2640 UXGA (1600x1200) @ 15fps" },
      { label: "Flash Output", val: "Ultra-Bright Onboard Flash LED" },
      { label: "Operating Voltage", val: "5V DC (Micro USB or Vin)" }
    ]
  },
  {
    id: "kit-arduino-starter",
    name: "Arduino Uno R3 Ultimate Robotics Starter Kit",
    kitType: "Learning Kits",
    brand: "Arduino Official Partner / NaviDron",
    price: 2499,
    quantity: 40,
    image: "/images/college_project_drone.jpg",
    images: [
      "/images/college_project_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/fpv_racing_drone.jpg"
    ],
    desc: "Genuine ATmega328P Arduino Uno with 30+ precision sensors, SG90 servo motor, ultrasonic HC-SR04 obstacle avoidance sensor, 16x2 I2C backlit LCD, breadboard, and 120-page full color project guide.",
    boxIncludes: [
      "1x Arduino Uno R3 Microcontroller Board with USB Cable",
      "1x HC-SR04 Ultrasonic Distance Sensor + Mounting Bracket",
      "1x SG90 9g Micro Servo Motor with Control Horns",
      "1x 1602 LCD Display with Pre-Soldered I2C Backpack",
      "1x 830-Point Solderless Transparent Breadboard",
      "65x Male-to-Male Multi-Length Jumper Wires",
      "1x Infrared Remote Controller & Receiver Sensor",
      "1x Active Buzzer, 5x Tactile Switches, 30x Precision Resistors",
      "1x High-Impact Compartment Organizer Storage Case"
    ],
    specs: [
      { label: "Main Chip", val: "Microchip ATmega328P (16MHz Crystal)" },
      { label: "Digital I/O Pins", val: "14 (6 PWM outputs)" },
      { label: "Analog Inputs", val: "6 × 10-bit ADC Channels" },
      { label: "Flash Memory", val: "32 KB (0.5 KB bootloader)" },
      { label: "Operating Voltage", val: "5V (Recommended 7–12V input)" },
      { label: "Certification", val: "RoHS, CE Certified Genuine Quality" }
    ]
  },
  {
    id: "kit-mecanum-wheels",
    name: "Omnidirectional Mecanum Wheel 4-Motor Drive Kit",
    kitType: "Motors & Wheels",
    brand: "NaviDron Robotics Lab",
    price: 3499,
    quantity: 15,
    image: "/images/college_project_drone.jpg",
    images: [
      "/images/college_project_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/toy_drone_basic.jpg"
    ],
    desc: "Set of four 80mm heavy-load Mecanum wheels with TT gear motors and steel coupler adapters for 360-degree all-direction motion robotics (sideways strafing, diagonal drifting, spinning).",
    boxIncludes: [
      "2x 80mm Left-Hand Mecanum Wheels (45° Rollers)",
      "2x 80mm Right-Hand Mecanum Wheels (45° Rollers)",
      "4x All-Metal Gear TT DC Motors (1:90 High Torque)",
      "4x 4mm Brass Motor Hex Coupler Hubs",
      "1x Hex Allen Wrench & Standoff Hardware Kit"
    ],
    specs: [
      { label: "Wheel Diameter", val: "80mm / Thickness 40mm" },
      { label: "Roller Construction", val: "9 TPU Rubber Grip Rollers per wheel" },
      { label: "Movement Vector", val: "Forward, Reverse, Lateral 90°, Diagonal" },
      { label: "Payload Capacity", val: "Up to 5.0 kg distributed load" },
      { label: "Motor Voltage", val: "6V–12V DC" },
      { label: "Total Kit Weight", val: "540g" }
    ]
  },
  {
    id: "kit-metal-servo",
    name: "High Torque Metal Gear Servo MG996R (Pack of 2)",
    kitType: "Motors",
    brand: "TowerPro × NaviDron",
    price: 449,
    quantity: 60,
    image: "/images/college_project_drone.jpg",
    images: [
      "/images/college_project_drone.jpg",
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "11kg-cm stall torque full metal gear high-precision servos for robotic arms, steering knuckles, pan-tilt camera gimbals, and UAV steerable landing gears.",
    boxIncludes: [
      "2x MG996R Metal Gear Digital Servos",
      "2x Double-Arm Heavy Duty Servo Horns",
      "2x Four-Arm Cross Servo Horns",
      "2x Round Aluminum-Reinforced Horns",
      "8x Rubber Vibration Damper Bushings & Eyelets",
      "8x Steel Mounting Screws"
    ],
    specs: [
      { label: "Stall Torque", val: "11.0 kg-cm @ 6.0V (9.4 kg-cm @ 4.8V)" },
      { label: "Operating Speed", val: "0.14 sec / 60 degrees @ 6.0V" },
      { label: "Gear Type", val: "Full All-Metal Hardened Brass & Steel" },
      { label: "Rotation Angle", val: "180 Degrees Precision PWM" },
      { label: "Operating Voltage", val: "4.8V–7.2V DC" },
      { label: "Weight", val: "55g each" }
    ]
  }
];

export async function getRoboticsKits() {
  const localKey = 'navidron_catalog_robotics_kits';
  const cached = localStorage.getItem(localKey);
  let localList = null;
  if (cached) {
    try { localList = JSON.parse(cached); } catch (e) {}
  }

  const cloudList = await readFirestoreCollection('Robotics_Kits');
  if (Array.isArray(cloudList) && cloudList.length > 0) {
    const normalized = cloudList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/college_project_drone.jpg']
    }));
    localStorage.setItem(localKey, JSON.stringify(normalized));
    return normalized;
  }

  if (localList && localList.length > 0) {
    const normalized = localList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/college_project_drone.jpg']
    }));
    return normalized;
  }

  localStorage.setItem(localKey, JSON.stringify(INITIAL_ROBOTICS_KITS));
  INITIAL_ROBOTICS_KITS.forEach((item) => writeFirestoreDoc('Robotics_Kits', item.id, item));
  return INITIAL_ROBOTICS_KITS;
}

export async function saveRoboticsKit(item) {
  const id = item.id || `kit-${Date.now()}`;
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/images/college_project_drone.jpg'];
  const cleanItem = {
    ...item,
    id,
    image: images[0] || item.image || '/images/college_project_drone.jpg',
    images,
    updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('Robotics_Kits', id, cleanItem);

  const current = await getRoboticsKits();
  const updated = [cleanItem, ...current.filter((i) => i.id !== id)];
  localStorage.setItem('navidron_catalog_robotics_kits', JSON.stringify(updated));
  return cleanItem;
}

export async function deleteRoboticsKit(id) {
  await deleteFirestoreDoc('Robotics_Kits', id);
  const current = await getRoboticsKits();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem('navidron_catalog_robotics_kits', JSON.stringify(updated));
  return true;
}

// ── Root Collection 5: "UAV_PreBuilt" ──────────────────────────
export const INITIAL_UAV_PREBUILT = [
  {
    id: "uav-apex-5",
    name: "Apex 5\" Freestyle FPV Drone (BNF / Ready To Fly)",
    type: "FPV Drone",
    brand: "NaviDron AeroLab India",
    price: 14999,
    quantity: 6,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg",
      "/images/college_project_drone.jpg"
    ],
    desc: "Ready to fly 6S freestyle drone with 2207 brushless motors, tuned Betaflight 4.5 flight control, ELRS 2.4G diversity receiver, and full T700 carbon fiber crash cage.",
    flightTime: "8 mins (Freestyle) / 12 mins (Cruising)",
    range: "3.5 km",
    maxSpeed: "140+ km/h",
    weight: "385g (dry) / 595g (AUW with 6S battery)",
    components: [
      { part: "Airframe", detail: "Apex 5\" T700 Full 3K Carbon Fiber (5.5mm Chamfered Arms)" },
      { part: "Flight Controller", detail: "SpeedyBee F405 V4 Bluetooth Wireless Configurable" },
      { part: "ESC", detail: "55A 4-in-1 BLHeli_S DShot600 with TVS Protection" },
      { part: "Motors", detail: "4x T-Motor F60 PRO V 2207 1950KV 6S Motors" },
      { part: "Propellers", detail: "HQProp Ethix S5 5.1x4.0 Tri-Blade Polycarbonate" },
      { part: "FPV Camera", detail: "Caddx Ratel 2 1200TVL Low-Light HDR Micro Camera" },
      { part: "Video Transmitter", detail: "800mW 5.8GHz Switchable SmartAudio VTX with RHCP Antenna" },
      { part: "Receiver", detail: "RadioMaster ExpressLRS 2.4GHz High Refresh Diversity RX" },
      { part: "Battery Connection", detail: "XT60 Female with 35V 1000uF Low-ESR Filter" }
    ],
    availableAddons: [
      { id: "gps", name: "M10 Precision GPS + Return-To-Home Rescue Compass", price: 1499 },
      { id: "telemetry", name: "Long-Range Telemetry Link (915MHz TBS Crossfire / ELRS)", price: 1899 },
      { id: "dji_o3", name: "Digital HD Upgrade (DJI O3 Air Unit 4K 60FPS Video)", price: 12499 },
      { id: "battery", name: "Extra CNHL 6S 1300mAh 120C High-Discharge LiPo Battery", price: 2499 },
      { id: "action_mount", name: "TPU GoPro Hero 10/11/12 Shockproof 30° Mount", price: 499 },
      { id: "radar", name: "Autonomous Obstacle Avoidance Dual LiDAR System", price: 6999 }
    ]
  },
  {
    id: "uav-skysurfer-rc",
    name: "SkySurfer V2 1400mm RC Scale Pusher Airplane",
    type: "RC Plane",
    brand: "NaviDron AeroLab India",
    price: 9999,
    quantity: 8,
    image: "/images/rc_plane_hobby.jpg",
    images: [
      "/images/rc_plane_hobby.jpg",
      "/images/fpv_racing_drone.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "Crash-resistant EPO foam pusher propeller glider airplane with 4-channel radio receiver, carbon spar wing reinforcement, and ultra-forgiving hand-launch gliding flight characteristics.",
    flightTime: "25 mins (Cruising) / 40 mins (Thermal Gliding)",
    range: "2.0 km",
    maxSpeed: "75 km/h",
    weight: "650g AUW",
    components: [
      { part: "Airframe", detail: "Molded High-Density EPO Foam with Carbon Spars" },
      { part: "Wingspan", detail: "1400mm (55 inch) Detachable 2-Piece Wing" },
      { part: "Motor", detail: "2212 1400KV Outrunner Brushless Motor" },
      { part: "ESC", detail: "30A Brushless ESC with 5V 2A BEC" },
      { part: "Servos", detail: "4x 9g Micro Metal-Gear Servos (Ailerons, Elevator, Rudder)" },
      { part: "Propeller", detail: "6040 Pusher Propeller (protected from belly landings)" },
      { part: "Receiver", detail: "FlySky / ELRS 6-Channel PWM Radio Receiver" },
      { part: "Battery Required", detail: "3S 2200mAh 25C–35C LiPo (XT60)" }
    ],
    availableAddons: [
      { id: "gps", name: "Byme-A Flight Stabilizer + Auto-Leveling Gyro", price: 1299 },
      { id: "telemetry", name: "Long-Range Telemetry Link (915MHz TBS Crossfire / ELRS)", price: 1899 },
      { id: "fpv_cockpit", name: "FPV Cockpit Pan-Tilt Camera Kit with 600mW VTX", price: 2999 },
      { id: "battery", name: "Extra 3S 2200mAh 35C Flight LiPo Battery", price: 1699 }
    ]
  },
  {
    id: "uav-micro-toothpick",
    name: "Micro Toothpick 3\" BNF FPV Quadcopter",
    type: "Toy Drone",
    brand: "NaviDron AeroLab India",
    price: 8999,
    quantity: 12,
    image: "/images/fpv_racing_drone.jpg",
    images: [
      "/images/fpv_racing_drone.jpg",
      "/images/toy_drone_basic.jpg",
      "/images/hero_drone_bg.jpg"
    ],
    desc: "Ultra-lightweight sub-100g racing drone for backyard cruising, park tree-weaving, and tight spaces. Highly durable 2.5mm carbon unibody plate.",
    flightTime: "5–7 mins",
    range: "1.0 km",
    maxSpeed: "90 km/h",
    weight: "85g (dry) / 128g (AUW with 3S LiPo)",
    components: [
      { part: "Frame", detail: "3-inch Unibody T700 Carbon Fiber (2.5mm)" },
      { part: "AIO Board", detail: "F411 20A 1-2S/2-3S All-In-One Flight Controller + ESC" },
      { part: "Motors", detail: "4x 1204 5000KV Ultra-Lightweight Brushless Motors" },
      { part: "Propellers", detail: "Gemfan 3018 Dual-Blade High-Efficiency Props" },
      { part: "Camera & VTX", detail: "Caddx Ant Nano 1200TVL + 400mW 5.8GHz VTX" },
      { part: "Receiver", detail: "Built-in SPI ExpressLRS 2.4GHz Ceramic Antenna" }
    ],
    availableAddons: [
      { id: "batteries_pack", name: "Pack of 3x GNB 3S 450mAh 80C High-Discharge LiPo", price: 1999 },
      { id: "props_pack", name: "Spare Set of 8x Gemfan 3018 Props (Assorted Colors)", price: 449 },
      { id: "canopy", name: "HD Thumb Pro Action Cam TPU Canopy", price: 349 }
    ]
  },
  {
    id: "uav-kisan-16l",
    name: "Kisan-16L Hexacopter Smart Agricultural UAV",
    type: "Agri Drone",
    brand: "Nexfly AgriRobotics India",
    price: 120000,
    quantity: 3,
    image: "/images/agricultural_drone.jpg",
    images: [
      "/images/agricultural_drone.jpg",
      "/images/agricultural_drone_field_1791059225277.jpg",
      "/images/college_project_drone.jpg"
    ],
    desc: "Autonomous RTK GPS waypoint navigation, 16-liter heavy-duty spray tank, dual centrifugal spray nozzles, terrain-following radar, and live telemetry for precision farming.",
    flightTime: "20 mins (full 16L load) / 35 mins (empty return)",
    range: "5.0 km",
    maxSpeed: "12 m/s spray speed",
    weight: "18.5kg (dry) / 38kg (Max Takeoff Weight MTOW)",
    components: [
      { part: "Airframe", detail: "Foldable Umbrella Hexacopter Carbon Fiber & Aviation Aluminum" },
      { part: "Tank Capacity", detail: "16 Liters Quick-Release Chemical Tank with Level Sensor" },
      { part: "Propulsion", detail: "6x Heavy-Duty 8120 100KV Waterproof FOC Brushless Motors" },
      { part: "ESC", detail: "80A 12S FOC Sinusoidal Waterproof ESCs" },
      { part: "Propellers", detail: "30-inch High-Strength Foldable Carbon-Nylon Blades" },
      { part: "Flight Controller", detail: "Industrial JIYI K++ V2 with Dual RTK Redundancy" },
      { part: "Radar", detail: "Front Obstacle Avoidance + Bottom Millimeter-Wave Terrain Radar" },
      { part: "Spray System", detail: "Centrifugal Rotary Droplet Nozzles (50–200μm droplet size)" }
    ],
    availableAddons: [
      { id: "rtk_base", name: "Centimeter-Level Portable RTK Base Station", price: 28500 },
      { id: "battery_12s", name: "Smart 12S 22,000mAh Semi-Solid State Flight Battery", price: 32000 },
      { id: "charger", name: "3000W Ultra-Fast Dual-Channel Intelligent Balance Charger", price: 21500 },
      { id: "granule_spreader", name: "Solid Fertilizer & Seed Spreader Attachment (20L)", price: 14999 }
    ]
  }
];

export async function getUAVPreBuilt() {
  const localKey = 'navidron_catalog_uav_prebuilt';
  const cached = localStorage.getItem(localKey);
  let localList = null;
  if (cached) {
    try { localList = JSON.parse(cached); } catch (e) {}
  }

  const cloudList = await readFirestoreCollection('UAV_PreBuilt');
  if (Array.isArray(cloudList) && cloudList.length > 0) {
    const normalized = cloudList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/fpv_racing_drone.jpg']
    }));
    localStorage.setItem(localKey, JSON.stringify(normalized));
    return normalized;
  }

  if (localList && localList.length > 0) {
    const normalized = localList.map((item) => ({
      ...item,
      images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || '/images/fpv_racing_drone.jpg']
    }));
    return normalized;
  }

  localStorage.setItem(localKey, JSON.stringify(INITIAL_UAV_PREBUILT));
  INITIAL_UAV_PREBUILT.forEach((item) => writeFirestoreDoc('UAV_PreBuilt', item.id, item));
  return INITIAL_UAV_PREBUILT;
}

export async function saveUAVPreBuilt(item) {
  const id = item.id || `uav-${Date.now()}`;
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/images/fpv_racing_drone.jpg'];
  const cleanItem = {
    ...item,
    id,
    image: images[0] || item.image || '/images/fpv_racing_drone.jpg',
    images,
    updatedAt: new Date().toISOString()
  };
  await writeFirestoreDoc('UAV_PreBuilt', id, cleanItem);

  const current = await getUAVPreBuilt();
  const updated = [cleanItem, ...current.filter((i) => i.id !== id)];
  localStorage.setItem('navidron_catalog_uav_prebuilt', JSON.stringify(updated));
  return cleanItem;
}

export async function deleteUAVPreBuilt(id) {
  await deleteFirestoreDoc('UAV_PreBuilt', id);
  const current = await getUAVPreBuilt();
  const updated = current.filter((i) => i.id !== id);
  localStorage.setItem('navidron_catalog_uav_prebuilt', JSON.stringify(updated));
  return true;
}

// ── Root Collection 6: "UAV_Custom" ────────────────────────────
export async function getUAVCustomOrders() {
  const localKey = 'navidron_custom_uav_orders';
  const cached = localStorage.getItem(localKey);
  let fallback = [];
  if (cached) {
    try { fallback = JSON.parse(cached); } catch (e) {}
  }

  const cloudList = await readFirestoreCollection('UAV_Custom');
  if (Array.isArray(cloudList) && cloudList.length > 0) {
    cloudList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    localStorage.setItem(localKey, JSON.stringify(cloudList));
    return cloudList;
  }

  return fallback;
}

export async function submitUAVCustomOrder(orderData) {
  const id = orderData.id || `CUSTOM-UAV-${Math.floor(10000 + Math.random() * 90000)}`;
  const cleanOrder = {
    ...orderData,
    id,
    createdAt: new Date().toISOString(),
    status: orderData.status || 'Pending Review'
  };

  await writeFirestoreDoc('UAV_Custom', id, cleanOrder);

  // Cache in local list
  const existing = await getUAVCustomOrders();
  const updated = [cleanOrder, ...existing.filter((o) => o.id !== id)];
  localStorage.setItem('navidron_custom_uav_orders', JSON.stringify(updated));

  // Also create a record in global "Order" collection
  await createGlobalOrder({
    ...cleanOrder,
    totalAmount: orderData.estimatedPrice || orderData.price || 14999,
    type: 'UAV_Custom',
    items: [
      {
        id: cleanOrder.id,
        name: `Custom UAV: ${cleanOrder.droneType || 'Custom Configured Drone'} (${cleanOrder.frameSize || '5 inch'})`,
        price: orderData.estimatedPrice || orderData.price || 14999,
        quantity: 1,
        image: '/images/fpv_racing_drone.jpg'
      }
    ]
  });

  return cleanOrder;
}

export async function updateUAVCustomOrderStatus(orderId, status) {
  await writeFirestoreDoc('UAV_Custom', orderId, { status, updatedAt: new Date().toISOString() });
  await updateOrderStatus(orderId, status);

  const existing = await getUAVCustomOrders();
  const updated = existing.map((o) => (o.id === orderId ? { ...o, status } : o));
  localStorage.setItem('navidron_custom_uav_orders', JSON.stringify(updated));
  return true;
}

// ── Root Collection: "users" (Admin User Management) ───────────
export async function getAllUsers() {
  const usersList = await readFirestoreCollection('users');
  if (Array.isArray(usersList) && usersList.length > 0) {
    return usersList.map((u) => {
      const contact = u.Contact || u.contact || {};
      const addresses = u['Delivery Address'] || u.deliveryAddresses || [];
      const orders = u['Order History'] || u.orderHistory || [];
      const cart = u.Cart || u.cart || [];
      return {
        id: u.id,
        name: contact.name || u.name || 'Unnamed Pilot',
        email: contact.email || u.email || '',
        phone: contact.phone || '',
        altPhone: contact.altPhone || '',
        addressesCount: Array.isArray(addresses) ? addresses.length : 0,
        addresses: Array.isArray(addresses) ? addresses : [],
        ordersCount: Array.isArray(orders) ? orders.length : 0,
        orders: Array.isArray(orders) ? orders : [],
        cartCount: Array.isArray(cart) ? cart.length : 0,
        cart: Array.isArray(cart) ? cart : [],
        updatedAt: u.updatedAt || contact.updatedAt || ''
      };
    });
  }

  // If offline or empty, check local storage for currently cached user
  const current = localStorage.getItem('navidron_current_user');
  if (current) {
    try {
      const parsed = JSON.parse(current);
      const uid = getEffectiveUserId(parsed);
      const cachedProfile = JSON.parse(localStorage.getItem(getStorageKey('profile', uid)) || '{}');
      const cachedAddrs = JSON.parse(localStorage.getItem(getStorageKey('addresses', uid)) || '[]');
      const cachedOrds = JSON.parse(localStorage.getItem(getStorageKey('orders', uid)) || '[]');
      const cachedCart = JSON.parse(localStorage.getItem(getStorageKey('cart', uid)) || '[]');
      return [
        {
          id: uid,
          name: cachedProfile.name || parsed.name || 'Active User',
          email: cachedProfile.email || parsed.email || '',
          phone: cachedProfile.phone || '',
          altPhone: cachedProfile.altPhone || '',
          addressesCount: cachedAddrs.length,
          addresses: cachedAddrs,
          ordersCount: cachedOrds.length,
          orders: cachedOrds,
          cartCount: cachedCart.length,
          cart: cachedCart,
          updatedAt: new Date().toISOString()
        }
      ];
    } catch (e) {}
  }

  return [];
}

// ── Bills / Invoices Services ─────────────────────────────────
export async function getUserBills(uidOrUser = 'guest_user') {
  const orders = await getUserOrders(uidOrUser);
  const profile = await getUserProfile(uidOrUser);
  return generateBillsFromOrders(orders, profile);
}

export { auth, db, isFirebaseOnline, RTDB_URL };

