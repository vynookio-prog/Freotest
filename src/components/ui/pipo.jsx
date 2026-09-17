import React from 'react';

export function GradientBackground({ className = "absolute inset-0" }: { className?: string }) {
  // SVG noise ter-encode URI agar valid dalam deklarasi CSS
  const noiseSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        width: "100%",
        height: "100%",
        containerType: "size",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "clamp(-120px, -14cqmin, -40px)",
          filter: "blur(clamp(24px, 7cqmin, 60px))",
          backgroundColor: "#FFFFFF",
          backgroundImage:
            `url("${noiseSvg}"), ` +
            /* Bagian Tengah: Putih Bersih */
            "radial-gradient(ellipse 65% 75% at 50% 50%, #FFFFFF 0%, rgba(255, 255, 255, 0.96) 40%, rgba(255, 255, 255, 0) 80%), " +
            /* Pojok Kanan: Orange Hangat & Segar */
            "radial-gradient(circle at 100% 45%, rgba(238, 126, 38, 0.72) 0%, rgba(246, 160, 78, 0.42) 35%, rgba(255, 255, 255, 0) 70%), " +
            "radial-gradient(circle at 92% 85%, rgba(230, 115, 30, 0.48) 0%, rgba(248, 172, 95, 0.22) 30%, rgba(255, 255, 255, 0) 65%), " +
            "radial-gradient(circle at 95% 10%, rgba(242, 142, 54, 0.45) 0%, rgba(255, 255, 255, 0) 55%), " +
            /* Pojok Kiri: Coklat Pastel Lembut */
            "radial-gradient(circle at 0% 55%, rgba(194, 158, 130, 0.72) 0%, rgba(214, 188, 166, 0.42) 35%, rgba(255, 255, 255, 0) 70%), " +
            "radial-gradient(circle at 8% 15%, rgba(182, 146, 118, 0.48) 0%, rgba(210, 185, 164, 0.22) 30%, rgba(255, 255, 255, 0) 65%), " +
            "radial-gradient(circle at 5% 90%, rgba(190, 154, 126, 0.42) 0%, rgba(255, 255, 255, 0) 55%)",
          backgroundSize: "120px 120px, auto, auto, auto, auto, auto, auto, auto",
          backgroundBlendMode: "overlay, normal, normal, normal, normal, normal, normal, normal",
        }}
      />
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.16,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      >
        <filter id="grain-freonix">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-freonix)" />
      </svg>
    </div>
  );
}

export default GradientBackground;
