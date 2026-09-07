// src/lib/firebase/firestore.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured, firebaseConfig } from './config.js';

// Nama Collections di Cloud Firestore
export const COLLECTIONS = {
  SETTINGS: 'store_settings',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs'
};

/**
 * Tes kesehatan & konektivitas Cloud Firestore
 */
export async function checkFirebaseHealth() {
  if (!isFirebaseConfigured || !db) {
    return {
      connected: false,
      status: 'error',
      message: 'Firebase Project ID atau API Key belum diset di environment variables.',
      projectId: firebaseConfig.projectId || '-'
    };
  }

  try {
    const testCol = collection(db, COLLECTIONS.SETTINGS);
    const q = query(testCol, limit(1));
    await getDocs(q);

    return {
      connected: true,
      status: 'success',
      message: 'Firebase Cloud Firestore terhubung dan siap digunakan.',
      projectId: firebaseConfig.projectId
    };
  } catch (err) {
    console.error('Firebase health check error:', err);
    return {
      connected: false,
      status: 'error',
      message: `Gagal menghubungi Firebase: ${err.message}`,
      projectId: firebaseConfig.projectId
    };
  }
}

// --- STORE SETTINGS ---
export async function fetchStoreSettings() {
  if (!isFirebaseConfigured || !db) return null;
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveStoreSettings(settings) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
  await setDoc(docRef, { ...settings, id: 'default', updatedAt: new Date().toISOString() }, { merge: true });
}

// --- CATEGORIES ---
export async function fetchCategories() {
  if (!isFirebaseConfigured || !db) return [];
  const colRef = collection(db, COLLECTIONS.CATEGORIES);
  const snap = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveCategory(category) {
  if (!isFirebaseConfigured || !db) return;
  const id = category.id || `cat-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await setDoc(docRef, { ...category, id, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteCategory(id) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await deleteDoc(docRef);
}

// --- PRODUCTS ---
export async function fetchProducts() {
  if (!isFirebaseConfigured || !db) return [];
  const colRef = collection(db, COLLECTIONS.PRODUCTS);
  const snap = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveProduct(product) {
  if (!isFirebaseConfigured || !db) return;
  const id = product.id || product.slug || `prod-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await setDoc(docRef, { ...product, id, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function updateProductStock(id, newStock) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await updateDoc(docRef, { stock: newStock, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
}

// --- ORDERS ---
export async function fetchOrders() {
  if (!isFirebaseConfigured || !db) return [];
  const colRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, orderId: d.id, ...d.data() }));
}

export async function fetchOrderById(id) {
  if (!isFirebaseConfigured || !db) return null;
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, orderId: snap.id, ...snap.data() } : null;
}

export async function saveOrder(order) {
  if (!isFirebaseConfigured || !db) return;
  const orderId = order.orderId || order.id || `FRX-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const payload = {
    ...order,
    id: orderId,
    orderId,
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, payload);
  return payload;
}

export async function updateOrder(orderId, updates) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteOrder(orderId) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await deleteDoc(docRef);
}

// --- NOTIFICATIONS ---
export async function fetchNotifications() {
  if (!isFirebaseConfigured || !db) return [];
  const colRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveNotification(notif) {
  if (!isFirebaseConfigured || !db) return;
  const id = notif.id || `notif-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
  await setDoc(docRef, { ...notif, id, createdAt: notif.createdAt || new Date().toISOString() });
}

export async function updateNotification(id, updates) {
  if (!isFirebaseConfigured || !db) return;
  const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
  await updateDoc(docRef, updates);
}

export async function clearAllNotifications(ids = []) {
  if (!isFirebaseConfigured || !db) return;
  for (const id of ids) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
    } catch (e) {
      console.warn('Delete notif error:', e);
    }
  }
}

// --- AUDIT LOGS ---
export async function fetchAuditLogs() {
  if (!isFirebaseConfigured || !db) return [];
  const colRef = collection(db, COLLECTIONS.AUDIT_LOGS);
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveAuditLog(log) {
  if (!isFirebaseConfigured || !db) return;
  const id = log.id || `log-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.AUDIT_LOGS, id);
  await setDoc(docRef, { ...log, id, createdAt: log.createdAt || new Date().toISOString() });
}

// --- REALTIME SUBSCRIBERS ---
export function subscribeToOrders(callback) {
  if (!isFirebaseConfigured || !db) return () => {};
  const colRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, orderId: d.id, ...d.data() }));
    callback(orders);
  }, (err) => {
    console.warn('Orders realtime subscription error:', err.message);
  });
}

export function subscribeToProducts(callback) {
  if (!isFirebaseConfigured || !db) return () => {};
  const colRef = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(colRef, (snapshot) => {
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(products);
  }, (err) => {
    console.warn('Products realtime subscription error:', err.message);
  });
}

export function subscribeToCategories(callback) {
  if (!isFirebaseConfigured || !db) return () => {};
  const colRef = collection(db, COLLECTIONS.CATEGORIES);
  return onSnapshot(colRef, (snapshot) => {
    const categories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(categories);
  }, (err) => {
    console.warn('Categories realtime subscription error:', err.message);
  });
}

export function subscribeToStoreSettings(callback) {
  if (!isFirebaseConfigured || !db) return () => {};
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'default');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (err) => {
    console.warn('Settings realtime subscription error:', err.message);
  });
}
