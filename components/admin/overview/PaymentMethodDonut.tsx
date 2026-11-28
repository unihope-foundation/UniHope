"use client";

import React from "react";
import { formatINR } from "@/components/admin/admin-utils";

export interface PaymentMethodItem {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

const DONUT_COLORS = ["#012A5F", "#12715B", "#F88C29", "#4A7AB5", "#94A3B8"];

export function PaymentMethodDonut({
  methods,
  totalAmount,
  totalCount,
}: {
  methods: PaymentMethodItem[];
  totalAmount: number;
  totalCount: number;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const segments = methods.reduce<
    Array<
      PaymentMethodItem & {
        color: string;
        dashLength: number;
        dashOffset: number;
      }
    >
  >((acc, item, idx) => {
    const prevSum = acc.reduce((sum, s) => sum + s.dashLength, 0);
    const ratio = totalAmount > 0 ? item.amount / totalAmount : 0;
    const dashLength = ratio * circumference;
    acc.push({
      ...item,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
      dashLength,
      dashOffset: -prevSum,
    });
    return acc;
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#012A5F]">
          Payment Methods
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          {totalCount} {totalCount === 1 ? "payment" : "payments"}
        </span>
      </div>

      {methods.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          No payment method data in period.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4 my-auto">
          {/* Donut SVG */}
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="16"
              />
              {segments.map((seg) => (
                <circle
                  key={seg.method}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={`${seg.dashLength} ${circumference}`}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span className="text-sm font-bold text-[#012A5F] tabular-nums leading-tight">
                {formatINR(totalAmount)}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                Total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2">
            {segments.map((seg) => (
              <div
                key={seg.method}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="truncate font-medium text-slate-700 capitalize">
                    {seg.method}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                  <span className="font-semibold text-[#012A5F]">
                    {formatINR(seg.amount)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {seg.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
