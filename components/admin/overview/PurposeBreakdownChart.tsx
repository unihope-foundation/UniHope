"use client";

import React from "react";
import { formatINR } from "@/components/admin/admin-utils";

export interface PurposeItem {
  purpose: string;
  amount: number;
  count: number;
}

const SEGMENT_COLORS = [
  "#012A5F",
  "#12715B",
  "#F88C29",
  "#3B6EA5",
  "#5BA890",
  "#94A3B8",
];

interface PurposeBreakdownChartProps {
  purposes: PurposeItem[];
  totalAmount: number;
  selectedPurpose: string | null;
  onSelectPurpose: (purpose: string | null) => void;
}

export function PurposeBreakdownChart({
  purposes,
  totalAmount,
  selectedPurpose,
  onSelectPurpose,
}: PurposeBreakdownChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-[#012A5F]">
            Donations by Purpose
          </h2>
          {selectedPurpose && (
            <button
              type="button"
              onClick={() => onSelectPurpose(null)}
              className="text-[11px] font-medium text-[#F88C29] hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold tracking-tight text-[#012A5F] tabular-nums">
            {formatINR(totalAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Across {purposes.length}{" "}
            {purposes.length === 1 ? "active purpose" : "active purposes"}
          </p>
        </div>

        {/* Segmented Proportional Bar */}
        {totalAmount > 0 && purposes.length > 0 && (
          <div className="flex h-3 w-full gap-1 overflow-hidden rounded-lg bg-slate-100 p-0.5 mb-5">
            {purposes.slice(0, 6).map((p, idx) => {
              const pct = Math.max(4, (p.amount / totalAmount) * 100);
              return (
                <div
                  key={p.purpose}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
                  }}
                  title={`${p.purpose}: ${formatINR(p.amount)}`}
                  className="h-full rounded-[4px] transition-all"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Purpose Rows */}
      {purposes.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400">
          No purpose breakdown data yet.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {purposes.map((p, idx) => {
            const pct =
              totalAmount > 0 ? Math.round((p.amount / totalAmount) * 100) : 0;
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            const isSelected = selectedPurpose === p.purpose;

            return (
              <button
                key={p.purpose}
                type="button"
                onClick={() =>
                  onSelectPurpose(isSelected ? null : p.purpose)
                }
                className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#012A5F]/6 ring-1 ring-[#012A5F]/20"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate text-xs font-medium text-slate-700">
                    {p.purpose}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs tabular-nums">
                  <span className="font-semibold text-[#012A5F]">
                    {formatINR(p.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400">({pct}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
