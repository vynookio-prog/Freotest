import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wvsyzexwmhyckbemuced.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XGpc9OI6OuD9hdRHAy_YnQ_1De0T12W';

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
export async function uploadToSupabaseStorage(file, folder = 'uploads') {
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
 * Tes koneksi ke Supabase dan cek ketersediaan tabel
 */
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      status: 'error',
      message: 'Supabase URL atau Publishable Key belum diset di environment variables.'
    };
  }

  try {
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      // Periksa apakah tabel belum ada
      if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return {
          connected: true,
          schemaReady: false,
          status: 'warning',
          message: 'Koneksi ke Supabase berhasil, namun tabel belum dibuat. Jalankan schema SQL di Supabase SQL Editor.'
        };
      }
      return {
        connected: false,
        schemaReady: false,
        status: 'error',
        message: `Koneksi Supabase error: ${error.message}`
      };
    }

    return {
      connected: true,
      schemaReady: true,
      status: 'success',
      message: 'Supabase terhubung dan tabel siap digunakan.'
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
