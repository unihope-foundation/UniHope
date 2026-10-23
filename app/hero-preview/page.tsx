"use client";

import React, { useState } from "react";
import HeroOption1 from "@/components/hero/HeroOption1";
import HeroOption2 from "@/components/hero/HeroOption2";
import HeroOption3 from "@/components/hero/HeroOption3";
import HeroOption4 from "@/components/hero/HeroOption4";

export default function HeroPreviewPage() {
  const [selectedConcept, setSelectedConcept] = useState<1 | 2 | 3 | 4>(4);

  return (
    <main className="w-full min-h-screen bg-white relative">
      {/* ========================================================= */}
      {/* FLOATING CONCEPT SWITCHER (Top Bar for easy comparison)   */}
      {/* ========================================================= */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[#19181A]/90 backdrop-blur-md shadow-2xl border border-white/10 text-xs overflow-x-auto max-w-[95vw] no-scrollbar">
        {/* Concept 1 */}
        <button
          type="button"
          onClick={() => setSelectedConcept(1)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
            selectedConcept === 1
              ? "bg-white text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              selectedConcept === 1 ? "bg-emerald-500" : "bg-neutral-600"
            }`}
          />
          1: AI Studio
        </button>

        {/* Concept 2 */}
        <button
          type="button"
          onClick={() => setSelectedConcept(2)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
            selectedConcept === 2
              ? "bg-[#29839D] text-white shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              selectedConcept === 2 ? "bg-white" : "bg-neutral-600"
            }`}
          />
          2: Path to Success
        </button>

        {/* Concept 3 */}
        <button
          type="button"
          onClick={() => setSelectedConcept(3)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
            selectedConcept === 3
              ? "bg-[#EAA945] text-black shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              selectedConcept === 3 ? "bg-black" : "bg-neutral-600"
            }`}
          />
          3: Mental Wellness
        </button>

        {/* Concept 4 */}
        <button
          type="button"
          onClick={() => setSelectedConcept(4)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium transition cursor-pointer whitespace-nowrap ${
            selectedConcept === 4
              ? "bg-[#DDFC79] text-[#024751] font-semibold shadow-sm"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              selectedConcept === 4 ? "bg-[#024751] animate-pulse" : "bg-neutral-600"
            }`}
          />
          4: Startup Talent
        </button>
      </div>

      {/* ========================================================= */}
      {/* ACTIVE HERO PREVIEW                                       */}
      {/* ========================================================= */}
      <div className="w-full pt-16 sm:pt-14">
        {selectedConcept === 1 && <HeroOption1 />}
        {selectedConcept === 2 && <HeroOption2 />}
        {selectedConcept === 3 && <HeroOption3 />}
        {selectedConcept === 4 && <HeroOption4 />}
      </div>
    </main>
  );
}
