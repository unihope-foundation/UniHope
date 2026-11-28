"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { formatIstDateTime } from "@/components/admin/admin-utils";

export default function SystemSettingsPage() {
  const health = useQuery(api.dashboard.getSystemHealth);

  if (health === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#012A5F]" />
      </div>
    );
  }

  const serviceRows = [
    { label: "Clerk Authentication", ok: health.services.clerkConfigured },
    { label: "Convex Backend Connection", ok: health.services.convexConnected },
    { label: "Razorpay Webhook Secret", ok: health.services.razorpayWebhookConfigured },
    { label: "Resend Email Service", ok: health.services.resendConfigured },
    { label: "PDF Receipt Generator", ok: health.services.pdfServiceReady },
    { label: "Organization Logo Storage", ok: health.services.logoConfigured },
    { label: "Founder Signature Storage", ok: health.services.signatureConfigured },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border border-[#12715B]/20 bg-[#12715B]/10 px-4 py-3 text-xs text-[#12715B]">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>
          Only safe boolean configuration status is shown here. Secret keys and
          credentials are never exposed to the browser.
        </span>
      </div>

      {/* Service Health */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
          Service &amp; Integration Status
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {serviceRows.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3.5"
            >
              <span className="text-xs font-semibold text-[#012A5F]">
                {s.label}
              </span>
              {s.ok ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#12715B]">
                  <CheckCircle2 className="h-4 w-4" />
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                  <XCircle className="h-4 w-4" />
                  Missing Env
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Webhook & Email Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Razorpay Webhook Health
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-xs">
            <dt className="text-gray-500">Last Processed Webhook</dt>
            <dd className="font-medium">
              {health.webhookHealth.lastSuccessfulAt
                ? formatIstDateTime(health.webhookHealth.lastSuccessfulAt)
                : "No events recorded yet"}
            </dd>
            <dt className="text-gray-500">Processed Events (recent 50)</dt>
            <dd className="font-bold text-[#12715B]">
              {health.webhookHealth.processedCount}
            </dd>
            <dt className="text-gray-500">Duplicate Events Handled</dt>
            <dd className="font-semibold">
              {health.webhookHealth.duplicateCount}
            </dd>
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-[#012A5F] border-b border-gray-100 pb-2">
            Resend Email Health
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-xs">
            <dt className="text-gray-500">Last Successful Receipt Email</dt>
            <dd className="font-medium">
              {health.emailHealth.lastSentAt
                ? formatIstDateTime(health.emailHealth.lastSentAt)
                : "No emails logged yet"}
            </dd>
            <dt className="text-gray-500">Pending Receipt Emails</dt>
            <dd className="font-bold text-amber-700">
              {health.emailHealth.pendingCount}
            </dd>
            <dt className="text-gray-500">Failed Receipt Emails</dt>
            <dd className="font-bold text-red-600">
              {health.emailHealth.failedDonationCount}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
