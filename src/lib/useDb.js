'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, fetchFromInsforge } from './db';

/**
 * Custom React Hook yang otomatis re-render saat database FREONIX berubah.
 * Termasuk auto-fetch data dari InsForge saat pertama kali mount.
 */
export function useDb() {
  const [, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    // Sinkronisasi data awal
    fetchFromInsforge();

    // Event listener untuk update dalam tab yang sama
    window.addEventListener('freonix_db_updated', refresh);

    // Event listener untuk update dari tab lain di browser
    const handleStorage = (e) => {
      if (e.key === 'freonix_database_v3') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('freonix_db_updated', refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  return db;
}
