"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { AdminToastProvider } from "@/components/admin/admin-utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader, BreadcrumbItem } from "@/components/admin/AdminHeader";

interface AdminShellProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  lastUpdatedAt?: number;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const ROUTE_TITLES: Array<{ prefix: string; title: string; label: string }> = [
  { prefix: "/admin/donations", title: "Donations", label: "Donations" },
  { prefix: "/admin/donors", title: "Donors", label: "Donors" },
  {
    prefix: "/admin/payment-attempts",
    title: "Payment Attempts",
    label: "Payment Attempts",
  },
  {
    prefix: "/admin/failed-payments",
    title: "Failed Payments",
    label: "Failed Payments",
  },
  { prefix: "/admin/receipts", title: "Receipts", label: "Receipts" },
  { prefix: "/admin/reports", title: "Financial Reports", label: "Reports" },
  { prefix: "/admin/campaigns", title: "Campaigns", label: "Campaigns" },
  {
    prefix: "/admin/settings/users",
    title: "Admin Users",
    label: "Admin Users",
  },
  {
    prefix: "/admin/settings/activity-logs",
    title: "Activity Logs",
    label: "Activity Logs",
  },
  { prefix: "/admin/settings", title: "Settings", label: "Settings" },
];

export function AdminShell({
  title,
  subtitle,
  breadcrumbs,
  lastUpdatedAt,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  // Default slim icon rail (matching the SaaS financial analytics reference)
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const resolvedMeta = useMemo(() => {
    if (title) {
      return {
        title,
        breadcrumbs: breadcrumbs ?? [{ label: "Admin", href: "/admin" }, { label: title }],
      };
    }
    const matched = ROUTE_TITLES.find((r) => pathname.startsWith(r.prefix));
    if (matched) {
      return {
        title: matched.title,
        breadcrumbs: [
          { label: "Admin", href: "/admin" },
          { label: matched.label },
        ],
      };
    }
    return {
      title: "Donation Analytics",
      breadcrumbs: [{ label: "Admin" }, { label: "Overview" }],
    };
  }, [pathname, title, breadcrumbs]);

  const handleLogout = () => {
    void signOut({ redirectUrl: "/admin/login" });
  };

  return (
    <AdminToastProvider>
      <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900">
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onLogout={handleLogout}
        />

        <div className="flex flex-1 flex-col min-w-0">
          <AdminHeader
            title={resolvedMeta.title}
            subtitle={subtitle}
            breadcrumbs={resolvedMeta.breadcrumbs}
            lastUpdatedAt={lastUpdatedAt}
            actions={actions}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1480px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}

export default AdminShell;
