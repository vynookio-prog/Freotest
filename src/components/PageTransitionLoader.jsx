'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Selesaikan animasi loading ketika pathname berhasil berganti dan halaman baru termuat
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Pantau klik pada link internal untuk langsung memicu lazy loading animation
  useEffect(() => {
    let t1, t2;

    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Abaikan link eksternal, anchor hash, tel/mailto, atau modifier key
      if (
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      const currentPath = window.location.pathname;
      const targetPath = href.split('?')[0].split('#')[0];

      // Jika berpindah ke rute berbeda, mulai animasi lazy transition
      if (targetPath !== currentPath) {
        setLoading(true);
        setProgress(25);

        t1 = setTimeout(() => setProgress(65), 120);
        t2 = setTimeout(() => setProgress(88), 300);
      }
    };

    document.addEventListener('click', handleAnchorClick, true);

    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top glowing progress bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] z-[999999] pointer-events-none transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading || progress === 100 ? 1 : 0,
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-[#DDA15E] via-[#B8815A] to-[#C9A227] shadow-[0_0_12px_rgba(221,161,94,0.95)]" />
      </div>

      {/* Floating glass lazy indicator saat proses transisi halaman berlangsung */}
      {progress >= 65 && progress < 100 && (
        <div className="fixed bottom-6 right-6 z-[999999] pointer-events-none animate-fade-in">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(93,58,41,0.15)] text-xs font-bold text-[#5D3A29]">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-[#B8815A] border-r-[#DDA15E] animate-spin" />
            <span>Membuka halaman...</span>
          </div>
        </div>
      )}
    </>
  );
}
