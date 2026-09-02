import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-200 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png" 
            alt="Logo FREONIX" 
            className="h-9 w-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-xl tracking-wider text-[#5D3A29]">
            FREONIX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-sm font-semibold transition-colors hover:text-[#8B5742] ${isActive(link.path) ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://wa.link/ewddmf" 
            target="_blank" 
            rel="noreferrer"
            className="bg-[#8B5742] hover:bg-[#5D3A29] text-white text-xs uppercase tracking-wider font-bold px-4 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          >
            Hubungi Kami
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#5D3A29] hover:bg-stone-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 space-y-3 shadow-lg absolute w-full top-full left-0">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`block w-full text-left py-2 text-sm font-semibold hover:text-[#8B5742] ${isActive(link.path) ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://wa.link/ewddmf" 
            target="_blank" 
            rel="noreferrer"
            className="block text-center bg-[#8B5742] text-white py-2.5 rounded-xl font-bold text-sm"
          >
            Pesan Sekarang
          </a>
        </div>
      )}
    </nav>
  );
}
