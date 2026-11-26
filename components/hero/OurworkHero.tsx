"use client";

import React, { useId, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, HeartHandshake } from "lucide-react";

export interface WorkSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isSvgGroup?: boolean;
}

const WORK_SLIDES: WorkSlide[] = [
  {
    id: "youth-skills",
    eyebrow: "UNIHOPE Foundation · Chennai & Tamil Nadu",
    title: "Empowering Youth Skills & Opportunities",
    description:
      "We support young individuals in gaining industry-relevant skills that open doors to sustainable employment and entrepreneurship. Our charitable programs in Chennai make vocational training and career mentorship accessible for underserved communities.",
    imageSrc: "/assets/Group 18.svg",
    imageAlt:
      "UNIHOPE Foundation youth empowerment and community welfare initiatives in Chennai, Tamil Nadu",
    isSvgGroup: true,
  },
  {
    id: "education-knowledge",
    eyebrow: "Education & Knowledge · Pillar 02",
    title: "Accessible Education for Every Child",
    description:
      "From scholarships, textbooks, and school kits to evening study centres in Vadapalani and rural Tamil Nadu, UNIHOPE equips underprivileged students with foundational learning tools so every child can thrive.",
    imageSrc: "/assets/Group 18.svg",
    imageAlt:
      "UNIHOPE Foundation free education, scholarships, and study centres for children in Chennai",
    isSvgGroup: true,
  },
  {
    id: "health-humanitarian",
    eyebrow: "Healthcare & Relief · Pillar 01",
    title: "Community Healthcare & Crisis Relief",
    description:
      "We organize free medical camps, blood donation awareness drives, and direct medical assistance for families who cannot afford care—delivering timely humanitarian relief across Chennai whenever crisis strikes.",
    imageSrc: "/assets/Group 18.svg",
    imageAlt:
      "UNIHOPE Foundation medical assistance, health camps, and humanitarian relief in Tamil Nadu",
    isSvgGroup: true,
  },
  {
    id: "women-community",
    eyebrow: "Women & Child Welfare · Pillar 04",
    title: "Stronger Women, Resilient Communities",
    description:
      "Through self-help groups, maternal and child nutrition support, clean water projects, and mental health circles, we build safe, dignified neighbourhoods across Chennai and rural Tamil Nadu.",
    imageSrc: "/assets/Group 18.svg",
    imageAlt:
      "UNIHOPE Foundation women empowerment, child nutrition, and community development in Chennai",
    isSvgGroup: true,
  },
];

/**
 * Renders the rounded hero banner with a mathematically continuous bottom-left
 * inverted-fillet notch that holds the carousel navigation controls.
 */
function NotchedWorkFrame({
  children,
  notchControls,
  className = "",
}: {
  children: React.ReactNode;
  notchControls: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const rawId = useId();
  const clipId = `our-work-hero-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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

  const W = dims ? dims.w : 1240;
  const H = dims ? dims.h : 520;
  const isMobile = W < 640;

  const rOuter = isMobile ? 24 : 32;
  const rFillet = isMobile ? 20 : 28;
  const rNotch = isMobile ? 20 : 28;

  // Compact bottom-left notch sized for the two circular prev/next buttons
  const maxSafeNW = W - rOuter - rFillet - 24;
  const targetNW = isMobile ? 132 : 164;
  const nW = Math.min(targetNW, maxSafeNW);
  const nH = isMobile ? 68 : 82;

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

      {/* Clipped Blue Hero Canvas */}
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          clipPath: dims ? `url(#${clipId})` : undefined,
          WebkitClipPath: dims ? `url(#${clipId})` : undefined,
          borderRadius: dims ? undefined : `${rOuter}px`,
        }}
      >
        {children}
      </div>

      {/* Bottom-Left Controls Inside the Notched Cutout */}
      <div
        className="absolute left-0 bottom-0 z-30 flex items-end pb-1 pr-2"
        style={{ width: `${nW}px`, height: `${nH}px` }}
      >
        {notchControls}
      </div>
    </div>
  );
}

export interface OurWorkHeroProps {
  className?: string;
  processTargetId?: string;
}

export function OurWorkHero({
  className = "",
  processTargetId = "ten-pillars",
}: OurWorkHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = WORK_SLIDES[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? WORK_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === WORK_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const scrollToProcess = () => {
    const el = document.getElementById(processTargetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      aria-label="UNIHOPE Foundation Our Work Overview"
      className={`mx-auto w-full max-w-7xl px-4 pt-5 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8 ${className}`}
    >
      <NotchedWorkFrame
        className="w-full bg-gradient-to-br from-[#0A2540] via-[#012A5F] to-[#071D33] text-white shadow-[0_20px_50px_rgba(10,37,64,0.18)]"
        notchControls={
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous focus area"
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#0A2540] text-white shadow-md transition hover:bg-[#012A5F] active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next focus area"
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#0A2540] text-white shadow-md transition hover:bg-[#012A5F] active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </button>
          </div>
        }
      >
        {/* Subtle UNIHOPE brand ambient glows (Green & Warm Gold) */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#2E7D32]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-[#EAA945]/10 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-end gap-6 lg:gap-4 min-h-[460px] sm:min-h-[500px] lg:min-h-[520px]">
          {/* Left Editorial Content Column */}
          <div className="lg:col-span-6 px-6 pt-8 pb-4 sm:px-10 sm:pt-12 sm:pb-24 lg:pl-14 lg:pr-4 lg:pt-14 lg:pb-28 z-10">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#EAA945]">
              {activeSlide.eyebrow}
            </p>

            <h1
              key={activeSlide.id}
              className="mt-3 font-outfit text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.12] tracking-tight text-white"
            >
              {activeSlide.title}
            </h1>

            <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-[15px] lg:text-base leading-relaxed text-white/85">
              {activeSlide.description}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
              <Link
                href="/donate"
                className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0A2540] shadow-md transition hover:bg-[#FBFAF6] hover:shadow-lg active:scale-[0.98]"
              >
                <span>Donate Now</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A2540] text-white">
                  <HeartHandshake className="h-3.5 w-3.5" />
                </span>
              </Link>

              <button
                type="button"
                onClick={scrollToProcess}
                className="group inline-flex items-center gap-3 text-sm font-semibold text-white transition hover:text-[#EAA945] cursor-pointer"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0A2540] shadow-sm transition group-hover:scale-105">
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </span>
                <span>Our process</span>
              </button>
            </div>

            {/* Subtle Slide Indicator Dots */}
            <div
              className="mt-6 flex items-center gap-2"
              role="tablist"
              aria-label="Our Work focus slides"
            >
              {WORK_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Show ${slide.title}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === activeIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Artwork / Group 18.svg Column */}
          <div className="lg:col-span-6 relative flex items-end justify-end self-end w-full h-[270px] sm:h-[360px] lg:h-[490px] pr-2 sm:pr-6">
            <div className="relative w-full h-full max-w-[660px]">
              <Image
                src={activeSlide.imageSrc}
                alt={activeSlide.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 660px"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </NotchedWorkFrame>
    </section>
  );
}

export default OurWorkHero;
