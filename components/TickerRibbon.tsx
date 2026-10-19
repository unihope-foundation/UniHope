import React from "react";

function TickerContent() {
  return (
    <div className="ticker-ribbon-group flex shrink-0 items-center justify-around px-4 text-xs font-extrabold uppercase tracking-widest text-[#0A2540] sm:text-sm">
      <span>TOGETHER, WE BUILD HOPE</span>
      <span className="mx-2">•</span>
      <span>EVERY DREAM COUNTS</span>
      <span className="mx-2">•</span>
      <span>TRANSFORMING LIVES</span>
      <span className="hidden mx-2 sm:inline">•</span>
      <span className="hidden sm:inline">TOGETHER, WE BUILD HOPE</span>
      <span className="hidden mx-2 md:inline">•</span>
      <span className="hidden md:inline">EVERY DREAM COUNTS</span>
    </div>
  );
}

export function TickerRibbon() {
  return (
    <div className="ticker-ribbon w-full overflow-hidden bg-[#FF8000] py-3.5 shadow-xs select-none">
      <div className="ticker-ribbon-track flex whitespace-nowrap">
        <TickerContent />
        <div aria-hidden="true" className="flex">
          <TickerContent />
        </div>
      </div>
    </div>
  );
}

export default TickerRibbon;
