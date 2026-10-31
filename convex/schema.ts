import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * UNIHOPE Foundation - Convex Database Schema
 *
 * Stores verified donation transactions captured via Razorpay,
 * with atomic idempotency and background receipt email status tracking.
 */
export default defineSchema({
  donations: defineTable({
    // Business identifier from Razorpay
    razorpayPaymentId: v.string(),
    razorpayOrderId: v.string(),

    // Donor information
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),

    // Financial metadata
    amount: v.number(), // Amount in INR rupees
    currency: v.string(), // "INR"
    purpose: v.string(),
    anonymous: v.boolean(),

    // Transaction & workflow lifecycle
    paymentStatus: v.union(
      v.literal("captured"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    receiptStatus: v.union(
      v.literal("pending"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("needs_review"),
    ),
    receiptSentAt: v.optional(v.number()),
    receiptError: v.optional(v.string()),

    // Audit timestamps (milliseconds since Unix epoch)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // Ensure fast lookup and idempotency by payment ID and order ID
    .index("by_payment_id", ["razorpayPaymentId"])
    .index("by_order_id", ["razorpayOrderId"])
    .index("by_receipt_status", ["receiptStatus"]),
});

