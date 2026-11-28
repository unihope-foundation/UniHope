"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import { Menu, Search, RefreshCw, ChevronRight } from "lucide-react";
import { AdminNotificationMenu } from "@/components/admin/AdminNotificationMenu";
import { formatIstDateTime } from "@/components/admin/admin-utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  lastUpdatedAt?: number;
  actions?: React.ReactNode;
  onOpenMobileSidebar: () => void;
}

export function AdminHeader({
  title,
  subtitle,
  breadcrumbs,
  lastUpdatedAt,
  actions,
  onOpenMobileSidebar,
}: AdminHeaderProps) {
  const access = useQuery(api.admin.getMyAdminAccess);
  const role = access?.isAdmin ? access.role : undefined;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/admin/donations?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-xs px-4 sm:px-6">
      {/* Left: Mobile Trigger + Title & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#012A5F] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-base sm:text-lg font-bold tracking-tight text-[#012A5F]">
              {title}
            </h1>
            {subtitle && (
              <span className="hidden xl:inline-block truncate text-xs text-slate-400 border-l border-slate-200 pl-2.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Search, Last Updated, Actions, Alerts, Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <form
          onSubmit={handleGlobalSearch}
          className="hidden md:flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 focus-within:border-[#012A5F] focus-within:bg-white transition-colors"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt, donor, ID..."
            className="w-40 lg:w-52 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </form>

        {lastUpdatedAt && (
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500">
            <RefreshCw className="h-3 w-3 text-[#12715B]" />
            <span>Updated {formatIstDateTime(lastUpdatedAt)}</span>
          </div>
        )}

        {actions}

        <AdminNotificationMenu />

        {role && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#012A5F]">
              {role}
            </span>
          </div>
        )}

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-1 ring-slate-200",
            },
          }}
        />
      </div>
    </header>
  );
}
