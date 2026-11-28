"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  CreditCard,
  AlertTriangle,
  FileText,
  BarChart3,
  Megaphone,
  ShieldCheck,
  History,
  Settings,
  ExternalLink,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchExact?: boolean;
}

export const MAIN_NAV: NavLinkItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, matchExact: true },
  { label: "Donations", href: "/admin/donations", icon: IndianRupee },
  { label: "Donors", href: "/admin/donors", icon: Users },
  {
    label: "Payment Attempts",
    href: "/admin/payment-attempts",
    icon: CreditCard,
  },
  {
    label: "Failed Payments",
    href: "/admin/failed-payments",
    icon: AlertTriangle,
  },
  { label: "Receipts", href: "/admin/receipts", icon: FileText },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export const MANAGEMENT_NAV: NavLinkItem[] = [
  { label: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
  { label: "Admin Users", href: "/admin/settings/users", icon: ShieldCheck },
  {
    label: "Activity Logs",
    href: "/admin/settings/activity-logs",
    icon: History,
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, matchExact: true },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavLinkItem) => {
    if (item.matchExact) return pathname === item.href;
    if (item.href === "/admin") return pathname === "/admin";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const renderGroup = (title: string, items: NavLinkItem[]) => (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${
              collapsed ? "justify-center px-0 mx-auto w-10 h-10" : ""
            } ${
              active
                ? "bg-[#012A5F] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#012A5F]"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                active
                  ? "text-[#F88C29]"
                  : "text-slate-500 group-hover:text-[#012A5F]"
              }`}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[72px]" : "w-60"}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center border-b border-slate-200/80 px-3 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2.5 min-w-0"
            title="UNIHOPE Admin Overview"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#012A5F] p-1.5 shadow-xs">
              <Image
                src="/logo.svg"
                alt="UNIHOPE"
                width={26}
                height={26}
                className="h-full w-full object-contain brightness-0 invert"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-[#012A5F]">
                  UNIHOPE
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-[#F88C29]">
                  Finance Admin
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle row */}
        <div
          className={`hidden lg:flex items-center border-b border-slate-100 px-3 py-2 ${
            collapsed ? "justify-center" : "justify-end"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#012A5F] cursor-pointer transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
          {renderGroup("Main", MAIN_NAV)}
          <div className="mx-2 border-t border-slate-100" />
          {renderGroup("Management", MANAGEMENT_NAV)}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-200/80 p-2.5 space-y-1">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "Public Website" : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#012A5F] transition-colors ${
              collapsed ? "justify-center px-0 mx-auto w-10 h-10" : ""
            }`}
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Public Website</span>}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
              collapsed ? "justify-center px-0 mx-auto w-10 h-10" : ""
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
