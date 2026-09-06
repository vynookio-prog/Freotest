import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'Kapan dan di mana pesanan bisa diambil?',
      answer: 'Pesanan dapat diambil pada tanggal 23 September 2026. Perlu diperhatikan bahwa pengambilan hanya dapat dilakukan langsung di stand acara kokurikuler FREONIX.'
    },
    {
      question: 'Pembayarannya bisa melalui apa saja?',
      answer: 'Pembayaran dapat dilakukan melalui QRIS (silakan minta kode QRIS kepada Admin melalui chat WhatsApp setelah checkout) atau secara Tunai (Cash) langsung saat pengambilan pesanan di stand.'
    },
    {
      question: 'Bagaimana jika saya ingin mengubah atau membatalkan pesanan?',
      answer: 'Jika ada perubahan menu atau pembatalan, harap segera menghubungi Admin via WhatsApp dengan menyertakan Nama Lengkap dan Kelas sebelum sesi Pre-Order resmi ditutup.'
    },
    {
      question: 'Apakah makanan dan minumannya higienis serta terjamin?',
      answer: 'Ya, seluruh menu makanan dan minuman khas Filipina ini diolah secara higienis, menggunakan bahan-bahan berkualitas, dan disajikan fresh oleh siswa-siswi kelas FREONIX.'
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="mt-20 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#8B5742] text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
          <HelpCircle size={14} className="text-[#DDA15E]" /> FAQ & Bantuan
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#5D3A29]">
          Pertanyaan yang Sering Diajukan
        </h3>
        <p className="text-sm text-[#4B5563] mt-2">
          Informasi seputar pengambilan pesanan dan metode pembayaran
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 border ${
                isOpen 
                  ? 'bg-white/75 border-white/90 shadow-[0_12px_36px_rgba(93,58,41,0.1)]' 
                  : 'bg-white/50 border-white/70 hover:bg-white/65 shadow-[0_6px_24px_rgba(93,58,41,0.04)]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 transition-colors focus:outline-none"
              >
                <span className="font-bold text-sm sm:text-base text-[#5D3A29]">
                  {faq.question}
                </span>
                <div className={`p-1.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-[#DDA15E]/20 text-[#8B5742]' : 'bg-stone-200/50 text-stone-500'}`}>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#4B5563] leading-relaxed border-t border-white/60 animate-fade-in bg-white/20">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
