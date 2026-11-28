import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeDonorKey,
  deduplicateByPaymentId,
  resolveStoredOrHistoricalReceiptNumber,
} from "../../convex/lib/helpers.ts";

describe("Dashboard Financial Metrics & Historical Compatibility", () => {
  const sampleLegacyDonations = [
    {
      _id: "d1",
      razorpayPaymentId: "pay_01",
      razorpayOrderId: "order_01",
      donorName: "Donor One",
      donorEmail: "donor1@example.org",
      donorPhone: "+919000000001",
      amount: 100,
      paymentStatus: "captured",
      receiptStatus: "sent",
      purpose: "General Fund",
      createdAt: 1793478672491,
    },
    {
      _id: "d2",
      razorpayPaymentId: "pay_02",
      razorpayOrderId: "order_02",
      donorName: "Donor One",
      donorEmail: "DONOR1@EXAMPLE.ORG",
      donorPhone: "9000000001",
      amount: 500,
      paymentStatus: "captured",
      receiptStatus: "sent",
      purpose: "General Fund",
      createdAt: 1793851641204,
    },
    {
      _id: "d3",
      razorpayPaymentId: "pay_03",
      razorpayOrderId: "order_03",
      donorName: "Donor Two",
      donorEmail: "donor2@example.org",
      donorPhone: "+919000000002",
      amount: 1000,
      paymentStatus: "captured",
      receiptStatus: "sent",
      purpose: "Healthcare",
      createdAt: 1793772190669,
    },
    // Duplicate paymentId edge case (should not double-count)
    {
      _id: "d3_dup",
      razorpayPaymentId: "pay_03",
      razorpayOrderId: "order_03",
      donorName: "Donor Two",
      donorEmail: "donor2@example.org",
      donorPhone: "+919000000002",
      amount: 1000,
      paymentStatus: "captured",
      receiptStatus: "sent",
      purpose: "Healthcare",
      createdAt: 1793772190669,
    },
    // Failed attempt/record must be excluded from captured totals
    {
      _id: "d4_failed",
      razorpayPaymentId: "pay_04_fail",
      razorpayOrderId: "order_04",
      donorName: "Failed Donor",
      donorEmail: "fail@example.org",
      donorPhone: "+919000000004",
      amount: 2500,
      paymentStatus: "failed",
      receiptStatus: "pending",
      purpose: "Education",
      createdAt: 1793900000000,
    },
  ];

  it("includes legacy records without receiptNumber and deduplicates by Payment ID", () => {
    const startMs = 0;
    const endMs = 1800000000000;
    const eligible = deduplicateByPaymentId(
      sampleLegacyDonations.filter(
        (d) =>
          (d.paymentStatus === "captured" ||
            d.paymentStatus === "refunded" ||
            d.paymentStatus === "partially_refunded") &&
          d.createdAt >= startMs &&
          d.createdAt <= endMs,
      ),
    );

    assert.equal(eligible.length, 3);
    const totalAmount = eligible.reduce((s, d) => s + d.amount, 0);
    assert.equal(totalAmount, 1600);

    for (const d of eligible) {
      const fallback = resolveStoredOrHistoricalReceiptNumber(d);
      assert.ok(fallback.startsWith("UH-2026-"));
    }
  });

  it("deduplicates donors accurately across repeat donations via computeDonorKey", () => {
    const donorKeys = new Set(
      sampleLegacyDonations
        .filter((d) => d.paymentStatus === "captured")
        .map((d) =>
          computeDonorKey({
            donorEmail: d.donorEmail,
            donorPhone: d.donorPhone,
            anonymous: false,
            razorpayPaymentId: d.razorpayPaymentId,
          }),
        ),
    );
    assert.equal(donorKeys.size, 2);
  });

  it("calculates receipt delivery rate without fabricating missing email statuses", () => {
    const captured = deduplicateByPaymentId(
      sampleLegacyDonations.filter((d) => d.paymentStatus === "captured"),
    );
    const sent = captured.filter((d) => d.receiptStatus === "sent").length;
    const rate = Math.round((sent / captured.length) * 1000) / 10;
    assert.equal(rate, 100);
  });

  it("respects All Time bounds (0..now) vs narrow date windows", () => {
    const allTime = sampleLegacyDonations.filter(
      (d) => d.paymentStatus === "captured" && d.createdAt >= 0,
    );
    assert.equal(allTime.length, 4);

    const narrowStart = 1793800000000;
    const narrowEnd = 1793900000000;
    const narrow = sampleLegacyDonations.filter(
      (d) =>
        d.paymentStatus === "captured" &&
        d.createdAt >= narrowStart &&
        d.createdAt <= narrowEnd,
    );
    assert.equal(narrow.length, 1);
    assert.equal(narrow[0]._id, "d2");
  });
});
