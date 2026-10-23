"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import marcusImg from "@/assets/hero/candidate-marcus.jpg";
import marinaImg from "@/assets/hero/candidate-marina.jpg";
import jamesImg from "@/assets/hero/candidate-james.jpg";
import shanayaImg from "@/assets/hero/candidate-shanaya.jpg";

export interface HeroOption4Props {
  className?: string;
  onGetStarted?: () => void;
  onNavClick?: (item: string) => void;
  onSelectCandidate?: (name: string) => void;
}

export default function HeroOption4({
  className = "",
  onGetStarted,
  onNavClick,
  onSelectCandidate,
}: HeroOption4Props) {
  const [activeNav, setActiveNav] = useState("Home");

  const candidates = [
    {
      id: "marcus",
      name: "Marcus L.",
      role: "Mobile Developer",
      tags: ["iOS / Swift", "React Native"],
      image: marcusImg,
      isTall: true,
    },
    {
      id: "marina",
      name: "Marina J.",
      role: "Digital Marketer",
      tags: ["Growth & SEO", "Paid Media"],
      image: marinaImg,
      isTall: false,
    },
    {
      id: "james",
      name: "James Marco",
      role: "Product Designer",
      tags: ["Design Systems", "Figma"],
      image: jamesImg,
      isTall: false,
    },
    {
      id: "shanaya",
      name: "Shanaya John",
      role: "UI/UX Designer",
      tags: ["User Journey", "Wireframing"],
      image: shanayaImg,
      isTall: true,
    },
  ];

  return (
    <div
      className={`relative min-h-screen w-full bg-[#FFFFFF] text-[#495057] overflow-hidden select-none font-plusJakartaSans ${className}`}
    >
      {/* Subtle background ambient mesh glow */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-[#024751]/5 via-[#DDFC79]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR (Deep Teal #024751)          */}
      {/* ========================================================= */}
      <header className="relative z-30 flex items-center justify-between w-full px-6 py-5 sm:px-12 lg:px-20 bg-[#024751] shadow-md">
        {/* Brand Logo (White) */}
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
              fill="white"
            />
            <path
              d="M24.7329 23.6499V0H28.9143V23.6499H24.7329Z"
              fill="white"
            />
            <path
              d="M34.2063 23.6499V0H50.7312V3.81342H38.3877V10.8716H48.9583V14.685H38.3877V23.6499H34.2063Z"
              fill="white"
            />
            <path
              d="M53.6602 23.6499V6.02119H57.3733L57.6075 8.32932C58.0535 7.6603 58.5552 7.14738 59.1128 6.79057C59.6926 6.41146 60.3058 6.14385 60.9526 5.98774C61.6216 5.83164 62.2906 5.75358 62.9596 5.75358C63.2049 5.75358 63.4279 5.75358 63.6286 5.75358C63.8517 5.75358 64.0301 5.76473 64.1639 5.78703V9.66736H63.0934C61.9338 9.66736 60.9526 9.89037 60.1497 10.3364C59.3469 10.7824 58.7448 11.418 58.3434 12.2431C57.942 13.0682 57.7413 14.0829 57.7413 15.2871V23.6499H53.6602Z"
              fill="white"
            />
            <path
              d="M74.3578 31.7116C72.9975 31.7116 71.6706 31.5221 70.3771 31.143C69.106 30.7861 67.9241 30.1729 66.8313 29.3031L68.3032 26.0249C69.0614 26.6271 69.9088 27.0954 70.8455 27.4299C71.7821 27.7867 72.8079 27.9651 73.923 27.9651C75.6847 27.9651 76.967 27.5191 77.7698 26.6271C78.595 25.735 79.0075 24.5196 79.0075 22.9809V21.6763C78.6061 22.1892 78.1155 22.6129 77.5357 22.9474C76.9559 23.2819 76.3314 23.5273 75.6624 23.6834C74.9934 23.8395 74.3132 23.9175 73.6219 23.9175C71.9047 23.9175 70.5332 23.5719 69.5074 22.8805C68.5039 22.1669 67.7791 21.1968 67.3331 19.9703C66.8871 18.7215 66.6641 17.3054 66.6641 15.722V6.02119H70.7117V14.8188C70.7117 15.4432 70.7563 16.0788 70.8455 16.7255C70.9347 17.3723 71.1131 17.9632 71.3807 18.4984C71.6483 19.0337 72.0385 19.4685 72.5515 19.803C73.0867 20.1152 73.7892 20.2714 74.6589 20.2714C75.7962 20.2714 76.6771 19.9926 77.3015 19.4351C77.9259 18.8776 78.3496 18.1528 78.5727 17.2608C78.818 16.3687 78.9406 15.4209 78.9406 14.4174V6.02119H83.0216V21.9774C83.0216 23.4715 82.8655 24.8095 82.5533 25.9915C82.2411 27.1957 81.7394 28.2216 81.048 29.069C80.3567 29.9164 79.4647 30.5631 78.3719 31.0091C77.2792 31.4775 75.9412 31.7116 74.3578 31.7116Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Center Links (White font-inter) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {["Home", "Pricing", "Features"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setActiveNav(item);
                if (onNavClick) onNavClick(item);
              }}
              className={`font-inter text-base lg:text-lg transition cursor-pointer ${
                activeNav === item
                  ? "text-white font-semibold underline underline-offset-8"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right CTA Button (Lime #DDFC79) */}
        <button
          type="button"
          onClick={onGetStarted}
          className="rounded-lg sm:rounded-xl bg-[#DDFC79] hover:bg-[#cfee65] active:scale-95 transition-all duration-200 px-6 sm:px-8 py-3 text-[#000] font-plusJakartaSans text-sm sm:text-base font-semibold shadow-sm hover:shadow-md cursor-pointer"
        >
          Get Started
        </button>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO HEADLINE & CTA SECTION                             */}
      {/* ========================================================= */}
      <section className="relative z-20 flex flex-col items-center justify-center pt-14 sm:pt-20 px-4 text-center max-w-5xl mx-auto">
        {/* Main Headline */}
        <h1 className="text-[#495057] font-plusJakartaSans text-4xl sm:text-6xl lg:text-[68px] font-semibold leading-[1.08] tracking-tight max-w-[960px]">
          Find the best people for candidates in your startup
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-[#495057]/80 font-plusJakartaSans text-lg sm:text-2xl font-medium leading-relaxed max-w-[939px]">
          Discover and hire vetted high-performing talent across engineering,
          product, design, and growth to power your startup.
        </p>

        {/* Center Primary Action Button */}
        <button
          type="button"
          onClick={onGetStarted}
          className="mt-7 sm:mt-9 rounded-xl bg-[#DDFC79] hover:bg-[#cfee65] active:scale-95 transition-all duration-200 px-8 sm:px-10 py-3.5 sm:py-4 text-[#000] font-plusJakartaSans text-base sm:text-lg font-semibold shadow-md hover:shadow-lg cursor-pointer"
        >
          Get Started
        </button>
      </section>

      {/* ========================================================= */}
      {/* 3. 4-CANDIDATE CARDS (CONCAVE CRADLE LAYOUT)               */}
      {/* Card 1 & 4 are Tall (576px), Card 2 & 3 are Compact (449px)*/}
      {/* ========================================================= */}
      {/* Desktop Panoramic Fixed Container (>= 1280px) */}
      <div className="hidden xl:block relative w-[1640px] h-[640px] mx-auto mt-8 select-none left-1/2 -translate-x-1/2">
        {/* Card 1: Marcus L. - Mobile Developer (Left Tall: w 380, h 576, top 0) */}
        <div
          onClick={() => onSelectCandidate && onSelectCandidate("Marcus L.")}
          className="absolute left-[30px] top-0 w-[380px] h-[576px] rounded-[52.8px] bg-[#024751] overflow-hidden shadow-2xl p-4 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-3 cursor-pointer group"
        >
          {/* Top Candidate Badge */}
          <div className="pt-4 px-2 text-center">
            <h3 className="text-white font-plusJakartaSans text-xl font-bold leading-tight">
              Marcus L.
            </h3>
            <p className="text-[#DDFC79] font-plusJakartaSans text-sm font-medium mt-0.5">
              Mobile Developer
            </p>
          </div>

          {/* Candidate Portrait */}
          <div className="relative w-full h-[430px] rounded-[36px] overflow-hidden shadow-inner">
            <Image
              src={marcusImg}
              alt="Marcus L. Mobile Developer"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card 2: Marina J. - Digital Marketer (Center-Left Compact: w 380, h 449, top 127px) */}
        <div
          onClick={() => onSelectCandidate && onSelectCandidate("Marina J.")}
          className="absolute left-[440px] top-[127px] w-[380px] h-[449px] rounded-[52.8px] bg-[#024751] overflow-hidden shadow-xl p-4 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-3 cursor-pointer group"
        >
          {/* Top Candidate Badge */}
          <div className="pt-2 px-2 text-center">
            <h3 className="text-white font-plusJakartaSans text-xl font-bold leading-tight">
              Marina J.
            </h3>
            <p className="text-[#DDFC79] font-plusJakartaSans text-sm font-medium mt-0.5">
              Digital Marketer
            </p>
          </div>

          {/* Candidate Portrait */}
          <div className="relative w-full h-[330px] rounded-[32px] overflow-hidden shadow-inner">
            <Image
              src={marinaImg}
              alt="Marina J. Digital Marketer"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card 3: James Marco - Product Designer (Center-Right Compact: w 380, h 449, top 127px) */}
        <div
          onClick={() => onSelectCandidate && onSelectCandidate("James Marco")}
          className="absolute left-[850px] top-[127px] w-[380px] h-[449px] rounded-[52.8px] bg-[#024751] overflow-hidden shadow-xl p-4 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-3 cursor-pointer group"
        >
          {/* Top Candidate Badge */}
          <div className="pt-2 px-2 text-center">
            <h3 className="text-white font-plusJakartaSans text-xl font-bold leading-tight">
              James Marco
            </h3>
            <p className="text-[#DDFC79] font-plusJakartaSans text-sm font-medium mt-0.5">
              Product Designer
            </p>
          </div>

          {/* Candidate Portrait */}
          <div className="relative w-full h-[330px] rounded-[32px] overflow-hidden shadow-inner">
            <Image
              src={jamesImg}
              alt="James Marco Product Designer"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card 4: Shanaya John - UI/UX Designer (Right Tall: w 380, h 576, top 0) */}
        <div
          onClick={() => onSelectCandidate && onSelectCandidate("Shanaya John")}
          className="absolute left-[1260px] top-0 w-[380px] h-[576px] rounded-[52.8px] bg-[#024751] overflow-hidden shadow-2xl p-4 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-3 cursor-pointer group"
        >
          {/* Top Candidate Badge */}
          <div className="pt-4 px-2 text-center">
            <h3 className="text-white font-plusJakartaSans text-xl font-bold leading-tight">
              Shanaya John
            </h3>
            <p className="text-[#DDFC79] font-plusJakartaSans text-sm font-medium mt-0.5">
              UI/UX Designer
            </p>
          </div>

          {/* Candidate Portrait */}
          <div className="relative w-full h-[430px] rounded-[36px] overflow-hidden shadow-inner">
            <Image
              src={shanayaImg}
              alt="Shanaya John UI/UX Designer"
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Responsive Layout for Screens < 1280px (Laptops, Tablets & Mobile) */}
      <div className="xl:hidden relative w-full mt-10 px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => onSelectCandidate && onSelectCandidate(cand.name)}
              className="rounded-[40px] bg-[#024751] overflow-hidden shadow-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
            >
              <div className="pt-2 pb-3 text-center">
                <h3 className="text-white font-plusJakartaSans text-lg font-bold">
                  {cand.name}
                </h3>
                <p className="text-[#DDFC79] font-plusJakartaSans text-xs font-medium">
                  {cand.role}
                </p>
              </div>
              <div className="relative w-full h-[280px] sm:h-[320px] rounded-[28px] overflow-hidden shadow-inner">
                <Image
                  src={cand.image}
                  alt={cand.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
