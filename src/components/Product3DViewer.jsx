import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Play, Pause, Sparkles } from 'lucide-react';

export default function Product3DViewer({ image, name, price }) {
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(10);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const lastRotation = useRef({ x: 10, y: 0 });
  const animFrameRef = useRef(null);

  // Auto-rotate loop when enabled and not dragging
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (isAutoRotate && !isDragging) {
        const delta = currentTime - lastTime;
        setRotationY((prev) => (prev + delta * 0.04) % 360);
      }
      lastTime = currentTime;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotate, isDragging]);

  // Mouse & Touch event handlers
  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setHasInteracted(true);
    startPos.current = { x: clientX, y: clientY };
    lastRotation.current = { x: rotationX, y: rotationY };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    // Adjust sensitivity
    const newRotY = (lastRotation.current.y + deltaX * 0.8) % 360;
    const newRotX = Math.max(-25, Math.min(35, lastRotation.current.x - deltaY * 0.4));

    setRotationY(newRotY);
    setRotationX(newRotX);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Toggle Auto-rotate
  const toggleAutoRotate = () => {
    setIsAutoRotate((prev) => !prev);
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] flex flex-col items-center justify-center select-none overflow-hidden bg-gradient-to-b from-[#3D251A] via-[#2A1810] to-[#1F120C] rounded-3xl p-4">
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(221,161,94,0.2)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top Header Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#DDA15E]/30 text-white text-xs font-semibold">
          <Sparkles size={13} className="text-[#DDA15E] animate-pulse" />
          <span>3D Interactive View</span>
        </div>

        <button
          type="button"
          onClick={toggleAutoRotate}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md ${
            isAutoRotate
              ? 'bg-[#DDA15E] text-[#3D251A] hover:bg-[#c99153]'
              : 'bg-white/20 text-white hover:bg-white/30 border border-white/20'
          }`}
          title={isAutoRotate ? 'Jeda Rotasi' : 'Mulai Putar Otomatis'}
        >
          {isAutoRotate ? <Pause size={13} /> : <Play size={13} />}
          <span>{isAutoRotate ? 'Auto-Spin: On' : 'Auto-Spin: Off'}</span>
        </button>
      </div>

      {/* 3D Interactive Stage */}
      <div
        className="relative w-64 h-64 sm:w-72 sm:h-72 cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ perspective: 1000 }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onTouchEnd={handleEnd}
      >
        {/* Dynamic Floor Shadow */}
        <div
          className="absolute bottom-2 w-48 h-12 bg-black/60 rounded-full blur-xl transition-transform duration-100 pointer-events-none"
          style={{
            transform: `scale(${1 - Math.abs(Math.sin((rotationY * Math.PI) / 180)) * 0.15})`
          }}
        />

        {/* 3D Floating Platter / Turntable */}
        <div
          className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`
          }}
        >
          {/* Outer Pedestal Plate */}
          <div className="absolute inset-0 rounded-full p-2 bg-gradient-to-tr from-[#8B5742] via-[#DDA15E] to-[#F5EBE0] shadow-2xl border-2 border-[#DDA15E]/40 flex items-center justify-center">
            {/* Food Image Container with 3D Depth */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner border border-stone-800/40 bg-stone-900">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable="false"
              />
              {/* Dynamic Glare Reflection Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none"
                style={{
                  transform: `rotate(${rotationY * -1}deg)`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Notification */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        <div className="text-white/80 text-[11px] font-medium flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <RotateCw size={12} className="text-[#DDA15E] animate-spin" style={{ animationDuration: '4s' }} />
          <span>{hasInteracted ? 'Geser untuk memutar sudut pandang' : 'Sentuh & geser layar untuk memutar'}</span>
        </div>

        <span className="bg-[#DDA15E] text-[#3D251A] px-3.5 py-1 rounded-full text-xs font-black shadow-lg">
          {price}
        </span>
      </div>
    </div>
  );
}
