"use client";

import React from "react";
import Image from "next/image";
import heroTwoBanner from "@/assets/hero/hero-2-banner.jpg";
import heroTwoFeature from "@/assets/hero/hero-2-feature.jpg";
import avatar1 from "@/assets/hero/portrait-1.jpg";
import avatar2 from "@/assets/hero/portrait-2.jpg";
import avatar3 from "@/assets/hero/portrait-3.jpg";
import avatar4 from "@/assets/hero/portrait-4.jpg";
import avatar5 from "@/assets/hero/portrait-5.jpg";

export interface HeroOption2Props {
  className?: string;
  onJoinClick?: () => void;
  onExploreMore?: () => void;
  onMenuClick?: () => void;
}

export default function HeroOption2({
  className = "",
  onJoinClick,
  onExploreMore,
  onMenuClick,
}: HeroOption2Props) {
  const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];

  return (
    <div
      className={`relative min-h-screen w-full bg-white text-black overflow-hidden font-plusJakartaSans ${className}`}
    >
      <div className="mx-auto w-full max-w-[1728px] px-4 sm:px-8 lg:px-[70px] pt-8 sm:pt-12 lg:pt-[73px] pb-16 lg:pb-24">
        {/* ========================================================= */}
        {/* 1. TOP PANORAMIC HERO BANNER                              */}
        {/* ========================================================= */}
        <div className="relative w-full h-[260px] sm:h-[360px] md:h-[420px] lg:h-[451px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group">
          <Image
            src={heroTwoBanner}
            alt="Project of the Year Panoramic View"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* ========================================================= */}
        {/* 2. SUB-BAR BELOW BANNER ("Project of the Year", etc.)      */}
        {/* ========================================================= */}
        <div className="mt-6 sm:mt-8 flex items-center justify-between border-b border-neutral-200/80 pb-5 sm:pb-6">
          <div className="flex items-center gap-8 sm:gap-20 md:gap-36">
            <p className="font-onest text-base sm:text-xl font-medium tracking-tight text-black">
              Project of the Year
            </p>
            <p className="font-onest text-base sm:text-xl font-medium tracking-tight text-neutral-600 sm:text-black">
              From 2016
            </p>
          </div>

          {/* Minimalist Hamburger / Filter Icon */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle Project Menu"
            className="flex flex-col justify-center items-end gap-1.5 w-8 h-8 rounded-lg hover:bg-neutral-100 transition p-1 cursor-pointer group"
          >
            <span className="w-5 h-0.5 bg-black rounded-full transition-all group-hover:w-6" />
            <span className="w-4 h-0.5 bg-black rounded-full transition-all group-hover:w-6" />
            <span className="w-5 h-0.5 bg-black rounded-full transition-all group-hover:w-6" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 3. MAIN HERO CONTENT GRID                                  */}
        {/* Left: CTA + Giant Title | Right: Lead Copy + Feature Card */}
        {/* ========================================================= */}
        <div className="mt-8 sm:mt-12 lg:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: CTA & Giant Display Headline */}
          <div className="lg:col-span-7 flex flex-col items-start order-2 lg:order-1">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onJoinClick}
              className="inline-flex items-center justify-center rounded-full bg-[#29839D] hover:bg-[#206f86] active:scale-95 transition-all duration-200 px-7 sm:px-8 py-3.5 sm:py-4 shadow-sm hover:shadow-md cursor-pointer group"
            >
              <span className="text-white font-plusJakartaSans text-sm sm:text-base font-medium tracking-wide">
                Join The Revolution
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="ml-2 w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M4.5 10H15.5M15.5 10L10.5 5M15.5 10L10.5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Giant Display Headline */}
            <h1 className="mt-6 sm:mt-8 font-onest text-4xl sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[114px] font-semibold leading-[1.04] tracking-[-0.04em] text-black">
              Charting the Path to Success
            </h1>
          </div>

          {/* Right Column: Lead Statement & Feature Social Proof Card */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-end order-1 lg:order-2">
            {/* Vision Statement */}
            <p className="font-plusJakartaSans text-lg sm:text-2xl font-medium leading-[1.3] text-[#19181A] max-w-[567px] text-left">
              Lead the way with innovation and determination. Together, we’ll
              achieve groundbreaking results and set new standards for excellence.
            </p>

            {/* Interactive Feature & Social Proof Card */}
            <div className="mt-8 sm:mt-10 w-full max-w-[581px] rounded-3xl bg-[#F8F8F8] border border-neutral-200/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5">
                {/* Secondary Architectural Feature Photo */}
                <div className="relative shrink-0 w-full sm:w-[209px] h-[160px] sm:h-[183px] rounded-2xl overflow-hidden shadow-inner group">
                  <Image
                    src={heroTwoFeature}
                    alt="Modern cantilevered architectural balcony"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Card Content: Avatars + 2K+ Stat + Explore More CTA */}
                <div className="flex flex-col justify-between flex-1 py-1">
                  {/* Top Row: Avatars & Explore More Link */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Avatars Stack */}
                    <div className="flex items-center -space-x-3.5 pl-1">
                      {avatars.map((avatar, idx) => (
                        <div
                          key={idx}
                          className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-[#F7F7F7] overflow-hidden shadow-xs hover:scale-110 hover:z-20 transition-all duration-200"
                        >
                          <Image
                            src={avatar}
                            alt={`Client avatar ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Explore More Link with Diagonal Arrow */}
                    <button
                      type="button"
                      onClick={onExploreMore}
                      className="group/link flex items-center gap-1.5 text-black hover:text-[#29839D] transition cursor-pointer"
                    >
                      <span className="font-plusJakartaSans text-xs sm:text-sm font-semibold whitespace-nowrap">
                        Explore More
                      </span>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-black text-white group-hover/link:bg-[#29839D] transition-colors duration-200">
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                        >
                          <path
                            d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>

                  {/* Bottom Row: 2K+ Stat & Label */}
                  <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-baseline gap-2.5">
                    <span className="font-onest text-3xl sm:text-[34px] font-bold leading-none text-black">
                      2K+
                    </span>
                    <span className="font-plusJakartaSans text-xs sm:text-sm font-medium text-neutral-600 leading-snug">
                      of happy clients and businesses
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
