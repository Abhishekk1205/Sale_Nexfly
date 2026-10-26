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
  setDoc
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

// ── Default User Information (Synced with Clerk / Google user) ──
export const DEFAULT_USER_PROFILE = {
  name: "Abhishek Kumar Gupta",
  email: "abhish1205@gmail.com",
  phone: "+91 98765 43210",
  altPhone: "+91 91234 56789",
  callsign: "SkyPhantom",
  bio: "Drone pilot, FPV racer & custom 3D printing enthusiast.",
  preferredContact: "WhatsApp",
  memberSince: "October 2026",
  badge: "VIP Pilot",
  clerkLinked: true,
  firebaseConnected: true
};

export const DEFAULT_ADDRESSES = [
  {
    id: "addr-1",
    tag: "Home",
    isDefault: true,
    recipient: "Abhishek Kumar Gupta",
    phone: "+91 98765 43210",
    street: "Flat 402, Skyline Heights, 12th Main Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    landmark: "Near Metro Pillar 84"
  },
  {
    id: "addr-2",
    tag: "Workshop",
    isDefault: false,
    recipient: "Abhishek Kumar Gupta (NaviDron Lab)",
    phone: "+91 91234 56789",
    street: "Unit 14B, Nexfly Robotics Hangar, Electronic City Phase 1",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    landmark: "Opposite Tech Park Gate 3"
  }
];

export const DEFAULT_ORDERS = [
  {
    id: "NVD-84920",
    date: "2026-10-18",
    status: "Delivered",
    statusLabel: "Delivered",
    statusDesc: "Handed over to recipient. Signed by Abhishek Kumar Gupta.",
    paymentStatus: "Paid Online (UPI)",
    totalAmount: 18499,
    trackingNumber: "DEL-EXP-9921448",
    deliveryAddress: "Flat 402, Skyline Heights, Indiranagar, Bengaluru - 560038",
    items: [
      {
        id: "p1",
        name: "NaviDron FPV Phantom 5'' Freestyle Drone",
        category: "UAV Systems",
        price: 15999,
        quantity: 1,
        image: "/images/drone-action.jpg"
      },
      {
        id: "p2",
        name: "GTA 6 Lucia Vice City Collectible Figure (18cm)",
        category: "3Dstudio Collection",
        price: 2500,
        quantity: 1,
        image: "/images/gta6-banner.jpg"
      }
    ]
  },
  {
    id: "NVD-73911",
    date: "2026-10-22",
    status: "Succeeded",
    statusLabel: "Succeeded & Dispatched",
    statusDesc: "Payment successful. Package in transit via BlueDart Air.",
    paymentStatus: "Paid (Google Pay)",
    totalAmount: 4999,
    trackingNumber: "BD-AIR-5582910",
    deliveryAddress: "Flat 402, Skyline Heights, Indiranagar, Bengaluru - 560038",
    items: [
      {
        id: "p3",
        name: "P_Brothers GTA 6 Vice City Neon Hoodie (Official)",
        category: "Streetwear Merch",
        price: 2999,
        quantity: 1,
        image: "/images/pbrothers-collab.jpg"
      },
      {
        id: "p4",
        name: "Custom 3D Lithophane Lightbox with LED Stand",
        category: "3Dstudio Custom",
        price: 2000,
        quantity: 1,
        image: "/images/drone-action.jpg"
      }
    ]
  },
  {
    id: "NVD-61042",
    date: "2026-09-30",
    status: "Cancelled",
    statusLabel: "Cancelled after payment",
    statusDesc: "Cancelled by user request. 100% Refund credited back to original payment source (UPI/Bank) on Oct 01, 2026.",
    refundInfo: "Refund ID: REF-994821 - ₹14,999 Credited",
    paymentStatus: "Refunded to Source",
    totalAmount: 14999,
    deliveryAddress: "Unit 14B, Nexfly Robotics Hangar, Electronic City, Bengaluru",
    items: [
      {
        id: "p5",
        name: "Agri-Hexacopter Spraying Frame Kit (10L Capacity)",
        category: "Agricultural UAV",
        price: 14999,
        quantity: 1,
        image: "/images/drone-action.jpg"
      }
    ]
  }
];

export const sanitizeKey = (key = 'default_user') => {
  return String(key).replace(/[.#$[\]/]/g, '_');
};

export const getStorageKey = (prefix, uid = 'default_user') => `navidron_${prefix}_${sanitizeKey(uid)}`;

export function getEffectiveUserId(user) {
  if (!user) {
    try {
      const saved = localStorage.getItem('navidron_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id || parsed?.uid) return sanitizeKey(parsed.id || parsed.uid);
      }
    } catch (e) {}
    return 'user_abhishek_gupta';
  }
  return sanitizeKey(user.id || user.uid || 'user_abhishek_gupta');
}

// ── Direct REST API for Cloud Firestore ────────────────────────
async function writeFirestoreRest(collectionName, docId, data) {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}`;

  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Array.isArray(v) || typeof v === 'object') fields[k] = { stringValue: JSON.stringify(v) };
  }

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

// ── Synchronize Complete User Data to Firebase (Firestore) ─────
export async function syncUserFullDataToFirebase(user) {
  if (!user) return { success: false, reason: "No user provided" };
  const uid = sanitizeKey(user.id || user.uid || 'user_abhishek_gupta');

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
  const name = existingProfile?.name || user.fullName || user.name || "Abhishek Kumar Gupta";
  const email = existingProfile?.email || user.primaryEmailAddress?.emailAddress || user.email || "abhish1205@gmail.com";

  const profileData = {
    ...DEFAULT_USER_PROFILE,
    ...(existingProfile || {}),
    name: name,
    email: email,
    updatedAt: new Date().toISOString()
  };

  const addressesData = (existingAddresses && Array.isArray(existingAddresses) && existingAddresses.length > 0)
    ? existingAddresses
    : DEFAULT_ADDRESSES;

  const ordersData = (existingOrders && Array.isArray(existingOrders) && existingOrders.length > 0)
    ? existingOrders
    : DEFAULT_ORDERS;

  let firestoreOk = false;
  let lastError = null;

  // 1. Try Direct Firestore REST API (fastest, clearest error responses)
  try {
    await writeFirestoreRest('users', uid, profileData);
    await writeFirestoreRest('users', `${uid}_addresses`, { list: addressesData });
    await writeFirestoreRest('users', `${uid}_orders`, { list: ordersData });
    firestoreOk = true;
  } catch (err) {
    lastError = err.message;
    console.warn("Firestore REST write failed:", err.message);
  }

  // 2. Try Firestore JS SDK (with 3.5s timeout)
  if (!firestoreOk && db) {
    try {
      await withTimeout(
        Promise.all([
          setDoc(doc(db, 'users', uid), profileData, { merge: true }),
          setDoc(doc(db, 'users', uid, 'data', 'addresses'), { list: addressesData }, { merge: true }),
          setDoc(doc(db, 'users', uid, 'data', 'orders'), { list: ordersData }, { merge: true })
        ]),
        3500
      );
      firestoreOk = true;
    } catch (err) {
      if (!lastError) lastError = err.message;
      console.warn("Firestore SDK write failed:", err.message);
    }
  }

  // 3. Cache locally preserving all user changes
  localStorage.setItem(getStorageKey('profile', uid), JSON.stringify(profileData));
  localStorage.setItem(getStorageKey('addresses', uid), JSON.stringify(addressesData));
  localStorage.setItem(getStorageKey('orders', uid), JSON.stringify(ordersData));

  // Also update active session in localStorage
  const currentSession = localStorage.getItem('navidron_current_user');
  if (currentSession) {
    try {
      const parsed = JSON.parse(currentSession);
      parsed.name = profileData.name;
      parsed.email = profileData.email;
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
        name: googleUser.displayName || "Abhishek Kumar Gupta",
        email: googleUser.email || "abhish1205@gmail.com",
        photoURL: googleUser.photoURL || null
      };

      await syncUserFullDataToFirebase(userObj);
      localStorage.setItem('navidron_current_user', JSON.stringify(userObj));
      return { success: true, user: userObj, isRealFirebase: true };
    } catch (err) {
      console.warn("Google popup fallback:", err.message);
    }
  }

  const fallbackUser = {
    uid: "user_abhishek_gupta",
    id: "user_abhishek_gupta",
    name: "Abhishek Kumar Gupta",
    email: "abhish1205@gmail.com",
    photoURL: null
  };

  await syncUserFullDataToFirebase(fallbackUser);
  localStorage.setItem('navidron_current_user', JSON.stringify(fallbackUser));
  return { success: true, user: fallbackUser, isRealFirebase: false };
}

// ── User Profile Services ─────────────────────────────────────
export async function getUserProfile(uidOrUser = 'user_abhishek_gupta') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
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

export async function saveUserProfile(uidOrUser = 'user_abhishek_gupta', profileData) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
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
    await writeFirestoreRest('users', cleanId, dataWithTimestamp);
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

  return { success: firestoreSaved, error: lastError };
}

// ── Delivery Addresses Services ───────────────────────────────
export async function getUserAddresses(uidOrUser = 'user_abhishek_gupta') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
  const localKey = getStorageKey('addresses', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // If no cache, check Firestore
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', `${cleanId}_addresses`)), 2500);
      if (docSnap && docSnap.exists() && docSnap.data().list) {
        const list = docSnap.data().list;
        localStorage.setItem(localKey, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
  }

  return DEFAULT_ADDRESSES;
}

export async function saveUserAddresses(uidOrUser = 'user_abhishek_gupta', addresses) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
  const localKey = getStorageKey('addresses', cleanId);
  localStorage.setItem(localKey, JSON.stringify(addresses));

  let firestoreSaved = false;
  let lastError = null;

  try {
    await writeFirestoreRest('users', `${cleanId}_addresses`, { list: addresses });
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  if (!firestoreSaved && db) {
    try {
      await withTimeout(
        setDoc(doc(db, 'users', `${cleanId}_addresses`), { list: addresses }, { merge: true }),
        3500
      );
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  return { success: firestoreSaved, error: lastError };
}

// ── Order History Services ────────────────────────────────────
export async function getUserOrders(uidOrUser = 'user_abhishek_gupta') {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
  const localKey = getStorageKey('orders', cleanId);

  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // If no cache, check Firestore
  if (db) {
    try {
      const docSnap = await withTimeout(getDoc(doc(db, 'users', `${cleanId}_orders`)), 2500);
      if (docSnap && docSnap.exists() && docSnap.data().list) {
        const list = docSnap.data().list;
        localStorage.setItem(localKey, JSON.stringify(list));
        return list;
      }
    } catch (e) {}
  }

  return DEFAULT_ORDERS;
}

export async function saveUserOrders(uidOrUser = 'user_abhishek_gupta', orders) {
  const cleanId = typeof uidOrUser === 'object' ? getEffectiveUserId(uidOrUser) : sanitizeKey(uidOrUser || 'user_abhishek_gupta');
  const localKey = getStorageKey('orders', cleanId);
  localStorage.setItem(localKey, JSON.stringify(orders));

  let firestoreSaved = false;
  let lastError = null;

  try {
    await writeFirestoreRest('users', `${cleanId}_orders`, { list: orders });
    firestoreSaved = true;
  } catch (e) {
    lastError = e.message;
  }

  if (!firestoreSaved && db) {
    try {
      await withTimeout(
        setDoc(doc(db, 'users', `${cleanId}_orders`), { list: orders }, { merge: true }),
        3500
      );
      firestoreSaved = true;
    } catch (e) {
      if (!lastError) lastError = e.message;
    }
  }

  return { success: firestoreSaved, error: lastError };
}

export { auth, db, isFirebaseOnline, RTDB_URL };
