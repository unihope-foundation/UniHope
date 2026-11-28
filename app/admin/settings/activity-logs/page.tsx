"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Shield } from "lucide-react";
import { formatIstDateTime } from "@/components/admin/admin-utils";

export default function ActivityLogsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const logs = useQuery(api.admin.listAuditLogs, {
    actionFilter,
    limit: 150,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#012A5F] font-semibold">
          <Shield className="h-4 w-4 text-[#12715B]" />
          <span>Immutable Admin Audit Trail (Secrets &amp; tokens never logged)</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium"
        >
          <option value="all">All Actions</option>
          <option value="RECEIPT_DOWNLOADED">Receipt Downloaded</option>
          <option value="RECEIPT_EMAIL_RESENT">Receipt Email Resent</option>
          <option value="CSV_EXPORT">CSV Export</option>
          <option value="ADMIN_INVITED">Admin Invited</option>
          <option value="ADMIN_ROLE_CHANGED">Admin Role Changed</option>
          <option value="ADMIN_DEACTIVATED">Admin Deactivated</option>
          <option value="REFUND_RECORDED">Refund Recorded</option>
          <option value="CAMPAIGN_CREATED">Campaign Created</option>
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {logs === undefined ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              No administrative activity logged yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Admin Email</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F4F6F9]/80">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#012A5F]">
                      {log.adminEmail}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-[#12715B]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.resourceType}
                      {log.resourceId ? ` (${log.resourceId.slice(0, 10)}...)` : ""}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 max-w-md truncate">
                      {log.metadata || "—"}
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
