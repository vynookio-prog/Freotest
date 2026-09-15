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
  Utensils
} from 'lucide-react';
import Link from 'next/link';

const QUICK_PROMPTS = [
  { label: '🍽️ Rekomendasi Favorit', text: 'Apa menu rekomendasi paling favorit dari FREONIX?' },
  { label: '💪 Tinggi Protein', text: 'Menu apa yang paling tinggi protein dan cocok untuk menambah energi?' },
  { label: '🧪 Sains Chicken Adobo', text: 'Apa penjelasan sains di balik rasa dan teknik memasak Chicken Adobo khas Filipina?' },
  { label: '💳 Cara Pesan & Bayar', text: 'Bagaimana cara pre-order dan metode pembayaran apa saja yang tersedia?' }
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! 👋 Saya **Asisten AI FREONIX**, pemandu sains dan kuliner kelas XII-F1 Sains.\n\nAda yang bisa saya bantu? Kamu bisa tanya rekomendasi menu khas Filipina, kandungan kalori & gizi, hingga sains seru di balik cara memasaknya!',
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

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Siapkan riwayat percakapan untuk API
      const historyForApi = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyForApi
        })
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
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Percakapan telah direset. Silakan tanyakan apa saja seputar menu, gizi, atau sains kuliner FREONIX!',
        time: 'Baru saja'
      }
    ]);
  };

  // Helper perender markdown sederhana (bold, list, break lines)
  const renderFormattedText = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Render bullet list
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Render bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-[#4A2818]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-1">
            <span className="text-[#8B5742] font-bold text-xs mt-0.5">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      return (
        <span key={idx} className="block min-h-[1.1rem]">
          {renderedParts}
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
                <Sparkles size={16} className="text-[#FFDE9E] animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#5D3A29] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#5D3A29] rounded-full" />
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
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#5D3A29] rounded-full" />
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
                  <span>XII-F1 Sains & Culinary Guide</span>
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
                onClick={() => setIsOpen(false)}
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white rounded-br-xs shadow-[0_4px_14px_rgba(93,58,41,0.2)]'
                        : msg.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-xs'
                        : 'bg-white/90 backdrop-blur-md text-[#374151] border border-stone-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
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

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200/60 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanya seputar menu, gizi, atau sains..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-full bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#8B5742]/30 focus:bg-white text-[#1F2937] placeholder:text-stone-400 transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5742] to-[#5D3A29] text-white flex items-center justify-center hover:opacity-95 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
              aria-label="Kirim Pesan"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
