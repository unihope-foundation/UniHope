"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Bell,
  AlertTriangle,
  FileWarning,
  ServerCrash,
  CheckCircle2,
} from "lucide-react";
import { formatIstDateTime } from "@/components/admin/admin-utils";

export function AdminNotificationMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = useQuery(api.dashboard.getAdminNotifications, {});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = data?.items ?? [];
  const count = data?.unreadCount ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Admin notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#012A5F] transition-colors cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F88C29] px-1 text-[10px] font-bold text-white shadow-xs">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-[#012A5F]">
                Operational Alerts
              </p>
              <p className="text-[11px] text-slate-500">
                Failed payments, receipt issues & webhooks
              </p>
            </div>
            {count > 0 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                {count} active
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <CheckCircle2 className="h-7 w-7 text-[#12715B] mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  All systems healthy
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No recent failed payments or receipt errors.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const Icon =
                  item.type === "failed_payment"
                    ? AlertTriangle
                    : item.type === "receipt_attention"
                      ? FileWarning
                      : ServerCrash;
                const badgeColor =
                  item.type === "failed_payment"
                    ? "bg-red-50 text-red-600"
                    : item.type === "receipt_attention"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-700";

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${badgeColor}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatIstDateTime(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
