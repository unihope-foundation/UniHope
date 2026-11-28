"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Eye, Loader2 } from "lucide-react";
import { formatINR, formatIstDate } from "@/components/admin/admin-utils";

export default function DonorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const donors = useQuery(api.dashboard.listDonors, {
    search: debounced || undefined,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search donors by name, email, or phone..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-[#012A5F] focus:bg-white focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-500">
          Matched by normalized email (primary) and phone (secondary). Anonymous
          privacy preserved.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {donors === undefined ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
            </div>
          ) : donors.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              No donations found yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Total Donations</th>
                  <th className="px-4 py-3">Lifetime Contribution</th>
                  <th className="px-4 py-3">First Donation</th>
                  <th className="px-4 py-3">Last Donation</th>
                  <th className="px-4 py-3">Donor Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donors.map((donor) => (
                  <tr key={donor.donorKey} className="hover:bg-[#F4F6F9]/80">
                    <td className="px-4 py-3 font-semibold text-[#012A5F]">
                      {donor.donorName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{donor.donorEmail}</td>
                    <td className="px-4 py-3 text-gray-600">{donor.donorPhone || "—"}</td>
                    <td className="px-4 py-3 font-semibold">{donor.totalDonations}</td>
                    <td className="px-4 py-3 font-bold text-[#12715B]">
                      {formatINR(donor.lifetimeContribution)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDate(donor.firstDonationAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDate(donor.lastDonationAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          donor.donorType === "Repeat"
                            ? "bg-emerald-50 text-[#12715B]"
                            : donor.donorType === "Anonymous"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-50 text-[#012A5F]"
                        }`}
                      >
                        {donor.donorType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/donors/${encodeURIComponent(donor.donorKey)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-[#012A5F] hover:bg-gray-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Profile
                      </Link>
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
