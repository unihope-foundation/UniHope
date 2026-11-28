import type { Metadata } from "next";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminShell from "@/components/admin/AdminShell";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin Dashboard | UNIHOPE Foundation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
