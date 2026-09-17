'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDb } from '../lib/useDb';

const JENJANG_CONFIG = {
  '10': { label: 'Kelas 10 (Fase E)', fase: 'E', count: 10 },
  '11': { label: 'Kelas 11 (Fase F)', fase: 'F', count: 10 },
  '12': { label: 'Kelas 12 (Fase F)', fase: 'F', count: 10 },
};

export default function BazarOrder() {
  const db = useDb();
  const activeProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  // Nomor WhatsApp admin bazar dari combine / database
  const WA_NUMBER = settings.adminPhone || '628818578363';

  // State untuk form identitas
  const [nama, setNama] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelas, setKelas] = useState('');

  // State untuk jumlah tiap produk: { [productId]: number }
  const [quantities, setQuantities] = useState({});

  // State kartu mana yang panel ordernya terbuka: { [productId]: boolean }
  const [openPanels, setOpenPanels] = useState({});

  // State untuk toast notifications: [ { id, message, type: 'info'|'success'|'error', hide: boolean } ]
  const [toasts, setToasts] = useState([]);

  // Ref untuk summary card & input nama
  const summaryRef = useRef(null);
  const inputNamaRef = useRef(null);
  const inputKelasRef = useRef(null);

  // Format Rupiah
  const formatRupiah = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  // Helper untuk menampilkan toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, hide: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, hide: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 350);
    }, 3000);
  };

  // Generate options untuk kelas berdasarkan jenjang: `${jenjang} ${fase} ${nomor}`
  const getClassOptions = (j) => {
    const config = JENJANG_CONFIG[j];
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => `${j} ${config.fase} ${i + 1}`);
  };

  const handleJenjangChange = (e) => {
    const val = e.target.value;
    setJenjang(val);
    setKelas('');
    if (val) {
      showToast(`Pilih kelas di jenjang ${val}`, 'info');
    }
  };

  // Toggle order panel pada kartu menu
  const handleCardClick = (productId, e) => {
    // Abaikan jika klik berasal dari tombol qty atau input
    if (e.target.closest('.qty-btn-action') || e.target.closest('.qty-input-action')) {
      return;
    }

    setOpenPanels(prev => {
      const isCurrentlyOpen = !!prev[productId];
      const next = {};

      // Tutup panel lain kecuali yang punya pesanan > 0
      activeProducts.forEach(p => {
        if (p.id !== productId && (quantities[p.id] || 0) > 0) {
          next[p.id] = true;
        }
      });

      if (!isCurrentlyOpen) {
        next[productId] = true;
        // Auto set ke 1 jika pertama kali buka dan qty masih 0
        setQuantities(q => {
          if ((q[productId] || 0) === 0) {
            return { ...q, [productId]: 1 };
          }
          return q;
        });
      } else if ((quantities[productId] || 0) === 0) {
        next[productId] = false;
      } else {
        next[productId] = true;
      }

      return next;
    });
  };

  // Handle Qty + dan -
  const handleMinus = (productId) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 0) return prev;
      const nextVal = current - 1;
      const updated = { ...prev, [productId]: nextVal };

      // Jika turun ke 0, otomatis collapse panel
      if (nextVal === 0) {
        setOpenPanels(p => ({ ...p, [productId]: false }));
      }
      return updated;
    });
  };

  const handlePlus = (productId) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current >= 99) return prev;
      return { ...prev, [productId]: current + 1 };
    });
  };

  // Hitung total item & total harga
  const orderedItems = activeProducts
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => {
      const qty = quantities[p.id];
      const harga = Number(p.price || 0);
      const subtotal = qty * harga;
      return {
        ...p,
        qty,
        subtotal
      };
    });

  const totalQty = orderedItems.reduce((acc, it) => acc + it.qty, 0);
  const totalHarga = orderedItems.reduce((acc, it) => acc + it.subtotal, 0);

  // Reset pesanan
  const handleReset = () => {
    if (window.confirm('Batal memilih semua menu?')) {
      const fresh = {};
      activeProducts.forEach(p => { fresh[p.id] = 0; });
      setQuantities(fresh);
      setOpenPanels({});
      showToast('Semua pesanan dibatalkan! 🗑️', 'info');
    }
  };

  // Validasi form & status hint
  const namaFilled = nama.trim().length > 0;
  const kelasFilled = kelas !== '';
  const isReadyToOrder = totalQty > 0 && namaFilled && kelasFilled;

  const getFormHint = () => {
    if (totalQty === 0) {
      return { text: '💡 Pilih minimal 1 menu di atas untuk memesan.', type: 'normal' };
    }
    if (!namaFilled && !kelasFilled) {
      return { text: '✏️ Silakan isi Nama Lengkap & Kelas Anda.', type: 'alert' };
    }
    if (!namaFilled) {
      return { text: '✏️ Silakan isi Nama Lengkap Anda.', type: 'alert' };
    }
    if (!kelasFilled) {
      return { text: '✏️ Silakan pilih Kelas Anda.', type: 'alert' };
    }
    return { text: '✅ Siap dikirim ke WhatsApp!', type: 'success' };
  };

  const formHint = getFormHint();

  // Generate string struk pesanan
  const generateReceiptText = () => {
    let itemsText = '';
    orderedItems.forEach(item => {
      itemsText += `  ${item.name}\n   └ ${item.qty}x @ ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}\n`;
    });

    return (
      '===== STRUK PESANAN =====\n' +
      'Bazar Masakan Filipina 🇵🇭\n' +
      '========================\n\n' +
      'Nama  : ' + nama.trim() + '\n' +
      'Kelas : ' + kelas + '\n\n' +
      '------------------------\n' +
      itemsText +
      '------------------------\n' +
      'TOTAL : ' + formatRupiah(totalHarga) + ' (' + totalQty + ' item)\n' +
      '========================\n\n' +
      'Terima kasih! 🙏'
    );
  };

  // Salin struk ke clipboard
  const handleCopyReceipt = () => {
    if (!isReadyToOrder) {
      if (!namaFilled) inputNamaRef.current?.focus();
      else if (!kelasFilled) inputKelasRef.current?.focus();
      showToast('Lengkapi Nama & Kelas terlebih dahulu.', 'error');
      return;
    }

    const receipt = generateReceiptText();
    navigator.clipboard.writeText(receipt)
      .then(() => {
        showToast('Struk disalin ke clipboard! 📋', 'success');
      })
      .catch(() => {
        showToast('Gagal menyalin struk. Coba lagi.', 'error');
      });
  };

  // Kirim pesanan via WhatsApp & simpan ke InsForge Database
  const handleSendToWhatsApp = async () => {
    if (!namaFilled) {
      inputNamaRef.current?.focus();
      inputNamaRef.current?.classList.add('anim-shake');
      setTimeout(() => inputNamaRef.current?.classList.remove('anim-shake'), 600);
      showToast('Silakan isi Nama Lengkap Anda!', 'error');
      return;
    }
    if (!kelasFilled) {
      inputKelasRef.current?.focus();
      inputKelasRef.current?.classList.add('anim-shake');
      setTimeout(() => inputKelasRef.current?.classList.remove('anim-shake'), 600);
      showToast('Silakan pilih Kelas Anda!', 'error');
      return;
    }
    if (totalQty === 0) {
      showToast('Pilih minimal 1 menu sebelum memesan.', 'error');
      return;
    }

    const receipt = generateReceiptText();
    const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(receipt);

    // Rekam ke InsForge Database (tabel orders)
    try {
      const orderId = `FRX-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.createOrder({
        orderId,
        name: nama.trim(),
        kelas: kelas,
        phone: '',
        totalHarga: totalHarga,
        paymentMethod: 'cash',
        paymentStatus: 'PENDING',
        orderStatus: 'Pending',
        notes: 'Pemesanan via Bazar WhatsApp Direct',
        items: orderedItems.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          total: item.subtotal
        }))
      });
    } catch (err) {
      console.warn('Gagal mencatat order ke InsForge db:', err);
    }

    showToast('Membuka WhatsApp...', 'success');
    window.open(url, '_blank');
  };

  // Scroll ke order summary
  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!namaFilled) {
      setTimeout(() => inputNamaRef.current?.focus(), 400);
    }
  };

  return (
    <div className="w-full text-[#1F2937] font-sans antialiased relative">
      {/* =========================================================================
          HERO SECTION (Migrated from combine)
          ========================================================================= */}
      <header className="relative bg-gradient-to-br from-[#5D3A29] via-[#4A2E1F] to-[#3D2518] text-white text-center pt-16 pb-12 px-5 sm:px-8 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Animated Shapes */}
        <div className="hero-bg-shapes">
          <div className="bazar-shape bazar-shape-1" />
          <div className="bazar-shape bazar-shape-2" />
          <div className="bazar-shape bazar-shape-3" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto">
          {/* Badge ASEAN */}
          <div className="mb-5 inline-block">
            <span className="hero-badge-bazar">
              <span className="text-base leading-none">🇵🇭</span>
              <span>ASEAN KOKURIKULER</span>
            </span>
          </div>

          {/* Logo FREONIX */}
          <div className="flex justify-center mb-4">
            <img 
              src="/logo-freonix.png" 
              alt="Logo FREONIX" 
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:scale-105 hover:rotate-2 transition-transform duration-300"
            />
          </div>

          {/* Judul & Tagline */}
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight mb-2 drop-shadow-md">
            Masakan Filipina
          </h1>
          <p className="text-base sm:text-lg font-bold text-white/90 tracking-wide mb-1">
            FREONIX
          </p>
          <p className="text-xs sm:text-sm font-medium text-white/60 tracking-wider mb-5">
            Future Ready, Twelve One and Only
          </p>

          <div className="w-10 h-1 bg-[#DDA15E] rounded-full mx-auto mb-4" />
        </div>
      </header>

      {/* CTA SECTION */}
      <div className="py-6 text-center">
        <p className="text-sm sm:text-base font-bold text-[#5D3A29]">
          Pilih menu favoritmu di bawah ↓
        </p>
      </div>

      {/* =========================================================================
          MENU SECTION (Migrated from combine & Powered by InsForge DB)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#1F2937]">
            Menu
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Ketuk menu untuk memilih jumlah pesanan
          </p>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProducts.map((item) => {
            const qty = quantities[item.id] || 0;
            const isOpen = !!openPanels[item.id];
            const hasOrder = qty > 0;

            return (
              <div 
                key={item.id}
                onClick={(e) => handleCardClick(item.id, e)}
                className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer select-none flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${
                  isOpen 
                    ? 'border-[#8B5742] ring-4 ring-[#8B5742]/15 shadow-lg' 
                    : hasOrder 
                      ? 'border-[#DDA15E] ring-2 ring-[#DDA15E]/25' 
                      : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div>
                  {/* Card Image Wrap */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img 
                      src={item.image || '/logo-freonix.png'} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        // Fallback jika url rusak
                        e.target.src = '/logo-freonix.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Qty Badge */}
                    <div 
                      className={`card-qty-badge-anim ${
                        hasOrder ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                    >
                      {qty}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 sm:p-5 text-center">
                    <h3 className="text-lg font-bold font-heading text-stone-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                      {item.description || item.desc}
                    </p>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-base sm:text-lg font-black font-heading text-[#DDA15E]">
                        {formatRupiah(item.price)}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        / {item.unit || 'porsi'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable Order Panel */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-44 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-4 bg-gradient-to-b from-[#FEF3C7]/40 to-white border-t border-stone-100 text-center">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2.5">
                      Jumlah Pesanan
                    </label>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        type="button" 
                        onClick={() => handleMinus(item.id)}
                        className="qty-btn-action w-11 h-11 rounded-xl bg-[#5D3A29] hover:bg-[#8B5742] active:scale-95 text-white font-bold text-xl flex items-center justify-center shadow-md transition-all"
                        aria-label="Kurangi"
                      >
                        −
                      </button>
                      <input 
                        type="number" 
                        value={qty}
                        readOnly
                        className="qty-input-action w-14 h-11 text-center font-heading font-black text-lg text-stone-900 bg-white border-2 border-stone-200 rounded-xl outline-none focus:border-[#8B5742]"
                      />
                      <button 
                        type="button" 
                        onClick={() => handlePlus(item.id)}
                        className="qty-btn-action w-11 h-11 rounded-xl bg-[#5D3A29] hover:bg-[#8B5742] active:scale-95 text-white font-bold text-xl flex items-center justify-center shadow-md transition-all"
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          IDENTITY + SUMMARY SECTION (Migrated from combine)
          ========================================================================= */}
      <section className="max-w-xl mx-auto px-4 sm:px-6 pb-20" ref={summaryRef} id="order-summary">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
          {/* Header Identitas */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-xl shadow-xs">
              📋
            </div>
            <h2 className="text-xl font-bold font-heading text-stone-900">
              Identitas Pemesan
            </h2>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label htmlFor="input-nama" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="input-nama"
                  ref={inputNamaRef}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 bg-stone-50 font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#8B5742] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Jenjang */}
            <div>
              <label htmlFor="input-jenjang" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Jenjang
              </label>
              <select 
                id="input-jenjang"
                value={jenjang}
                onChange={handleJenjangChange}
                className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 bg-stone-50 font-medium text-stone-900 focus:bg-white focus:border-[#8B5742] focus:outline-none transition-all cursor-pointer"
              >
                <option value="" disabled>Pilih Jenjang</option>
                {Object.entries(JENJANG_CONFIG).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </div>

            {/* Kelas Dinamis */}
            <div>
              <label htmlFor="input-kelas" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Kelas
              </label>
              <select 
                id="input-kelas"
                ref={inputKelasRef}
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                disabled={!jenjang}
                className={`w-full h-12 px-4 rounded-xl border-2 font-medium focus:outline-none transition-all ${
                  jenjang 
                    ? 'border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:border-[#8B5742] cursor-pointer' 
                    : 'border-stone-100 bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                <option value="" disabled>
                  {jenjang ? 'Pilih Kelas' : 'Pilih Jenjang dulu'}
                </option>
                {getClassOptions(jenjang).map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-stone-200 my-6" />

          {/* =====================================================================
              RINGKASAN PESANAN
              ===================================================================== */}
          <div className="order-summary-block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-lg">
                  🧾
                </div>
                <h3 className="text-base font-bold font-heading text-stone-900">
                  Ringkasan Pesanan
                </h3>
              </div>

              {orderedItems.length > 0 && (
                <button 
                  type="button" 
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  🗑️ Reset
                </button>
              )}
            </div>

            {/* List Pesanan */}
            {orderedItems.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-50 border-2 border-dashed border-stone-200 text-center text-xs text-stone-400 font-medium mb-4">
                Belum ada pesanan
              </div>
            ) : (
              <ul className="space-y-2 mb-4">
                {orderedItems.map(item => (
                  <li 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-bold text-stone-900">{item.name}</div>
                      <div className="text-xs text-stone-500">
                        {item.qty} {item.unit || 'porsi'} @ {formatRupiah(item.price)}
                      </div>
                    </div>
                    <div className="text-sm font-black font-heading text-[#8B5742]">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Total */}
            <div className="pt-4 border-t-2 border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-stone-600">Total</span>
                <span className={`text-xl font-black font-heading ${
                  totalHarga > 0 ? 'text-[#DDA15E] anim-popin' : 'text-stone-400'
                }`}>
                  {formatRupiah(totalHarga)}
                </span>
              </div>

              {/* Form Hint */}
              <p className={`text-xs text-center font-medium my-3 ${
                formHint.type === 'alert' 
                  ? 'text-rose-600 font-bold anim-shake' 
                  : formHint.type === 'success' 
                    ? 'text-emerald-600 font-bold' 
                    : 'text-stone-500'
              }`}>
                {formHint.text}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-4">
                {/* Tombol WhatsApp */}
                <button 
                  type="button" 
                  onClick={handleSendToWhatsApp}
                  disabled={!isReadyToOrder}
                  className={`w-full sm:flex-1 h-13 rounded-2xl font-heading font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    isReadyToOrder 
                      ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#0E7064] wa-btn-pulse cursor-pointer' 
                      : 'bg-stone-300 opacity-60 cursor-not-allowed shadow-none'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Pesan via WhatsApp</span>
                </button>

                {/* Tombol Salin Struk */}
                <button 
                  type="button" 
                  onClick={handleCopyReceipt}
                  disabled={totalQty === 0}
                  className={`w-full sm:w-auto px-5 h-13 rounded-2xl font-heading font-black text-sm text-white flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                    totalQty > 0 
                      ? 'bg-[#8B5742] hover:bg-[#724534] cursor-pointer' 
                      : 'bg-stone-300 opacity-60 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>📋 Salin Struk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FLOATING QUICK BAR (MOBILE) (Migrated from combine)
          ========================================================================= */}
      <div 
        className={`floating-bar ${
          totalQty > 0 ? 'is-visible' : ''
        }`}
      >
        <div className="floating-bar-info">
          <span className="floating-bar-count">{totalQty} Item Dipilih</span>
          <span className="floating-bar-total">{formatRupiah(totalHarga)}</span>
        </div>
        <button 
          type="button" 
          onClick={scrollToSummary}
          className="floating-bar-btn"
        >
          Lihat Struk ↓
        </button>
      </div>

      {/* =========================================================================
          TOAST NOTIFICATION CONTAINER (Migrated from combine)
          ========================================================================= */}
      <div className="toast-container">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`toast ${t.hide ? 'toast-hide' : ''} ${
              t.type === 'success' 
                ? 'bg-emerald-600' 
                : t.type === 'error' 
                  ? 'bg-rose-600' 
                  : 'bg-[#5D3A29]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
