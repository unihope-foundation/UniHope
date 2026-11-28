"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface KpiItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  deltaPct?: number | null;
  comparisonText?: string;
  href?: string;
}

export function KpiSummaryRow({ items }: { items: KpiItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {items.map((item) => {
          const Icon = item.icon;
          const hasDelta =
            item.deltaPct !== undefined &&
            item.deltaPct !== null &&
            Number.isFinite(item.deltaPct);
          const isPositive = hasDelta && (item.deltaPct as number) > 0;
          const isNegative = hasDelta && (item.deltaPct as number) < 0;

          return (
            <div
              key={item.label}
              className="p-4 sm:p-5 flex flex-col justify-between gap-2.5 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 ${
                    item.iconBg ?? "bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${item.iconColor ?? "text-[#012A5F]"}`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 truncate">
                  {item.label}
                </span>
              </div>

              <p className="text-2xl font-bold tracking-tight text-[#012A5F] tabular-nums">
                {item.value}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {hasDelta ? (
                  <>
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        isPositive
                          ? "text-[#12715B]"
                          : isNegative
                            ? "text-red-600"
                            : "text-slate-500"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : isNegative ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {(item.deltaPct as number).toFixed(1)}%
                    </span>
                    <span className="text-slate-400 truncate">
                      {item.comparisonText ?? "vs prior period"}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 truncate">
                    {item.comparisonText ?? "No prior baseline"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface SecondaryMetric {
  label: string;
  value: string;
  tone?: "navy" | "teal" | "amber" | "red";
}

export function SecondaryMetricsStrip({
  metrics,
}: {
  metrics: SecondaryMetric[];
}) {
  const toneText = {
    navy: "text-[#012A5F]",
    teal: "text-[#12715B]",
    amber: "text-[#F88C29]",
    red: "text-red-600",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-2xs"
        >
          <span className="text-xs font-medium text-slate-500">{m.label}</span>
          <span
            className={`text-sm font-bold tabular-nums ${
              toneText[m.tone ?? "navy"]
            }`}
          >
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
}
