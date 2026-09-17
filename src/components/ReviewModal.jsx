// src/components/ReviewModal.jsx
// Interactive Popup Modal for Customer Reviews & Ratings upon Order Approval

'use client';

import React, { useState } from 'react';
import { 
  Star, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Heart
} from 'lucide-react';
import { uploadToInsforgeStorage } from '../lib/insforge';

const RATING_LABELS = {
  1: 'Kurang Enak',
  2: 'Biasa Saja',
  3: 'Cukup Enak',
  4: 'Enak & Mantap',
  5: 'Luar Biasa Enak! ⭐'
};

export default function ReviewModal({ order, isOpen, onClose, onSuccess }) {
  const items = order?.items || [];

  // State per product: { [productId]: { rating: 5, comment: '', photoFile: null, photoPreview: '', photoUrl: '', photoKey: '' } }
  const [reviewsState, setReviewsState] = useState(() => {
    const initial = {};
    items.forEach(item => {
      initial[item.id] = {
        rating: 5,
        comment: '',
        photoFile: null,
        photoPreview: '',
        photoUrl: '',
        photoKey: ''
      };
    });
    return initial;
  });

  const [hoveredStar, setHoveredStar] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !order || items.length === 0) return null;

  const handleRatingChange = (productId, starVal) => {
    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        rating: starVal
      }
    }));
  };

  const handleCommentChange = (productId, val) => {
    if (val.length > 200) return;
    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        comment: val
      }
    }));
  };

  const handlePhotoSelect = (productId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB.');
      return;
    }

    // Validate type (JPG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Format foto harus JPG, PNG, atau WebP.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setReviewsState(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        photoFile: file,
        photoPreview: previewUrl
      }
    }));
  };

  const handleRemovePhoto = (productId) => {
    setReviewsState(prev => {
      const current = prev[productId];
      if (current?.photoPreview && current.photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(current.photoPreview);
      }
      return {
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          photoFile: null,
          photoPreview: '',
          photoUrl: '',
          photoKey: ''
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payloadReviews = [];

      for (const item of items) {
        const rev = reviewsState[item.id] || { rating: 5, comment: '' };

        let photoUrl = '';
        let photoKey = '';

        // Upload photo if user attached one
        if (rev.photoFile) {
          const uploadRes = await uploadToInsforgeStorage(rev.photoFile, 'reviews');
          if (uploadRes.success && uploadRes.url) {
            photoUrl = uploadRes.url;
            photoKey = uploadRes.key || '';
          } else {
            console.warn('Gagal upload foto ulasan, lanjut tanpa foto:', uploadRes.error);
          }
        }

        payloadReviews.push({
          orderId: order.orderId || order.id,
          productId: item.id,
          rating: Number(rev.rating) || 5,
          comment: rev.comment || '',
          photoUrl,
          photoKey,
          buyerName: order.name || 'Pelanggan'
        });
      }

      // Call API
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: payloadReviews })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan ulasan.');
      }

      // Mark as permanently reviewed for this order
      const orderKey = order.orderId || order.id;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`review_submitted_${orderKey}`, 'true');
        } catch (e) {}
      }

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim ulasan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200/60 flex items-start justify-between gap-3 bg-gradient-to-b from-[#8B5742]/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#8B5742]/10 text-[#8B5742] flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={22} className="text-[#DDA15E]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8B5742] block">
                Pesanan Terverifikasi #{order.orderId || order.id}
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#5D3A29] leading-snug">
                Bagikan Pendapat & Rating Anda!
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-black text-[#5D3A29]">Terima Kasih Banyak!</h4>
            <p className="text-xs text-stone-600 max-w-xs leading-relaxed">
              Ulasan dan rating Anda telah berhasil dikirim dan sangat berharga bagi proyek kokurikuler kami!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <p className="text-xs text-stone-500 leading-relaxed">
                Bagaimana rasa sajian yang Anda nikmati? Berikan penilaian bintang dan saran terbaik Anda untuk menu di bawah ini:
              </p>

              {items.map((item) => {
                const currentRev = reviewsState[item.id] || { rating: 5, comment: '', photoPreview: '' };
                const currentStar = currentRev.rating;
                const hovered = hoveredStar[item.id] || 0;
                const activeStar = hovered || currentStar;

                return (
                  <div 
                    key={item.id} 
                    className="p-4 sm:p-5 rounded-2xl bg-[#FAFAF9] border border-stone-200/80 shadow-xs space-y-3.5"
                  >
                    {/* Item Name */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-[#5D3A29]">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                        {item.qty} porsi
                      </span>
                    </div>

                    {/* Star Rating Bar */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                        Nilai Rasa & Kepuasan:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= activeStar;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(item.id, star)}
                              onMouseEnter={() => setHoveredStar(prev => ({ ...prev, [item.id]: star }))}
                              onMouseLeave={() => setHoveredStar(prev => ({ ...prev, [item.id]: 0 }))}
                              className="p-1.5 rounded-xl transition-all hover:scale-115 active:scale-95 focus:outline-none"
                              aria-label={`Bintang ${star}`}
                            >
                              <Star 
                                size={28} 
                                className={`transition-colors ${
                                  isFilled 
                                    ? 'text-amber-400 fill-amber-400 filter drop-shadow-sm' 
                                    : 'text-stone-300'
                                }`} 
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-bold text-[#8B5742] ml-2">
                          {RATING_LABELS[activeStar] || ''}
                        </span>
                      </div>
                    </div>

                    {/* Comment Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          Ulasan Singkat (Opsional):
                        </label>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {(currentRev.comment || '').length}/200
                        </span>
                      </div>
                      <textarea
                        value={currentRev.comment || ''}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        placeholder="Contoh: Enak banget, manisnya pas, dan bumbu terasa autentik..."
                        rows={2}
                        maxLength={200}
                        className="w-full text-xs p-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 focus:border-[#8B5742] transition-all resize-none text-stone-700"
                      />
                    </div>

                    {/* Photo Upload (Optional) */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                        Foto Produk (Opsional, Maks 2MB):
                      </span>

                      {currentRev.photoPreview ? (
                        <div className="relative inline-block rounded-xl overflow-hidden border border-stone-300 group shadow-xs">
                          <img 
                            src={currentRev.photoPreview} 
                            alt="Pratinjau Ulasan" 
                            className="w-20 h-20 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(item.id)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-colors"
                            title="Hapus foto"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-600 hover:text-[#5D3A29] cursor-pointer transition-colors shadow-2xs">
                          <ImageIcon size={14} className="text-[#8B5742]" />
                          <span>Unggah Foto Sajian</span>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp" 
                            onChange={(e) => handlePhotoSelect(item.id, e)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-200/60 bg-stone-50/80 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-stone-600 hover:bg-stone-200/60 transition-colors active:scale-95"
              >
                Nanti Saja
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Kirim Ulasan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
