"use client";

import React, { useMemo, useState } from "react";
import { formatINR } from "@/components/admin/admin-utils";

export interface TrendPoint {
  label: string;
  amount: number;
  count: number;
}

export type GranularityOption = "daily" | "weekly" | "monthly" | "yearly";

interface DonationTrendChartProps {
  series: TrendPoint[];
  totalRefundedAmount: number;
  granularity: GranularityOption;
  onGranularityChange: (g: GranularityOption) => void;
}

function formatCompactAxis(val: number): string {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${Math.round(val)}`;
}

export function DonationTrendChart({
  series,
  totalRefundedAmount,
  granularity,
  onGranularityChange,
}: DonationTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chart = useMemo(() => {
    const width = 680;
    const height = 240;
    const padLeft = 56;
    const padRight = 20;
    const padTop = 18;
    const padBottom = 32;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;

    const maxVal = Math.max(100, ...series.map((p) => p.amount));
    // Round up nicely
    const niceMax = Math.ceil(maxVal * 1.15);

    const points = series.map((p, idx) => {
      const x =
        series.length === 1
          ? padLeft + innerW / 2
          : padLeft + (idx / (series.length - 1)) * innerW;
      const y = padTop + innerH - (p.amount / niceMax) * innerH;
      return { ...p, x, y };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`
        : "";

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      y: padTop + innerH - ratio * innerH,
      value: ratio * niceMax,
    }));

    return { width, height, padLeft, padTop, innerH, innerW, points, linePath, areaPath, yTicks };
  }, [series]);

  const activePoint =
    hoveredIdx !== null && chart.points[hoveredIdx]
      ? chart.points[hoveredIdx]
      : null;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#012A5F]">
            Donation Trends
          </h2>
          {totalRefundedAmount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F88C29]" />
              Refunded {formatINR(totalRefundedAmount)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">
            Time Interval:
          </span>
          <select
            value={granularity}
            onChange={(e) =>
              onGranularityChange(e.target.value as GranularityOption)
            }
            aria-label="Chart granularity"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-[#012A5F] focus:outline-none cursor-pointer"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Chart Area */}
      {series.length === 0 ? (
        <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-400">
          No captured donations in the selected date range.
        </div>
      ) : (
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className="w-full h-60 overflow-visible select-none"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="unihopeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#012A5F" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#012A5F" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {chart.yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={chart.padLeft}
                  x2={chart.padLeft + chart.innerW}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={chart.padLeft - 8}
                  y={tick.y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {formatCompactAxis(tick.value)}
                </text>
              </g>
            ))}

            {/* Area & Line */}
            {chart.areaPath && (
              <path d={chart.areaPath} fill="url(#unihopeAreaGrad)" />
            )}
            {chart.linePath && (
              <path
                d={chart.linePath}
                fill="none"
                stroke="#012A5F"
                strokeWidth={2.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical hover guideline */}
            {activePoint && (
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={chart.padTop}
                y2={chart.padTop + chart.innerH}
                stroke="#F88C29"
                strokeDasharray="3 3"
                strokeWidth={1.2}
              />
            )}

            {/* Points & invisible hover targets */}
            {chart.points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              const showXLabel =
                chart.points.length <= 7 ||
                idx === 0 ||
                idx === chart.points.length - 1 ||
                idx % Math.ceil(chart.points.length / 6) === 0;

              return (
                <g key={pt.label}>
                  {showXLabel && (
                    <text
                      x={pt.x}
                      y={chart.padTop + chart.innerH + 18}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-medium"
                    >
                      {pt.label}
                    </text>
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3}
                    className={
                      isHovered
                        ? "fill-[#F88C29] stroke-white stroke-2"
                        : "fill-[#012A5F] stroke-white stroke-[1.5]"
                    }
                  />
                  <rect
                    x={pt.x - Math.max(14, chart.innerW / Math.max(1, chart.points.length * 2))}
                    y={chart.padTop}
                    width={Math.max(28, chart.innerW / Math.max(1, chart.points.length))}
                    height={chart.innerH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {activePoint && (
            <div
              className="pointer-events-none absolute top-2 z-10 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md text-xs"
              style={{
                left: `${Math.min(78, Math.max(8, (activePoint.x / chart.width) * 100))}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-bold text-[#012A5F] tabular-nums">
                {formatINR(activePoint.amount)}
              </p>
              <p className="text-[11px] text-slate-500">
                {activePoint.label} · {activePoint.count}{" "}
                {activePoint.count === 1 ? "donation" : "donations"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
