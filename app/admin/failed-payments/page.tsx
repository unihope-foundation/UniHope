"use client";

import { PaymentAttemptsView } from "@/components/admin/PaymentAttemptsView";

export default function FailedPaymentsPage() {
  return <PaymentAttemptsView defaultStatus="failed" />;
}
