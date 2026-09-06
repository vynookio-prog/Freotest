import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle, 
  Printer, 
  ExternalLink, 
  MessageSquare, 
  PlusCircle, 
  QrCode, 
  Banknote, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Phone,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDb } from '../utils/useDb';
import { addOrder } from '../utils/orderStore';

export default function Checkout() {
  const db = useDb();
  const activeProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    kelas: '',
    phone: '',
    notes: '',
    paymentMethod: 'qris' // 'qris' or 'cash'
  });

  // Dynamic Item Quantities: { [productId]: count }
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    activeProducts.forEach(p => {
      initial[p.id] = 0;
    });
    return initial;
  });

  const [paymentProof, setPaymentProof] = useState(null); // Data URL for local thumbnail preview
  const [paymentProofUrl, setPaymentProofUrl] = useState(''); // Public CDN URL for WhatsApp & Sheets
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore order state from localStorage
  const [savedOrder, setSavedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('freonix_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isSuccess, setIsSuccess] = useState(() => {
    return !!localStorage.getItem('freonix_last_order');
  });

  // Dynamically sync order with db if order exists so real-time status update shows immediately on receipt
  const currentDbOrder = savedOrder ? db.getOrderById(savedOrder.orderId) : null;
  const orderSummary = currentDbOrder ? {
    ...savedOrder,
    paymentStatus: currentDbOrder.paymentStatus,
    orderStatus: currentDbOrder.orderStatus,
    verifiedAt: currentDbOrder.verifiedAt
  } : savedOrder;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQtyChange = (productId, delta) => {
    const prod = activeProducts.find(p => p.id === productId);
    const maxStock = prod ? (prod.stock || 0) : 999;
    
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next > maxStock) {
        alert(`Maaf, stok ${prod.name} hanya tersisa ${maxStock} ${prod.unit || 'porsi'}.`);
        return prev;
      }
      return { ...prev, [productId]: next };
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const uploadToCdn = async (file) => {
    const litterboxFormData = new FormData();
    litterboxFormData.append('reqtype', 'fileupload');
    litterboxFormData.append('time', '72h');
    litterboxFormData.append('fileToUpload', file);

    try {
      const resp = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
        method: 'POST',
        body: litterboxFormData
      });
      if (resp.ok) {
        const url = (await resp.text()).trim();
        if (url.startsWith('http')) return url;
      }
    } catch (e) {
      console.warn('Litterbox CDN upload failed, trying tmpfiles fallback...', e);
    }

    const tmpFormData = new FormData();
    tmpFormData.append('file', file);
    const tmpResp = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: tmpFormData
    });
    if (tmpResp.ok) {
      const json = await tmpResp.json();
      if (json && json.data && json.data.url) {
        return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      }
    }
    throw new Error('Gagal mengunggah foto ke CDN publik');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WebP) untuk bukti transfer.');
      return;
    }

    try {
      const compressed = await compressImage(file);
      if (compressed) setPaymentProof(compressed);
    } catch (err) {
      console.warn('Image compression warning:', err);
    }

    setIsUploadingProof(true);
    setUploadError(null);
    try {
      const directUrl = await uploadToCdn(file);
      setPaymentProofUrl(directUrl);
    } catch (err) {
      console.error('Error saat upload bukti ke CDN:', err);
      setUploadError('Gagal mengunggah gambar ke server CDN otomatis. Anda tetap dapat mengirim foto bukti transfer secara manual melalui WhatsApp.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Calculations
  const calculateTotal = () => {
    return activeProducts.reduce((sum, p) => {
      const qty = quantities[p.id] || 0;
      return sum + (qty * (p.price || 0));
    }, 0);
  };

  const totalItemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (settings.storeStatus === 'closed') {
      alert('Mohon maaf, sesi pre-order saat ini sedang ditutup oleh panitia.');
      return;
    }

    if (activeProducts.length === 0) {
      alert('Belum ada menu produk yang tersedia untuk dipesan.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Silakan isi Nama Lengkap Anda terlebih dahulu.');
      return;
    }

    if (!formData.kelas.trim()) {
      alert('Silakan isi Kelas Anda terlebih dahulu.');
      return;
    }

    if (totalItemCount === 0) {
      alert('Silakan pilih minimal 1 produk untuk dipesan.');
      return;
    }

    // Verify stock availability
    for (const prod of activeProducts) {
      const orderedQty = quantities[prod.id] || 0;
      if (orderedQty > 0 && orderedQty > (prod.stock || 0)) {
        alert(`Stok ${prod.name} tidak mencukupi. Tersedia hanya ${prod.stock} ${prod.unit}.`);
        return;
      }
    }

    const isQris = formData.paymentMethod === 'qris';

    if (isQris && isUploadingProof) {
      alert('Sedang mengunggah foto bukti transfer QRIS. Mohon tunggu beberapa detik hingga selesai.');
      return;
    }

    if (isQris && !paymentProof && !paymentProofUrl) {
      alert('Untuk pembayaran QRIS, Anda diwajibkan mengunggah foto / screenshot bukti transfer sebelum pesanan dapat dibuat.');
      return;
    }

    const totalHarga = calculateTotal();
    const prefix = settings.orderPrefix || 'FRX';
    const orderId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderTime = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const paymentStatusText = 'PENDING';

    // Format items list
    const orderItems = activeProducts
      .filter(p => (quantities[p.id] || 0) > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        qty: quantities[p.id],
        price: p.price,
        total: quantities[p.id] * p.price
      }));

    // Format WhatsApp message
    const adminPhone = settings.whatsappAdmin || '6287856624994';
    let textMessage = `Halo Admin, saya ingin memesan produk kuliner ${settings.storeName || 'FREONIX'}.\n\n`;
    textMessage += `*NO. PESANAN:* #${orderId}\n`;
    textMessage += `*STATUS PEMBAYARAN:* ${isQris ? '⏳ PAYMENT PENDING (Sedang dalam pengecekan bukti transfer QRIS oleh Admin)' : '⏳ PAYMENT PENDING (Bayar Tunai di Stand saat Pengambilan)'}\n`;
    textMessage += `*METODE BAYAR:* ${isQris ? 'QRIS' : 'Cash (Tunai di Stand)'}\n\n`;
    
    textMessage += `*DATA PEMESAN*\n`;
    textMessage += `Nama: ${formData.name}\n`;
    textMessage += `Kelas: ${formData.kelas}\n`;
    if (formData.phone) textMessage += `WhatsApp: ${formData.phone}\n`;
    textMessage += `\n*RINCIAN PESANAN*\n`;
    orderItems.forEach(item => {
      textMessage += `• ${item.name}: ${item.qty} porsi (Rp ${item.total.toLocaleString('id-ID')})\n`;
    });
    if (formData.notes.trim()) {
      textMessage += `\n*CATATAN KHUSUS:* ${formData.notes.trim()}\n`;
    }
    textMessage += `\n*TOTAL HARGA:* Rp ${totalHarga.toLocaleString('id-ID')}\n\n`;

    if (isQris) {
      if (paymentProofUrl) {
        textMessage += `📎 *LINK BUKTI PEMBAYARAN:* ${paymentProofUrl}\n\n`;
      } else {
        textMessage += `📎 *BUKTI PEMBAYARAN:* (Foto bukti transfer QRIS saya lampirkan di chat ini).\n\n`;
      }
    } else {
      textMessage += `💵 *KETERANGAN:* Pembayaran akan dibayarkan secara tunai langsung di stand acara.\n\n`;
    }
    textMessage += `Terima kasih!`;

    const encodedMessage = encodeURIComponent(textMessage);
    const waUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

    const summaryData = {
      orderId,
      orderTime,
      name: formData.name,
      kelas: formData.kelas,
      phone: formData.phone || '',
      notes: formData.notes.trim(),
      paymentMethod: formData.paymentMethod,
      paymentStatus: paymentStatusText,
      orderStatus: 'Pending',
      paymentProofUrl: paymentProofUrl || null,
      paymentProofImage: paymentProof || paymentProofUrl || null,
      items: orderItems,
      totalHarga,
      waUrl
    };

    // 1. Simpan ke database terpadu (db.js) - otomatis potong stok & buat notifikasi
    try {
      db.createOrder(summaryData);
    } catch (err) {
      console.error('db.createOrder error:', err);
    }

    // 2. Simpan ke orderStore untuk backward compatibility
    try {
      addOrder(summaryData);
    } catch (err) {
      console.error('OrderStore error:', err);
    }

    // 3. Simpan struk aktif ke localStorage
    try {
      localStorage.setItem('freonix_last_order', JSON.stringify(summaryData));
    } catch (err) {
      console.error('LocalStorage error:', err);
    }

    setSavedOrder(summaryData);
    setIsSuccess(true);

    // 4. Buka WhatsApp
    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewOrder = () => {
    try {
      localStorage.removeItem('freonix_last_order');
    } catch (e) {}
    setSavedOrder(null);
    setIsSuccess(false);
    setPaymentProof(null);
    setPaymentProofUrl('');
    setUploadError(null);
    setImgError(false);
    setFormData({
      name: '',
      kelas: '',
      phone: '',
      notes: '',
      paymentMethod: 'qris'
    });
    const resetQty = {};
    activeProducts.forEach(p => { resetQty[p.id] = 0; });
    setQuantities(resetQty);
  };

  // --- RENDER DIGITAL RECEIPT ---
  if (isSuccess && orderSummary) {
    const isQrisOrder = orderSummary.paymentMethod === 'qris';
    const isVerifiedSuccess = orderSummary.paymentStatus === 'SUCCESS';

    return (
      <div className="py-12 px-4 sm:px-6 max-w-lg mx-auto animate-fade-in">
        {/* Apple Liquid Glass Digital Receipt Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_24px_70px_rgba(93,58,41,0.12)] relative overflow-hidden print:shadow-none print:border print:border-stone-300">
          {/* Top Specular Rim */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Receipt Header */}
          <div className="text-center pb-6 border-b border-stone-200/50">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isVerifiedSuccess 
                ? 'bg-green-500/15 border border-green-500/30 text-green-600 animate-bounce' 
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-600'
            }`}>
              <CheckCircle className="w-8 h-8" />
            </div>
            
            {/* Live Synchronized Payment Status Badge */}
            <div className="mb-2">
              {isVerifiedSuccess ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-800 text-xs font-black uppercase tracking-wider shadow-sm">
                  <CheckCircle2 size={14} className="text-green-600" />
                  Payment Successful (Lunas Terverifikasi Admin)
                </span>
              ) : isQrisOrder ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 text-xs font-black uppercase tracking-wider animate-pulse shadow-sm">
                  <Clock size={14} />
                  Payment Pending (Sedang Dalam Pengecekan Admin)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-500/15 border border-stone-500/30 text-stone-700 text-xs font-black uppercase tracking-wider shadow-sm">
                  <AlertCircle size={14} />
                  Payment Pending (Bayar Tunai di Stand)
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-[#5D3A29] mt-2 mb-1">Pesanan Diterima!</h2>
            <p className="text-xs text-stone-500 font-mono">
              No. Pesanan: <span className="font-extrabold text-[#8B5742]">#{orderSummary.orderId}</span>
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">{orderSummary.orderTime}</p>
          </div>

          {/* Customer Info */}
          <div className="py-4 border-b border-stone-200/50 flex justify-between text-xs">
            <div>
              <span className="text-stone-400 block uppercase font-bold text-[10px]">Nama Pemesan</span>
              <span className="font-bold text-[#5D3A29] text-sm">{orderSummary.name}</span>
              {orderSummary.phone && (
                <span className="text-[11px] text-stone-400 block font-mono mt-0.5">{orderSummary.phone}</span>
              )}
            </div>
            <div className="text-right">
              <span className="text-stone-400 block uppercase font-bold text-[10px]">Kelas & Metode</span>
              <span className="font-bold text-[#8B5742] text-sm">
                {orderSummary.kelas} • {isQrisOrder ? 'QRIS' : 'Tunai (Cash)'}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5 font-semibold">
                Status: {orderSummary.orderStatus || 'Pending'}
              </span>
            </div>
          </div>

          {/* Itemized Breakdown */}
          <div className="py-4 border-b border-stone-200/50 space-y-2.5">
            <span className="text-stone-400 block uppercase font-bold text-[10px] mb-1">Rincian Menu</span>
            {(orderSummary.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#5D3A29]">{item.name}</span>
                  <span className="text-stone-400 ml-1.5 font-semibold">x{item.qty}</span>
                </div>
                <span className="font-bold text-[#5D3A29]">Rp {Number(item.total).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>

          {/* Catatan Khusus */}
          {orderSummary.notes && (
            <div className="py-3 border-b border-stone-200/50 bg-stone-50/60 rounded-xl px-3 my-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5742] block mb-1">
                Catatan Khusus:
              </span>
              <p className="text-xs text-stone-600 italic">"{orderSummary.notes}"</p>
            </div>
          )}

          {/* Total Price */}
          <div className="py-4 flex justify-between items-center">
            <span className="font-bold text-sm text-[#5D3A29]">Total Pembayaran</span>
            <span className="text-xl font-black text-[#8B5742]">
              Rp {Number(orderSummary.totalHarga || 0).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Bukti Pembayaran QRIS Thumbnail jika ada */}
          {(orderSummary.paymentProofImage || orderSummary.paymentProofUrl) && (
            <div className="py-3 border-t border-stone-200/50 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5742] block mb-2">
                Lampiran Bukti Transfer QRIS:
              </span>
              <div className="w-full rounded-2xl overflow-hidden border border-white/80 shadow-xs bg-stone-100/80 p-2 flex items-center justify-center min-h-[140px]">
                {imgError ? (
                  <div className="py-4 px-2 flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-8 h-8 text-[#8B5742]/50 mb-1.5" />
                    <p className="text-xs font-bold text-[#5D3A29]">Bukti Transfer Terlampir via Cloud CDN</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">Tautan bukti pembayaran telah dilampirkan ke WhatsApp Admin</p>
                  </div>
                ) : (
                  <img 
                    src={orderSummary.paymentProofImage || orderSummary.paymentProofUrl} 
                    alt="Bukti Transfer QRIS" 
                    className="w-full max-h-64 object-contain rounded-xl"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
              {orderSummary.paymentProofUrl && (
                <div className="mt-2.5 text-center">
                  <a
                    href={orderSummary.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[11px] font-bold text-[#8B5742] hover:text-[#5D3A29] border border-stone-200/60 shadow-xs transition-all"
                  >
                    <ExternalLink size={12} /> Buka Bukti Foto (Link CDN)
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Stand Pickup Notification */}
          <div className="bg-[#DDA15E]/15 border border-[#DDA15E]/30 rounded-2xl p-4 text-center mt-2 mb-6">
            <p className="text-xs text-[#5D3A29] font-medium leading-relaxed">
              📍 <strong>Pengambilan Pesanan:</strong> Tunjukkan nomor <span className="font-bold text-[#8B5742]">#{orderSummary.orderId}</span> ini di stand acara kokurikuler pada <strong>{settings.eventDate || '23 September 2026'}</strong>.
              {!isQrisOrder && (
                <span className="block mt-1 text-amber-900 font-semibold">
                  (Siapkan uang pas Rp {Number(orderSummary.totalHarga || 0).toLocaleString('id-ID')} untuk pembayaran tunai di tempat).
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 print:hidden">
            <a
              href={orderSummary.waUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(139,87,66,0.3)] hover:shadow-[0_6px_22px_rgba(139,87,66,0.45)] transition-all active:scale-95"
            >
              <ExternalLink size={15} />
              Buka WhatsApp & Kirim Bukti
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-[#5D3A29] py-3 rounded-2xl font-bold text-xs uppercase tracking-wider border border-white/90 shadow-xs transition-all active:scale-95"
            >
              <Printer size={15} />
              Cetak / Simpan Bukti Struk
            </button>
            <button
              type="button"
              onClick={handleNewOrder}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs text-[#8B5742] hover:bg-white/60 transition-all active:scale-95"
            >
              <PlusCircle size={15} />
              Buat Pesanan Baru
            </button>
            <Link 
              to="/products"
              className="w-full text-center text-xs font-bold text-stone-500 hover:text-[#5D3A29] py-1 transition-colors"
            >
              ← Kembali ke Menu Produk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CHECKOUT FORM ---
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Closed Store Alert */}
        {settings.storeStatus === 'closed' && (
          <div className="mb-8 p-4 rounded-3xl bg-rose-500/10 backdrop-blur-xl border border-rose-500/30 text-rose-900 flex items-center gap-3">
            <AlertCircle size={22} className="text-rose-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold block">Sesi Pre-Order Ditutup</span>
              <span className="text-rose-800">Saat ini stan sedang tidak menerima pesanan baru. Anda tidak dapat melanjutkan proses checkout.</span>
            </div>
          </div>
        )}

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <ShoppingBag size={14} />
            Keranjang Pemesanan
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5D3A29] mb-3">Checkout Pesanan</h1>
          <p className="text-[#4B5563] text-sm sm:text-base">
            Isi data diri Anda dan tentukan jumlah produk yang ingin dipesan. 
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 p-6 sm:p-10 shadow-[0_20px_60px_rgba(93,58,41,0.08)] relative overflow-hidden">
          {/* Top specular rim */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Data Diri */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider border-b border-stone-200/50 pb-3 mb-5">
              Data Diri Pembeli
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>Nama Lengkap <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">Wajib</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all placeholder:text-stone-400"
                  placeholder="Nama Lengkap Anda"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>Kelas <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">Wajib</span>
                </label>
                <input 
                  type="text"
                  name="kelas"
                  required
                  value={formData.kelas}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all placeholder:text-stone-400"
                  placeholder="Contoh: XII IPA 1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>Nomor WhatsApp (Opsional)</span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">Untuk Notifikasi</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all placeholder:text-stone-400 font-mono"
                    placeholder="Contoh: 081234567890"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rincian Menu Produk Dinamis dari Database */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider border-b border-stone-200/50 pb-3 mb-5">
              Rincian Menu Produk
            </h2>
            <div className="space-y-3.5">
              {activeProducts.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/70">
                  <ShoppingBag size={28} className="mx-auto text-stone-400 mb-2" />
                  <p className="text-sm font-bold text-[#5D3A29]">Belum Ada Menu yang Tersedia</p>
                  <p className="text-xs text-stone-500 mt-1">Daftar menu produk sedang disiapkan atau belum diinput oleh Admin.</p>
                </div>
              ) : (
                activeProducts.map(prod => {
                  const isOutOfStock = (prod.stock || 0) === 0;
                  const currentQty = quantities[prod.id] || 0;

                  return (
                    <div key={prod.id} className={`flex items-center justify-between p-3.5 rounded-2xl border shadow-xs transition-all ${
                      isOutOfStock 
                        ? 'bg-stone-100/60 border-stone-200 opacity-60' 
                        : 'bg-white/50 backdrop-blur-md border-white/70'
                    }`}>
                      <div className="flex items-center gap-3">
                        {prod.image && (
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-white/80 shrink-0" 
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-sm text-[#5D3A29]">{prod.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-[#8B5742]">
                              Rp {Number(prod.price || 0).toLocaleString('id-ID')} / {prod.unit || 'porsi'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                              isOutOfStock 
                                ? 'bg-rose-100 text-rose-700' 
                                : (prod.stock || 0) <= 5 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-stone-100 text-stone-600'
                            }`}>
                              {isOutOfStock ? 'Habis' : `Stok: ${prod.stock}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          type="button"
                          disabled={isOutOfStock || currentQty === 0}
                          onClick={() => handleQtyChange(prod.id, -1)}
                          className="w-8 h-8 rounded-full bg-white/80 disabled:opacity-40 border border-white/90 shadow-xs flex items-center justify-center text-[#5D3A29] font-black hover:bg-white active:scale-90 transition-all"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-extrabold text-sm text-[#5D3A29]">
                          {currentQty}
                        </span>
                        <button 
                          type="button"
                          disabled={isOutOfStock || currentQty >= (prod.stock || 0)}
                          onClick={() => handleQtyChange(prod.id, 1)}
                          className="w-8 h-8 rounded-full bg-white/80 disabled:opacity-40 border border-white/90 shadow-xs flex items-center justify-center text-[#5D3A29] font-black hover:bg-white active:scale-90 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Catatan Khusus */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-stone-200/50 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={16} className="text-[#DDA15E]" /> Catatan Khusus (Opsional)
              </h2>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Optional</span>
            </div>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Contoh: Saus dipisah, kurangi es batu, atau catatan khusus lainnya..."
              className="w-full px-4 py-3 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DDA15E]/60 text-sm shadow-xs transition-all placeholder:text-stone-400 resize-none"
            />
          </div>

          {/* Metode Pembayaran (QRIS vs Cash) */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider border-b border-stone-200/50 pb-3 mb-4">
              Pilih Metode Pembayaran
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Opsi QRIS */}
              <label 
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'qris'
                    ? 'bg-white/80 border-[#8B5742] shadow-sm ring-2 ring-[#8B5742]/20'
                    : 'bg-white/40 border-white/80 hover:bg-white/60'
                }`}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="qris"
                  checked={formData.paymentMethod === 'qris'}
                  onChange={handleChange}
                  className="accent-[#8B5742] w-4 h-4"
                />
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#DDA15E]/20 text-[#8B5742]">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#5D3A29] block">QRIS (Non-Tunai)</span>
                    <span className="text-[11px] text-stone-500">Scan barcode & bayar instan</span>
                  </div>
                </div>
              </label>

              {/* Opsi Cash */}
              <label 
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'cash'
                    ? 'bg-white/80 border-[#8B5742] shadow-sm ring-2 ring-[#8B5742]/20'
                    : 'bg-white/40 border-white/80 hover:bg-white/60'
                }`}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="accent-[#8B5742] w-4 h-4"
                />
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-stone-200/60 text-[#5D3A29]">
                    <Banknote size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#5D3A29] block">Tunai (Cash di Stand)</span>
                    <span className="text-[11px] text-stone-500">Bayar saat ambil di stand</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Kotak Tampilan QRIS & Upload Bukti jika QRIS dipilih */}
            {formData.paymentMethod === 'qris' && (
              <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-sm animate-fade-in space-y-4">
                {/* Kartu QRIS Dummy */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs text-center max-w-sm mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <img 
                      src="https://images.seeklogo.com/logo-png/39/2/quick-response-code-indonesia-standard-qris-logo-png_seeklogo-391791.png" 
                      alt="Logo QRIS" 
                      className="h-6 object-contain"
                    />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">NMID: ID102026FREONIX</span>
                  </div>

                  <h3 className="font-black text-sm text-[#5D3A29] mb-1">{settings.storeName || 'FREONIX STAND'}</h3>
                  <p className="text-[11px] text-stone-500 mb-3">Kuliner Stand Kokurikuler</p>

                  {/* QR Code Canvas/Image */}
                  <div className="p-3 bg-white rounded-xl border border-stone-200 inline-block shadow-inner mb-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=FREONIX-ORDER-QRIS-NOMINAL-${calculateTotal()}`}
                      alt="QRIS Barcode" 
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>

                  <div className="text-xs font-bold text-[#8B5742] bg-[#DDA15E]/15 py-1.5 px-3 rounded-lg border border-[#DDA15E]/30">
                    Nominal: Rp {calculateTotal().toLocaleString('id-ID')}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2">
                    Dapat di-scan dengan GoPay, OVO, Dana, ShopeePay, BCA Mobile, dll.
                  </p>
                </div>

                {/* Input Upload Bukti Transfer */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] flex items-center gap-1">
                      Upload Bukti Transfer QRIS <span className="text-red-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full">
                      Wajib Diisi (QRIS)
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed transition-all group ${
                      isUploadingProof 
                        ? 'border-stone-300 bg-stone-100 cursor-not-allowed text-stone-400' 
                        : !paymentProof
                          ? 'border-red-300 hover:border-red-500 bg-red-50/20 cursor-pointer'
                          : 'border-green-400/80 hover:border-green-600 bg-green-50/30 cursor-pointer'
                    }`}>
                      {isUploadingProof ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-[#8B5742]" />
                          <span className="text-xs font-semibold text-stone-600">Mengunggah ke server CDN...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="text-[#8B5742] group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold text-stone-600">
                            {paymentProof ? 'Ganti Foto Bukti' : 'Pilih Foto / Screenshot Bukti Transfer'}
                          </span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={isUploadingProof}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {paymentProof && (
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-white shadow-xs shrink-0 bg-stone-100">
                        <img 
                          src={paymentProof} 
                          alt="Preview Bukti" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pengingat Jika Belum Upload Bukti */}
                  {!paymentProof && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-900 text-xs animate-fade-in">
                      <AlertCircle size={15} className="shrink-0 text-amber-600" />
                      <span>Anda <strong>wajib</strong> mengunggah screenshot bukti transfer QRIS agar pesanan dapat diproses.</span>
                    </div>
                  )}

                  {/* Status Sukses Upload CDN */}
                  {paymentProofUrl && !isUploadingProof && (
                    <div className="mt-3 p-3 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-start gap-2.5 animate-fade-in">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-green-800">Bukti berhasil diunggah & diverifikasi!</p>
                        <p className="text-green-700 text-[11px] mt-0.5">
                          Link foto publik siap dilampirkan otomatis ke pesan WhatsApp Admin.
                        </p>
                        <a 
                          href={paymentProofUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1 text-[11px] text-green-900 font-bold underline mt-1"
                        >
                          <ExternalLink size={11} /> Cek Tautan Gambar
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Status Error Upload */}
                  {uploadError && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-800 text-xs animate-fade-in">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <p>{uploadError}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 mt-2">
                    * Pembayaran QRIS mewajibkan lampiran bukti screenshot agar Admin dapat langsung memverifikasi status pembayaran lunas.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Total & Submit */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-5 border border-white/80 shadow-xs mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#5D3A29]/80 text-xs font-bold uppercase tracking-wider">Total Item Dipesan</span>
              <span className="font-extrabold text-[#5D3A29]">{totalItemCount} item</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200/40">
              <span className="text-[#5D3A29] font-bold text-sm">Total Estimasi Harga</span>
              <span className="text-2xl font-black text-[#8B5742]">Rp {calculateTotal().toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isUploadingProof || settings.storeStatus === 'closed' || activeProducts.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] disabled:opacity-50 text-white py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_8px_24px_rgba(139,87,66,0.35)] hover:shadow-[0_12px_30px_rgba(139,87,66,0.5)] active:scale-98"
          >
            {activeProducts.length === 0 ? (
              <span className="font-bold flex items-center gap-2">
                <ShoppingBag size={18} /> Belum Ada Menu untuk Dipesan
              </span>
            ) : settings.storeStatus === 'closed' ? (
              <span className="font-bold">Pre-Order Ditutup</span>
            ) : isUploadingProof ? (
              <span className="font-bold flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Mengunggah Bukti Pembayaran...
              </span>
            ) : isLoading ? (
              <span className="font-bold">Memproses...</span>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                {formData.paymentMethod === 'qris' 
                  ? (paymentProof ? 'Konfirmasi Bayar QRIS & Kirim WA' : 'Wajib Upload Bukti QRIS Terlebih Dahulu') 
                  : 'Pesan & Bayar Tunai di Stand'}
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
