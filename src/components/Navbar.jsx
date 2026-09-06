import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu mobile ketika rute berubah
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0); // Scroll ke atas tiap pindah halaman
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/about', label: 'Tentang Kelas' },
    { path: '/products', label: 'Produk Kokurikuler' },
    { path: '/gallery', label: 'Galeri' },
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 transition-all duration-300 pointer-events-none">
      <div className={`max-w-5xl mx-auto px-5 py-3 rounded-full transition-all duration-300 pointer-events-auto flex items-center justify-between border ${
        isScrolled
          ? 'bg-white/75 backdrop-blur-2xl border-white/70 shadow-[0_16px_40px_rgba(93,58,41,0.12)]'
          : 'bg-white/50 backdrop-blur-xl border-white/50 shadow-[0_8px_30px_rgba(93,58,41,0.06)]'
      }`}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-1 rounded-full bg-white/80 border border-white shadow-sm group-hover:scale-105 transition-transform">
            <img 
              src="https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png" 
              alt="Logo FREONIX" 
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-[#5D3A29] group-hover:text-[#8B5742] transition-colors">
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
                to={link.path} 
                className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-300 ${
                  active 
                    ? 'bg-white text-[#5D3A29] shadow-sm' 
                    : 'text-[#5D3A29]/80 hover:text-[#5D3A29] hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Checkout CTA */}
        <div className="hidden md:flex items-center">
          <Link 
            to="/checkout"
            className="flex items-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-[0_4px_16px_rgba(139,87,66,0.3)] hover:shadow-[0_6px_22px_rgba(139,87,66,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <ShoppingCart size={15} />
            <span>Checkout</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full text-[#5D3A29] hover:bg-white/60 active:scale-90 transition-all border border-transparent hover:border-white/50"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Floating Glass Card */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-sm mx-auto mt-3 bg-white/80 backdrop-blur-2xl border border-white/70 p-5 rounded-3xl shadow-[0_20px_50px_rgba(93,58,41,0.15)] pointer-events-auto animate-fade-in space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`block w-full text-left px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                isActive(link.path) 
                  ? 'bg-white text-[#5D3A29] shadow-sm' 
                  : 'text-[#4B5563] hover:bg-white/50 hover:text-[#5D3A29]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link 
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full text-center bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3 rounded-2xl font-bold text-sm shadow-md"
            >
              <ShoppingCart size={17} />
              Checkout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
