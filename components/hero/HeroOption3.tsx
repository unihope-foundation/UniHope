"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import sanctuaryImage from "@/assets/hero/hero-3-sanctuary.jpg";

export interface HeroOption3Props {
  className?: string;
  onGetStarted?: () => void;
  onNavClick?: (item: string) => void;
}

export default function HeroOption3({
  className = "",
  onGetStarted,
  onNavClick,
}: HeroOption3Props) {
  const [activeNav, setActiveNav] = useState("Home");

  const navItems = [
    { label: "Home", font: "font-sourceSerifPro" },
    { label: "About Us", font: "font-sourceSerifPro" },
    { label: "Services", font: "font-openSans" },
    { label: "Contact Us", font: "font-openSans" },
  ];

  return (
    <div
      className={`relative min-h-screen w-full bg-[#FFFFFF] text-[#1F1F1F] overflow-hidden select-none font-sourceSerifPro ${className}`}
    >
      {/* Background ambient warm tint */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-[#EAA945]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR                              */}
      {/* ========================================================= */}
      <header className="relative z-30 flex items-center justify-between w-full px-6 py-6 sm:px-12 lg:px-20 max-w-[1728px] mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <svg
            width="84"
            height="32"
            viewBox="0 0 84 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 w-[83px] h-8 relative transition-transform duration-300 group-hover:scale-105"
            aria-label="Brand Mark"
          >
            <path
              d="M9.80117 23.9175C7.54879 23.9175 5.69783 23.4827 4.24829 22.6129C2.79874 21.7209 1.72831 20.4721 1.03698 18.8664C0.345661 17.2608 0 15.3652 0 13.1797V0H4.18139V13.2801C4.18139 14.4843 4.34864 15.6105 4.68315 16.6586C5.03996 17.6845 5.63093 18.5096 6.45606 19.134C7.30348 19.7584 8.44082 20.0706 9.86807 20.0706C11.3176 20.0706 12.4327 19.7584 13.2132 19.134C14.016 18.4873 14.5735 17.651 14.8857 16.6252C15.2202 15.5994 15.3875 14.4843 15.3875 13.2801V0H19.6023V13.1797C19.6023 15.3429 19.2567 17.2273 18.5653 18.833C17.874 20.4386 16.8147 21.6874 15.3875 22.5795C13.9602 23.4715 12.0981 23.9175 9.80117 23.9175Z"
              fill="black"
            />
            <path
              d="M24.7329 23.6499V0H28.9143V23.6499H24.7329Z"
              fill="black"
            />
            <path
              d="M34.2063 23.6499V0H50.7312V3.81342H38.3877V10.8716H48.9583V14.685H38.3877V23.6499H34.2063Z"
              fill="black"
            />
            <path
              d="M53.6602 23.6499V6.02119H57.3733L57.6075 8.32932C58.0535 7.6603 58.5552 7.14738 59.1128 6.79057C59.6926 6.41146 60.3058 6.14385 60.9526 5.98774C61.6216 5.83164 62.2906 5.75358 62.9596 5.75358C63.2049 5.75358 63.4279 5.75358 63.6286 5.75358C63.8517 5.75358 64.0301 5.76473 64.1639 5.78703V9.66736H63.0934C61.9338 9.66736 60.9526 9.89037 60.1497 10.3364C59.3469 10.7824 58.7448 11.418 58.3434 12.2431C57.942 13.0682 57.7413 14.0829 57.7413 15.2871V23.6499H53.6602Z"
              fill="black"
            />
            <path
              d="M74.3578 31.7116C72.9975 31.7116 71.6706 31.5221 70.3771 31.143C69.106 30.7861 67.9241 30.1729 66.8313 29.3031L68.3032 26.0249C69.0614 26.6271 69.9088 27.0954 70.8455 27.4299C71.7821 27.7867 72.8079 27.9651 73.923 27.9651C75.6847 27.9651 76.967 27.5191 77.7698 26.6271C78.595 25.735 79.0075 24.5196 79.0075 22.9809V21.6763C78.6061 22.1892 78.1155 22.6129 77.5357 22.9474C76.9559 23.2819 76.3314 23.5273 75.6624 23.6834C74.9934 23.8395 74.3132 23.9175 73.6219 23.9175C71.9047 23.9175 70.5332 23.5719 69.5074 22.8805C68.5039 22.1669 67.7791 21.1968 67.3331 19.9703C66.8871 18.7215 66.6641 17.3054 66.6641 15.722V6.02119H70.7117V14.8188C70.7117 15.4432 70.7563 16.0788 70.8455 16.7255C70.9347 17.3723 71.1131 17.9632 71.3807 18.4984C71.6483 19.0337 72.0385 19.4685 72.5515 19.803C73.0867 20.1152 73.7892 20.2714 74.6589 20.2714C75.7962 20.2714 76.6771 19.9926 77.3015 19.4351C77.9259 18.8776 78.3496 18.1528 78.5727 17.2608C78.818 16.3687 78.9406 15.4209 78.9406 14.4174V6.02119H83.0216V21.9774C83.0216 23.4715 82.8655 24.8095 82.5533 25.9915C82.2411 27.1957 81.7394 28.2216 81.048 29.069C80.3567 29.9164 79.4647 30.5631 78.3719 31.0091C77.2792 31.4775 75.9412 31.7116 74.3578 31.7116Z"
              fill="black"
            />
          </svg>
        </div>

        {/* Center Pill Nav Bar */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 py-3 px-8 lg:px-12 rounded-full border border-[#909090]/25 bg-white/80 backdrop-blur-md shadow-xs">
          {navItems.map((item, idx) => {
            const isActive = activeNav === item.label;
            return (
              <React.Fragment key={item.label}>
                {idx > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#909090]/40 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav(item.label);
                    if (onNavClick) onNavClick(item.label);
                  }}
                  className={`text-base lg:text-lg transition cursor-pointer ${item.font} ${
                    isActive
                      ? "text-[#1F1F1F] font-semibold"
                      : "text-[#545454] hover:text-[#1F1F1F] font-normal"
                  }`}
                >
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right CTA Button ("Get Started") */}
        <button
          type="button"
          onClick={onGetStarted}
          className="flex items-center justify-center rounded-full bg-black text-[#F7F7F7] font-sourceSerifPro text-base sm:text-lg font-semibold px-6 sm:px-7 py-3 shadow-md hover:bg-neutral-800 active:scale-95 transition cursor-pointer"
        >
          Get Started
        </button>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN DISPLAY HEADLINE & LEAD STATEMENT                  */}
      {/* ========================================================= */}
      <section className="relative z-20 max-w-[1728px] mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-14 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Giant Amber Headline */}
          <div className="lg:col-span-7 xl:col-span-8">
            <h1 className="text-[#EAA945] font-sourceSerifPro text-5xl sm:text-7xl md:text-8xl lg:text-[95px] font-bold leading-[0.96] tracking-tight uppercase">
              EMPOWERING MENTAL WELLNESS
            </h1>
          </div>

          {/* Divider & Right Editorial Statement */}
          <div className="lg:col-span-5 xl:col-span-4 flex items-center gap-6 sm:gap-8">
            {/* Elegant Vertical Divider Line */}
            <div className="hidden sm:block w-px h-36 lg:h-44 bg-[#909090]/40 shrink-0" />

            {/* Description */}
            <p className="text-[#1F1F1F] font-sourceSerifPro text-lg sm:text-xl lg:text-[22px] font-light leading-relaxed">
              Transform your living space into a sanctuary of growth,
              productivity, and personal well-being. Home Empowering focuses on
              creating environments that inspire confidence, enhance creativity,
              and support your everyday ambitions.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SANCTUARY LIVING SPACE VISUAL (Grounding Centerpiece)    */}
      {/* ========================================================= */}
      <section className="relative z-20 max-w-[1728px] mx-auto px-6 sm:px-12 lg:px-20 mt-10 sm:mt-14">
        <div className="relative w-full h-[320px] sm:h-[480px] lg:h-[580px] rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl border border-black/5 group">
          <Image
            src={sanctuaryImage}
            alt="Sanctuary of mental wellness and living space"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Ambient Lighting Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BOTTOM ELEVATED LIFESTYLE STATEMENT                    */}
      {/* ========================================================= */}
      <section className="relative z-20 max-w-[1728px] mx-auto px-6 sm:px-12 lg:px-20 pt-10 sm:pt-14 pb-16 sm:pb-24">
        <div className="max-w-2xl flex flex-col items-start gap-2.5">
          <h2 className="text-[#1F1F1F] font-sourceSerifPro text-2xl sm:text-3xl font-semibold tracking-tight">
            Empower Your Space, Elevate Your Life
          </h2>
          <p className="text-[#1F1F1F]/90 font-sourceSerifPro text-lg sm:text-[22px] font-light leading-relaxed">
            Redefine comfort and functionality in a way that truly reflects and
            uplifts your unique lifestyle.
          </p>
        </div>
      </section>
    </div>
  );
}
