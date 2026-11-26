"use client";

import React, { useId, useRef, useState, useEffect } from "react";
import Image from "next/image";

export interface HeroOption3Props {
  className?: string;
  onGetStarted?: () => void;
  onNavClick?: (item: string) => void;
  imageSrc?: string;
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  notchTitle?: string;
  notchDescription?: string;
}

/**
 * Renders a panoramic hero container clipped with smooth, mathematically continuous
 * inverted circular fillets (concave fillets) wrapping around the bottom-left text notch.
 */
function NotchedHeroFrame({
  children,
  notchContent,
  className = "",
  notchWidthRatio = 0.44,
  maxNotchWidth = 520,
  notchHeight = 135,
}: {
  children: React.ReactNode;
  notchContent?: React.ReactNode;
  className?: string;
  notchWidthRatio?: number;
  maxNotchWidth?: number;
  notchHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const rawId = useId();
  const clipId = `notched-hero-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDims({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Responsive calculations that guarantee ZERO geometry collisions on all devices
  const W = dims ? dims.w : 1200;
  const H = dims ? dims.h : 560;
  const isMobile = W < 640;

  // Adaptive corner & fillet radii
  const rOuter = isMobile ? (W < 360 ? 16 : 20) : (W < 1024 ? 26 : 32);
  const rFillet = isMobile ? (W < 360 ? 14 : 16) : (W < 1024 ? 20 : 24);
  const rNotch = isMobile ? (W < 360 ? 14 : 16) : (W < 1024 ? 20 : 24);

  // Maximum safe width so notch never touches or overlaps the bottom-right corner arc
  const maxSafeNW = W - rOuter - rFillet - 16;
  const targetNW = isMobile
    ? Math.min(Math.round(W * 0.74), 300)
    : Math.min(Math.round(W * notchWidthRatio), maxNotchWidth);
  const nW = Math.max(Math.min(targetNW, maxSafeNW), 160);

  // Maximum safe height so notch never touches or overlaps the top-left corner arc
  const maxSafeNH = H - rOuter - rFillet - 20;
  const targetNH = isMobile ? Math.min(124, Math.round(H * 0.36)) : notchHeight;
  const nH = Math.min(targetNH, maxSafeNH);

  // Mathematically continuous SVG path with inverted (concave) corner fillets
  const pathData = [
    `M 0 ${rOuter}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${rOuter} 0`,
    `L ${W - rOuter} 0`,
    `A ${rOuter} ${rOuter} 0 0 1 ${W} ${rOuter}`,
    `L ${W} ${H - rOuter}`,
    `A ${rOuter} ${rOuter} 0 0 1 ${W - rOuter} ${H}`,
    `L ${nW + rFillet} ${H}`,
    `A ${rFillet} ${rFillet} 0 0 1 ${nW} ${H - rFillet}`,
    `L ${nW} ${H - nH + rNotch}`,
    `A ${rNotch} ${rNotch} 0 0 0 ${nW - rNotch} ${H - nH}`,
    `L ${rOuter} ${H - nH}`,
    `A ${rOuter} ${rOuter} 0 0 1 0 ${H - nH - rOuter}`,
    `L 0 ${rOuter}`,
    "Z",
  ].join(" ");

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        className="pointer-events-none absolute h-0 w-0"
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={pathData} />
          </clipPath>
        </defs>
      </svg>
      {/* Clipped Hero Media Frame */}
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          clipPath: dims ? `url(#${clipId})` : undefined,
          WebkitClipPath: dims ? `url(#${clipId})` : undefined,
        }}
      >
        {children}
      </div>

      {/* Synchronized Bottom-Left Notched Text Slot */}
      {notchContent && (
        <div
          className="absolute left-0 bottom-0 z-30 flex flex-col justify-end"
          style={{
            width: `${nW}px`,
            height: `${nH}px`,
          }}
        >
          {notchContent}
        </div>
      )}
    </div>
  );
}

export default function VolunteerHero({
  className = "",
  imageSrc = "/Heros/education-hope.jpg",
  titleLine1 = "EMPOWERING",
  titleLine2 = "COMMUNITIES TOGETHER",
  description = "Join hands with UNIHOPE Foundation across Chennai. Dedicate your passion, skills, and time to teach children, support healthcare camps, empower vulnerable women, and deliver crisis relief where hope is needed most.",
  notchTitle = "Empower Communities, Elevate Lives",
  notchDescription = "Every hour you contribute brings quality education, healthcare, and vital community relief to underserved families in Chennai.",
}: HeroOption3Props) {
  return (
    <div
      className={`relative w-full bg-white text-[#19181A] overflow-hidden font-sourceSerif ${className}`}
    >
      {/* Background ambient UNIHOPE brand tints */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[#EAA945]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[360px] bg-[#2E7D32]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. MAIN DISPLAY HEADLINE & LEAD EDITORIAL STATEMENT        */}
      {/* ========================================================= */}
      <section className="relative z-20 max-w-[1728px] mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-12 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center">
          {/* Dual-Color Giant Headline in UNIHOPE Navy & Warm Gold */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="font-serif text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[92px] font-extrabold leading-[1.0] tracking-tight uppercase">
              <span className="block text-[#0A2540]">{titleLine1}</span>
              <span className="block text-[#2E7D32]">{titleLine2}</span>
            </h1>
          </div>

          {/* Divider & Right Editorial Statement */}
          <div className="lg:col-span-5 xl:col-span-4 flex items-center gap-6 sm:gap-8">
            {/* Elegant Vertical Divider Line */}
            <div className="hidden sm:block w-px h-32 lg:h-44 bg-[#0A2540]/20 shrink-0" />

            {/* Description */}
            <p className="font-serif text-sm sm:text-base lg:text-lg font-light text-[#43474F] leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. GROUNDING CENTERPIECE VISUAL WITH PERFECT CUTTING EDGES */}
      {/* ========================================================= */}
      <section className="relative z-20 max-w-[1728px] mx-auto px-6 sm:px-12 lg:px-20 mt-8 sm:mt-12 mb-12 sm:mb-16">
        {/* Notched Panoramic Frame with Synchronized Bottom-Left Inset Notch */}
        <NotchedHeroFrame
          notchWidthRatio={0.44}
          maxNotchWidth={520}
          notchHeight={135}
          className="w-full h-[360px] xs:h-[400px] sm:h-[480px] md:h-[540px] lg:h-[580px] shadow-2xl bg-[#0A2540] group"
          notchContent={
            <div className="pt-2 sm:pt-4 pr-3 sm:pr-6 pb-1 sm:pb-2">
              <h2 className="font-serif text-[15px] xs:text-base sm:text-xl lg:text-2xl font-bold text-[#0A2540] tracking-tight leading-snug line-clamp-2">
                {notchTitle}
              </h2>
              <p className="mt-1 sm:mt-1.5 font-serif text-xs sm:text-sm lg:text-[15px] font-light text-[#43474F] leading-relaxed line-clamp-2 sm:line-clamp-3">
                {notchDescription}
              </p>
            </div>
          }
        >
          <Image
            src={imageSrc}
            alt="UNIHOPE Foundation volunteer outreach and education in Chennai"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1600px"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle ambient lighting gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/45 via-transparent to-transparent pointer-events-none" />
        </NotchedHeroFrame>
      </section>
    </div>
  );
}
