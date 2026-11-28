"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  formatINR,
  formatIstDateTime,
  StatusBadge,
} from "@/components/admin/admin-utils";

export default function DonorProfilePage() {
  const params = useParams<{ id: string }>();
  const donorKey = decodeURIComponent(params.id);
  const profile = useQuery(api.dashboard.getDonorProfile, { donorKey });

  if (profile === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#012A5F]" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-600">Donor profile not found.</p>
        <Link
          href="/admin/donors"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#012A5F] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Donors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/donors"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#012A5F]">
            {profile.donorName}
          </h2>
          <p className="text-xs text-gray-500">
            {profile.donorEmail} &bull; {profile.donorPhone || "No phone"}
          </p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">
            Lifetime Contribution
          </p>
          <p className="mt-2 text-2xl font-bold text-[#12715B]">
            {formatINR(profile.lifetimeContribution)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">
            Successful Donations
          </p>
          <p className="mt-2 text-2xl font-bold text-[#012A5F]">
            {profile.totalDonations}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">
            Average Donation
          </p>
          <p className="mt-2 text-2xl font-bold text-[#012A5F]">
            {formatINR(profile.avgDonation)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">
            First / Most Recent
          </p>
          <p className="mt-2 text-xs font-medium text-gray-800">
            First: {formatIstDateTime(profile.firstDonationAt)}
          </p>
          <p className="mt-1 text-xs font-medium text-gray-800">
            Latest: {formatIstDateTime(profile.lastDonationAt)}
          </p>
        </div>
      </div>

      {/* Donation & Receipt Timeline */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
          Donation &amp; Receipt Timeline
        </h3>
        <div className="mt-4 space-y-3">
          {profile.donations.map((d) => (
            <Link
              key={d._id}
              href={`/admin/donations/${d._id}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4 transition hover:border-[#012A5F]/30 hover:bg-white"
            >
              <div>
                <p className="font-mono text-sm font-bold text-[#012A5F]">
                  {d.resolvedReceiptNumber} — {formatINR(d.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {d.purpose} &bull; {formatIstDateTime(d.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={d.paymentStatus} />
                <StatusBadge status={d.receiptStatus} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Refund History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
          Refund History
        </h3>
        {profile.refunds.length === 0 ? (
          <p className="py-6 text-xs text-gray-500">
            No refunds recorded for this donor.
          </p>
        ) : (
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="py-2">Receipt #</th>
                <th className="py-2">Refund ID</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Reason</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profile.refunds.map((r) => (
                <tr key={r._id}>
                  <td className="py-2 font-mono font-semibold">{r.receiptNumber || "—"}</td>
                  <td className="py-2 font-mono">{r.razorpayRefundId || "—"}</td>
                  <td className="py-2 font-bold">{formatINR(r.refundedAmount)}</td>
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
    </div>
  );
}
