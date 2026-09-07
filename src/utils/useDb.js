import { useState, useEffect, useCallback } from 'react';
import { db } from './db';

/**
 * Custom React Hook yang otomatis re-render saat database FREONIX berubah.
 * Termasuk auto-fetch orders dari Supabase saat pertama kali mount.
 */
export function useDb() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
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

  // Auto-fetch orders dari Supabase saat pertama kali mount
  useEffect(() => {
    let isMounted = true;
    db.fetchOrders()
      .then(() => {
        if (isMounted) refresh();
      })
      .catch(err => {
        console.warn('useDb: fetchOrders warning:', err.message);
      });

    return () => { isMounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return db;
}
