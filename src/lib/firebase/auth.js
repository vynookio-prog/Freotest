// src/lib/firebase/auth.js
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config.js';

const ADMIN_STORAGE_KEY = 'freonix_admin_auth';

/**
 * Autentikasi Admin FREONIX
 * @param {string} usernameOrEmail 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<{ success: boolean, user?: any, error?: string }>}
 */
export async function loginAdmin(usernameOrEmail, password, rememberMe = false) {
  const u = (usernameOrEmail || '').trim().toLowerCase();
  const p = (password || '').trim();

  // Validasi kredensial lokal standar
  const isDefaultAdmin = (u === 'freonix' || u === 'admin@freonix.com') && p === 'Freonixx2026';

  if (!isDefaultAdmin) {
    return { success: false, error: 'Username atau password yang Anda masukkan salah.' };
  }

  // Jika Firebase Auth terkonfigurasi, sinkronkan sesi Firebase Auth
  if (isFirebaseConfigured && auth) {
    try {
      const email = u.includes('@') ? u : `${u}@freonix.internal`;
      await signInWithEmailAndPassword(auth, email, p).catch(async (authErr) => {
        // Jika user belum dibuat di Firebase Auth Console, login anonim sebagai session bridge
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.warn('Anonymous auth bridge notice:', e.message);
          }
        }
      });
    } catch (err) {
      console.warn('Firebase auth attempt notice:', err.message);
    }
  }

  // Simpan sesi autentikasi
  if (rememberMe) {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
  } else {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  return { success: true };
}

/**
 * Logout Admin
 */
export async function logoutAdmin() {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut notice:', err.message);
    }
  }

  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

/**
 * Cek apakah session admin saat ini aktif
 */
export function isAdminAuthenticated() {
  return (
    sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true' ||
    localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
  );
}

/**
 * Listener perubahan status auth Firebase
 */
export function subscribeAuthState(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user, isAdminAuthenticated());
    });
  }
  callback(null, isAdminAuthenticated());
  return () => {};
}
