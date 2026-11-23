import type { Metadata } from "next";
import AdminAuthGuard from "./AdminAuthGuard";

/**
 * Opt out of instant-navigation prerendering validation for dynamic authenticated admin route.
 * Allowed exclusively in Server Components.
 */
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
    <div className="min-h-screen bg-gray-50">
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  );
}
