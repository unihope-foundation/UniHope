import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

/**
 * Opt out of instant-navigation prerendering validation for dynamic authenticated admin route.
 * Allowed exclusively in Server Components.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Admin Overview | UNIHOPE Foundation",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
