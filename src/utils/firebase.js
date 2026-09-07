// src/utils/firebase.js
// Centralized Firebase module for FREONIX

export { app, db, auth, storage, isFirebaseConfigured, firebaseConfig } from '../lib/firebase/config.js';
export { uploadToFirebaseStorage } from '../lib/firebase/storage.js';
export { loginAdmin, logoutAdmin, isAdminAuthenticated, subscribeAuthState } from '../lib/firebase/auth.js';
export {
  COLLECTIONS,
  checkFirebaseHealth,
  fetchStoreSettings,
  saveStoreSettings,
  fetchCategories,
  saveCategory,
  deleteCategory,
  fetchProducts,
  saveProduct,
  updateProductStock,
  deleteProduct,
  fetchOrders,
  fetchOrderById,
  saveOrder,
  updateOrder,
  deleteOrder,
  fetchNotifications,
  saveNotification,
  updateNotification,
  clearAllNotifications,
  fetchAuditLogs,
  saveAuditLog,
  subscribeToOrders,
  subscribeToProducts,
  subscribeToCategories,
  subscribeToStoreSettings
} from '../lib/firebase/firestore.js';
