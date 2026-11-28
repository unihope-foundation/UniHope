"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Eye,
  Download,
  Mail,
  Copy,
  RotateCcw,
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

export default function DonationDetailPage() {
  const params = useParams<{ id: string }>();
  const donationId = params.id as Id<"donations">;
  const { showToast } = useAdminToast();

  const detail = useQuery(api.dashboard.getDonationDetail, { donationId });
  const access = useQuery(api.admin.getMyAdminAccess);
  const generatePdf = useAction(api.donations.generateReceiptPdfForAdmin);
  const resendReceipt = useAction(api.donations.resendDonationReceipt);
  const recordRefund = useMutation(api.dashboard.recordVerifiedRefundByAdmin);

  const [pdfModal, setPdfModal] = useState<{
    open: boolean;
    title: string;
    base64: string | null;
    filename: string;
    loading: boolean;
  }>({ open: false, title: "", base64: null, filename: "", loading: false });

  const [confirmResend, setConfirmResend] = useState(false);
  const [resending, setResending] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundIdInput, setRefundIdInput] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundStatus, setRefundStatus] = useState<"completed" | "pending" | "failed">("completed");
  const [savingRefund, setSavingRefund] = useState(false);

  const canWrite = access?.role === "owner" || access?.role === "admin";
  const isOwner = access?.role === "owner";

  if (detail === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#012A5F]" />
      </div>
    );
  }

  if (detail === null) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-600">Donation record not found.</p>
        <Link
          href="/admin/donations"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#012A5F] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Donations
        </Link>
      </div>
    );
  }

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    showToast(`${label} copied`, "info");
  };

  const handlePdf = async (mode: "preview" | "download") => {
    if (mode === "preview") {
      setPdfModal({
        open: true,
        title: `Receipt ${detail.resolvedReceiptNumber}`,
        base64: null,
        filename: `${detail.resolvedReceiptNumber}-UNIHOPE-Receipt.pdf`,
        loading: true,
      });
    }
    try {
      const res = await generatePdf({ donationId: detail._id, mode });
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
    setResending(true);
    try {
      const res = await resendReceipt({ donationId: detail._id });
      if (res.success) {
        showToast(`Receipt ${detail.resolvedReceiptNumber} resent`, "success");
      } else {
        showToast(res.error || "Failed to resend", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to resend", "error");
    } finally {
      setResending(false);
      setConfirmResend(false);
    }
  };

  const handleRecordRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRefund(true);
    try {
      await recordRefund({
        donationId: detail._id,
        razorpayRefundId: refundIdInput,
        refundedAmount: Number(refundAmount),
        reason: refundReason,
        status: refundStatus,
      });
      showToast("Refund record saved", "success");
      setRefundOpen(false);
      setRefundIdInput("");
      setRefundAmount("");
      setRefundReason("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to record refund", "error");
    } finally {
      setSavingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/donations"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#012A5F]">
              {detail.resolvedReceiptNumber}
            </h2>
            <p className="text-xs text-gray-500">
              Captured {formatIstDateTime(detail.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePdf("preview")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#012A5F] hover:bg-gray-50 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            View Receipt PDF
          </button>
          <button
            type="button"
            onClick={() => handlePdf("download")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#012A5F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#012048] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          {canWrite && (
            <button
              type="button"
              onClick={() => setConfirmResend(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12715B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0e5a48] cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" />
              Resend Receipt Email
            </button>
          )}
          <button
            type="button"
            onClick={() => handleCopy(detail.resolvedReceiptNumber, "Receipt number")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Receipt #
          </button>
          <button
            type="button"
            onClick={() => handleCopy(detail.razorpayPaymentId, "Payment ID")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Payment ID
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => setRefundOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Record Refund
            </button>
          )}
        </div>
      </div>

      {/* 4 Info Panels */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Donor Information
          </h3>
          <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
            <dt className="text-gray-500">Full Name</dt>
            <dd className="font-semibold text-gray-900">
              {detail.anonymous ? "Anonymous Donor" : detail.donorName}
            </dd>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-800 break-all">{detail.donorEmail}</dd>
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-800">{detail.donorPhone || "—"}</dd>
            <dt className="text-gray-500">Anonymous</dt>
            <dd>{detail.anonymous ? "Yes (Privacy Protected)" : "No"}</dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Payment Information
          </h3>
          <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
            <dt className="text-gray-500">Amount</dt>
            <dd className="font-bold text-[#12715B]">
              {formatINR(detail.amount)} {detail.currency}
            </dd>
            <dt className="text-gray-500">Purpose</dt>
            <dd className="font-medium text-gray-900">{detail.purpose}</dd>
            <dt className="text-gray-500">Payment Method</dt>
            <dd className="capitalize">{detail.paymentMethod || "Razorpay"}</dd>
            <dt className="text-gray-500">Payment Status</dt>
            <dd>
              <StatusBadge status={detail.paymentStatus} />
            </dd>
            <dt className="text-gray-500">Razorpay Payment ID</dt>
            <dd className="font-mono text-[11px]">{detail.razorpayPaymentId}</dd>
            <dt className="text-gray-500">Razorpay Order ID</dt>
            <dd className="font-mono text-[11px]">{detail.razorpayOrderId}</dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Receipt &amp; Email Delivery
          </h3>
          <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
            <dt className="text-gray-500">Receipt Number</dt>
            <dd className="font-mono font-bold text-[#012A5F]">
              {detail.resolvedReceiptNumber}
            </dd>
            <dt className="text-gray-500">Generated At</dt>
            <dd>
              {formatIstDateTime(detail.receiptGeneratedAt ?? detail.createdAt)}
            </dd>
            <dt className="text-gray-500">PDF Availability</dt>
            <dd className="text-[#12715B] font-semibold">Available (On-demand)</dd>
            <dt className="text-gray-500">Email Delivery Status</dt>
            <dd>
              <StatusBadge status={detail.receiptStatus} />
            </dd>
            <dt className="text-gray-500">Email Sent At</dt>
            <dd>
              {detail.receiptSentAt ? formatIstDateTime(detail.receiptSentAt) : "—"}
            </dd>
            <dt className="text-gray-500">Last Email Error</dt>
            <dd className="text-red-600">{detail.receiptError || "None"}</dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Refund Information
          </h3>
          <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
            <dt className="text-gray-500">Refund Status</dt>
            <dd>
              <StatusBadge status={detail.refundStatus || "none"} />
            </dd>
            <dt className="text-gray-500">Refunded Amount</dt>
            <dd className="font-semibold">
              {formatINR(detail.refundedAmount ?? 0)}
            </dd>
            <dt className="text-gray-500">Refund Reference</dt>
            <dd className="font-mono">{detail.refundReference || "—"}</dd>
            <dt className="text-gray-500">Refund Date</dt>
            <dd>
              {detail.refundedAt ? formatIstDateTime(detail.refundedAt) : "—"}
            </dd>
          </dl>
        </div>
      </div>

      {/* Email Attempt History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
          Email Delivery Attempt History
        </h3>
        {detail.emailLogs.length === 0 ? (
          <p className="py-6 text-xs text-gray-500">No email attempts logged yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-xs">
            <thead className="text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="py-2">Timestamp</th>
                <th className="py-2">Recipient</th>
                <th className="py-2">Triggered By</th>
                <th className="py-2">Status</th>
                <th className="py-2">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detail.emailLogs.map((log) => (
                <tr key={log._id}>
                  <td className="py-2">{formatIstDateTime(log.createdAt)}</td>
                  <td className="py-2">{log.recipient}</td>
                  <td className="py-2">{log.triggeredBy}</td>
                  <td className="py-2">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-2 text-red-600">{log.errorMessage || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Record Refund Modal (Owner only) */}
      {refundOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRefundOpen(false)}
        >
          <form
            onSubmit={handleRecordRefund}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-base font-bold text-[#012A5F]">
              Record Verified Refund
            </h3>
            <p className="text-xs text-gray-500">
              Records an authoritative Razorpay refund without altering the original
              receipt number ({detail.resolvedReceiptNumber}).
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Razorpay Refund ID
              </label>
              <input
                required
                value={refundIdInput}
                onChange={(e) => setRefundIdInput(e.target.value)}
                placeholder="rfnd_..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Refunded Amount (INR) — max {formatINR(detail.amount)}
              </label>
              <input
                required
                type="number"
                min={1}
                max={detail.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={refundStatus}
                onChange={(e) =>
                  setRefundStatus(e.target.value as typeof refundStatus)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason
              </label>
              <input
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Donor request / duplicate charge"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingRefund}
                className="rounded-lg bg-[#012A5F] px-4 py-2 text-xs font-semibold text-white"
              >
                {savingRefund ? "Saving..." : "Save Refund"}
              </button>
            </div>
          </form>
        </div>
      )}

      <PdfPreviewModal
        open={pdfModal.open}
        title={pdfModal.title}
        base64={pdfModal.base64}
        filename={pdfModal.filename}
        loading={pdfModal.loading}
        onClose={() => setPdfModal((p) => ({ ...p, open: false }))}
      />

      <ConfirmDialog
        open={confirmResend}
        title="Resend Official Receipt Email"
        description={`Send the official PDF receipt (${detail.resolvedReceiptNumber}) to ${detail.donorEmail}?`}
        confirmLabel="Resend Receipt"
        loading={resending}
        onConfirm={handleResend}
        onCancel={() => setConfirmResend(false)}
      />
    </div>
  );
}
