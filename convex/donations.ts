import { v } from "convex/values";
import {
  query,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { buildDonationReceiptEmail } from "./emailTemplates";
import { buildDonationReceiptPdf, uint8ArrayToBase64 } from "./pdfReceipt";
import { requireAdmin, recordAdminAudit, type AdminRole } from "./lib/adminAuth";
import {
  computeDonorKey,
  formatReceiptNumber,
  getIstYear,
  getYearlyCounterBaseline,
  normalizeEmail,
  normalizeTimestampToMs,
  resolveStoredOrHistoricalReceiptNumber,
} from "./lib/helpers";

export type ClaimResult =
  | { claimed: true; donation: Doc<"donations"> }
  | { claimed: false; reason: string; donation?: undefined };

export type ReceiptActionResult = {
  success: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  receiptStatus?: string;
  receiptNumber?: string;
};

/**
 * Internal helper query for actions to enforce backend RBAC.
 */
export const verifyAdminActionAccess = internalQuery({
  args: {
    allowedRoles: v.array(
      v.union(v.literal("owner"), v.literal("admin"), v.literal("viewer")),
    ),
  },
  handler: async (ctx, args) => {
    return await requireAdmin(ctx, args.allowedRoles as AdminRole[]);
  },
});

export const getDonationByIdInternal = internalQuery({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.donationId);
  },
});

/**
 * Internal Mutation: Persists a captured donation payment idempotently
 * and atomically allocates a permanent sequential receipt number (UH-YYYY-WEB01)
 * using Asia/Kolkata calendar year.
 */
export const recordCapturedPaymentInternal = internalMutation({
  args: {
    razorpayPaymentId: v.string(),
    razorpayOrderId: v.string(),
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),
    amount: v.number(),
    currency: v.string(),
    purpose: v.string(),
    anonymous: v.boolean(),
    paymentMethod: v.optional(v.string()),
    webhookEventId: v.optional(v.string()),
    capturedAtMs: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    donationId: Doc<"donations">["_id"];
    alreadyProcessed: boolean;
    receiptStatus: Doc<"donations">["receiptStatus"];
    receiptNumber: string;
  }> => {
    // 1. Idempotency check by Razorpay Payment ID
    const existing = await ctx.db
      .query("donations")
      .withIndex("by_payment_id", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId),
      )
      .first();

    if (existing) {
      if (args.webhookEventId) {
        await ctx.db.insert("webhookEvents", {
          eventId: args.webhookEventId,
          eventType: "payment.captured",
          razorpayPaymentId: args.razorpayPaymentId,
          razorpayOrderId: args.razorpayOrderId,
          status: "duplicate",
          createdAt: Date.now(),
        });
      }
      return {
        donationId: existing._id,
        alreadyProcessed: true,
        receiptStatus: existing.receiptStatus,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(existing),
      };
    }

    const now = Date.now();
    // Use verified Razorpay payment capture timestamp when provided (handles delayed webhooks across New Year)
    const captureTimestampMs = normalizeTimestampToMs(args.capturedAtMs) ?? now;
    const istYear = getIstYear(captureTimestampMs);

    // 2. Atomically increment yearly receipt counter in Asia/Kolkata year
    const counter = await ctx.db
      .query("receiptCounters")
      .withIndex("by_year", (q) => q.eq("year", istYear))
      .first();

    const nextSeq = counter
      ? counter.lastSequence + 1
      : getYearlyCounterBaseline(istYear) + 1;

    if (counter) {
      await ctx.db.patch(counter._id, {
        lastSequence: nextSeq,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("receiptCounters", {
        year: istYear,
        lastSequence: nextSeq,
        updatedAt: now,
      });
    }

    const receiptNumber = formatReceiptNumber(istYear, nextSeq);
    const normalizedEmail = normalizeEmail(args.donorEmail);
    const donorKey = computeDonorKey({
      donorEmail: normalizedEmail,
      donorPhone: args.donorPhone,
      anonymous: args.anonymous,
      razorpayPaymentId: args.razorpayPaymentId,
    });

    // 3. Insert new captured donation record with permanent receipt number
    const donationId = await ctx.db.insert("donations", {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpayOrderId: args.razorpayOrderId,
      donorName: args.donorName,
      donorEmail: normalizedEmail || args.donorEmail,
      donorPhone: args.donorPhone,
      donorKey,
      amount: args.amount,
      currency: args.currency,
      purpose: args.purpose,
      anonymous: args.anonymous,
      paymentMethod: args.paymentMethod,
      receiptNumber,
      receiptYear: istYear,
      receiptSequence: nextSeq,
      receiptGeneratedAt: now,
      paymentStatus: "captured",
      receiptStatus: "pending",
      refundStatus: "none",
      refundedAmount: 0,
      emailRetryCount: 0,
      createdAt: captureTimestampMs,
      updatedAt: now,
    });

    // 4. Clean up any matching initiated/pending paymentAttempt for this order
    const matchingAttempts = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_order_id", (q) => q.eq("razorpayOrderId", args.razorpayOrderId))
      .collect();
    for (const attempt of matchingAttempts) {
      if (attempt.status === "initiated" || attempt.status === "pending") {
        await ctx.db.delete(attempt._id);
      }
    }

    if (args.webhookEventId) {
      await ctx.db.insert("webhookEvents", {
        eventId: args.webhookEventId,
        eventType: "payment.captured",
        razorpayPaymentId: args.razorpayPaymentId,
        razorpayOrderId: args.razorpayOrderId,
        status: "processed",
        createdAt: now,
      });
    }

    return {
      donationId,
      alreadyProcessed: false,
      receiptStatus: "pending",
      receiptNumber,
    };
  },
});

function assertValidServerSecret(serverSecret: string): void {
  const expectedSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!expectedSecret || !serverSecret || serverSecret !== expectedSecret) {
    throw new Error("Unauthorized: Invalid webhook secret.");
  }
}

/**
 * Server-authenticated Action: Persists a captured donation payment.
 */
export const recordCapturedPayment = action({
  args: {
    serverSecret: v.string(),
    razorpayPaymentId: v.string(),
    razorpayOrderId: v.string(),
    donorName: v.string(),
    donorEmail: v.string(),
    donorPhone: v.string(),
    amount: v.number(),
    currency: v.string(),
    purpose: v.string(),
    anonymous: v.boolean(),
    paymentMethod: v.optional(v.string()),
    webhookEventId: v.optional(v.string()),
    capturedAtMs: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    donationId: Doc<"donations">["_id"];
    alreadyProcessed: boolean;
    receiptStatus: Doc<"donations">["receiptStatus"];
    receiptNumber: string;
  }> => {
    assertValidServerSecret(args.serverSecret);

    return await ctx.runMutation(internal.donations.recordCapturedPaymentInternal, {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpayOrderId: args.razorpayOrderId,
      donorName: args.donorName,
      donorEmail: args.donorEmail,
      donorPhone: args.donorPhone,
      amount: args.amount,
      currency: args.currency,
      purpose: args.purpose,
      anonymous: args.anonymous,
      paymentMethod: args.paymentMethod,
      webhookEventId: args.webhookEventId,
      capturedAtMs: args.capturedAtMs,
    });
  },
});

/**
 * Safe one-time internal initialization of the yearly receipt counter baseline.
 * Audits existing donations first; refuses to decrease an existing counter or
 * overwrite a conflicting issued sequence.
 */
export const seedReceiptCounterBaselineInternal = internalMutation({
  args: {
    year: v.number(),
    baselineSequence: v.number(),
  },
  handler: async (ctx, args) => {
    const existingCounter = await ctx.db
      .query("receiptCounters")
      .withIndex("by_year", (q) => q.eq("year", args.year))
      .first();

    const donations = await ctx.db.query("donations").collect();
    let maxIssuedSeq = 0;
    for (const d of donations) {
      if (d.receiptYear === args.year && typeof d.receiptSequence === "number") {
        if (d.receiptSequence > maxIssuedSeq) {
          maxIssuedSeq = d.receiptSequence;
        }
      }
    }

    if (maxIssuedSeq > args.baselineSequence) {
      throw new Error(
        `CONFLICT: Existing ${args.year} donation already holds sequence ${maxIssuedSeq} (> ${args.baselineSequence}).`,
      );
    }

    if (existingCounter) {
      if (existingCounter.lastSequence >= args.baselineSequence) {
        return {
          status: "unchanged",
          year: args.year,
          lastSequence: existingCounter.lastSequence,
        };
      }
      await ctx.db.patch(existingCounter._id, {
        lastSequence: args.baselineSequence,
        updatedAt: Date.now(),
      });
      return {
        status: "updated",
        year: args.year,
        lastSequence: args.baselineSequence,
      };
    }

    await ctx.db.insert("receiptCounters", {
      year: args.year,
      lastSequence: args.baselineSequence,
      updatedAt: Date.now(),
    });
    return {
      status: "created",
      year: args.year,
      lastSequence: args.baselineSequence,
    };
  },
});

/**
 * Internal Mutation: Records an unsuccessful or in-flight payment attempt separately.
 * Never allocates a receipt number and never touches the donations table.
 */
export const recordPaymentAttemptInternal = internalMutation({
  args: {
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
    webhookEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If a captured donation already exists for this payment/order, ignore failed attempt
    if (args.razorpayPaymentId) {
      const captured = await ctx.db
        .query("donations")
        .withIndex("by_payment_id", (q) =>
          q.eq("razorpayPaymentId", args.razorpayPaymentId!),
        )
        .first();
      if (captured) {
        return { skipped: true, reason: "already_captured" };
      }
    }

    // Check if an attempt for this orderId (or paymentId) already exists
    const existing = args.razorpayPaymentId
      ? await ctx.db
        .query("paymentAttempts")
        .withIndex("by_payment_id", (q) =>
          q.eq("razorpayPaymentId", args.razorpayPaymentId!),
        )
        .first()
      : await ctx.db
        .query("paymentAttempts")
        .withIndex("by_order_id", (q) =>
          q.eq("razorpayOrderId", args.razorpayOrderId),
        )
        .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        razorpayPaymentId: args.razorpayPaymentId ?? existing.razorpayPaymentId,
        paymentMethod: args.paymentMethod ?? existing.paymentMethod,
        status: args.status,
        errorCode: args.errorCode ?? existing.errorCode,
        errorDescription: args.errorDescription ?? existing.errorDescription,
        errorSource: args.errorSource ?? existing.errorSource,
        errorStep: args.errorStep ?? existing.errorStep,
        updatedAt: now,
      });
      if (args.webhookEventId) {
        await ctx.db.insert("webhookEvents", {
          eventId: args.webhookEventId,
          eventType: `payment.${args.status}`,
          razorpayPaymentId: args.razorpayPaymentId,
          razorpayOrderId: args.razorpayOrderId,
          status: "processed",
          createdAt: now,
        });
      }
      return { attemptId: existing._id, updated: true };
    }

    const attemptId = await ctx.db.insert("paymentAttempts", {
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
      donorName: args.donorName,
      donorEmail: args.donorEmail ? normalizeEmail(args.donorEmail) : undefined,
      donorPhone: args.donorPhone,
      amount: args.amount,
      currency: args.currency,
      purpose: args.purpose,
      paymentMethod: args.paymentMethod,
      status: args.status,
      errorCode: args.errorCode,
      errorDescription: args.errorDescription,
      errorSource: args.errorSource,
      errorStep: args.errorStep,
      createdAt: now,
      updatedAt: now,
    });

    if (args.webhookEventId) {
      await ctx.db.insert("webhookEvents", {
        eventId: args.webhookEventId,
        eventType: `payment.${args.status}`,
        razorpayPaymentId: args.razorpayPaymentId,
        razorpayOrderId: args.razorpayOrderId,
        status: "processed",
        createdAt: now,
      });
    }

    return { attemptId, updated: false };
  },
});

export const recordPaymentAttempt = action({
  args: {
    serverSecret: v.string(),
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
    webhookEventId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    skipped?: boolean;
    reason?: string;
    attemptId?: Id<"paymentAttempts">;
    updated?: boolean;
  }> => {
    const expectedSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!expectedSecret || args.serverSecret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid webhook secret.");
    }
    const { serverSecret: _ignored, ...rest } = args;
    void _ignored;
    return await ctx.runMutation(internal.donations.recordPaymentAttemptInternal, rest);
  },
});

/**
 * Internal Mutation: Records or updates a refund from Razorpay webhook without creating a new receipt number.
 */
export const recordRefundInternal = internalMutation({
  args: {
    razorpayPaymentId: v.string(),
    razorpayRefundId: v.string(),
    refundedAmount: v.number(),
    currency: v.string(),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    webhookEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_payment_id", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId),
      )
      .first();

    if (!donation) {
      return { skipped: true, reason: "donation_not_found" };
    }

    const receiptNumber = resolveStoredOrHistoricalReceiptNumber(donation);
    const existingRefund = await ctx.db
      .query("refunds")
      .withIndex("by_refund_id", (q) =>
        q.eq("razorpayRefundId", args.razorpayRefundId),
      )
      .first();

    const refundType =
      args.refundedAmount >= donation.amount ? ("full" as const) : ("partial" as const);

    if (existingRefund) {
      await ctx.db.patch(existingRefund._id, {
        status: args.status,
        completedAt: args.status === "completed" ? now : existingRefund.completedAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("refunds", {
        donationId: donation._id,
        receiptNumber,
        razorpayPaymentId: args.razorpayPaymentId,
        razorpayRefundId: args.razorpayRefundId,
        refundedAmount: args.refundedAmount,
        currency: args.currency,
        refundType,
        reason: args.reason,
        status: args.status,
        requestedAt: now,
        completedAt: args.status === "completed" ? now : undefined,
        updatedAt: now,
      });
    }

    // Recalculate total completed refunds for this donation
    const allRefundsForDonation = await ctx.db
      .query("refunds")
      .withIndex("by_donation_id", (q) => q.eq("donationId", donation._id))
      .collect();

    const completedSum = allRefundsForDonation
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + r.refundedAmount, 0);

    const hasPending = allRefundsForDonation.some((r) => r.status === "pending");

    const nextRefundStatus =
      completedSum >= donation.amount
        ? ("refunded" as const)
        : completedSum > 0
          ? ("partially_refunded" as const)
          : hasPending
            ? ("pending" as const)
            : args.status === "failed"
              ? ("failed" as const)
              : ("none" as const);

    const nextPaymentStatus =
      completedSum >= donation.amount
        ? ("refunded" as const)
        : completedSum > 0
          ? ("partially_refunded" as const)
          : donation.paymentStatus;

    await ctx.db.patch(donation._id, {
      paymentStatus: nextPaymentStatus,
      refundStatus: nextRefundStatus,
      refundedAmount: completedSum,
      refundReference: args.razorpayRefundId,
      refundedAt: args.status === "completed" ? now : donation.refundedAt,
      updatedAt: now,
    });

    if (args.webhookEventId) {
      await ctx.db.insert("webhookEvents", {
        eventId: args.webhookEventId,
        eventType: `refund.${args.status}`,
        razorpayPaymentId: args.razorpayPaymentId,
        razorpayOrderId: donation.razorpayOrderId,
        status: "processed",
        createdAt: now,
      });
    }

    return { success: true, donationId: donation._id, receiptNumber };
  },
});

export const recordRefundWebhook = action({
  args: {
    serverSecret: v.string(),
    razorpayPaymentId: v.string(),
    razorpayRefundId: v.string(),
    refundedAmount: v.number(),
    currency: v.string(),
    reason: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    webhookEventId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    skipped?: boolean;
    reason?: string;
    success?: boolean;
    donationId?: Id<"donations">;
    receiptNumber?: string;
  }> => {
    const expectedSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!expectedSecret || args.serverSecret !== expectedSecret) {
      throw new Error("Unauthorized: Invalid webhook secret.");
    }
    const { serverSecret: _ignored, ...rest } = args;
    void _ignored;
    return await ctx.runMutation(internal.donations.recordRefundInternal, rest);
  },
});

/**
 * Atomically claims the email receipt sending task.
 */
export const claimReceiptSending = internalMutation({
  args: {
    donationId: v.id("donations"),
    forceResend: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<ClaimResult> => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      return { claimed: false, reason: "not_found" };
    }

    if (donation.receiptStatus === "sent" && !args.forceResend) {
      return { claimed: false, reason: "already_sent" };
    }

    const now = Date.now();
    if (
      donation.receiptStatus === "sending" &&
      now - donation.updatedAt < 5 * 60 * 1000
    ) {
      return { claimed: false, reason: "in_flight" };
    }

    await ctx.db.patch(args.donationId, {
      receiptStatus: "sending",
      updatedAt: now,
    });

    return { claimed: true, donation };
  },
});

/**
 * Updates receipt delivery status and logs delivery history.
 */
export const updateReceiptStatus = internalMutation({
  args: {
    donationId: v.id("donations"),
    receiptStatus: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("needs_review"),
    ),
    receiptSentAt: v.optional(v.number()),
    receiptError: v.optional(v.string()),
    emailProviderId: v.optional(v.string()),
    triggeredBy: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const donation = await ctx.db.get(args.donationId);
    const now = Date.now();

    await ctx.db.patch(args.donationId, {
      receiptStatus: args.receiptStatus,
      receiptSentAt: args.receiptSentAt ?? donation?.receiptSentAt,
      receiptError: args.receiptError,
      emailProviderId: args.emailProviderId ?? donation?.emailProviderId,
      emailRetryCount:
        args.triggeredBy && args.triggeredBy !== "webhook"
          ? (donation?.emailRetryCount ?? 0) + 1
          : donation?.emailRetryCount ?? 0,
      updatedAt: now,
    });

    if (donation) {
      await ctx.db.insert("emailLogs", {
        donationId: args.donationId,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(donation),
        recipient: donation.donorEmail,
        status: args.receiptStatus,
        providerId: args.emailProviderId,
        errorMessage: args.receiptError,
        triggeredBy: args.triggeredBy || "webhook",
        createdAt: now,
      });
    }
  },
});

export const writeAdminAuditInternal = internalMutation({
  args: {
    adminId: v.id("adminUsers"),
    clerkUserId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("viewer")),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await recordAdminAudit(
      ctx,
      {
        id: args.adminId,
        clerkUserId: args.clerkUserId,
        email: args.email,
        fullName: args.fullName,
        role: args.role,
        isActive: true,
      },
      {
        action: args.action,
        resourceType: args.resourceType,
        resourceId: args.resourceId,
        metadata: args.metadata ? JSON.parse(args.metadata) : undefined,
      },
    );
  },
});

async function buildReceiptAssetsForDonation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  donation: Doc<"donations">,
) {
  const orgDetails = {
    name: process.env.ORG_NAME,
    registeredAddress: process.env.ORG_REGISTERED_ADDRESS,
    pan: process.env.ORG_PAN,
    trustRegistrationNo: process.env.ORG_TRUST_REGISTRATION_NO,
    email: process.env.ORG_EMAIL,
    website: process.env.ORG_WEBSITE,
  };

  const taxDetails = {
    approvalSection: process.env.ORG_80G_PROVISIONAL_APPROVAL_SECTION,
    provisionalUrn: process.env.ORG_80G_PROVISIONAL_URN,
    approvalDate: process.env.ORG_80G_APPROVAL_DATE,
    validFrom: process.env.ORG_80G_VALID_FROM,
    validUntil: process.env.ORG_80G_VALID_UNTIL,
  };

  let logoBytes: Uint8Array | null = null;
  let logoUrl: string | undefined = undefined;
  const rawLogoStorageId = process.env.ORG_LOGO_STORAGE_ID;
  if (rawLogoStorageId) {
    try {
      const logoStorageId = rawLogoStorageId as Id<"_storage">;
      const logoBlob = await ctx.storage.get(logoStorageId);
      if (logoBlob) {
        logoBytes = new Uint8Array(await logoBlob.arrayBuffer());
      }
      const publicUrl = await ctx.storage.getUrl(logoStorageId);
      if (publicUrl) logoUrl = publicUrl;
    } catch (logoErr) {
      console.warn("Error retrieving logo from Convex storage:", logoErr);
    }
  }

  let signatureBytes: Uint8Array | null = null;
  const rawStorageId = process.env.FOUNDER_SIGNATURE_STORAGE_ID;
  if (rawStorageId) {
    try {
      const storageId = rawStorageId as Id<"_storage">;
      const fileBlob = await ctx.storage.get(storageId);
      if (fileBlob) {
        signatureBytes = new Uint8Array(await fileBlob.arrayBuffer());
      }
    } catch (storageErr) {
      console.warn("Error retrieving founder signature from Convex storage:", storageErr);
    }
  }

  // Always use the authoritative stored receipt number (or historical fallback)
  const receiptNumber = resolveStoredOrHistoricalReceiptNumber(donation);
  const formattedAmount = `₹${new Intl.NumberFormat("en-IN").format(donation.amount)}`;
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(donation.createdAt));

  const pdfBytes = await buildDonationReceiptPdf({
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    anonymous: donation.anonymous,
    amount: donation.amount,
    purpose: donation.purpose,
    razorpayPaymentId: donation.razorpayPaymentId,
    razorpayOrderId: donation.razorpayOrderId,
    formattedDate,
    formattedAmount,
    receiptNumber,
    transactionRef: donation.razorpayPaymentId,
    status: "PAID",
    logoBytes,
    logoSrc: logoBytes,
    signatureBytes,
    signatureSrc: signatureBytes,
    orgDetails,
    taxDetails,
  });

  return {
    receiptNumber,
    formattedAmount,
    formattedDate,
    orgDetails,
    taxDetails,
    logoUrl,
    pdfBytes,
  };
}

async function dispatchReceiptEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  donation: Doc<"donations">,
  triggeredBy: string,
): Promise<ReceiptActionResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !fromAddress) {
    const err = "Resend configuration missing (API key or sender email).";
    await ctx.runMutation(internal.donations.updateReceiptStatus, {
      donationId: donation._id,
      receiptStatus: "failed",
      receiptError: err,
      triggeredBy,
    });
    return { success: false, error: err };
  }

  let assets: Awaited<ReturnType<typeof buildReceiptAssetsForDonation>>;
  let pdfBase64 = "";
  try {
    assets = await buildReceiptAssetsForDonation(ctx, donation);
    pdfBase64 = uint8ArrayToBase64(assets.pdfBytes);
    if (!pdfBase64) {
      throw new Error("Generated PDF attachment buffer was empty.");
    }
  } catch (pdfErr) {
    const msg = pdfErr instanceof Error ? pdfErr.message : "PDF generation failed";
    await ctx.runMutation(internal.donations.updateReceiptStatus, {
      donationId: donation._id,
      receiptStatus: "needs_review",
      receiptError: `PDF generation failed: ${msg}`,
      triggeredBy,
    });
    return {
      success: false,
      error: `PDF generation failed: ${msg}`,
      receiptStatus: "needs_review",
    };
  }

  const defaultSiteUrl = "https://brave-firefly-526.ap-southeast-2.convex.site";
  const siteUrl = process.env.CONVEX_SITE_URL || defaultSiteUrl;
  const finalSignatureUrl = `${siteUrl}/assets/signature.png`;

  const { html: htmlReceipt, text: textFallback } = buildDonationReceiptEmail({
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    anonymous: donation.anonymous,
    amount: donation.amount,
    purpose: donation.purpose,
    razorpayPaymentId: donation.razorpayPaymentId,
    razorpayOrderId: donation.razorpayOrderId,
    formattedDate: assets.formattedDate,
    formattedAmount: assets.formattedAmount,
    receiptNumber: assets.receiptNumber,
    status: "PAID",
    orgDetails: assets.orgDetails,
    taxDetails: assets.taxDetails,
    logoUrl: assets.logoUrl,
    signatureUrl: finalSignatureUrl,
  });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [donation.donorEmail],
        subject: `Your Donation Receipt — ${assets.receiptNumber} | UNIHOPE Foundation`,
        html: htmlReceipt,
        text: textFallback,
        attachments: [
          {
            filename: `${assets.receiptNumber}-UNIHOPE-Receipt.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (response.ok) {
      let providerId: string | undefined;
      try {
        const okJson = (await response.json()) as { id?: string };
        providerId = okJson.id;
      } catch {
        // ignore JSON parse if empty
      }

      await ctx.runMutation(internal.donations.updateReceiptStatus, {
        donationId: donation._id,
        receiptStatus: "sent",
        receiptSentAt: Date.now(),
        emailProviderId: providerId,
        triggeredBy,
      });
      return {
        success: true,
        receiptStatus: "sent",
        receiptNumber: assets.receiptNumber,
      };
    }

    const errorText = await response.text();
    let parsedError = "Resend delivery error";
    try {
      const errorJson = JSON.parse(errorText);
      parsedError = errorJson.message || errorJson.name || errorText;
    } catch {
      parsedError = errorText.slice(0, 300);
    }

    const newStatus =
      response.status >= 500 || response.status === 429
        ? ("needs_review" as const)
        : ("failed" as const);

    await ctx.runMutation(internal.donations.updateReceiptStatus, {
      donationId: donation._id,
      receiptStatus: newStatus,
      receiptError: `Resend status ${response.status}: ${parsedError}`,
      triggeredBy,
    });

    return {
      success: false,
      error: parsedError,
      receiptStatus: newStatus,
      receiptNumber: assets.receiptNumber,
    };
  } catch (networkErr: unknown) {
    const msg =
      networkErr instanceof Error
        ? networkErr.message
        : "Network failure connecting to Resend";
    await ctx.runMutation(internal.donations.updateReceiptStatus, {
      donationId: donation._id,
      receiptStatus: "needs_review",
      receiptError: msg,
      triggeredBy,
    });
    return {
      success: false,
      error: msg,
      receiptStatus: "needs_review",
      receiptNumber: assets.receiptNumber,
    };
  }
}

/**
 * External Action: Executes initial donor receipt email delivery via Resend API.
 */
/**
 * Server-only Action: Dispatches receipt PDF + email for a newly captured donation.
 * Requires the server webhook secret and relies on atomic claimReceiptSending
 * idempotency so duplicate webhook deliveries never send duplicate emails.
 */
export const sendDonationReceipt = action({
  args: {
    serverSecret: v.string(),
    donationId: v.id("donations"),
  },
  handler: async (ctx, args): Promise<ReceiptActionResult> => {
    assertValidServerSecret(args.serverSecret);

    const claim: ClaimResult = await ctx.runMutation(
      internal.donations.claimReceiptSending,
      { donationId: args.donationId, forceResend: false },
    );

    if (!claim.claimed || !claim.donation) {
      return {
        success: false,
        skipped: true,
        reason: claim.reason || "already_processed",
      };
    }

    return await dispatchReceiptEmail(ctx, claim.donation, "webhook");
  },
});

/**
 * Admin Action (Owner & Admin): Safely resends a receipt email using the exact
 * stored receipt number and logs the administrative action.
 */
export const resendDonationReceipt = action({
  args: {
    donationId: v.id("donations"),
  },
  handler: async (ctx, args): Promise<ReceiptActionResult> => {
    const admin = await ctx.runQuery(internal.donations.verifyAdminActionAccess, {
      allowedRoles: ["owner", "admin"],
    });

    const claim: ClaimResult = await ctx.runMutation(
      internal.donations.claimReceiptSending,
      { donationId: args.donationId, forceResend: true },
    );

    if (!claim.claimed || !claim.donation) {
      return {
        success: false,
        skipped: true,
        reason: claim.reason || "unable_to_claim",
      };
    }

    const res = await dispatchReceiptEmail(ctx, claim.donation, admin.email);

    await ctx.runMutation(internal.donations.writeAdminAuditInternal, {
      adminId: admin.id,
      clerkUserId: admin.clerkUserId,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      action: "RECEIPT_EMAIL_RESENT",
      resourceType: "donations",
      resourceId: String(args.donationId),
      metadata: JSON.stringify({
        receiptNumber: res.receiptNumber,
        success: res.success,
      }),
    });

    return res;
  },
});

/**
 * Admin Action (Owner, Admin, Viewer): Generates the official PDF receipt
 * on demand using the permanent stored receipt number for preview or download.
 */
export const generateReceiptPdfForAdmin = action({
  args: {
    donationId: v.id("donations"),
    mode: v.optional(v.union(v.literal("preview"), v.literal("download"))),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ base64: string; filename: string; receiptNumber: string }> => {
    const admin = await ctx.runQuery(internal.donations.verifyAdminActionAccess, {
      allowedRoles: ["owner", "admin", "viewer"],
    });

    const donation = await ctx.runQuery(
      internal.donations.getDonationByIdInternal,
      { donationId: args.donationId },
    );

    if (!donation) {
      throw new Error("NOT_FOUND: Donation record not found.");
    }

    const assets = await buildReceiptAssetsForDonation(ctx, donation);
    const base64 = uint8ArrayToBase64(assets.pdfBytes);

    if (args.mode === "download") {
      await ctx.runMutation(internal.donations.writeAdminAuditInternal, {
        adminId: admin.id,
        clerkUserId: admin.clerkUserId,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        action: "RECEIPT_DOWNLOADED",
        resourceType: "donations",
        resourceId: String(args.donationId),
        metadata: JSON.stringify({ receiptNumber: assets.receiptNumber }),
      });
    }

    return {
      base64,
      filename: `${assets.receiptNumber}-UNIHOPE-Receipt.pdf`,
      receiptNumber: assets.receiptNumber,
    };
  },
});

/**
 * Internal Query: Retrieves a donation record by Razorpay payment ID.
 * Not exposed to unauthenticated public Convex clients.
 */
export const getDonationByPaymentIdInternal = internalQuery({
  args: {
    razorpayPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("donations")
      .withIndex("by_payment_id", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId),
      )
      .first();
  },
});

/**
 * Server-only Action: Returns non-PII payment verification status for
 * /api/razorpay/verify-payment after validating the server webhook secret.
 */
export const getPaymentVerificationStatus = action({
  args: {
    serverSecret: v.string(),
    razorpayPaymentId: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    paymentStatus: Doc<"donations">["paymentStatus"];
    amount: number;
    currency: string;
    receiptStatus: Doc<"donations">["receiptStatus"];
  } | null> => {
    assertValidServerSecret(args.serverSecret);

    const existing = await ctx.runQuery(
      internal.donations.getDonationByPaymentIdInternal,
      { razorpayPaymentId: args.razorpayPaymentId },
    );

    if (!existing) return null;

    return {
      paymentStatus: existing.paymentStatus,
      amount: existing.amount,
      currency: existing.currency,
      receiptStatus: existing.receiptStatus,
    };
  },
});
