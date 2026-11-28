"use client";

import React, { createContext, useContext, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, Loader2, Download } from "lucide-react";

export function formatINR(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatIstDateTime(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(ms));
}

export function formatIstDate(ms: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  }).format(new Date(ms));
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    captured: "bg-emerald-50 text-[#12715B] border-emerald-200",
    sent: "bg-emerald-50 text-[#12715B] border-emerald-200",
    completed: "bg-emerald-50 text-[#12715B] border-emerald-200",
    active: "bg-emerald-50 text-[#12715B] border-emerald-200",
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    sending: "bg-sky-50 text-sky-700 border-sky-200",
    initiated: "bg-slate-100 text-slate-700 border-slate-200",
    needs_review: "bg-orange-50 text-orange-800 border-orange-200",
    partially_refunded: "bg-orange-50 text-orange-800 border-orange-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    refunded: "bg-purple-50 text-purple-700 border-purple-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    expired: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const cls = styles[s] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize whitespace-nowrap ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Toast System ────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType) => void;
}>({ showToast: () => {} });

export function useAdminToast() {
  return useContext(ToastContext);
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3.5 shadow-lg text-sm font-medium bg-white ${
              t.type === "success"
                ? "border-emerald-200 text-[#12715B]"
                : t.type === "error"
                  ? "border-red-200 text-red-700"
                  : "border-slate-200 text-[#012A5F]"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
            {t.type === "info" && <Info className="h-4 w-4 mt-0.5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── PDF Preview Modal ───────────────────────────────────────────────────────
export function PdfPreviewModal({
  open,
  title,
  base64,
  filename,
  loading,
  onClose,
}: {
  open: boolean;
  title: string;
  base64: string | null;
  filename: string;
  loading?: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const dataUrl = base64 ? `data:application/pdf;base64,${base64}` : "";

  const handleDownload = () => {
    if (!base64) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 bg-[#012A5F] text-white">
          <h3 className="text-sm font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {base64 && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F88C29] px-3 py-1.5 text-xs font-semibold text-[#012A5F] hover:bg-[#e77d1c] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-gray-600">
              <Loader2 className="h-7 w-7 animate-spin text-[#012A5F]" />
              <span className="text-sm font-medium">Generating official PDF receipt...</span>
            </div>
          ) : base64 ? (
            <iframe
              title={title}
              src={dataUrl}
              className="h-full w-full border-0"
            />
          ) : (
            <p className="text-sm text-gray-500">Unable to load PDF preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Dialog ─────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-[#012A5F]">{title}</h3>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white cursor-pointer disabled:opacity-60 ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#12715B] hover:bg-[#0e5a48]"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
