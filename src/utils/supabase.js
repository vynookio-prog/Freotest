import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://wvsyzexwmhyckbemuced.supabase.co';
const supabasePublishableKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) || 'sb_publishable_XGpc9OI6OuD9hdRHAy_YnQ_1De0T12W';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

const STORAGE_BUCKET = 'freonix-uploads';

/**
 * Unggah file gambar ke Supabase Storage (bucket: freonix-uploads)
 * @param {File|Blob} file 
 * @param {string} folder 
 * @returns {Promise<{ url: string|null, error: Error|null, success: boolean }>}
 */
export async function uploadToSupabaseStorage(file, folder = 'payment_proofs') {
  if (!supabase) {
    return { success: false, url: null, error: new Error('Supabase client tidak terkonfigurasi') };
  }

  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const filePath = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn('Gagal upload ke Supabase Storage:', error.message);
      return { success: false, url: null, error };
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData?.publicUrl || null,
      error: null
    };
  } catch (err) {
    console.error('Exception upload Supabase Storage:', err);
    return { success: false, url: null, error: err };
  }
}

/**
 * Login Admin menggunakan Supabase Auth
 * Mendukung username 'freonix' (dipetakan ke admin@freonix.com) atau email lengkap
 * @param {string} identifier 
 * @param {string} password 
 * @param {boolean} rememberMe 
 */
export async function loginAdmin(identifier, password, rememberMe = true) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase URL atau Publishable Key belum terkonfigurasi di environment.' };
  }

  const raw = identifier ? identifier.trim().toLowerCase() : '';
  const email = raw.includes('@') ? raw : (raw === 'freonix' ? 'admin@freonix.com' : `${raw}@freonix.com`);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim()
    });

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        return {
          success: false,
          error: 'Email admin belum dikonfirmasi di Supabase. Harap nonaktifkan "Confirm email" di Supabase Auth atau jalankan skrip SQL aktivasi di SQL Editor.'
        };
      }
      if (error.message?.toLowerCase().includes('invalid login credentials')) {
        return {
          success: false,
          error: 'Username/email atau password admin salah. Pastikan akun admin sudah dibuat di Supabase Auth.'
        };
      }
      return { success: false, error: error.message };
    }

    if (data?.session) {
      if (rememberMe) {
        localStorage.setItem('freonix_admin_auth', 'true');
        sessionStorage.removeItem('freonix_admin_auth');
      } else {
        sessionStorage.setItem('freonix_admin_auth', 'true');
        localStorage.removeItem('freonix_admin_auth');
      }
      return { success: true, user: data.user, session: data.session };
    }

    return { success: false, error: 'Sesi login tidak valid' };
  } catch (err) {
    return { success: false, error: err.message || 'Terjadi kesalahan saat otentikasi admin' };
  }
}

/**
 * Logout Admin dari Supabase Auth
 */
export async function logoutAdmin() {
  try {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.warn('Supabase signOut notice:', e);
  } finally {
    if (typeof localStorage !== 'undefined') localStorage.removeItem('freonix_admin_auth');
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('freonix_admin_auth');
  }
}

/**
 * Cek sesi autentikasi admin yang sedang aktif
 */
export async function getAdminSession() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch (err) {
    return null;
  }
}

/**
 * Tes koneksi ke Supabase dan cek ketersediaan tabel orders & products
 */
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      schemaReady: false,
      status: 'error',
      message: 'Supabase URL atau Publishable Key belum diset di environment variables (.env).'
    };
  }

  try {
    // Cek tabel orders
    const { data, error } = await supabase.from('orders').select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return {
          connected: true,
          schemaReady: false,
          status: 'warning',
          message: 'Koneksi ke Supabase berhasil, namun tabel "orders" belum dibuat. Harap salin dan jalankan file SUPABASE_SCHEMA.sql di Supabase SQL Editor.'
        };
      }
      return {
        connected: false,
        schemaReady: false,
        status: 'error',
        message: `Koneksi Supabase error (${error.code || 'ERR'}): ${error.message}`
      };
    }

    return {
      connected: true,
      schemaReady: true,
      status: 'success',
      message: 'Supabase terhubung dan tabel orders siap digunakan.'
    };
  } catch (err) {
    return {
      connected: false,
      schemaReady: false,
      status: 'error',
      message: `Gagal menghubungi Supabase: ${err.message}`
    };
  }
}
