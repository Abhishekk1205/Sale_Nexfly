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
  deleteDoc
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
  callsign: "",
  bio: "",
  preferredContact: "WhatsApp",
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
function formatRestFields(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: String(v) };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (Array.isArray(v) || typeof v === 'object') {
      fields[k] = { stringValue: JSON.stringify(v) };
    }
  }
  return fields;
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

// Automatically cleans up old duplicate documents (e.g. user_xxx_addresses) so only the single user doc appears in Firestore
async function cleanupLegacyUserDocs(uid) {
  if (!uid) return;
  try {
    deleteFirestoreRest(`users/${uid}_addresses`);
    deleteFirestoreRest(`users/${uid}_orders`);
    if (db) {
      deleteDoc(doc(db, 'users', `${uid}_addresses`)).catch(() => {});
      deleteDoc(doc(db, 'users', `${uid}_orders`)).catch(() => {});
    }
  } catch (e) {}
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

  // Preserve user's updated name, email, bio, phone; never revert to default!
  const name = existingProfile?.name || user.fullName || user.name || "";
  const email = existingProfile?.email || user.primaryEmailAddress?.emailAddress || user.email || "";

  const addressesData = (existingAddresses && Array.isArray(existingAddresses))
    ? existingAddresses
    : [];

  const ordersData = (existingOrders && Array.isArray(existingOrders))
    ? existingOrders
    : [];

  const billsData = generateBillsFromOrders(ordersData, { name, email });

  const profileData = {
    ...DEFAULT_USER_PROFILE,
    ...(existingProfile || {}),
    name: name,
    email: email,
    updatedAt: new Date().toISOString(),
    // Keep addresses, orders, and bills inside the user document as fields
    addresses: addressesData,
    orders: ordersData,
    bills: billsData
  };

  let firestoreOk = false;
  let lastError = null;

  // 1. Try Direct Firestore REST API: Write to single User document: users/{uid}
  try {
    await writeFirestoreRest(`users/${uid}`, profileData);

    // Also create subcollections directly inside this user document:
    // users/{uid}/addresses/all, users/{uid}/orders/all, users/{uid}/bills/all
    await writeFirestoreRest(`users/${uid}/addresses/all`, { list: addressesData, count: addressesData.length, updatedAt: profileData.updatedAt });
    await writeFirestoreRest(`users/${uid}/orders/all`, { list: ordersData, count: ordersData.length, updatedAt: profileData.updatedAt });
    await writeFirestoreRest(`users/${uid}/bills/all`, { list: billsData, count: billsData.length, updatedAt: profileData.updatedAt });

    for (const addr of addressesData) {
      if (addr.id) {
        await writeFirestoreRest(`users/${uid}/addresses/${addr.id}`, { ...addr, updatedAt: profileData.updatedAt }).catch(() => {});
      }
    }
    for (const ord of ordersData) {
      if (ord.id) {
        await writeFirestoreRest(`users/${uid}/orders/${ord.id}`, { ...ord, updatedAt: profileData.updatedAt }).catch(() => {});
      }
    }
    for (const bill of billsData) {
      if (bill.id) {
        await writeFirestoreRest(`users/${uid}/bills/${bill.id}`, { ...bill, updatedAt: profileData.updatedAt }).catch(() => {});
      }
    }

    firestoreOk = true;
  } catch (err) {
    lastError = err.message;
    console.warn("Firestore REST write failed:", err.message);
  }

  // 2. Try Firestore JS SDK (with 3.5s timeout)
  if (db) {
    try {
      const promises = [
        setDoc(doc(db, 'users', uid), profileData, { merge: true }),
        setDoc(doc(db, 'users', uid, 'addresses', 'all'), { list: addressesData, count: addressesData.length, updatedAt: profileData.updatedAt }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'orders', 'all'), { list: ordersData, count: ordersData.length, updatedAt: profileData.updatedAt }, { merge: true }),
        setDoc(doc(db, 'users', uid, 'bills', 'all'), { list: billsData, count: billsData.length, updatedAt: profileData.updatedAt }, { merge: true })
      ];

      for (const addr of addressesData) {
        if (addr.id) {
          promises.push(setDoc(doc(db, 'users', uid, 'addresses', addr.id), addr, { merge: true }));
        }
      }
      for (const ord of ordersData) {
        if (ord.id) {
          promises.push(setDoc(doc(db, 'users', uid, 'orders', ord.id), ord, { merge: true }));
        }
      }
      for (const bill of billsData) {
        if (bill.id) {
          promises.push(setDoc(doc(db, 'users', uid, 'bills', bill.id), bill, { merge: true }));
        }
      }

      await withTimeout(Promise.all(promises), 3500);
      firestoreOk = true;
    } catch (err) {
      if (!lastError) lastError = err.message;
      console.warn("Firestore SDK write failed:", err.message);
    }
  }

  // Clean up any old stray documents so they disappear from users collection
  cleanupLegacyUserDocs(uid);

  // 3. Cache locally preserving all user changes
  localStorage.setItem(getStorageKey('profile', uid), JSON.stringify(profileData));
  localStorage.setItem(getStorageKey('addresses', uid), JSON.stringify(addressesData));
  localStorage.setItem(getStorageKey('orders', uid), JSON.stringify(ordersData));
  localStorage.setItem(getStorageKey('bills', uid), JSON.stringify(billsData));

  // Also update active session in localStorage if logged in
  const currentSession = localStorage.getItem('navidron_current_user');
  if (currentSession) {
    try {
      const parsed = JSON.parse(currentSession);
      if (profileData.name) parsed.name = profileData.name;
      if (profileData.email) parsed.email = profileData.email;
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

  // 1. Immediately return local cache if present — eliminates lag and prevents reverting on refresh!
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
            localStorage.setItem(localKey, JSON.stringify({ ...localData, ...val }));
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
        localStorage.setItem(localKey, JSON.stringify(val));
        return { ...DEFAULT_USER_PROFILE, ...val };
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

  // 1. Save to local storage first (instant persistence across reloads)
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

  // 3. Try Firestore REST
  try {
    await writeFirestoreRest(`users/${cleanId}`, dataWithTimestamp);
    firestoreSaved = true;
  } catch (err) {
    lastError = err.message;
  }

  // 4. Try Firestore SDK with timeout
  if (!firestoreSaved && db) {
    try {
      await withTimeout(setDoc(doc(db, 'users', cleanId), dataWithTimestamp, { merge: true }), 3500);
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

  // If no cache, check Firestore inside user doc and subcollections
  if (db) {
    try {
      // 1. Check user document field first
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(data.addresses));
          return data.addresses;
        }
      }

      // 2. Check subcollection users/{cleanId}/addresses/all
      const subSnap = await withTimeout(getDoc(doc(db, 'users', cleanId, 'addresses', 'all')), 2500);
      if (subSnap && subSnap.exists() && subSnap.data().list) {
        const list = subSnap.data().list;
        localStorage.setItem(localKey, JSON.stringify(list));
        return list;
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

  // 1. Try Firestore REST: update user doc fields AND subcollections inside this same user
  try {
    await writeFirestoreRest(`users/${cleanId}`, { addresses, updatedAt });
    await writeFirestoreRest(`users/${cleanId}/addresses/all`, { list: addresses, count: addresses.length, updatedAt });
    for (const addr of addresses) {
      if (addr.id) {
        await writeFirestoreRest(`users/${cleanId}/addresses/${addr.id}`, { ...addr, updatedAt }).catch(() => {});
      }
    }
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  // 2. Try Firestore SDK
  if (db) {
    try {
      const promises = [
        setDoc(doc(db, 'users', cleanId), { addresses, updatedAt }, { merge: true }),
        setDoc(doc(db, 'users', cleanId, 'addresses', 'all'), { list: addresses, count: addresses.length, updatedAt }, { merge: true })
      ];
      for (const addr of addresses) {
        if (addr.id) {
          promises.push(setDoc(doc(db, 'users', cleanId, 'addresses', addr.id), addr, { merge: true }));
        }
      }
      await withTimeout(Promise.all(promises), 3500);
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

  // If no cache, check Firestore inside user doc and subcollections
  if (db) {
    try {
      // 1. Check user document field first
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(data.orders));
          return data.orders;
        }
      }

      // 2. Check subcollection users/{cleanId}/orders/all
      const subSnap = await withTimeout(getDoc(doc(db, 'users', cleanId, 'orders', 'all')), 2500);
      if (subSnap && subSnap.exists() && subSnap.data().list) {
        const list = subSnap.data().list;
        localStorage.setItem(localKey, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
  }

  return DEFAULT_ORDERS;
}

export async function saveUserOrders(uidOrUser = 'guest_user', orders) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('orders', cleanId);
  localStorage.setItem(localKey, JSON.stringify(orders));

  // Get current profile for bill details
  let userProfile = {};
  try {
    const cached = localStorage.getItem(getStorageKey('profile', cleanId));
    if (cached) userProfile = JSON.parse(cached);
  } catch (e) {}

  const bills = generateBillsFromOrders(orders, userProfile);
  localStorage.setItem(getStorageKey('bills', cleanId), JSON.stringify(bills));

  let firestoreSaved = false;
  let lastError = null;
  const updatedAt = new Date().toISOString();

  // 1. Try Firestore REST: update user doc fields AND subcollections inside this same user
  try {
    await writeFirestoreRest(`users/${cleanId}`, { orders, bills, updatedAt });
    await writeFirestoreRest(`users/${cleanId}/orders/all`, { list: orders, count: orders.length, updatedAt });
    await writeFirestoreRest(`users/${cleanId}/bills/all`, { list: bills, count: bills.length, updatedAt });

    for (const ord of orders) {
      if (ord.id) {
        await writeFirestoreRest(`users/${cleanId}/orders/${ord.id}`, { ...ord, updatedAt }).catch(() => {});
      }
    }
    for (const bill of bills) {
      if (bill.id) {
        await writeFirestoreRest(`users/${cleanId}/bills/${bill.id}`, { ...bill, updatedAt }).catch(() => {});
      }
    }
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  // 2. Try Firestore SDK
  if (db) {
    try {
      const promises = [
        setDoc(doc(db, 'users', cleanId), { orders, bills, updatedAt }, { merge: true }),
        setDoc(doc(db, 'users', cleanId, 'orders', 'all'), { list: orders, count: orders.length, updatedAt }, { merge: true }),
        setDoc(doc(db, 'users', cleanId, 'bills', 'all'), { list: bills, count: bills.length, updatedAt }, { merge: true })
      ];
      for (const ord of orders) {
        if (ord.id) {
          promises.push(setDoc(doc(db, 'users', cleanId, 'orders', ord.id), ord, { merge: true }));
        }
      }
      for (const bill of bills) {
        if (bill.id) {
          promises.push(setDoc(doc(db, 'users', cleanId, 'bills', bill.id), bill, { merge: true }));
        }
      }
      await withTimeout(Promise.all(promises), 3500);
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  // Clean up any stray legacy docs from users collection
  cleanupLegacyUserDocs(cleanId);

  return { success: firestoreSaved, error: lastError };
}

// ── Bills / Invoices Services ─────────────────────────────────
export async function getUserBills(uidOrUser = 'guest_user') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'guest_user');
  const localKey = getStorageKey('bills', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', cleanId)), 2500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.bills && Array.isArray(data.bills) && data.bills.length > 0) {
          localStorage.setItem(localKey, JSON.stringify(data.bills));
          return data.bills;
        }
      }

      const subSnap = await withTimeout(getDoc(doc(db, 'users', cleanId, 'bills', 'all')), 2500);
      if (subSnap && subSnap.exists() && subSnap.data().list) {
        const list = subSnap.data().list;
        localStorage.setItem(localKey, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
  }

  return [];
}

export { auth, db, isFirebaseOnline, RTDB_URL };
