"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface HeroOption2Props {
  className?: string;
  onJoinClick?: () => void;
  onExploreMore?: () => void;
  onMenuClick?: () => void;
}

/**
 * 16-petal geometric floral / sunburst badge matching the UI design mockup.
 */
function SunburstIcon({ className = "w-10 h-10" }: { className?: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * (360 / 16));
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(50, 50)">
        {petals.map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-26"
            rx="6.5"
            ry="16"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="16" />
      </g>
    </svg>
  );
}

/**
 * Four core team coordinators representing the 21 Foundation Coordinators.
 */
const COORDINATOR_AVATARS = [
  {
    name: "Venkatesh A",
    role: "Secretary & Community Outreach Coordinator",
    image: "/Teams/Venkatesh%20A.jpeg",
  },
  {
    name: "Sundareswaran V",
    role: "Treasurer & Events Coordinator",
    image: "/Teams/Sundareshwaran%20V.jpeg",
  },
  {
    name: "Umamaheswari K",
    role: "Trustee & Women Welfare Coordinator",
    image: "/Teams/Umamageshwari%20K.svg",
  },
  {
    name: "Santhoshkumar B",
    role: "Trustee & Volunteer Coordinator",
    image: "/Teams/Santhosh%20Kumar.svg",
  },
];

export default function AboutHero({
  className = "",
  onJoinClick,
  onExploreMore,
  onMenuClick,
}: HeroOption2Props) {
  return (
    <div
      className={`relative w-full bg-white text-black overflow-hidden font-plusJakartaSans ${className}`}
    >
      <div className="mx-auto w-full max-w-[1728px] px-4 sm:px-6 md:px-8 lg:px-[70px] pt-1 sm:pt-2 lg:pt-3 pb-14 lg:pb-20">
        {/* ========================================================= */}
        {/* 1. TOP PANORAMIC HERO BANNER: ALL FACES FULLY VISIBLE     */}
        {/* ========================================================= */}
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] lg:h-[560px] xl:h-[640px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg group bg-[#0A2540]">
          <Image
            src="/assets/team-coordinators.jpg"
            alt="UNIHOPE Foundation 21 Core Committee & Community Coordinators"
            fill
            priority
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102"
          />
          {/* Subtle bottom gradient overlay for readability without obscuring faces */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/60 via-transparent to-transparent pointer-events-none" />

          {/* Banner Badge positioned on bottom-right empty space */}
          <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-10 flex items-center gap-2 rounded-full bg-[#0A2540]/85 backdrop-blur-md px-3.5 py-1.5 sm:px-4 text-white shadow-md border border-white/15 max-w-[92%] sm:max-w-none">
            <span className="h-2 w-2 rounded-full bg-[#EAA945] animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-medium tracking-wide truncate sm:whitespace-normal">
              UNIHOPE Core Committee &bull; 21 Foundation Coordinators
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SUB-BAR BELOW BANNER ("Registered Trust / From 2021")  */}
        {/* ========================================================= */}
        <div className="mt-5 sm:mt-7 flex items-center justify-between border-b border-neutral-200/80 pb-4 sm:pb-5">
          <div className="flex items-center gap-6 sm:gap-14 md:gap-24">
            <p className="font-onest text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-tight text-[#0A2540] flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2E7D32] shrink-0" />
              Registered Charitable Trust
            </p>
            <p className="font-onest text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-tight text-[#43474F] sm:text-[#0A2540]">
              21 Coordinators &bull; Chennai
            </p>
          </div>

          {/* Minimalist 3-line Menu Icon as in Reference UI Design */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle Project Menu"
            className="flex flex-col justify-center items-end gap-1.5 w-8 h-8 rounded-lg hover:bg-[#F4F5F7] transition p-1 cursor-pointer group"
          >
            <span className="w-5 h-0.5 bg-[#0A2540] rounded-full transition-all group-hover:w-6" />
            <span className="w-4 h-0.5 bg-[#2E7D32] rounded-full transition-all group-hover:w-6" />
            <span className="w-5 h-0.5 bg-[#0A2540] rounded-full transition-all group-hover:w-6" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. MAIN HERO CONTENT GRID                                  */}
        {/* Left: CTA + Giant Title | Right: Lead Copy + Stepped Pod  */}
        {/* ========================================================= */}
        <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Left Column: CTA & Giant Display Headline */}
          <div className="lg:col-span-7 flex flex-col items-start order-2 lg:order-1 min-w-0">
            {/* Primary Action Button */}
            <Link
              href="/donate"
              onClick={onJoinClick}
              className="inline-flex items-center justify-center rounded-full bg-[#0A2540] hover:bg-[#012A5F] active:scale-95 transition-all duration-200 px-7 sm:px-8 py-3.5 sm:py-4 shadow-sm hover:shadow-md cursor-pointer group shrink-0"
            >
              <span className="text-white font-plusJakartaSans text-sm sm:text-base font-semibold tracking-wide">
                Support Our Mission
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="ml-2 w-4 h-4 text-[#EAA945] transition-transform duration-200 group-hover:translate-x-0.5 shrink-0"
              >
                <path
                  d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* Giant Display Headline */}
            <h1 className="mt-6 sm:mt-8 font-onest text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[96px] 2xl:text-[104px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#0A2540] break-words">
              Empowering Lives, Inspiring Hope.
            </h1>
          </div>

          {/* Right Column: Lead Statement & Stepped Brand Widget */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end order-1 lg:order-2 min-w-0 w-full">
            {/* Vision Statement */}
            <p className="font-plusJakartaSans text-base sm:text-xl lg:text-[22px] font-medium leading-[1.35] text-[#19181A] max-w-[567px] text-left">
              Driven by 21 dedicated community coordinators, UNIHOPE Foundation
              creates measurable impact across Chennai through accessible education,
              maternal healthcare, youth livelihood training, and compassionate humanitarian aid.
            </p>

            {/* Stepped Brand UI Design Widget (Side-by-side with photo on all screens including mobile) */}
            <div className="mt-6 sm:mt-10 flex flex-row items-center gap-2.5 sm:gap-5 w-full max-w-[567px]">
              {/* Left Feature Photo */}
              <div className="relative shrink-0 w-[110px] xs:w-[125px] sm:w-[155px] md:w-[165px] h-[140px] xs:h-[150px] sm:h-[170px] rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-xs group">
                <Image
                  src="/Heros/education-hope.jpg"
                  alt="Village children holding HOPE slates in classroom"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-white">
                  Education For All
                </span>
              </div>

              {/* Right Stepped Cluster */}
              <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Top Row: Stepped Sage-Green Pod with 4 Avatars + Explore More ↘ */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Top Brand Pod with Coordinator Avatars */}
                  <div className="bg-[#E8F3EA] border border-[#C8E2CD] rounded-full py-1.5 px-2 sm:py-2.5 sm:px-4 shadow-xs shrink-0">
                    <div className="flex items-center -space-x-2 sm:-space-x-3 pl-0.5">
                      {COORDINATOR_AVATARS.map((coord) => (
                        <div
                          key={coord.name}
                          title={`${coord.name} - ${coord.role}`}
                          className="relative w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-full border-1.5 sm:border-2 border-white bg-slate-100 overflow-hidden shadow-xs hover:scale-125 hover:z-20 transition-all duration-200 shrink-0"
                        >
                          <Image
                            src={coord.image}
                            alt={coord.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explore More Link with Diagonal Down-Right Arrow ↘ */}
                  <Link
                    href="/our-work"
                    onClick={onExploreMore}
                    className="group/link flex items-center gap-1 sm:gap-1.5 text-[#0A2540] hover:text-[#2E7D32] transition cursor-pointer pl-0.5 shrink-0"
                  >
                    <span className="font-plusJakartaSans text-[10px] sm:text-sm font-semibold leading-tight">
                      Explore
                      <br />
                      More
                    </span>
                    <span className="text-sm sm:text-lg font-bold leading-none transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 shrink-0">
                      ↘
                    </span>
                  </Link>
                </div>

                {/* Bottom Row: Navy 16-point Sunburst Icon + Stepped Soft Navy Stat Pod */}
                <div className="flex items-center gap-2 sm:gap-4 pl-0.5 sm:pl-2">
                  {/* 16-point Navy Geometric Sunburst Flower */}
                  <div className="w-7 h-7 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                    <SunburstIcon className="w-6 h-6 sm:w-10 sm:h-10 text-[#0A2540] transition-transform duration-700 hover:rotate-45" />
                  </div>

                  {/* Bottom Brand Stat Pod */}
                  <div className="bg-[#EAF1F8] border border-[#CBDCEB] rounded-[20px] sm:rounded-[30px] py-2 px-3 sm:py-3.5 sm:px-5 shadow-xs flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <span className="font-onest text-lg sm:text-[28px] font-bold leading-none text-[#0A2540] shrink-0">
                      2K+
                    </span>
                    <span className="font-plusJakartaSans text-[10px] sm:text-sm font-medium text-[#0A2540] leading-tight whitespace-nowrap">
                      lives supported
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
