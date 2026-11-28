"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download, Printer, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  formatINR,
  formatIstDateTime,
  StatusBadge,
  useAdminToast,
} from "@/components/admin/admin-utils";

export default function ReportsPage() {
  const { showToast } = useAdminToast();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [purpose, setPurpose] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [exporting, setExporting] = useState(false);

  const startMs = fromDate
    ? new Date(`${fromDate}T00:00:00+05:30`).getTime()
    : undefined;
  const endMs = toDate
    ? new Date(`${toDate}T23:59:59.999+05:30`).getTime()
    : undefined;

  const data = useQuery(api.dashboard.getReportsData, {
    startMs,
    endMs,
    purpose,
    paymentMethod,
  });

  const exportCsv = useMutation(api.dashboard.exportDonationsCsv);

  const handleExport = async (excelBom: boolean) => {
    setExporting(true);
    try {
      const res = await exportCsv({
        startMs,
        endMs,
        purpose,
        reportType: excelBom ? "excel_csv" : "csv",
      });
      const content = excelBom ? `\uFEFF${res.csv}` : res.csv;
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unihope-donations-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${res.rowCount} records`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Exports */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              From Date (IST)
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              To Date (IST)
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            >
              <option value="all">All Purposes</option>
              {(data?.distinctPurposes ?? []).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#012A5F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#012048] cursor-pointer disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => handleExport(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12715B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0e5a48] cursor-pointer disabled:opacity-60"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#012A5F] hover:bg-gray-50 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      {data === undefined ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#012A5F]" />
        </div>
      ) : (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-gray-500 font-semibold">Gross Donations</p>
              <p className="mt-2 text-2xl font-bold text-[#012A5F]">
                {formatINR(data.summary.grossDonations)}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {data.summary.successfulCount} successful payments
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-gray-500 font-semibold">Completed Refunds</p>
              <p className="mt-2 text-2xl font-bold text-purple-700">
                {formatINR(data.summary.completedRefunds)}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {data.summary.refundCount} refund record(s)
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-gray-500 font-semibold">Net Donations</p>
              <p className="mt-2 text-2xl font-bold text-[#12715B]">
                {formatINR(data.summary.netDonations)}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">Gross minus refunds</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-gray-500 font-semibold">
                Failed Attempts / Receipt Delivery
              </p>
              <p className="mt-2 text-2xl font-bold text-red-600">
                {data.summary.failedCount} failed
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Receipts: {data.receiptSummary.sent} sent, {data.receiptSummary.pending} pending,{" "}
                {data.receiptSummary.failed} failed
              </p>
            </div>
          </div>

          {/* Distributions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
                Monthly Comparison
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                {data.monthlyComparison.length === 0 ? (
                  <p className="py-6 text-gray-500">No monthly data.</p>
                ) : (
                  data.monthlyComparison.map((m) => (
                    <div key={m.month} className="flex justify-between py-1">
                      <span className="font-medium">{m.month}</span>
                      <span className="font-bold text-[#12715B]">
                        {formatINR(m.gross)} ({m.count})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
                Payment Method Distribution
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                {data.paymentMethods.length === 0 ? (
                  <p className="py-6 text-gray-500">No payment method data.</p>
                ) : (
                  data.paymentMethods.map((pm) => (
                    <div key={pm.method} className="flex justify-between py-1">
                      <span className="capitalize font-medium">{pm.method}</span>
                      <span className="font-bold text-[#012A5F]">
                        {formatINR(pm.amount)} ({pm.count})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
                Purpose Distribution
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                {data.purposeDistribution.length === 0 ? (
                  <p className="py-6 text-gray-500">No purpose data.</p>
                ) : (
                  data.purposeDistribution.map((p) => (
                    <div key={p.purpose} className="flex justify-between py-1">
                      <span className="font-medium truncate pr-2">{p.purpose}</span>
                      <span className="font-bold text-[#12715B] shrink-0">
                        {formatINR(p.amount)} ({p.count})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Refund Report Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
              Refund Report
            </h3>
            {data.refunds.length === 0 ? (
              <p className="py-6 text-xs text-gray-500">
                No refunds recorded in the selected period.
              </p>
            ) : (
              <table className="mt-3 w-full text-left text-xs">
                <thead className="text-gray-500 uppercase border-b border-gray-100">
                  <tr>
                    <th className="py-2">Receipt #</th>
                    <th className="py-2">Refund ID</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Reason</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.refunds.map((r) => (
                    <tr key={r._id}>
                      <td className="py-2 font-mono font-bold">{r.receiptNumber || "—"}</td>
                      <td className="py-2 font-mono">{r.razorpayRefundId || "—"}</td>
                      <td className="py-2 capitalize">{r.refundType}</td>
                      <td className="py-2 font-semibold">{formatINR(r.refundedAmount)}</td>
                      <td className="py-2">{r.reason}</td>
                      <td className="py-2">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-2">{formatIstDateTime(r.requestedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
