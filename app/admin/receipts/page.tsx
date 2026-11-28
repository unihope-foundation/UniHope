"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Search, Eye, Download, Mail, Loader2, FileCheck2 } from "lucide-react";
import {
  formatINR,
  formatIstDateTime,
  StatusBadge,
  PdfPreviewModal,
  ConfirmDialog,
  useAdminToast,
} from "@/components/admin/admin-utils";

export default function ReceiptsPage() {
  const { showToast } = useAdminToast();
  const access = useQuery(api.admin.getMyAdminAccess);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const data = useQuery(api.dashboard.listReceipts, {
    statusFilter,
    search: debounced || undefined,
  });

  const generatePdf = useAction(api.donations.generateReceiptPdfForAdmin);
  const resendReceipt = useAction(api.donations.resendDonationReceipt);

  const [pdfModal, setPdfModal] = useState<{
    open: boolean;
    title: string;
    base64: string | null;
    filename: string;
    loading: boolean;
  }>({ open: false, title: "", base64: null, filename: "", loading: false });

  const [resendTarget, setResendTarget] = useState<{
    id: Id<"donations">;
    receiptNumber: string;
    email: string;
  } | null>(null);
  const [resending, setResending] = useState(false);

  const canWrite = access?.role === "owner" || access?.role === "admin";

  const handlePdf = async (
    donationId: Id<"donations">,
    receiptNumber: string,
    mode: "preview" | "download",
  ) => {
    if (mode === "preview") {
      setPdfModal({
        open: true,
        title: `Receipt ${receiptNumber}`,
        base64: null,
        filename: `${receiptNumber}-UNIHOPE-Receipt.pdf`,
        loading: true,
      });
    }
    try {
      const res = await generatePdf({ donationId, mode });
      if (mode === "preview") {
        setPdfModal({
          open: true,
          title: `Receipt ${res.receiptNumber}`,
          base64: res.base64,
          filename: res.filename,
          loading: false,
        });
      } else {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${res.base64}`;
        link.download = res.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloaded ${res.filename}`, "success");
      }
    } catch (err) {
      setPdfModal((p) => ({ ...p, open: false, loading: false }));
      showToast(err instanceof Error ? err.message : "PDF failed", "error");
    }
  };

  const handleResend = async () => {
    if (!resendTarget) return;
    setResending(true);
    try {
      const res = await resendReceipt({ donationId: resendTarget.id });
      if (res.success) {
        showToast(`Receipt ${resendTarget.receiptNumber} resent`, "success");
      } else {
        showToast(res.error || "Resend failed", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Resend failed", "error");
    } finally {
      setResending(false);
      setResendTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Yearly Sequential Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(data?.counters ?? []).map((c) => (
          <div
            key={c._id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-gray-500">
                IST Year {c.year} Counter
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[#012A5F]">
                UH-{c.year}-WEB{String(c.lastSequence).padStart(2, "0")}
              </p>
            </div>
            <FileCheck2 className="h-6 w-6 text-[#12715B]" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search receipt #, donor, payment ID..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-[#012A5F] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium"
        >
          <option value="all">All Delivery Statuses</option>
          <option value="sent">Sent</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {data === undefined ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
            </div>
          ) : data.receipts.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              No donations found yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Donor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Seq</th>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Generated (IST)</th>
                  <th className="px-4 py-3">Email Status</th>
                  <th className="px-4 py-3">Retries</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.receipts.map((r) => (
                  <tr key={r._id} className="hover:bg-[#F4F6F9]/80">
                    <td className="px-4 py-3 font-mono font-bold text-[#012A5F]">
                      <Link href={`/admin/donations/${r._id}`} className="hover:underline">
                        {r.receiptNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.donorName}</p>
                      <p className="text-[11px] text-gray-500">{r.donorEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#12715B]">
                      {formatINR(r.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.receiptYear}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {r.receiptSequence !== null
                        ? String(r.receiptSequence).padStart(2, "0")
                        : "Historical"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      {r.razorpayPaymentId}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.receiptStatus} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.emailRetryCount}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePdf(r._id, r.receiptNumber, "preview")}
                          title="Preview PDF"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#012A5F] cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePdf(r._id, r.receiptNumber, "download")}
                          title="Download PDF"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#012A5F] cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() =>
                              setResendTarget({
                                id: r._id,
                                receiptNumber: r.receiptNumber,
                                email: r.donorEmail,
                              })
                            }
                            title="Resend Email"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#12715B] cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PdfPreviewModal
        open={pdfModal.open}
        title={pdfModal.title}
        base64={pdfModal.base64}
        filename={pdfModal.filename}
        loading={pdfModal.loading}
        onClose={() => setPdfModal((p) => ({ ...p, open: false }))}
      />

      <ConfirmDialog
        open={!!resendTarget}
        title="Resend Receipt Email"
        description={`Resend ${resendTarget?.receiptNumber} to ${resendTarget?.email} without generating a new receipt number?`}
        confirmLabel="Resend"
        loading={resending}
        onConfirm={handleResend}
        onCancel={() => setResendTarget(null)}
      />
    </div>
  );
}
