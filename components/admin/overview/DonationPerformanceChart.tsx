"use client";

import React from "react";
import { formatINR } from "@/components/admin/admin-utils";
import type { PurposeItem } from "@/components/admin/overview/PurposeBreakdownChart";

export function DonationPerformanceChart({
  purposes,
  totalAmount,
}: {
  purposes: PurposeItem[];
  totalAmount: number;
}) {
  const topPurposes = purposes.slice(0, 5);
  const maxAmount = Math.max(1, ...topPurposes.map((p) => p.amount));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#012A5F]">
          Purpose Performance
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          Share of total
        </span>
      </div>

      {topPurposes.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          No donation performance data yet.
        </div>
      ) : (
        <div className="space-y-3.5 my-auto">
          {topPurposes.map((item, idx) => {
            const pct =
              totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;
            const barWidth = Math.max(6, (item.amount / maxAmount) * 100);
            const barColor =
              idx === 0
                ? "bg-[#012A5F]"
                : idx === 1
                  ? "bg-[#12715B]"
                  : "bg-[#F88C29]";

            return (
              <div key={item.purpose} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate font-medium text-slate-700">
                    {item.purpose}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="text-[11px] text-slate-400">
                      {formatINR(item.amount)}
                    </span>
                    <span className="font-semibold text-[#012A5F] w-9 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
