// src/lib/insforge.js
// InsForge SDK Client & Service Helpers for FREONIX

import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ie8b79we.ap-southeast.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'anon_0ddb6b73b2a5550817e6c1ed3e355133fdd82c8be69b16dff84f4a2d99df1871';

export const isInsforgeConfigured = Boolean(baseUrl && anonKey);

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export const STORAGE_BUCKET = 'freonix-uploads';

/**
 * Unggah file gambar ke InsForge Storage (bucket: freonix-uploads)
 * @param {File|Blob} file 
 * @param {string} folder 
 * @returns {Promise<{ url: string|null, key: string|null, error: Error|null, success: boolean }>}
 */
export async function uploadToInsforgeStorage(file, folder = 'payment_proofs') {
  if (!insforge || !isInsforgeConfigured) {
    return { success: false, url: null, key: null, error: new Error('InsForge client tidak terkonfigurasi') };
  }

  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const filePath = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}_${cleanFileName}`;

    const { data, error } = await insforge.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (error) {
      console.warn('Gagal upload ke InsForge Storage:', error.message || error);
      return { success: false, url: null, key: null, error };
    }

    const publicUrl = data?.url || `${baseUrl}/api/storage/buckets/${STORAGE_BUCKET}/objects/${encodeURIComponent(filePath)}`;

    return {
      success: true,
      url: publicUrl,
      key: data?.key || filePath,
      error: null
    };
  } catch (err) {
    console.error('Exception upload InsForge Storage:', err);
    return { success: false, url: null, key: null, error: err };
  }
}

/**
 * Login Admin menggunakan InsForge Auth (atau kredensial fallback jika offline)
 * @param {string} identifier 
 * @param {string} password 
 * @param {boolean} rememberMe 
 */
export async function loginAdmin(identifier, password, rememberMe = true) {
  const raw = identifier ? identifier.trim().toLowerCase() : '';
  const email = raw.includes('@') ? raw : (raw === 'freonix' ? 'freonix@freonix.com' : `${raw}@freonix.com`);

  // 1. Coba lewat InsForge Auth
  if (isInsforgeConfigured && insforge.auth) {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password: password.trim()
      });

      if (!error && data?.accessToken) {
        if (typeof window !== 'undefined') {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('freonix_admin_auth', 'true');
          storage.setItem('freonix_admin_token', data.accessToken);
        }
        return { success: true, user: data.user, session: data };
      }

      // Jika email belum ada di auth atau password salah di remote, berikan pesan spesifik jika error
      if (error && !error.message?.includes('Invalid') && !error.message?.includes('credentials')) {
        console.warn('InsForge auth notice:', error.message);
      }
    } catch (err) {
      console.warn('InsForge auth connection notice:', err);
    }
  }

  // 2. Fallback credential check untuk kredensial admin toko
  if (
    ((raw === 'vynookio@gmail.com' || raw === 'vynookio') && (password === 'Freonixx2026' || password === 'Freonix2026')) ||
    ((raw === 'freonix' || raw === 'admin@freonix.com' || raw === 'freonix@freonix.com') && (password === 'Freonix2026' || password === 'freonix123' || password === 'admin123'))
  ) {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('freonix_admin_auth', 'true');
    }
    return {
      success: true,
      user: { 
        id: raw.includes('vynookio') ? '6fa0f09f-d825-43f2-9735-b027388de0f0' : 'admin-freonix', 
        email: raw.includes('vynookio') ? 'vynookio@gmail.com' : 'freonix@freonix.com', 
        name: raw.includes('vynookio') ? 'Admin Vynookio' : 'Admin Freonix' 
      }
    };
  }

  return {
    success: false,
    error: 'Username/email atau password admin salah. Pastikan kredensial admin tepat.'
  };
}

/**
 * Logout Admin dari InsForge Auth
 */
export async function logoutAdmin() {
  try {
    if (isInsforgeConfigured && insforge.auth) {
      await insforge.auth.signOut().catch(() => {});
    }
  } catch (e) {
    console.warn('InsForge signOut notice:', e);
  } finally {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('freonix_admin_auth');
      localStorage.removeItem('freonix_admin_token');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('freonix_admin_auth');
      sessionStorage.removeItem('freonix_admin_token');
    }
  }
}

/**
 * Cek sesi autentikasi admin
 */
export async function getAdminSession() {
  if (typeof window === 'undefined') return null;
  const isAuth = localStorage.getItem('freonix_admin_auth') === 'true' || sessionStorage.getItem('freonix_admin_auth') === 'true';
  return isAuth ? { authenticated: true } : null;
}

/**
 * Tes koneksi ke InsForge database & storage
 */
export async function checkInsforgeHealth() {
  if (!isInsforgeConfigured) {
    return {
      connected: false,
      schemaReady: false,
      status: 'error',
      message: 'InsForge URL atau Anon Key belum dikonfigurasi di environment variables (.env.local).'
    };
  }

  try {
    const { data, error } = await insforge.database
      .from('orders')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        schemaReady: false,
        status: 'error',
        message: `Koneksi InsForge error: ${error.message || JSON.stringify(error)}`
      };
    }

    return {
      connected: true,
      schemaReady: true,
      status: 'success',
      message: 'InsForge terhubung dan database siap digunakan.'
    };
  } catch (err) {
    return {
      connected: false,
      schemaReady: false,
      status: 'error',
      message: `Gagal menghubungi InsForge: ${err.message}`
    };
  }
}
