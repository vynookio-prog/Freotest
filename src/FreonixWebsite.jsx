import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ImageIcon, 
  Info, 
  Menu, 
  X, 
  Utensils, 
  ArrowRight, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function FreonixWebsite() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efek scroll untuk backdrop navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Data Produk Kokurikuler
  const products = [
    {
      id: 1,
      name: 'Kwek Kwek',
      price: 'Rp 2.000 / pcs',
      status: 'PO Buka',
      desc: 'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
      image: 'https://kommodo.ai/i/Wc3lBakVVNt7IgCzbgDR'
    },
    {
      id: 2,
      name: 'Chicken Adobo',
      price: 'Rp 15.000 / porsi',
      status: 'PO Buka',
      desc: 'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d'
    },
    {
      id: 3,
      name: 'Halo-Halo',
      price: 'Rp 5.000 / cup',
      status: 'PO Buka',
      desc: 'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
      image: 'https://kommodo.ai/i/oVjITA1lpigSZNcxhvyA'
    }
  ];

  // Helper fungsi link WhatsApp pemesanan
  const getWhatsAppLink = (productName) => {
    const baseWaLink = 'https://wa.link/ewddmf';
    const message = encodeURIComponent(`Halo, saya ingin memesan produk kuliner FREONIX: ${productName}. Apakah masih bisa di-order?`);
    return `${baseWaLink}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1F2937] font-sans antialiased selection:bg-[#DDA15E] selection:text-white">
      
      {/* Dynamic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-200 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div 
            onClick={() => scrollToSection('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src="https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png" 
              alt="Logo FREONIX" 
              className="h-9 w-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-xl tracking-wider text-[#5D3A29]">
              FREONIX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('home')} 
              className={`text-sm font-semibold transition-colors hover:text-[#8B5742] ${activeSection === 'home' ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              Beranda
            </button>
            <button 
              onClick={() => scrollToSection('identity')} 
              className={`text-sm font-semibold transition-colors hover:text-[#8B5742] ${activeSection === 'identity' ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              Tentang Kelas
            </button>
            <button 
              onClick={() => scrollToSection('products')} 
              className={`text-sm font-semibold transition-colors hover:text-[#8B5742] ${activeSection === 'products' ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              Produk Kokurikuler
            </button>
            <button 
              onClick={() => scrollToSection('gallery')} 
              className={`text-sm font-semibold transition-colors hover:text-[#8B5742] ${activeSection === 'gallery' ? 'text-[#8B5742]' : 'text-[#4B5563]'}`}
            >
              Galeri
            </button>
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
          <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 space-y-3 shadow-lg">
            <button 
              onClick={() => scrollToSection('home')} 
              className="block w-full text-left py-2 text-sm font-semibold text-[#4B5563] hover:text-[#8B5742]"
            >
              Beranda
            </button>
            <button 
              onClick={() => scrollToSection('identity')} 
              className="block w-full text-left py-2 text-sm font-semibold text-[#4B5563] hover:text-[#8B5742]"
            >
              Tentang Kelas
            </button>
            <button 
              onClick={() => scrollToSection('products')} 
              className="block w-full text-left py-2 text-sm font-semibold text-[#4B5563] hover:text-[#8B5742]"
            >
              Produk Kokurikuler
            </button>
            <button 
              onClick={() => scrollToSection('gallery')} 
              className="block w-full text-left py-2 text-sm font-semibold text-[#4B5563] hover:text-[#8B5742]"
            >
              Galeri
            </button>
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

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDA15E]/15 border border-[#DDA15E]/30 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="text-[#DDA15E]" /> Kelas Sains XI F1
          </div>
          
          <div className="flex justify-center mb-6">
            <img 
              src="https://cdn.phototourl.com/free/2026-09-02-4a88c19c-cba9-4d03-8a00-53eab79ada72.png" 
              alt="FREONIX Logo" 
              className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#5D3A29] tracking-tight mb-4">
            FREONIX
          </h1>
          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-widest text-[#8B5742] uppercase mb-8">
            “Future Ready Twelve One and Only”
          </p>

          <p className="max-w-xl mx-auto text-[#4B5563] text-sm sm:text-base leading-relaxed mb-10">
            Selamat datang di etalase resmi FREONIX. Temukan karya kebersamaan kami serta nikmati sajian kuliner khas Filipina hasil proyek kokurikuler kelas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('products')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8B5742] hover:bg-[#5D3A29] text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Utensils size={18} />
              Produk Kokurikuler
            </button>
            <button 
              onClick={() => scrollToSection('gallery')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-[#5D3A29] border border-stone-200 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-95"
            >
              <ImageIcon size={18} />
              Lihat Galeri
            </button>
          </div>
        </div>
      </section>

      {/* Bagian Identitas (Our Identity) */}
      <section id="identity" className="py-20 bg-white border-y border-stone-200/60 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#DDA15E]/20 to-[#8B5742]/20 rounded-3xl blur-lg transition duration-500 group-hover:opacity-100 opacity-60"></div>
              <img 
                src="https://kommodo.ai/i/08meLO5ue1HQiNe4fA3G" 
                alt="Kenangan Kelas FREONIX" 
                className="relative rounded-2xl w-full h-[340px] sm:h-[420px] object-cover shadow-md transition duration-500 group-hover:scale-[1.01]"
              />
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[#8B5742] font-bold text-xs uppercase tracking-widest">
                <Info size={16} /> Profil & Filosofi
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] leading-tight">
                Keluarga Besar Kelas Sains XI F1
              </h2>
              <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
                FREONIX bukan sekadar singkatan kelas, melainkan wujud tekad, inovasi, dan kehangatan kebersamaan. Sebagai siswa-siswi kelas sains, kami berkomitmen untuk selalu siap menghadapi masa depan dengan karya nyata, kolaborasi berkesinambungan, dan semangat pantang menyerah.
              </p>
              <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
                Melalui proyek kokurikuler ini, kami belajar mengasah kemampuan kewirausahaan, menyajikan cita rasa autentik khas Filipina, dan mempererat tali persaudaraan.
              </p>

              {/* Tautan Sosial Media */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a 
                  href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#5D3A29] text-xs font-bold transition-colors"
                >
                  <ExternalLink size={14} /> Instagram Resmi
                </a>
                <a 
                  href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#5D3A29] text-xs font-bold transition-colors"
                >
                  <ExternalLink size={14} /> TikTok Resmi
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Halaman 2: Produk Kokurikuler (Katalog Pemesanan) */}
      <section id="products" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#8B5742] font-bold text-xs uppercase tracking-widest block mb-2">
              Katalog Makanan & Minuman
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] mb-4">
              Produk Kokurikuler Khas Filipina
            </h2>
            <p className="text-[#4B5563] text-sm sm:text-base">
              Pilihan hidangan tradisional Filipina yang diolah higienis dan lezat oleh siswa-siswi FREONIX. Pesan sekarang melalui WhatsApp sebelum kuota PO penuh!
            </p>
          </div>

          {/* Grid Produk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Gambar Produk & Badge */}
                <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-[#DDA15E] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {item.status}
                  </div>
                </div>

                {/* Konten Kartu */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-xl font-bold text-[#5D3A29]">
                        {item.name}
                      </h3>
                      <span className="text-sm font-extrabold text-[#8B5742]">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  {/* Tombol Pesan Langsung via WhatsApp */}
                  <a 
                    href={getWhatsAppLink(item.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#8B5742] hover:bg-[#5D3A29] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <ShoppingBag size={16} />
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-[#4B5563]">
              * Sistem pemesanan bersifat Pre-Order (PO). Pengiriman atau pengambilan dilakukan sesuai jadwal kegiatan sekolah.
            </p>
          </div>
        </div>
      </section>

      {/* Halaman 3: Galeri (Dokumentasi Kelas) */}
      <section id="gallery" className="py-20 bg-white border-t border-stone-200/60 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-[#8B5742] font-bold text-xs uppercase tracking-widest block mb-2">
              Momen & Kebersamaan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29]">
              Dokumentasi Galeri
            </h2>
            <p className="text-[#4B5563] text-sm mt-2">
              Jejak kehangatan, dinamika belajar, dan proses persiapan proyek kokurikuler kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group overflow-hidden rounded-2xl shadow-md bg-stone-100 h-72 sm:h-80">
              <img 
                src="https://kommodo.ai/i/08meLO5ue1HQiNe4fA3G" 
                alt="Galeri Kegiatan 1" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold tracking-wide">
                  Kebersamaan XI F1 Sains
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl shadow-md bg-stone-100 h-72 sm:h-80">
              <img 
                src="https://kommodo.ai/i/OO6Qh7sAq8QkWkieoic2" 
                alt="Galeri Kegiatan 2" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-semibold tracking-wide">
                  Dokumentasi Persiapan Proyek
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#5D3A29] text-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="text-lg font-black tracking-wider">FREONIX</h3>
            <p className="text-xs text-stone-300 mt-1">
              Kelas Sains XI F1 • "FUTURE READY TWELVE ONE AND ONLY"
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-stone-300">
            <a 
              href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a 
              href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors"
            >
              TikTok
            </a>
            <a 
              href="https://wa.link/ewddmf" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-stone-600/40 text-center text-[11px] text-stone-400">
          © {new Date().getFullYear()} FREONIX. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>

    </div>
  );
}
