"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Loader2, ShieldAlert } from "lucide-react";
import {
  formatINR,
  formatIstDateTime,
  StatusBadge,
} from "@/components/admin/admin-utils";

export function PaymentAttemptsView({
  defaultStatus = "all",
}: {
  defaultStatus?: string;
}) {
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [searchInput, setSearchInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const attempts = useQuery(api.dashboard.listPaymentAttempts, {
    statusFilter,
    search: debounced || undefined,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <ShieldAlert className="h-4 w-4 text-[#F88C29] shrink-0" />
        <span>
          Failed, cancelled, pending, and expired attempts never receive receipt
          numbers and are excluded from donation revenue.
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search order ID, payment ID, email, error code..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-[#012A5F] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium"
          >
            <option value="all">All Attempt Statuses</option>
            <option value="failed">Failed</option>
            <option value="initiated">Initiated</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <Link
            href="/admin/failed-payments"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Failed Only View
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {attempts === undefined ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              No unsuccessful payment attempts recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Date (IST)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Error Code / Step</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map((a) => (
                  <tr key={a._id} className="hover:bg-[#F4F6F9]/80">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDateTime(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {a.donorName || "—"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {a.donorEmail || a.donorPhone || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatINR(a.amount)}
                    </td>
                    <td className="px-4 py-3">{a.purpose}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {a.razorpayOrderId}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {a.razorpayPaymentId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-red-700">
                        {a.errorCode || "—"}
                      </span>
                      {a.errorStep && (
                        <span className="block text-[10px] text-gray-500">
                          {a.errorSource || "gateway"} / {a.errorStep}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {a.errorDescription || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
