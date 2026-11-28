"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  formatINR,
  formatIstDate,
  StatusBadge,
} from "@/components/admin/admin-utils";

export interface RecentDonationRow {
  _id: string;
  receiptNumber: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  purpose: string;
  paymentMethod: string;
  createdAt: number;
  receiptStatus: string;
  paymentStatus: string;
}

export function RecentDonationsTable({
  donations,
  purposeFilter,
}: {
  donations: RecentDonationRow[];
  purposeFilter?: string | null;
}) {
  const router = useRouter();

  const filtered = purposeFilter
    ? donations.filter(
        (d) => (d.purpose || "General Donation") === purposeFilter,
      )
    : donations;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#012A5F]">
            Recent Donations
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {purposeFilter
              ? `Filtered by purpose: ${purposeFilter}`
              : "Latest verified Razorpay captures & receipt delivery status"}
          </p>
        </div>
        <Link
          href="/admin/donations"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#012A5F] hover:bg-slate-50 transition-colors"
        >
          View All Donations
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No donations match the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Donor</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((d) => (
                <tr
                  key={d._id}
                  onClick={() => router.push(`/admin/donations/${d._id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-[#012A5F] whitespace-nowrap">
                    {d.receiptNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800 truncate max-w-[170px]">
                      {d.donorName}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#012A5F] tabular-nums whitespace-nowrap">
                    {formatINR(d.amount)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                    {d.purpose || "General Donation"}
                  </td>
                  <td className="py-3 px-4 text-slate-500 capitalize whitespace-nowrap">
                    {d.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {formatIstDate(d.createdAt)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={d.paymentStatus} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={d.receiptStatus} />
                  </td>
                  <td
                    className="py-3 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/admin/donations/${d._id}`}
                      className="font-semibold text-[#012A5F] hover:text-[#F88C29] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
