import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * UNIHOPE Foundation - Convex Database Schema
 *
 * Backward-compatible schema supporting:
 * - Captured donations with permanent sequential receipt numbers (UH-YYYY-WEB01)
 * - Atomic yearly receipt counters (Asia/Kolkata timezone)
 * - Separate unsuccessful payment attempts tracking
 * - Refund lifecycle tracking
 * - Campaigns / Donation Purposes management
 * - Authorized Administrators & RBAC
 * - Immutable Admin Activity / Audit Logs
 * - Webhook & Email delivery health logs
 */
export default defineSchema({
  donations: defineTable({
    // Business identifier from Razorpay (primary idempotency key)
    razorpayPaymentId: v.string(),
    razorpayOrderId: v.string(),

    // Donor information
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),
    donorKey: v.optional(v.string()),

    // Financial metadata (amount stored in INR rupees, preserving existing records)
    amount: v.number(),
    currency: v.string(), // "INR"
    purpose: v.string(),
    anonymous: v.boolean(),
    paymentMethod: v.optional(v.string()),

    // Permanent sequential receipt metadata (e.g. UH-2026-WEB01)
    receiptNumber: v.optional(v.string()),
    receiptYear: v.optional(v.number()),
    receiptSequence: v.optional(v.number()),
    receiptGeneratedAt: v.optional(v.number()),
    receiptPdfStorageId: v.optional(v.id("_storage")),

    // Transaction & workflow lifecycle
    paymentStatus: v.union(
      v.literal("captured"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("partially_refunded"),
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
    emailProviderId: v.optional(v.string()),
    emailRetryCount: v.optional(v.number()),

    // Refund summary fields (backward-compatible)
    refundStatus: v.optional(
      v.union(
        v.literal("none"),
        v.literal("pending"),
        v.literal("partially_refunded"),
        v.literal("refunded"),
        v.literal("failed"),
      ),
    ),
    refundedAmount: v.optional(v.number()),
    refundReference: v.optional(v.string()),
    refundedAt: v.optional(v.number()),

    // Audit timestamps (milliseconds since Unix epoch)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_payment_id", ["razorpayPaymentId"])
    .index("by_order_id", ["razorpayOrderId"])
    .index("by_receipt_number", ["receiptNumber"])
    .index("by_receipt_status", ["receiptStatus"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_donor_email", ["donorEmail"])
    .index("by_donor_key", ["donorKey"])
    .index("by_purpose", ["purpose"])
    .index("by_created_at", ["createdAt"])
    .searchIndex("search_donor_name", {
      searchField: "donorName",
      filterFields: ["paymentStatus", "purpose"],
    }),

  // Atomic yearly sequential receipt counters (Asia/Kolkata calendar year)
  receiptCounters: defineTable({
    year: v.number(),
    lastSequence: v.number(),
    updatedAt: v.number(),
  }).index("by_year", ["year"]),

  // Unsuccessful / in-flight payment attempts (never receive receipt numbers)
  paymentAttempts: defineTable({
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    donorName: v.optional(v.string()),
    donorEmail: v.optional(v.string()),
    donorPhone: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    purpose: v.string(),
    paymentMethod: v.optional(v.string()),
    status: v.union(
      v.literal("initiated"),
      v.literal("pending"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("expired"),
    ),
    errorCode: v.optional(v.string()),
    errorDescription: v.optional(v.string()),
    errorSource: v.optional(v.string()),
    errorStep: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order_id", ["razorpayOrderId"])
    .index("by_payment_id", ["razorpayPaymentId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Refund tracking (linked to original donation, never allocates new receipt numbers)
  refunds: defineTable({
    donationId: v.id("donations"),
    receiptNumber: v.optional(v.string()),
    razorpayPaymentId: v.string(),
    razorpayRefundId: v.optional(v.string()),
    refundedAmount: v.number(),
    currency: v.string(),
    refundType: v.union(v.literal("full"), v.literal("partial")),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    requestedByAdminId: v.optional(v.string()),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_donation_id", ["donationId"])
    .index("by_payment_id", ["razorpayPaymentId"])
    .index("by_refund_id", ["razorpayRefundId"])
    .index("by_status", ["status"])
    .index("by_requested_at", ["requestedAt"]),

  // Donation Campaigns / Purposes
  campaigns: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    targetAmount: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // Email delivery attempt history per donation
  emailLogs: defineTable({
    donationId: v.id("donations"),
    receiptNumber: v.string(),
    recipient: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("needs_review"),
    ),
    providerId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    triggeredBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_donation_id", ["donationId"])
    .index("by_created_at", ["createdAt"]),

  // Webhook processing & idempotency log
  webhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string()),
    status: v.union(
      v.literal("processed"),
      v.literal("duplicate"),
      v.literal("ignored"),
      v.literal("error"),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_created_at", ["createdAt"]),

  // Authorized Administrators & RBAC
  adminUsers: defineTable({
    clerkUserId: v.string(),
    issuer: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("viewer")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Immutable Admin Activity / Audit Logs
  adminAuditLogs: defineTable({
    adminUserId: v.string(),
    adminEmail: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_admin_user_id", ["adminUserId"])
    .index("by_action", ["action"]),
});
