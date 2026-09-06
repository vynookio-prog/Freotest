import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useDb } from '../utils/useDb';

export default function CountdownTimer({ targetDate }) {
  const db = useDb();
  const settings = db.getSettings() || {};
  const effectiveTargetDate = targetDate || (settings.eventDate ? `${settings.eventDate}T08:00:00` : '2026-09-23T08:00:00');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(effectiveTargetDate) - +new Date();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [effectiveTargetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-700 text-xs font-bold backdrop-blur-xl">
        <span>Sesi Pre-Order Telah Ditutup! Sampai jumpa di stand acara.</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_12px_32px_rgba(93,58,41,0.06)] relative overflow-hidden">
      {/* Specular rim */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8B5742]">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DDA15E] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8B5742]"></span>
        </span>
        <Clock size={14} className="text-[#DDA15E]" />
        <span>Batas Pre-Order:</span>
      </div>

      <div className="flex items-center gap-2 font-mono">
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/90 shadow-xs">
          <span className="text-sm sm:text-base font-black text-[#5D3A29]">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-500 font-sans font-bold">Hari</span>
        </div>
        <span className="font-bold text-[#8B5742]">:</span>
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/90 shadow-xs">
          <span className="text-sm sm:text-base font-black text-[#5D3A29]">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-500 font-sans font-bold">Jam</span>
        </div>
        <span className="font-bold text-[#8B5742]">:</span>
        <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/90 shadow-xs">
          <span className="text-sm sm:text-base font-black text-[#5D3A29]">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-stone-500 font-sans font-bold">Mnt</span>
        </div>
        <span className="font-bold text-[#8B5742]">:</span>
        <div className="flex items-center gap-1 bg-[#DDA15E]/20 backdrop-blur-md px-3 py-1 rounded-xl border border-[#DDA15E]/40 shadow-xs">
          <span className="text-sm sm:text-base font-black text-[#8B5742]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-[#8B5742] font-sans font-bold">Dtk</span>
        </div>
      </div>
    </div>
  );
}
