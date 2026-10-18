import React from "react";

function TickerContent() {
  return (
    <>
      <span>TOGETHER, WE BUILD HOPE</span>
      <span className="mx-2">•</span>
      <span>EVERY DREAM COUNTS</span>
      <span className="mx-2">•</span>
      <span>TRANSFORMING LIVES</span>
      <span className="hidden sm:inline mx-2">•</span>
      <span className="hidden sm:inline">TOGETHER, WE BUILD HOPE</span>
      <span className="hidden md:inline mx-2">•</span>
      <span className="hidden md:inline">EVERY DREAM COUNTS</span>
    </>
  );
}

export function TickerRibbon() {
  return (
    <div className="w-full bg-[#FF8000] py-3.5 overflow-hidden select-none shadow-xs">
      <div className="ticker-track">
        <div className="ticker-group flex whitespace-nowrap text-xs sm:text-sm font-extrabold tracking-widest text-[#0A2540] uppercase justify-around px-4">
          <TickerContent />
        </div>
        <div
          aria-hidden="true"
          className="ticker-group flex whitespace-nowrap text-xs sm:text-sm font-extrabold tracking-widest text-[#0A2540] uppercase justify-around px-4"
        >
          <TickerContent />
        </div>
      </div>
    </div>
  );
}
