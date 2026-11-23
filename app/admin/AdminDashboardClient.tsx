"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft, ShieldCheck, Timer } from "lucide-react";
import { ADMIN_TAB_SESSION_KEY } from "./AdminAuthGuard";

export default function AdminDashboardClient() {
  const access = useQuery(api.admin.getMyAdminAccess);
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLeaveToWebsite = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ADMIN_TAB_SESSION_KEY);
    }
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(ADMIN_TAB_SESSION_KEY);
    }
    await signOut({ redirectUrl: "/sign-in" });
    router.push("/sign-in");
  };

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                UNIHOPE Foundation Admin Dashboard
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                {access?.role?.toUpperCase() || "OWNER"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Signed in as <span className="font-medium text-gray-800">{access?.email || "..."}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLeaveToWebsite}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 shadow-sm"
              title="Return to public website (logs out admin session)"
            >
              <ArrowLeft className="h-4 w-4 text-gray-500" />
              Website
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 hover:border-red-300 shadow-sm"
              title="Sign out of Admin Dashboard"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>

            <UserButton />
          </div>
        </div>

        {/* Security Session Banner */}
        <div className="flex items-center justify-between rounded-lg bg-blue-50/70 border border-blue-100 px-4 py-2.5 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">High-Security Session Active:</span>
            <span>Auto-logout on 15m inactivity, tab close, or exiting admin page.</span>
          </div>
          <span className="hidden sm:inline-block font-medium text-blue-700">Protected</span>
        </div>
      </div>
    </div>
  );
}
