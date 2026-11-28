"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Users,
  MailCheck,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { formatINR, formatIstDateTime } from "@/components/admin/admin-utils";
import {
  KpiSummaryRow,
  SecondaryMetricsStrip,
  type KpiItem,
} from "@/components/admin/overview/DashboardKpiCard";
import {
  DonationTrendChart,
  type GranularityOption,
} from "@/components/admin/overview/DonationTrendChart";
import { PurposeBreakdownChart } from "@/components/admin/overview/PurposeBreakdownChart";
import { PaymentMethodDonut } from "@/components/admin/overview/PaymentMethodDonut";
import { DonationActivityCalendar } from "@/components/admin/overview/DonationActivityCalendar";
import { DonationPerformanceChart } from "@/components/admin/overview/DonationPerformanceChart";
import { RecentDonationsTable } from "@/components/admin/overview/RecentDonationsTable";

type RangePreset = "7d" | "30d" | "90d" | "12m" | "all" | "custom";

function computeDeltaPct(
  current: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined ||
    previous <= 0
  ) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function AdminDashboardClient() {
  const [preset, setPreset] = useState<RangePreset>("all");
  const [granularity, setGranularity] = useState<GranularityOption>("daily");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [anchorNow] = useState<number>(() => Date.now());

  const range = useMemo(() => {
    const end = anchorNow;
    if (preset === "7d") {
      return { startMs: end - 7 * 86400000, endMs: end };
    }
    if (preset === "30d") {
      return { startMs: end - 30 * 86400000, endMs: end };
    }
    if (preset === "90d") {
      return { startMs: end - 90 * 86400000, endMs: end };
    }
    if (preset === "12m") {
      return { startMs: end - 365 * 86400000, endMs: end };
    }
    if (preset === "custom" && customStart && customEnd) {
      const s = new Date(`${customStart}T00:00:00+05:30`).getTime();
      const e = new Date(`${customEnd}T23:59:59+05:30`).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
        return { startMs: s, endMs: e };
      }
    }
    return { startMs: undefined, endMs: undefined };
  }, [preset, customStart, customEnd, anchorNow]);

  const metrics = useQuery(api.dashboard.getOverviewMetrics, {
    startMs: range.startMs,
    endMs: range.endMs,
    granularity,
  });

  const kpiItems: KpiItem[] = useMemo(() => {
    if (!metrics) return [];
    const k = metrics.kpis;
    return [
      {
        label: "Total Donations",
        value: formatINR(k.grossDonations),
        icon: IndianRupee,
        iconBg: "bg-[#012A5F]/6",
        iconColor: "text-[#012A5F]",
        deltaPct: computeDeltaPct(k.grossDonations, k.prevGrossDonations),
        comparisonText:
          k.prevGrossDonations !== null
            ? `vs ${formatINR(k.prevGrossDonations)} prior`
            : "All-time verified total",
      },
      {
        label: "Monthly Donation Growth",
        value:
          k.monthlyGrowthPct !== null
            ? `${k.monthlyGrowthPct > 0 ? "+" : ""}${k.monthlyGrowthPct.toFixed(1)}%`
            : formatINR(k.thisMonthDonations),
        icon: TrendingUp,
        iconBg: "bg-[#12715B]/10",
        iconColor: "text-[#12715B]",
        deltaPct: k.monthlyGrowthPct,
        comparisonText:
          k.lastMonthDonations > 0
            ? `vs ${formatINR(k.lastMonthDonations)} last mo`
            : `${formatINR(k.thisMonthDonations)} this month`,
      },
      {
        label: "Successful Payments",
        value: String(k.successfulPayments),
        icon: CheckCircle2,
        iconBg: "bg-[#12715B]/10",
        iconColor: "text-[#12715B]",
        deltaPct: computeDeltaPct(
          k.successfulPayments,
          k.prevSuccessfulCount,
        ),
        comparisonText:
          k.prevSuccessfulCount !== null
            ? `vs ${k.prevSuccessfulCount} prior`
            : "Captured via Razorpay",
      },
      {
        label: "Total Donors",
        value: String(k.totalDonors),
        icon: Users,
        iconBg: "bg-[#012A5F]/6",
        iconColor: "text-[#012A5F]",
        deltaPct: computeDeltaPct(k.totalDonors, k.prevTotalDonors),
        comparisonText:
          k.prevTotalDonors !== null
            ? `vs ${k.prevTotalDonors} prior`
            : "Unique contributors",
      },
      {
        label: "Receipt Delivery Rate",
        value:
          k.receiptDeliveryRate !== null
            ? `${k.receiptDeliveryRate.toFixed(0)}%`
            : "—",
        icon: MailCheck,
        iconBg: "bg-amber-50",
        iconColor: "text-[#F88C29]",
        deltaPct:
          k.receiptDeliveryRate !== null && k.prevReceiptDeliveryRate !== null
            ? k.receiptDeliveryRate - k.prevReceiptDeliveryRate
            : null,
        comparisonText: `${k.receiptsSentCount} of ${k.successfulPayments} emailed`,
      },
    ];
  }, [metrics]);

  return (
    <div className="space-y-5">
      {/* Top Toolbar: Last Updated + Date Range Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Real-time financial analytics, Razorpay captures &amp; 80G receipt delivery
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {metrics?.lastUpdatedAt && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-2xs">
              <RefreshCw className="h-3 w-3 text-[#12715B]" />
              <span>Last updated: {formatIstDateTime(metrics.lastUpdatedAt)}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as RangePreset)}
              aria-label="Date range preset"
              className="bg-transparent text-xs font-semibold text-[#012A5F] focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="12m">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Optional Custom Date Inputs */}
      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <span className="text-xs font-semibold text-[#012A5F]">
            Custom IST Range:
          </span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
          />
        </div>
      )}

      {!metrics ? (
        <div className="space-y-5">
          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      ) : (
        <>
          {/* 5-Card Horizontal KPI Row */}
          <KpiSummaryRow items={kpiItems} />

          {/* Compact Secondary Operational Strip */}
          <SecondaryMetricsStrip
            metrics={[
              {
                label: "Today's Donations",
                value: formatINR(metrics.kpis.todaysDonations),
                tone: "teal",
              },
              {
                label: "Failed Payments",
                value: String(metrics.kpis.failedPayments),
                tone: metrics.kpis.failedPayments > 0 ? "red" : "navy",
              },
              {
                label: "Total Refunded",
                value: formatINR(metrics.kpis.totalRefundedAmount),
                tone: metrics.kpis.totalRefundedAmount > 0 ? "amber" : "navy",
              },
              {
                label: "Net Donations",
                value: formatINR(metrics.kpis.netDonations),
                tone: "navy",
              },
            ]}
          />

          {/* Main Analytics Section: 2 Columns (Trend + Purpose Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <DonationTrendChart
                series={metrics.trendSeries}
                totalRefundedAmount={metrics.kpis.totalRefundedAmount}
                granularity={granularity}
                onGranularityChange={setGranularity}
              />
            </div>

            <PurposeBreakdownChart
              purposes={metrics.purposeBreakdown}
              totalAmount={metrics.kpis.grossDonations}
              selectedPurpose={selectedPurpose}
              onSelectPurpose={setSelectedPurpose}
            />
          </div>

          {/* Lower Analytics Section: 3 Balanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <PaymentMethodDonut
              methods={metrics.paymentMethodBreakdown}
              totalAmount={metrics.kpis.grossDonations}
              totalCount={metrics.kpis.successfulPayments}
            />

            <DonationActivityCalendar />

            <DonationPerformanceChart
              purposes={metrics.purposeBreakdown}
              totalAmount={metrics.kpis.grossDonations}
            />
          </div>

          {/* Recent Donations Table */}
          <RecentDonationsTable
            donations={metrics.recentDonations}
            purposeFilter={selectedPurpose}
          />
        </>
      )}
    </div>
  );
}

export default AdminDashboardClient;
