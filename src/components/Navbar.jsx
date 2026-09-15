'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu mobile ketika rute berubah
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/about', label: 'Tentang Kelas' },
    { path: '/products', label: 'Produk Kokurikuler' },
    { path: '/gallery', label: 'Galeri' },
  ];

  return (
    <nav className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className={`max-w-5xl mx-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-shadow duration-200 pointer-events-auto flex items-center justify-between border ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-white/80 shadow-[0_12px_36px_rgba(93,58,41,0.12)]'
          : 'bg-white/75 backdrop-blur-md border-white/60 shadow-[0_6px_25px_rgba(93,58,41,0.06)]'
      }`}>
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="p-1 rounded-full bg-white/80 border border-white shadow-xs group-hover:scale-105 transition-transform">
            <img 
              src="/logo-freonix.png" 
              alt="Logo FREONIX" 
              width="28"
              height="28"
              loading="eager"
              decoding="async"
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            />
          </div>
          <span className="font-black text-base sm:text-lg tracking-wider text-[#5D3A29] group-hover:text-[#8B5742] transition-colors">
            FREONIX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5 bg-stone-900/5 p-1 rounded-full border border-white/40">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path}
                href={link.path} 
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors duration-200 ${
                  active 
                    ? 'bg-white text-[#5D3A29] shadow-xs' 
                    : 'text-[#5D3A29]/80 hover:text-[#5D3A29] hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/checkout"
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#8B5742] to-[#5D3A29] hover:from-[#784936] hover:to-[#4e3022] text-white transition-all duration-200 shadow-[0_4px_16px_rgba(139,87,66,0.3)] hover:shadow-[0_6px_22px_rgba(139,87,66,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-white/20 shrink-0"
          >
            <ShoppingCart size={14} className="shrink-0" />
            <span className="hidden sm:inline">Pesan Sekarang</span>
            <span className="sm:hidden text-[11px]">Pesan</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/70 text-[#5D3A29] hover:bg-white active:scale-90 transition-all border border-stone-200/50 shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2.5 max-w-5xl mx-auto pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(93,58,41,0.15)] rounded-3xl p-4 flex flex-col gap-1.5 animate-slide-up">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    active
                      ? 'bg-[#5D3A29] text-white shadow-xs'
                      : 'text-[#5D3A29] hover:bg-[#5D3A29]/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-stone-200/60 mt-1">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white font-bold text-sm shadow-md active:scale-95"
              >
                <ShoppingCart size={16} />
                <span>Pesan Sekarang</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
