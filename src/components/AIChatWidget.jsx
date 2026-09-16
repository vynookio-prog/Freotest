'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  RotateCcw, 
  ShoppingBag, 
  Loader2, 
  ChevronDown,
  Info,
  Utensils,
  Camera,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

// Helper kompresi gambar client-side (Base64 Ephemeral in-memory)
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.82);
        const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '');

        resolve({
          name: file.name || 'foto.jpg',
          previewUrl: dataUrl,
          base64: base64,
          mimeType: mimeType
        });
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

const QUICK_PROMPTS = [
  { label: '✨ Tanya Apa Saja', text: 'Jelaskan fakta sains paling menakjubkan di alam semesta ini!' },
  { label: '📚 Bantuan Belajar', text: 'Bantu saya memahami konsep sains/pelajaran dengan cara yang mudah!' },
  { label: '🍽️ Menu Bazar', text: 'Apa menu rekomendasi paling favorit dari bazar FREONIX?' },
  { label: '💡 Ide Kreatif', text: 'Berikan tips menarik untuk meningkatkan produktivitas belajar siswa!' }
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // { name, previewUrl, base64, mimeType }
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! 👋 Saya **Asisten AI FREONIX**, asisten cerdas universal dari kelas XII-F1 Sains.\n\nAda yang bisa saya bantu hari ini? Kamu bisa bertanya tentang apa saja—mulai dari ilmu pengetahuan umum, sains & teknologi, tugas sekolah, hingga informasi lengkap seputar bazar kuliner FREONIX!',
      time: 'Baru saja'
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }
    try {
      setIsProcessingImage(true);
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      alert('Maaf, gagal memproses gambar. Silakan coba kembali.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    const imagePayload = selectedImage;

    if ((!query && !imagePayload) || isLoading || isProcessingImage) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query || (imagePayload ? 'Tolong perhatikan dan analisis foto ini.' : ''),
      image: imagePayload ? imagePayload.previewUrl : null,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    clearSelectedImage();
    setIsLoading(true);

    try {
      // Siapkan riwayat percakapan untuk API
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const payload = {
        message: query,
        history: historyForApi
      };

      if (imagePayload?.base64 && imagePayload?.mimeType) {
        payload.image = {
          mimeType: imagePayload.mimeType,
          base64: imagePayload.base64
        };
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.reply,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        if (data.model) setModelUsed(data.model);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.error || 'Maaf, sedang ada kendala jaringan saat menghubungi AI. Silakan coba sesaat lagi!',
            isError: true,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Maaf, terjadi kesalahan koneksi. Pastikan koneksi internet Anda aktif.',
          isError: true,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    clearSelectedImage();
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Percakapan telah direset. Silakan tanyakan topik apa saja (sains, umum, tugas, atau menu FREONIX), saya siap membantu!',
        time: 'Baru saja'
      }
    ]);
  };

  // Helper sanitasi dan perender teks Markdown AI (Bold, Italic, Bullet, Numbering, Heading, Linebreaks)
  const renderFormattedText = (content) => {
    if (!content) return null;

    // 1. Sanitasi relic / format teks aneh seperti 1/ (times), \times, dll.
    let sanitized = content
      .replace(/(\d+)\s*\/\s*\(times\)/gi, '$1x')
      .replace(/\\times/gi, 'x')
      .replace(/\(times\)/gi, 'kali')
      .replace(/^(\d+)\s*\/\s+/gm, '$1. ')
      .replace(/^#{1,4}\s*(.*)$/gm, '**$1**');

    const lines = sanitized.split('\n');

    const parseInline = (textLine) => {
      // Regex untuk mendeteksi **bold**, *italic*, dan `code`
      const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
      const parts = textLine.split(regex);

      return parts.map((part, pIdx) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={pIdx} className="font-extrabold text-[#4A2818] tracking-tight">
              {part.slice(2, -2).trim()}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <em key={pIdx} className="italic text-stone-700">
              {part.slice(1, -1).trim()}
            </em>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code key={pIdx} className="px-1 py-0.5 rounded bg-stone-100 font-mono text-[11px] text-[#5D3A29]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });
    };

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Baris kosong
      if (!trimmed) {
        return <span key={idx} className="block h-2" />;
      }

      // 1. Numbered List (contoh: "1. ", "2) ")
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (numMatch) {
        const num = numMatch[1];
        const rest = numMatch[2];
        return (
          <div key={idx} className="flex items-start gap-2 my-1.5 ml-0.5">
            <span className="w-4 h-4 rounded-full bg-[#8B5742]/15 text-[#8B5742] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <span className="flex-1 leading-relaxed text-stone-800">
              {parseInline(rest)}
            </span>
          </div>
        );
      }

      // 2. Bullet List (contoh: "- ", "* ", "• ")
      const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        const rest = bulletMatch[1];
        return (
          <div key={idx} className="flex items-start gap-2 my-1 ml-1">
            <span className="text-[#8B5742] font-black text-xs mt-0.5 shrink-0">•</span>
            <span className="flex-1 leading-relaxed text-stone-800">
              {parseInline(rest)}
            </span>
          </div>
        );
      }

      // 3. Paragraf Biasa
      return (
        <span key={idx} className="block leading-relaxed min-h-[1.2rem] my-0.5 text-stone-800">
          {parseInline(line)}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 animate-bounce-subtle">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#8B5742] via-[#754431] to-[#5D3A29] text-white px-4 sm:px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(93,58,41,0.35)] hover:shadow-[0_14px_38px_rgba(93,58,41,0.45)] hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-white/20"
            aria-label="Buka Chat Asisten AI FREONIX"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner group-hover:rotate-12 transition-transform">
                <Sparkles size={16} className="text-[#FFDE9E]" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDE9E] block leading-none">
                Tanya AI
              </span>
              <span className="text-xs font-bold tracking-tight text-white block mt-0.5">
                Chef FREONIX
              </span>
            </div>
            <span className="sm:hidden text-xs font-black tracking-wide pr-1">Tanya AI</span>
          </button>
        </div>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[430px] h-[580px] max-h-[85vh] flex flex-col bg-white/85 backdrop-blur-2xl rounded-[2rem] border border-white/90 shadow-[0_25px_70px_rgba(93,58,41,0.22)] overflow-hidden animate-slide-up">
          {/* Ambient Specular Highlight */}
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#5D3A29] via-[#754431] to-[#8B5742] text-white flex items-center justify-between relative shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs">
                  <Bot size={20} className="text-[#FFDE9E]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black tracking-tight leading-tight text-white">
                    Asisten AI FREONIX
                  </h4>
                  <span className="text-[9px] font-extrabold uppercase bg-white/20 px-1.5 py-0.5 rounded-full text-[#FFDE9E]">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[11px] text-stone-200 flex items-center gap-1">
                  <span>Asisten Universal XII-F1 Sains</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                title="Reset Percakapan"
                aria-label="Reset Chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => {
                  clearSelectedImage();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                title="Tutup Chat"
                aria-label="Tutup Chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-[13px] leading-relaxed select-text">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white rounded-br-xs shadow-[0_4px_14px_rgba(93,58,41,0.2)]'
                        : msg.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-xs'
                        : 'bg-white/90 backdrop-blur-md text-[#374151] border border-stone-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {/* Foto Lampiran Pengguna (jika ada) */}
                    {msg.image && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-white/25 bg-black/10 shadow-sm relative group">
                        <img
                          src={msg.image}
                          alt="Lampiran foto pengguna"
                          className="w-full max-h-52 object-cover rounded-xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                          onClick={() => setPreviewModalImage(msg.image)}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalImage(msg.image)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-all"
                          title="Perbesar foto"
                        >
                          <Maximize2 size={13} />
                        </button>
                      </div>
                    )}
                    {msg.text && renderFormattedText(msg.text)}
                  </div>

                  <span className="text-[9px] font-semibold text-stone-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-stone-500 bg-white/70 backdrop-blur-md border border-stone-200/70 rounded-2xl px-3.5 py-2 w-fit">
                <Loader2 size={14} className="animate-spin text-[#8B5742]" />
                <span className="text-xs font-semibold text-[#5D3A29]">
                  Menghubungkan Gemini AI...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-stone-50/70 border-t border-stone-200/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(qp.text)}
                className="whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-white text-[#5D3A29] border border-stone-200/70 hover:border-[#8B5742]/40 hover:bg-[#8B5742]/5 text-[11px] font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Quick CTA to Pre-Order */}
          <div className="px-4 py-1.5 bg-[#8B5742]/5 border-t border-[#8B5742]/10 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-[#5D3A29] flex items-center gap-1">
              <Utensils size={11} className="text-[#8B5742]" /> Tertarik mencicipi menu?
            </span>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#8B5742] hover:text-[#5D3A29] uppercase tracking-wider"
            >
              <span>Pesan Sekarang</span>
              <span>→</span>
            </Link>
          </div>

          {/* Input Footer with Camera & Gallery */}
          <div className="bg-white border-t border-stone-200/60 shrink-0">
            {/* Hidden File Inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
            />

            {/* Status Processing Image */}
            {isProcessingImage && (
              <div className="px-4 py-1.5 bg-amber-50/80 border-b border-amber-100 flex items-center gap-2 text-xs text-[#5D3A29]">
                <Loader2 size={13} className="animate-spin text-[#8B5742]" />
                <span className="font-semibold text-[11px]">Mengompresi foto kamera/galeri...</span>
              </div>
            )}

            {/* Selected Image Preview Card */}
            {selectedImage && !isProcessingImage && (
              <div className="px-3 py-2 bg-stone-50 border-b border-stone-200/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={selectedImage.previewUrl}
                      alt="Preview"
                      className="w-11 h-11 object-cover rounded-xl border border-stone-300 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewModalImage(selectedImage.previewUrl)}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 truncate max-w-[170px] sm:max-w-[240px]">
                      {selectedImage.name}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Siap dianalisis oleh AI
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="p-1.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                  title="Batalkan lampiran foto"
                  aria-label="Batalkan foto"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Form Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 sm:p-3 flex items-center gap-1.5 sm:gap-2"
            >
              {/* Action Buttons: Kamera Langsung & Galeri */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isLoading || isProcessingImage}
                  className="p-2 text-stone-500 hover:text-[#8B5742] hover:bg-[#8B5742]/10 rounded-full transition-all active:scale-90 disabled:opacity-40"
                  title="Ambil Foto Langsung (Kamera)"
                  aria-label="Ambil Foto Langsung"
                >
                  <Camera size={19} />
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isLoading || isProcessingImage}
                  className="p-2 text-stone-500 hover:text-[#8B5742] hover:bg-[#8B5742]/10 rounded-full transition-all active:scale-90 disabled:opacity-40"
                  title="Pilih Gambar dari Galeri"
                  aria-label="Pilih Foto Galeri"
                >
                  <ImageIcon size={19} />
                </button>
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedImage ? "Tanya seputar foto ini (opsional)..." : "Tanya apa saja (sains, umum, menu)..."}
                disabled={isLoading || isProcessingImage}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-full bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 focus:bg-white text-[#1F2937] placeholder:text-stone-400 transition-all"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading || isProcessingImage}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white flex items-center justify-center hover:opacity-95 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                aria-label="Kirim Pesan"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewModalImage}
              alt="Tampilan perbesar foto"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewModalImage(null)}
              className="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <X size={14} /> Tutup Tampilan Foto
            </button>
          </div>
        </div>
      )}
    </>
  );
}
