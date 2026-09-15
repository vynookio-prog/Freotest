'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Play, Pause, Sparkles } from 'lucide-react';

export default function Product3DViewer({ image, name, price }) {
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const isAutoRotateRef = useRef(isAutoRotate);
  const isDraggingRef = useRef(false);
  const turntableRef = useRef(null);
  const glareRef = useRef(null);
  const floorShadowRef = useRef(null);

  const rotationYRef = useRef(0);
  const rotationXRef = useRef(10);
  const startPos = useRef({ x: 0, y: 0 });
  const lastRotation = useRef({ x: 10, y: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  const applyTransforms = (rotX, rotY) => {
    if (turntableRef.current) {
      turntableRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
    if (glareRef.current) {
      glareRef.current.style.transform = `rotate(${-rotY}deg)`;
    }
    if (floorShadowRef.current) {
      const scale = 1 - Math.abs(Math.sin((rotY * Math.PI) / 180)) * 0.15;
      floorShadowRef.current.style.transform = `scale(${scale})`;
    }
  };

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (!document.hidden && isAutoRotateRef.current && !isDraggingRef.current) {
        const delta = Math.min(currentTime - lastTime, 50); // Cap delta to avoid huge jumps
        rotationYRef.current = (rotationYRef.current + delta * 0.04) % 360;
        applyTransforms(rotationXRef.current, rotationYRef.current);
      }
      lastTime = currentTime;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleStart = (clientX, clientY) => {
    isDraggingRef.current = true;
    if (!hasInteracted) setHasInteracted(true);
    startPos.current = { x: clientX, y: clientY };
    lastRotation.current = { x: rotationXRef.current, y: rotationYRef.current };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    const newRotY = (lastRotation.current.y + deltaX * 0.8) % 360;
    const newRotX = Math.max(-25, Math.min(35, lastRotation.current.x - deltaY * 0.4));

    rotationYRef.current = newRotY;
    rotationXRef.current = newRotX;
    applyTransforms(newRotX, newRotY);
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
  };

  const toggleAutoRotate = () => {
    setIsAutoRotate(prev => !prev);
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[420px] flex flex-col items-center justify-center select-none overflow-hidden bg-gradient-to-b from-[#3D251A] via-[#2A1810] to-[#1F120C] rounded-3xl p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(221,161,94,0.2)_0%,_transparent_70%)] pointer-events-none" />

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
        <div
          ref={floorShadowRef}
          className="absolute bottom-2 w-48 h-12 bg-black/60 rounded-full blur-xl pointer-events-none will-change-transform"
          style={{ transform: 'scale(1)' }}
        />

        <div
          ref={turntableRef}
          className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(10deg) rotateY(0deg)'
          }}
        >
          <div className="absolute inset-0 rounded-full p-2 bg-gradient-to-tr from-[#8B5742] via-[#DDA15E] to-[#F5EBE0] shadow-2xl border-2 border-[#DDA15E]/40 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner border border-stone-800/40 bg-stone-900">
              <picture>
                <source srcSet={image ? image.replace(/\.jpg$/, '.webp') : ''} type="image/webp" />
                <img
                  src={image}
                  alt={name}
                  width="256"
                  height="256"
                  loading="eager"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable="false"
                />
              </picture>
              <div
                ref={glareRef}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none will-change-transform"
                style={{ transform: 'rotate(0deg)' }}
              />
            </div>
          </div>
        </div>
      </div>

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
