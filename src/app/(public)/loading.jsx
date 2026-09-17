import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="relative p-8 sm:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_20px_60px_rgba(93,58,41,0.08)] flex flex-col items-center gap-5 max-w-sm w-full text-center">
        {/* Animated Eagle Mascot with Spinning Gradient Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Glowing pulse aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#DDA15E]/30 to-[#B8815A]/30 blur-xl animate-pulse" />
          
          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#B8815A] border-r-[#DDA15E] animate-spin" />
          
          {/* Freonix circular mascot logo */}
          <div className="relative p-2.5 rounded-full bg-white/80 shadow-md">
            <img 
              src="/logo-freonix.png" 
              alt="Memuat..." 
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        {/* Shimmer text */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#B8815A] animate-ping" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[#5D3A29]">
              Memuat Halaman...
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            Menyiapkan sajian khas Filipina FREONIX
          </p>
        </div>

        {/* Skeleton shimmer bars */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-2 w-3/4 mx-auto rounded-full bg-stone-200/70 animate-pulse" />
          <div className="h-2 w-1/2 mx-auto rounded-full bg-stone-200/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
