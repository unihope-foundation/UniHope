import React from "react";

export function TickerRibbon() {
  return (
    <div className="w-full overflow-hidden bg-[#F88C29] py-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)] select-none">
      <div className="animate-ticker flex items-center">
        {Array.from({ length: 4 }).map((_, repeatIdx) => (
          <div key={repeatIdx} className="flex shrink-0 items-center gap-6 px-3">
            <span className="font-outfit text-base font-bold uppercase tracking-[0.05em] text-[#171717] sm:text-xl">
              TOGETHER, WE BUILD HOPE
            </span>
            <span className="font-outfit text-xs font-bold text-[#171717]">•</span>
            <span className="font-outfit text-base font-bold uppercase tracking-[0.05em] text-[#171717] sm:text-xl">
              EVERY DREAM COUNTS
            </span>
            <span className="font-outfit text-xs font-bold text-[#171717]">•</span>
            <span className="font-outfit text-base font-bold uppercase tracking-[0.05em] text-[#171717] sm:text-xl">
              TRANSFORMING LIVES
            </span>
            <span className="font-outfit text-xs font-bold text-[#171717]">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TickerRibbon;
