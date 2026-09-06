import { useState, useEffect } from 'react';
import { db } from './db';

/**
 * Custom React Hook yang otomatis re-render saat database FREONIX berubah
 * (baik dari tab ini maupun tab lain melalui storage event).
 */
export function useDb() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleDbUpdate = () => {
      setVersion(v => v + 1);
    };

    // Event listener untuk update dalam tab yang sama
    window.addEventListener('freonix_db_updated', handleDbUpdate);

    // Event listener untuk update dari tab lain di browser
    const handleStorage = (e) => {
      if (e.key === 'freonix_database_v1') {
        setVersion(v => v + 1);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('freonix_db_updated', handleDbUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return db;
}
