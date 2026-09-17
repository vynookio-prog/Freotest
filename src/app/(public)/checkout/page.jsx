'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Star,
  Search,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useDb } from '../../../lib/useDb';
import { uploadToInsforgeStorage, isInsforgeConfigured } from '../../../lib/insforge';
import ReviewModal from '../../../components/ReviewModal';
import Loading from '../loading';

// Konfigurasi terpusat untuk jenjang, fase kurikulum, dan jumlah rombel kelas
export const JENJANG_CONFIG = {
  '10': { label: 'Kelas 10 (Fase E)', fase: 'E', count: 10, isStaff: false },
  '11': { label: 'Kelas 11 (Fase F)', fase: 'F', count: 10, isStaff: false },
  '12': { label: 'Kelas 12 (Fase F)', fase: 'F', count: 10, isStaff: false },
  'guru': { label: 'Guru / Tenaga Pendidik', fase: '', count: 0, isStaff: true },
};

/**
 * Generate opsi kelas secara dinamis: `${jenjang} ${fase} ${nomor}`
 * Contoh: "10 E 1" s/d "10 E 10", "11 F 1" s/d "11 F 10", "12 F 1" s/d "12 F 10"
 * @param {string} j - Kunci jenjang ('10', '11', '12', 'guru')
 * @returns {string[]} Array nama kelas
 */
export const getClassOptions = (j) => {
  const config = JENJANG_CONFIG[j];
  if (!config || !config.count) return [];
  return Array.from({ length: config.count }, (_, i) => `${j} ${config.fase} ${i + 1}`);
};

export default function CheckoutPage() {
  const db = useDb();
  const activeProducts = db.getActiveProducts() || [];
  const settings = db.getSettings() || {};

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    kelas: '',
    phone: '',
    notes: '',
    paymentMethod: '' // '' (belum memilih), 'qris', or 'cash'
  });

  const [jenjang, setJenjang] = useState(''); // '10', '11', '12', 'guru'
  const [formErrors, setFormErrors] = useState({
    name: '',
    jenjang: '',
    kelas: '',
    phone: '',
    paymentMethod: ''
  });

  const isTeacher = jenjang === 'guru';

  // Opsi kelas reaktif ter-memoize berdasarkan jenjang yang aktif
  const classOptions = useMemo(() => getClassOptions(jenjang), [jenjang]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, name: val }));
    if (formErrors.name && val.trim().length >= 5) {
      setFormErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleJenjangChange = (e) => {
    const val = e.target.value;
    setJenjang(val);
    setFormData(prev => ({
      ...prev,
      kelas: val === 'guru' ? 'Guru / Tenaga Pendidik' : ''
    }));
    setFormErrors(prev => ({
      ...prev,
      jenjang: '',
      kelas: ''
    }));
  };

  const handleKelasChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      kelas: val
    }));
    if (formErrors.kelas && val) {
      setFormErrors(prev => ({ ...prev, kelas: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      phone: onlyDigits
    }));
    if (formErrors.phone && onlyDigits.length >= 10) {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handlePhoneBlur = () => {
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      setFormErrors(prev => ({
        ...prev,
        phone: 'Nomor WhatsApp wajib diisi minimal 10 digit angka (contoh: 0812345678).'
      }));
    } else if (trimmedPhone.length < 10) {
      setFormErrors(prev => ({
        ...prev,
        phone: `Nomor WhatsApp harus minimal 10 digit angka (contoh: 0812345678). Anda baru memasukkan ${trimmedPhone.length} digit.`
      }));
    } else {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const validateCustomerData = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errors.name = 'Nama lengkap wajib diisi.';
    } else if (trimmedName.length < 5) {
      errors.name = 'Nama lengkap minimal 5 huruf.';
    }

    if (!jenjang) {
      errors.jenjang = 'Pilih jenjang kelas atau Guru.';
    }

    if (!isTeacher && !formData.kelas.trim()) {
      errors.kelas = 'Pilih kelas Anda.';
    }

    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Nomor WhatsApp wajib diisi minimal 10 digit angka (contoh: 0812345678).';
    } else if (trimmedPhone.length < 10) {
      errors.phone = `Nomor WhatsApp harus minimal 10 digit angka (contoh: 0812345678). Anda baru memasukkan ${trimmedPhone.length} digit.`;
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Silakan pilih salah satu metode pembayaran (QRIS atau Tunai).';
    }

    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

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
  const [submitError, setSubmitError] = useState(null);

  // Hydration-safe State Management
  const [isMounted, setIsMounted] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSavedReceipt, setHasSavedReceipt] = useState(false);

  // Restore order state from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem('freonix_last_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedOrder(parsed);
        setIsSuccess(true);
        if (parsed?.orderId && sessionStorage.getItem(`receipt_saved_${parsed.orderId}`) === 'true') {
          setHasSavedReceipt(true);
        }
      }
    } catch (err) {
      console.error('Error reading localStorage order:', err);
    }
  }, []);

  const [liveOrder, setLiveOrder] = useState(null);

  useEffect(() => {
    const orderId = savedOrder?.orderId;
    if (!orderId) return;

    let isMounted = true;
    db.getOrderByIdAsync(orderId).then(order => {
      if (isMounted && order) setLiveOrder(order);
    });

    return () => {
      isMounted = false;
    };
  }, [savedOrder?.orderId, db]);

  // Dynamically sync order with db/live state
  const currentDbOrder = liveOrder || (savedOrder ? db.getOrderById(savedOrder.orderId) : null);
  const orderSummary = currentDbOrder ? {
    ...savedOrder,
    paymentStatus: currentDbOrder.paymentStatus,
    orderStatus: currentDbOrder.orderStatus,
    verifiedAt: currentDbOrder.verifiedAt
  } : savedOrder;

  // Rating & Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  // Order Lookup State (Search by Phone or Receipt Code)
  const [showLookupBox, setShowLookupBox] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const orderKey = orderSummary?.orderId || orderSummary?.id;

  // Check if review already submitted for this order
  useEffect(() => {
    if (!orderKey) return;
    if (typeof window !== 'undefined') {
      const isLocalReviewed = localStorage.getItem(`review_submitted_${orderKey}`) === 'true';
      if (isLocalReviewed) {
        setHasSubmittedReview(true);
        return;
      }
      // Check server API to be 100% sure
      fetch(`/api/reviews?orderId=${encodeURIComponent(orderKey)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.reviews?.length > 0) {
            setHasSubmittedReview(true);
            try {
              localStorage.setItem(`review_submitted_${orderKey}`, 'true');
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, [orderKey]);

  // Trigger popup when order is approved & hasn't been reviewed & not dismissed this session
  useEffect(() => {
    if (!isSuccess || !orderSummary || !orderKey) return;
    const isApproved = orderSummary.paymentStatus === 'SUCCESS' || 
      ['Processing', 'Shipped', 'Completed', 'Disetujui'].includes(orderSummary.orderStatus);
    
    if (!isApproved || hasSubmittedReview) return;

    if (typeof window !== 'undefined') {
      const isDismissed = sessionStorage.getItem(`review_dismissed_${orderKey}`) === 'true';
      const isReviewed = localStorage.getItem(`review_submitted_${orderKey}`) === 'true';
      if (!isDismissed && !isReviewed) {
        const timer = setTimeout(() => {
          setShowReviewModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSuccess, orderSummary, orderKey, hasSubmittedReview]);

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    if (orderKey && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`review_dismissed_${orderKey}`, 'true');
      } catch (e) {}
    }
  };

  const handleReviewSuccess = () => {
    setHasSubmittedReview(true);
    if (orderKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`review_submitted_${orderKey}`, 'true');
      } catch (e) {}
    }
  };

  const handleLookupOrder = async (e) => {
    e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;
    setLookupLoading(true);
    setLookupError('');

    try {
      let foundOrder = await db.getOrderByIdAsync(q);
      if (!foundOrder) {
        const cleanPhone = q.replace(/\D/g, '');
        const allOrders = await db.fetchOrders();
        foundOrder = allOrders.find(o => 
          (o.phone && o.phone.replace(/\D/g, '').includes(cleanPhone)) ||
          (o.orderId && o.orderId.toLowerCase() === q.toLowerCase()) ||
          (o.id && o.id.toLowerCase() === q.toLowerCase())
        );
      }

      if (foundOrder) {
        const mapped = {
          orderId: foundOrder.orderId || foundOrder.id,
          name: foundOrder.name,
          kelas: foundOrder.kelas,
          phone: foundOrder.phone,
          items: foundOrder.items || [],
          totalHarga: foundOrder.totalHarga || foundOrder.total_harga || 0,
          paymentMethod: foundOrder.paymentMethod || foundOrder.payment_method || 'cash',
          paymentStatus: foundOrder.paymentStatus || foundOrder.payment_status || 'PENDING',
          orderStatus: foundOrder.orderStatus || foundOrder.order_status || 'Pending',
          paymentProofImage: foundOrder.paymentProofImage || foundOrder.paymentProof || foundOrder.payment_proof || foundOrder.payment_proof_url,
          paymentProofUrl: foundOrder.paymentProofUrl || foundOrder.payment_proof_url || '',
          notes: foundOrder.notes || '',
          orderTime: foundOrder.orderTime || foundOrder.order_time || ''
        };
        setSavedOrder(mapped);
        setLiveOrder(mapped);
        setIsSuccess(true);
        setShowLookupBox(false);
      } else {
        setLookupError('Pesanan tidak ditemukan. Pastikan nomor WhatsApp atau nomor pesanan (contoh: FRX-8365) sudah tepat.');
      }
    } catch (err) {
      setLookupError(`Gagal mencari pesanan: ${err.message}`);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'paymentMethod' && formErrors.paymentMethod) {
      setFormErrors(prev => ({ ...prev, paymentMethod: '' }));
      setSubmitError(null);
    }
  };

  const handleQtyChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
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
    // 1. Coba upload ke InsForge Storage (bucket: freonix-uploads)
    try {
      const ifResult = await uploadToInsforgeStorage(file, 'payment_proofs');
      if (ifResult.success && ifResult.url) {
        return ifResult.url;
      }
    } catch (e) {
      console.warn('InsForge storage upload fallback...', e);
    }

    // 2. Fallback cadangan ke Litterbox CDN jika offline / tanpa koneksi BaaS
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
    throw new Error('Gagal mengunggah foto bukti transfer');
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

  const calculateTotal = () => {
    return activeProducts.reduce((sum, p) => {
      const qty = quantities[p.id] || 0;
      return sum + (qty * (p.price || 0));
    }, 0);
  };

  const totalItemCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setSubmitError(null);

    if (settings.storeStatus === 'closed') {
      alert('Mohon maaf, sesi pre-order saat ini sedang ditutup oleh panitia.');
      return;
    }

    if (activeProducts.length === 0) {
      alert('Belum ada menu produk yang tersedia untuk dipesan.');
      return;
    }

    const { isValid, errors } = validateCustomerData();
    if (!isValid) {
      // Jika nomor WhatsApp kurang dari 10 digit atau belum diisi, prioritaskan alert
      if (errors.phone) {
        setSubmitError(errors.phone);
        alert(errors.phone);
        document.getElementById('input-phone')?.focus();
        return;
      }

      const firstError = errors.name || errors.jenjang || errors.kelas || errors.paymentMethod;
      setSubmitError(firstError);
      alert(firstError);

      if (errors.name) {
        document.getElementById('input-name')?.focus();
      } else if (errors.jenjang) {
        document.getElementById('input-jenjang')?.focus();
      } else if (errors.kelas) {
        document.getElementById('input-kelas')?.focus();
      } else if (errors.paymentMethod) {
        document.getElementById('section-payment-method')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (totalItemCount === 0) {
      setSubmitError('Silakan pilih minimal 1 produk untuk dipesan.');
      alert('Silakan pilih minimal 1 produk untuk dipesan.');
      return;
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

    const orderItems = activeProducts
      .filter(p => (quantities[p.id] || 0) > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        qty: quantities[p.id],
        price: p.price,
        total: quantities[p.id] * p.price
      }));

    const adminPhone = settings.adminPhone || settings.whatsappAdmin || '628818578363';
    let textMessage = `Halo Admin, saya ingin memesan produk kuliner ${settings.storeName || 'FREONIX'}.\n\n`;
    textMessage += `*NO. PESANAN:* #${orderId}\n`;
    textMessage += `*STATUS PEMBAYARAN:* ${isQris ? '⏳ PAYMENT PENDING (Sedang dalam pengecekan bukti transfer QRIS oleh Admin)' : '⏳ PAYMENT PENDING (Bayar Tunai di Stand saat Pengambilan)'}\n`;
    textMessage += `*METODE BAYAR:* ${isQris ? `QRIS (a.n. ${settings.qrisAccountName || 'FREONIX'})` : 'Cash (Tunai di Stand)'}\n\n`;
    
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
      paymentProof: paymentProof || paymentProofUrl || null,
      paymentProofUrl: paymentProofUrl || null,
      paymentProofImage: paymentProof || paymentProofUrl || null,
      items: orderItems,
      totalHarga,
      waUrl
    };

    setIsLoading(true);

    try {
      await db.createOrder(summaryData);
    } catch (err) {
      console.error('db.createOrder error:', err);
      setIsLoading(false);
      setSubmitError(`Gagal menyimpan pesanan ke InsForge: ${err.message || 'Terjadi kesalahan sistem'}.`);
      return;
    }

    try {
      localStorage.setItem('freonix_last_order', JSON.stringify(summaryData));
    } catch (err) {
      console.error('LocalStorage error:', err);
    }

    setSavedOrder(summaryData);
    setHasSavedReceipt(false);
    setIsSuccess(true);
    setIsLoading(false);

    window.open(waUrl, '_blank');
  };

  const handlePrint = () => {
    setHasSavedReceipt(true);
    if (orderSummary?.orderId && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`receipt_saved_${orderSummary.orderId}`, 'true');
      } catch (e) {}
    }
    window.print();
  };

  const handleNewOrder = () => {
    // 1. Alert bahwa harus simpan atau cetak bukti struk terlebih dahulu
    if (!hasSavedReceipt) {
      alert(
        '⚠️ PERHATIAN:\n\nAnda harus menyimpan atau mencetak bukti struk terlebih dahulu sebelum membuat pesanan baru!\n\nNomor pesanan dan detail struk tidak dapat diakses kembali setelah membuat pesanan baru.'
      );
      handlePrint();
      return;
    }

    // 2. Butuh konfirmasi dari pelanggan setelah struk disimpan
    const isConfirmed = window.confirm(
      `KONFIRMASI BUAT PESANAN BARU:\n\nApakah Anda yakin sudah menyimpan bukti struk pesanan #${orderSummary?.orderId || ''} dengan aman?\n\nLayar struk saat ini akan direset dan Anda dapat membuat pesanan baru.\n\nKlik "OK" untuk melanjutkan.`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      localStorage.removeItem('freonix_last_order');
      if (orderSummary?.orderId) {
        sessionStorage.removeItem(`receipt_saved_${orderSummary.orderId}`);
      }
    } catch (e) {}
    setHasSavedReceipt(false);
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
      paymentMethod: ''
    });
    setJenjang('');
    setFormErrors({
      name: '',
      jenjang: '',
      kelas: '',
      phone: '',
      paymentMethod: ''
    });
    const resetQty = {};
    activeProducts.forEach(p => { resetQty[p.id] = 0; });
    setQuantities(resetQty);
  };

  // Tunggu client mount untuk memastikan keselarasan SSR dan browser (cegah hydration mismatch)
  if (!isMounted) {
    return <Loading />;
  }

  // --- DIGITAL RECEIPT ---
  if (isSuccess && orderSummary) {
    const isQrisOrder = orderSummary.paymentMethod === 'qris';
    const isVerifiedSuccess = orderSummary.paymentStatus === 'SUCCESS';

    return (
      <div className="py-12 px-4 sm:px-6 max-w-lg mx-auto animate-fade-in">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/90 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_24px_70px_rgba(93,58,41,0.12)] relative overflow-hidden print:shadow-none print:border print:border-stone-300">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Receipt Header */}
          <div className="text-center pb-6 border-b border-stone-200/50">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
              isVerifiedSuccess 
                ? 'bg-green-500/15 border border-green-500/30 text-green-600' 
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-600'
            }`}>
              <CheckCircle className="w-8 h-8" />
            </div>
            
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

          {/* Bukti Pembayaran QRIS */}
          {(orderSummary.paymentProofImage || orderSummary.paymentProofUrl) && (
            <div className="py-3 border-t border-stone-200/50 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5742] block mb-2">
                Lampiran Bukti Transfer QRIS:
              </span>
              <div className="w-full rounded-2xl overflow-hidden border border-white/80 shadow-xs bg-stone-100/80 p-2 flex items-center justify-center min-h-[140px]">
                {imgError ? (
                  <div className="py-4 px-2 flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-8 h-8 text-[#8B5742]/50 mb-1.5" />
                    <p className="text-xs font-bold text-[#5D3A29]">Bukti Transfer Terlampir via Cloud Storage</p>
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
                    <ExternalLink size={12} /> Buka Bukti Foto (Link InsForge Storage)
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
            {/* Rating & Review Action for Approved Orders */}
            {(orderSummary.paymentStatus === 'SUCCESS' || ['Processing', 'Shipped', 'Completed', 'Disetujui'].includes(orderSummary.orderStatus)) && (
              hasSubmittedReview ? (
                <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold shadow-2xs">
                  <Star size={15} className="fill-amber-500 text-amber-500" />
                  <span>Ulasan Anda Sudah Terkirim — Terima Kasih!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] transition-all active:scale-95 animate-pulse"
                >
                  <Star size={15} className="fill-white" />
                  Beri Rating & Ulasan Sekarang
                </button>
              )
            )}

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
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider border shadow-xs transition-all active:scale-95 ${
                hasSavedReceipt 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-white/80 hover:bg-white text-[#5D3A29] border-white/90'
              }`}
            >
              {hasSavedReceipt ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Printer size={15} />}
              {hasSavedReceipt ? 'Struk Berhasil Disimpan / Dicetak' : 'Cetak / Simpan Bukti Struk'}
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
              href="/products"
              className="w-full text-center text-xs font-bold text-stone-500 hover:text-[#5D3A29] py-1 transition-colors"
            >
              ← Kembali ke Menu Produk
            </Link>
          </div>
        </div>

        {/* Review Popup Modal */}
        <ReviewModal
          order={orderSummary}
          isOpen={showReviewModal}
          onClose={handleCloseReviewModal}
          onSuccess={handleReviewSuccess}
        />
      </div>
    );
  }

  // --- CHECKOUT FORM ---
  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
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

        {/* Cek Status Pesanan / Kode Struk / Nomor WA */}
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#5D3A29]">
              <div className="p-2 rounded-xl bg-[#8B5742]/10 text-[#8B5742]">
                <Search size={16} />
              </div>
              <div>
                <span className="font-extrabold block">Sudah Pernah Memesan?</span>
                <span className="text-[11px] text-stone-500">Cek status pesanan atau berikan rating & ulasan Anda</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLookupBox(!showLookupBox)}
              className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-[#5D3A29] text-xs font-bold transition-all active:scale-95"
            >
              {showLookupBox ? 'Tutup Pencarian' : 'Cek Status Pesanan →'}
            </button>
          </div>

          {showLookupBox && (
            <form onSubmit={handleLookupOrder} className="mt-4 pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="Nomor WhatsApp (misal: 0812345678) atau ID Pesanan (FRX-...)"
                className="flex-1 text-xs p-3 rounded-2xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 text-stone-800"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                {lookupLoading ? 'Mencari...' : 'Lacak Pesanan'}
              </button>
            </form>
          )}

          {lookupError && (
            <p className="text-xs text-rose-600 font-semibold mt-2.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              ⚠️ {lookupError}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 p-6 sm:p-10 shadow-[0_20px_60px_rgba(93,58,41,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Data Diri */}
          <div className="mb-8">
            <div className="border-b border-stone-200/50 pb-3 mb-5">
              <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider">
                Data Diri Pembeli
              </h2>
            </div>

            {/* Error Notification Alert */}
            {submitError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200/90 flex items-center gap-2.5 text-red-700 text-xs font-semibold shadow-xs">
                <AlertCircle size={17} className="shrink-0 text-red-600" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label htmlFor="input-name" className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>Nama Lengkap <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                    Wajib
                  </span>
                </label>
                <input 
                  id="input-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 rounded-2xl border bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 text-sm shadow-xs transition-all placeholder:text-stone-400 ${
                    formErrors.name 
                      ? 'border-red-400 ring-2 ring-red-300/60 text-red-800' 
                      : 'border-white/90 focus:ring-[#DDA15E]/60 text-[#1F2937]'
                  }`}
                  placeholder="Masukkan nama lengkap Anda (minimal 5 huruf)"
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Jenjang Dropdown */}
              <div>
                <label htmlFor="input-jenjang" className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>1. Pilih Jenjang / Profesi <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                    Wajib
                  </span>
                </label>
                <select
                  id="input-jenjang"
                  value={jenjang}
                  onChange={handleJenjangChange}
                  aria-required="true"
                  className={`w-full px-4 py-3 rounded-2xl border bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 text-sm shadow-xs transition-all cursor-pointer ${
                    formErrors.jenjang 
                      ? 'border-red-400 ring-2 ring-red-300/60 text-red-800' 
                      : 'border-white/90 focus:ring-[#DDA15E]/60 text-[#1F2937]'
                  }`}
                >
                  <option value="">-- Pilih Jenjang / Profesi --</option>
                  {Object.entries(JENJANG_CONFIG).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {formErrors.jenjang && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" /> {formErrors.jenjang}
                  </p>
                )}
              </div>

              {/* Kelas Dropdown */}
              <div>
                <label htmlFor="input-kelas" className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>2. Pilih Kelas {!isTeacher && <span className="text-red-500 font-bold">*</span>}</span>
                  {isTeacher ? (
                    <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      Khusus Guru
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                      Wajib
                    </span>
                  )}
                </label>
                <select
                  id="input-kelas"
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleKelasChange}
                  disabled={!jenjang || isTeacher}
                  aria-disabled={!jenjang || isTeacher}
                  aria-required={!isTeacher}
                  className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 text-sm shadow-xs transition-all ${
                    isTeacher
                      ? 'bg-emerald-50/70 border-emerald-200/90 text-emerald-900 font-medium cursor-not-allowed'
                      : !jenjang 
                      ? 'bg-stone-100/80 border-stone-200 text-stone-400 cursor-not-allowed opacity-80' 
                      : formErrors.kelas
                      ? 'border-red-400 ring-2 ring-red-300/60 bg-white/70 text-red-800 cursor-pointer'
                      : 'border-white/90 bg-white/70 focus:ring-[#DDA15E]/60 text-[#1F2937] cursor-pointer'
                  }`}
                >
                  {isTeacher ? (
                    <option value="Guru / Tenaga Pendidik">
                      Guru / Tenaga Pendidik (Tidak perlu memilih kelas)
                    </option>
                  ) : (
                    <>
                      <option value="">
                        {jenjang ? '-- Pilih Kelas --' : 'Pilih jenjang dulu'}
                      </option>
                      {classOptions.map(cls => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {formErrors.kelas && !isTeacher && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" /> {formErrors.kelas}
                  </p>
                )}
              </div>

              {/* Nomor WhatsApp */}
              <div className="sm:col-span-2">
                <label htmlFor="input-phone" className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                  <span>Nomor WhatsApp <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                    Wajib
                  </span>
                </label>
                <div className="relative">
                  <Phone size={15} className={`absolute left-4 top-1/2 -translate-y-1/2 ${formErrors.phone ? 'text-red-500' : 'text-stone-400'}`} />
                  <input 
                    id="input-phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    onKeyDown={handlePhoneKeyDown}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-white/70 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-2 text-sm shadow-xs transition-all font-mono placeholder:text-stone-400 ${
                      formErrors.phone 
                        ? 'border-red-400 ring-2 ring-red-300/60 text-red-800' 
                        : 'border-white/90 focus:ring-[#DDA15E]/60 text-[#1F2937]'
                    }`}
                    placeholder="Contoh: 081234567890 (minimal 10 digit angka)"
                  />
                </div>
                {formErrors.phone ? (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" /> {formErrors.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                    <span>📱 Wajib minimal 10 digit angka (contoh: 0812345678). Digunakan untuk verifikasi pemesanan & notifikasi pengambilan di stand.</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rincian Menu Produk */}
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
                  const currentQty = quantities[prod.id] || 0;

                  return (
                    <div key={prod.id} className="flex items-center justify-between p-3.5 rounded-2xl border shadow-xs transition-all bg-white/50 backdrop-blur-md border-white/70">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 min-w-[3rem] min-h-[3rem] sm:min-w-[3.5rem] sm:min-h-[3.5rem] max-w-[3rem] max-h-[3rem] sm:max-w-[3.5rem] sm:max-h-[3.5rem] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs shrink-0 flex items-center justify-center relative">
                          <img 
                            src={prod.image || `/images/${prod.id}.jpg`} 
                            alt={prod.name} 
                            width="56"
                            height="56"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-xl" 
                            onError={(e) => {
                              if (!e.target.dataset.triedLocal) {
                                e.target.dataset.triedLocal = 'true';
                                e.target.src = `/images/${prod.id || prod.slug}.jpg`;
                              } else {
                                e.target.src = '/logo-freonix.png';
                              }
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[#5D3A29] truncate">{prod.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold text-[#8B5742] whitespace-nowrap">
                              Rp {Number(prod.price || 0).toLocaleString('id-ID')} / {prod.unit || 'porsi'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-600" />
                              Open PO
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          type="button"
                          disabled={currentQty === 0}
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

          {/* Metode Pembayaran */}
          <div id="section-payment-method" className="mb-8 scroll-mt-24">
            <div className="flex items-center justify-between border-b border-stone-200/50 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#8B5742] uppercase tracking-wider flex items-center gap-1.5">
                <span>Pilih Metode Pembayaran</span>
                <span className="text-red-500 font-bold">*</span>
              </h2>
              <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                Wajib Dipilih
              </span>
            </div>

            {/* Error Message jika belum pilih metode pembayaran */}
            {formErrors.paymentMethod && (
              <p className="mb-3 text-[11px] text-red-600 font-semibold flex items-center gap-1 bg-red-50/90 border border-red-200 p-2.5 rounded-xl">
                <AlertCircle size={14} className="shrink-0 text-red-600" /> {formErrors.paymentMethod}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <label 
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'qris'
                    ? 'bg-white/80 border-[#8B5742] shadow-sm ring-2 ring-[#8B5742]/20'
                    : formErrors.paymentMethod && !formData.paymentMethod
                    ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200 hover:bg-white/60'
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
                    <span className="text-[11px] text-stone-500">Scan QRIS instan (a.n. {settings.qrisAccountName || 'FREONIX'})</span>
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.paymentMethod === 'cash'
                    ? 'bg-white/80 border-[#8B5742] shadow-sm ring-2 ring-[#8B5742]/20'
                    : formErrors.paymentMethod && !formData.paymentMethod
                    ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200 hover:bg-white/60'
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

            {/* Banner Total Pembayaran (Konsisten Tampil untuk QRIS maupun Tunai) */}
            <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/90 shadow-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] block">
                  Total Pembayaran
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {formData.paymentMethod === 'qris' 
                    ? 'Nominal transfer sesuai pesanan' 
                    : formData.paymentMethod === 'cash'
                    ? 'Siapkan uang pas saat ambil di stand'
                    : 'Silakan pilih salah satu metode pembayaran di atas'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-[#8B5742] tracking-tight block">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Hint jika belum memilih metode pembayaran */}
            {!formData.paymentMethod && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-dashed border-amber-200 text-center text-xs text-amber-900 font-medium animate-fade-in">
                👆 Silakan pilih salah satu opsi pembayaran di atas (<strong>QRIS</strong> atau <strong>Tunai</strong>) untuk menyelesaikan pesanan.
              </div>
            )}

            {formData.paymentMethod === 'cash' && (
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-stone-200/80 text-[#5D3A29] text-xs font-medium flex items-center gap-3 animate-fade-in shadow-2xs">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900 shrink-0">
                  <Banknote size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#5D3A29]">Pembayaran Tunai (Cash di Stand)</p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Silakan siapkan uang pas saat mengambil pesanan Anda di stand FREONIX (Hari H Acara: {settings.eventDateDisplay || '22 September 2026'}).
                  </p>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'qris' && (
              <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-sm animate-fade-in space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs text-center max-w-sm mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <div className="text-left">
                      <span className="text-xs font-black text-[#5D3A29] block">QRIS NASIONAL</span>
                      <span className="text-[11px] font-bold text-[#8B5742] block">a.n. {settings.qrisAccountName || 'FREONIX'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400">NMID: ID1020038849201</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl inline-block border border-stone-200/80 mb-2 shadow-xs max-w-[280px]">
                    <img 
                      src={settings.qrisImageUrl || 'https://cdn.phototourl.com/free/2026-09-17-07ea5a55-7913-45f5-b313-9c5819ae71a3.jpg'} 
                      alt={`QR Code QRIS FREONIX - a.n. ${settings.qrisAccountName || 'FREONIX'}`} 
                      className="mx-auto rounded-xl w-full h-auto max-w-[240px] object-contain"
                    />
                  </div>

                  {/* Tombol Download QRIS */}
                  <div className="mb-1">
                    <a
                      href={settings.qrisImageUrl || 'https://cdn.phototourl.com/free/2026-09-17-07ea5a55-7913-45f5-b313-9c5819ae71a3.jpg'}
                      download="QRIS-FREONIX.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#5D3A29]/10 hover:bg-[#5D3A29]/20 border border-[#8B5742]/20 text-[#5D3A29] text-[11px] font-bold transition-all active:scale-95"
                    >
                      <Download size={13} />
                      Unduh Gambar QRIS
                    </a>
                  </div>

                  {/* Highlight Atas Nama */}
                  <div className="my-2.5 py-1.5 px-3 bg-amber-50/90 border border-amber-200/80 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
                    <span className="text-xs text-amber-900 font-bold">
                      Atas Nama: <span className="font-extrabold text-[#5D3A29]">{settings.qrisAccountName || 'FREONIX'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 font-medium">
                    Scan via BCA, Mandiri, BRI, BNI, Dana, GoPay, OVO, atau ShopeePay
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Pastikan nama penerima transfer tertera: <strong>{settings.qrisAccountName || 'FREONIX'}</strong>
                  </p>
                </div>

                {/* Upload Bukti Pembayaran */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5D3A29] mb-2 flex items-center justify-between">
                    <span>Unggah Bukti Transfer QRIS <span className="text-red-500 font-bold">*</span></span>
                    <span className="text-[10px] text-red-600 font-bold uppercase bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">Wajib untuk QRIS</span>
                  </label>
                  
                  <div className="relative border-2 border-dashed border-stone-300 hover:border-[#DDA15E] rounded-2xl p-4 text-center transition-colors bg-white/40">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {isUploadingProof ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B5742] mb-2" />
                        <span className="text-xs font-bold text-[#5D3A29]">Sedang mengunggah ke InsForge Storage...</span>
                      </div>
                    ) : paymentProof ? (
                      <div className="flex items-center justify-center gap-3">
                        <img 
                          src={paymentProof} 
                          alt="Thumbnail Bukti Transfer" 
                          className="w-14 h-14 object-cover rounded-xl border border-white shadow-xs" 
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Foto bukti siap dilampirkan
                          </span>
                          <span className="text-[10px] text-stone-400 block">Klik di sini jika ingin mengganti file gambar</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Upload className="w-6 h-6 text-[#8B5742] mb-1" />
                        <span className="text-xs font-bold text-[#5D3A29]">Klik untuk pilih gambar bukti transfer</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">Format: JPG, PNG, atau WebP</span>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <p className="text-[11px] text-amber-700 mt-1.5 font-medium">{uploadError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Error Banner */}
          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-200/50">
            <button
              type="submit"
              disabled={isLoading || settings.storeStatus === 'closed'}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(139,87,66,0.35)] hover:shadow-[0_12px_32px_rgba(139,87,66,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Kirim Pesanan & Dapatkan Struk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
