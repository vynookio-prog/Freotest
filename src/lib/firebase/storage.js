// src/lib/firebase/storage.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config.js';

/**
 * Unggah file gambar ke Firebase Storage
 * @param {File|Blob} file 
 * @param {string} folder 
 * @returns {Promise<{ url: string|null, error: Error|null, success: boolean }>}
 */
export async function uploadToFirebaseStorage(file, folder = 'uploads') {
  if (!isFirebaseConfigured || !storage) {
    return { 
      success: false, 
      url: null, 
      error: new Error('Firebase Storage belum dikonfigurasi atau belum terhubung') 
    };
  }

  try {
    const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
    const filePath = `${folder}/${Date.now()}-${Math.floor(Math.random() * 10000)}_${cleanFileName}`;
    const storageRef = ref(storage, filePath);

    const metadata = {
      contentType: file.type || 'image/jpeg'
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadUrl,
      error: null
    };
  } catch (err) {
    console.error('Exception upload Firebase Storage:', err);
    return { 
      success: false, 
      url: null, 
      error: err 
    };
  }
}
