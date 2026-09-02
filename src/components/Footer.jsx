import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#5D3A29] text-white py-12 px-4 sm:px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-lg font-black tracking-wider">FREONIX</h3>
          <p className="text-xs text-stone-300 mt-1">
            Kelas Sains XII-F1 • "FUTURE READY TWELVE ONE AND ONLY"
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs text-stone-300">
          <a 
            href="https://www.instagram.com/freonix__?igsi=YzA1MDF4amhva3Qx" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <i className="fab fa-instagram text-lg"></i> Instagram
          </a>
          <a 
            href="https://www.tiktok.com/@duabelasefsatu1?_r=1&_t=ZS-98ZVLY09Qxh" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <i className="fab fa-tiktok text-lg"></i> TikTok
          </a>
          <a 
            href="https://wa.link/ewddmf" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <i className="fab fa-whatsapp text-lg"></i> WhatsApp
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-stone-600/40 text-center text-[11px] text-stone-400">
        © {new Date().getFullYear()} FREONIX. Hak Cipta Dilindungi Undang-Undang.
      </div>
    </footer>
  );
}
