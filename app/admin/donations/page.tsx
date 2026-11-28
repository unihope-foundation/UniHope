"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePaginatedQuery, useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  Eye,
  Download,
  Mail,
  Copy,
  Filter,
  Loader2,
} from "lucide-react";
import {
  formatINR,
  formatIstDateTime,
  StatusBadge,
  PdfPreviewModal,
  ConfirmDialog,
  useAdminToast,
} from "@/components/admin/admin-utils";

function DonationsListContent() {
  const searchParams = useSearchParams();
  const { showToast } = useAdminToast();
  const access = useQuery(api.admin.getMyAdminAccess);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [purpose, setPurpose] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [receiptStatus, setReceiptStatus] = useState("all");
  const [refundStatus, setRefundStatus] = useState("all");
  const [sortBy, setSortBy] = useState<
    "latest" | "oldest" | "highest" | "lowest" | "receipt"
  >("latest");
  const [pageSize, setPageSize] = useState(20);

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

  const generatePdf = useAction(api.donations.generateReceiptPdfForAdmin);
  const resendReceipt = useAction(api.donations.resendDonationReceipt);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.dashboard.listDonationsPaginated,
    {
      search: debouncedSearch || undefined,
      purpose,
      paymentMethod,
      receiptStatus,
      refundStatus,
      sortBy,
    },
    { initialNumItems: pageSize },
  );

  const canWrite = access?.role === "owner" || access?.role === "admin";

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    showToast(`${label} copied to clipboard`, "info");
  };

  const handleViewPdf = async (
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
      showToast(
        err instanceof Error ? err.message : "Failed to generate PDF",
        "error",
      );
    }
  };

  const handleConfirmResend = async () => {
    if (!resendTarget) return;
    setResending(true);
    try {
      const res = await resendReceipt({ donationId: resendTarget.id });
      if (res.success) {
        showToast(
          `Receipt ${resendTarget.receiptNumber} resent to ${resendTarget.email}`,
          "success",
        );
      } else {
        showToast(res.error || "Failed to resend receipt email", "error");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to resend email",
        "error",
      );
    } finally {
      setResending(false);
      setResendTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filters Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search receipt #, donor name, email, phone, payment ID..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 focus:border-[#012A5F] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value="all">All Purposes</option>
              <option value="Education">Education</option>
              <option value="Food Support">Food Support</option>
              <option value="Medical Assistance">Medical Assistance</option>
              <option value="Community Development">Community Development</option>
              <option value="General Donation">General Donation</option>
              <option value="General Fund">General Fund</option>
            </select>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
              <option value="wallet">Wallet</option>
            </select>

            <select
              value={receiptStatus}
              onChange={(e) => setReceiptStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value="all">All Receipt Status</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="needs_review">Needs Review</option>
            </select>

            <select
              value={refundStatus}
              onChange={(e) => setRefundStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value="all">All Refund Status</option>
              <option value="none">No Refund</option>
              <option value="pending">Pending Refund</option>
              <option value="partially_refunded">Partial Refund</option>
              <option value="refunded">Full Refund</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value="latest">Latest Payment</option>
              <option value="oldest">Oldest Payment</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
              <option value="receipt">Receipt Number</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-medium"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {status === "LoadingFirstPage" ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              No donations found yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Receipt #</th>
                  <th className="px-4 py-3">Donor Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Captured Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Receipt Email</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((d) => (
                  <tr key={d._id} className="hover:bg-[#F4F6F9]/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#012A5F] whitespace-nowrap">
                      <Link
                        href={`/admin/donations/${d._id}`}
                        className="hover:underline"
                      >
                        {d.resolvedReceiptNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {d.anonymous ? "Anonymous Donor" : d.donorName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.donorEmail}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {d.donorPhone || "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#12715B] whitespace-nowrap">
                      {formatINR(d.amount)} {d.currency}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {d.purpose}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">
                      {d.paymentMethod || "Razorpay"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {d.razorpayPaymentId}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatIstDateTime(d.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.receiptStatus} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/donations/${d._id}`}
                          title="View Details"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#012A5F]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewPdf(
                              d._id,
                              d.resolvedReceiptNumber,
                              "preview",
                            )
                          }
                          title="Preview PDF Receipt"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#012A5F] cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() =>
                              setResendTarget({
                                id: d._id,
                                receiptNumber: d.resolvedReceiptNumber,
                                email: d.donorEmail,
                              })
                            }
                            title="Resend Receipt Email"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#12715B] cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(d.resolvedReceiptNumber, "Receipt number")
                          }
                          title="Copy Receipt Number"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#012A5F] cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {status === "CanLoadMore" && (
          <div className="border-t border-gray-100 p-4 text-center">
            <button
              type="button"
              onClick={() => loadMore(pageSize)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-xs font-semibold text-[#012A5F] hover:bg-gray-100 cursor-pointer"
            >
              Load more donations
            </button>
          </div>
        )}
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
        title="Resend Official Receipt Email"
        description={`Send the official PDF receipt (${resendTarget?.receiptNumber}) to ${resendTarget?.email}? The original receipt number will be preserved.`}
        confirmLabel="Resend Receipt"
        loading={resending}
        onConfirm={handleConfirmResend}
        onCancel={() => setResendTarget(null)}
      />
    </div>
  );
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading donations...</div>}>
      <DonationsListContent />
    </Suspense>
  );
}
