"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import portraitOne from "@/assets/hero/portrait-1.jpg";
import portraitTwo from "@/assets/hero/portrait-2.jpg";
import portraitThree from "@/assets/hero/portrait-3.jpg";
import portraitFour from "@/assets/hero/portrait-4.jpg";
import portraitFive from "@/assets/hero/portrait-5.jpg";

export interface HeroOption1Props {
  className?: string;
  onExploreFeatures?: () => void;
  onContact?: () => void;
  onGenerate?: (prompt: string, params: { ar: string; v: string; stylize: string }) => void;
}

export default function HeroOption1({
  className = "",
  onExploreFeatures,
  onContact,
  onGenerate,
}: HeroOption1Props) {
  const [promptText, setPromptText] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [version, setVersion] = useState("6.0 [alpha]");
  const [stylize, setStylize] = useState("250");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGenerate) {
      onGenerate(promptText, { ar: aspectRatio, v: version, stylize });
    }
  };

  return (
    <div
      className={`relative min-h-[960px] lg:min-h-[1050px] w-full bg-white text-black overflow-hidden select-none font-dMSans ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION HEADER                                   */}
      {/* ========================================================= */}
      <header className="relative z-30 flex items-center justify-between w-full px-6 py-6 sm:px-12 lg:px-20 max-w-[1800px] mx-auto">
        {/* Brand Logo & Trademark */}
        <div className="flex items-center gap-1.5 group cursor-pointer">
          <svg
            width="84"
            height="32"
            viewBox="0 0 84 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[83px] h-8 relative transition-transform duration-300 group-hover:scale-105"
            aria-label="UIFRG Brand Mark"
          >
            <path
              d="M9.80117 23.9175C7.54879 23.9175 5.69783 23.4827 4.24829 22.6129C2.79874 21.7209 1.72831 20.4721 1.03698 18.8664C0.345661 17.2608 0 15.3652 0 13.1797V0H4.18139V13.2801C4.18139 14.4843 4.34864 15.6105 4.68315 16.6586C5.03996 17.6845 5.63093 18.5096 6.45606 19.134C7.30348 19.7584 8.44082 20.0706 9.86807 20.0706C11.3176 20.0706 12.4327 19.7584 13.2132 19.134C14.016 18.4873 14.5735 17.651 14.8857 16.6252C15.2202 15.5994 15.3875 14.4843 15.3875 13.2801V0H19.6023V13.1797C19.6023 15.3429 19.2567 17.2273 18.5653 18.833C17.874 20.4386 16.8147 21.6874 15.3875 22.5795C13.9602 23.4715 12.0981 23.9175 9.80117 23.9175Z"
              fill="currentColor"
            />
            <path
              d="M24.7329 23.6499V0H28.9143V23.6499H24.7329Z"
              fill="currentColor"
            />
            <path
              d="M34.2063 23.6499V0H50.7312V3.81342H38.3877V10.8716H48.9583V14.685H38.3877V23.6499H34.2063Z"
              fill="currentColor"
            />
            <path
              d="M53.6602 23.6499V6.02119H57.3733L57.6075 8.32932C58.0535 7.6603 58.5552 7.14738 59.1128 6.79057C59.6926 6.41146 60.3058 6.14385 60.9526 5.98774C61.6216 5.83164 62.2906 5.75358 62.9596 5.75358C63.2049 5.75358 63.4279 5.75358 63.6286 5.75358C63.8517 5.75358 64.0301 5.76473 64.1639 5.78703V9.66736H63.0934C61.9338 9.66736 60.9526 9.89037 60.1497 10.3364C59.3469 10.7824 58.7448 11.418 58.3434 12.2431C57.942 13.0682 57.7413 14.0829 57.7413 15.2871V23.6499H53.6602Z"
              fill="currentColor"
            />
            <path
              d="M74.3578 31.7116C72.9975 31.7116 71.6706 31.5221 70.3771 31.143C69.106 30.7861 67.9241 30.1729 66.8313 29.3031L68.3032 26.0249C69.0614 26.6271 69.9088 27.0954 70.8455 27.4299C71.7821 27.7867 72.8079 27.9651 73.923 27.9651C75.6847 27.9651 76.967 27.5191 77.7698 26.6271C78.595 25.735 79.0075 24.5196 79.0075 22.9809V21.6763C78.6061 22.1892 78.1155 22.6129 77.5357 22.9474C76.9559 23.2819 76.3314 23.5273 75.6624 23.6834C74.9934 23.8395 74.3132 23.9175 73.6219 23.9175C71.9047 23.9175 70.5332 23.5719 69.5074 22.8805C68.5039 22.1669 67.7791 21.1968 67.3331 19.9703C66.8871 18.7215 66.6641 17.3054 66.6641 15.722V6.02119H70.7117V14.8188C70.7117 15.4432 70.7563 16.0788 70.8455 16.7255C70.9347 17.3723 71.1131 17.9632 71.3807 18.4984C71.6483 19.0337 72.0385 19.4685 72.5515 19.803C73.0867 20.1152 73.7892 20.2714 74.6589 20.2714C75.7962 20.2714 76.6771 19.9926 77.3015 19.4351C77.9259 18.8776 78.3496 18.1528 78.5727 17.2608C78.818 16.3687 78.9406 15.4209 78.9406 14.4174V6.02119H83.0216V21.9774C83.0216 23.4715 82.8655 24.8095 82.5533 25.9915C82.2411 27.1957 81.7394 28.2216 81.048 29.069C80.3567 29.9164 79.4647 30.5631 78.3719 31.0091C77.2792 31.4775 75.9412 31.7116 74.3578 31.7116Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-inter text-base font-extralight text-black tracking-[0.11em] -mt-1">
            ®
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-7 sm:gap-9">
          <button
            type="button"
            onClick={onExploreFeatures}
            className="text-black font-dMSans text-sm sm:text-base font-normal tracking-[0.11em] lowercase hover:opacity-60 transition cursor-pointer"
          >
            features
          </button>
          <button
            type="button"
            onClick={onContact}
            className="text-black font-dMSans text-sm sm:text-base font-normal tracking-[0.11em] lowercase hover:opacity-60 transition cursor-pointer"
          >
            contact
          </button>
        </nav>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO HEADLINE & INTERACTIVE PROMPT BAR                 */}
      {/* ========================================================= */}
      <section className="relative z-20 flex flex-col items-center justify-center pt-8 sm:pt-14 lg:pt-16 px-4 text-center max-w-5xl mx-auto">
        {/* Main Display Headline */}
        <h1 className="text-black font-dMSans text-3xl sm:text-5xl lg:text-[68px] font-semibold leading-[1.12] sm:leading-[1.1] lg:leading-[72px] tracking-[-0.015em] max-w-[1028px]">
          Transforming prompts into exquisite high-quality portraits
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-[#495057]/80 font-dMSans text-base sm:text-xl lg:text-[24px] font-normal leading-relaxed sm:leading-[32px] max-w-[660px] tracking-[0.02em]">
          Pioneering AI-powered solution designed to expedite and economize your
          profile production process
        </p>

        {/* Form Container */}
        <form
          onSubmit={handleGenerate}
          className="mt-7 sm:mt-9 flex flex-col items-center gap-4 w-full max-w-[540px]"
        >
          {/* Main Prompt Bar */}
          <div className="flex items-center justify-between w-full rounded-full bg-[#DADADA]/45 hover:bg-[#DADADA]/60 focus-within:bg-[#DADADA]/70 transition border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-sm">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter prompt"
              className="w-full bg-transparent px-3 text-sm sm:text-[15px] font-dMSans text-[#495057] placeholder-[#495057]/70 focus:outline-none tracking-[0.04em]"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center justify-center rounded-full bg-white px-5 py-2 sm:px-6 sm:py-2 text-xs sm:text-sm font-medium text-[#201D20] shadow-sm hover:shadow-md hover:bg-neutral-50 active:scale-95 transition cursor-pointer"
            >
              Generate
            </button>
          </div>

          {/* Parameter Pill Flags (--ar, --v, --stylize) */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Pill 1: --ar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("ar")}
                className="flex items-center gap-1.5 rounded-full bg-[#2C2B2E] px-3.5 py-1.5 text-xs sm:text-sm text-neutral-400 shadow-[0_2px_6px_rgba(38,40,46,0.3)] hover:bg-[#38373B] transition cursor-pointer"
              >
                <span>--ar</span>
                <span className="text-white font-medium">{aspectRatio}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "ar" ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="#AAAAAA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {activeDropdown === "ar" && (
                <div className="absolute top-full mt-2 left-0 z-50 min-w-[110px] rounded-xl bg-[#2C2B2E] p-1.5 shadow-xl border border-white/10 text-xs">
                  {["16:9", "9:16", "1:1", "4:5", "3:2"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAspectRatio(val);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 transition"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pill 2: --v */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("v")}
                className="flex items-center gap-1.5 rounded-full bg-[#2C2B2E] px-3.5 py-1.5 text-xs sm:text-sm text-neutral-400 shadow-[0_2px_6px_rgba(38,40,46,0.3)] hover:bg-[#38373B] transition cursor-pointer"
              >
                <span>--v</span>
                <span className="text-neutral-200 font-medium">{version}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "v" ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="#AAAAAA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {activeDropdown === "v" && (
                <div className="absolute top-full mt-2 left-0 z-50 min-w-[140px] rounded-xl bg-[#2C2B2E] p-1.5 shadow-xl border border-white/10 text-xs">
                  {["6.0 [alpha]", "5.2", "5.1", "Niji 6"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setVersion(val);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 transition"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pill 3: --stylize */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("stylize")}
                className="flex items-center gap-1.5 rounded-full bg-[#2C2B2E] px-3.5 py-1.5 text-xs sm:text-sm text-neutral-400 shadow-[0_2px_6px_rgba(38,40,46,0.3)] hover:bg-[#38373B] transition cursor-pointer"
              >
                <span>--stylize</span>
                <span className="text-white font-medium">{stylize}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`w-3 h-3 transition-transform duration-200 ${
                    activeDropdown === "stylize" ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="#AAAAAA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {activeDropdown === "stylize" && (
                <div className="absolute top-full mt-2 left-0 z-50 min-w-[100px] rounded-xl bg-[#2C2B2E] p-1.5 shadow-xl border border-white/10 text-xs">
                  {["100", "250", "500", "750", "1000"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setStylize(val);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-white hover:bg-white/10 transition"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* ========================================================= */}
      {/* 3. THE 5 ARCHED PORTRAIT CARDS ("UNION" CURVED AMPHITHEATER) */}
      {/* ========================================================= */}
      {/* Desktop Fixed Canvas Layout (Scales smoothly on desktop) */}
      <div className="hidden xl:block relative w-[1728px] h-[780px] mx-auto mt-6 pointer-events-none select-none left-1/2 -translate-x-1/2">
        {/* Card 1 (Far Left, Tall: w 340, h 677, top 20px in canvas) */}
        <div className="pointer-events-auto absolute left-0 top-[20px] w-[340px] h-[677px] rounded-t-[170px] rounded-b-[40px] overflow-hidden shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3 group border border-black/5 bg-neutral-100">
          <Image
            src={portraitOne}
            alt="AI Portrait Model 1"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 2 (Mid Left: w 346, h 506, top 191px in canvas) */}
        <div className="pointer-events-auto absolute left-[354px] top-[191px] w-[346px] h-[506px] rounded-t-[173px] rounded-b-[40px] overflow-hidden shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 group border border-black/5 bg-neutral-100">
          <Image
            src={portraitTwo}
            alt="AI Portrait Model 2"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 3 (Center, Low Arch: w 340, h 335, top 362px in canvas) */}
        <div className="pointer-events-auto absolute left-[714px] top-[362px] w-[340px] h-[335px] rounded-t-[170px] rounded-b-[40px] overflow-hidden shadow-lg transition-all duration-500 ease-out hover:-translate-y-3 group border border-black/5 bg-neutral-100">
          <Image
            src={portraitThree}
            alt="AI Portrait Model 3"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 4 (Mid Right: w 323, h 510, top 187px in canvas) */}
        <div className="pointer-events-auto absolute left-[1068px] top-[187px] w-[323px] h-[510px] rounded-t-[161px] rounded-b-[40px] overflow-hidden shadow-xl transition-all duration-500 ease-out hover:-translate-y-3 group border border-black/5 bg-neutral-100">
          <Image
            src={portraitFour}
            alt="AI Portrait Model 4"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 5 (Far Right, Tall: w 323, h 708, top -11px in canvas) */}
        <div className="pointer-events-auto absolute left-[1405px] top-[-11px] w-[323px] h-[708px] rounded-t-[161px] rounded-b-[40px] overflow-hidden shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3 group border border-black/5 bg-neutral-100">
          <Image
            src={portraitFive}
            alt="AI Portrait Model 5"
            fill
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Responsive Layout for Screens < 1280px (Laptops, Tablets & Mobile) */}
      <div className="xl:hidden relative w-full mt-10 px-4 pb-12">
        <div className="flex items-end justify-center gap-3 sm:gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {/* Card 1 */}
          <div className="shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-[280px] sm:h-[360px] md:h-[440px] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group">
            <Image
              src={portraitOne}
              alt="AI Portrait Model 1"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Card 2 */}
          <div className="shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-[220px] sm:h-[280px] md:h-[350px] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group">
            <Image
              src={portraitTwo}
              alt="AI Portrait Model 2"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Card 3 (Center dip) */}
          <div className="shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-[160px] sm:h-[210px] md:h-[260px] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group">
            <Image
              src={portraitThree}
              alt="AI Portrait Model 3"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Card 4 */}
          <div className="shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-[220px] sm:h-[280px] md:h-[350px] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group">
            <Image
              src={portraitFour}
              alt="AI Portrait Model 4"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {/* Card 5 */}
          <div className="shrink-0 w-[140px] sm:w-[180px] md:w-[220px] h-[280px] sm:h-[360px] md:h-[440px] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group">
            <Image
              src={portraitFive}
              alt="AI Portrait Model 5"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
