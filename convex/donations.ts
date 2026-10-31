import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { buildDonationReceiptEmail } from "./emailTemplates";

export type ClaimResult =
  | { claimed: true; donation: Doc<"donations"> }
  | { claimed: false; reason: string; donation?: undefined };

export type ReceiptActionResult = {
  success: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  receiptStatus?: string;
};

/**
 * Persists a captured donation payment idempotently.
 * If a payment with the same `razorpayPaymentId` already exists,
 * it returns the existing record without duplicating.
 */
export const recordCapturedPayment = mutation({
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
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    donationId: Doc<"donations">["_id"];
    alreadyProcessed: boolean;
    receiptStatus: Doc<"donations">["receiptStatus"];
  }> => {
    // 1. Check for existing payment record
    const existing = await ctx.db
      .query("donations")
      .withIndex("by_payment_id", (q) =>
        q.eq("razorpayPaymentId", args.razorpayPaymentId),
      )
      .first();

    if (existing) {
      return {
        donationId: existing._id,
        alreadyProcessed: true,
        receiptStatus: existing.receiptStatus,
      };
    }

    const now = Date.now();

    // 2. Insert new captured donation record
    const donationId = await ctx.db.insert("donations", {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpayOrderId: args.razorpayOrderId,
      donorName: args.donorName,
      donorEmail: args.donorEmail,
      donorPhone: args.donorPhone,
      amount: args.amount,
      currency: args.currency,
      purpose: args.purpose,
      anonymous: args.anonymous,
      paymentStatus: "captured",
      receiptStatus: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return {
      donationId,
      alreadyProcessed: false,
      receiptStatus: "pending",
    };
  },
});

/**
 * Atomically claims the email receipt sending task.
 * Guarantees that only one process or action can send the receipt for a given payment.
 * Automatically recovers leases stalled longer than 5 minutes.
 */
export const claimReceiptSending = mutation({
  args: {
    donationId: v.id("donations"),
  },
  handler: async (ctx, args): Promise<ClaimResult> => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      return { claimed: false, reason: "not_found" };
    }

    // Do not resend already sent receipts
    if (donation.receiptStatus === "sent") {
      return { claimed: false, reason: "already_sent" };
    }

    // Check if sending lease is currently active (within 5 minutes)
    const now = Date.now();
    if (
      donation.receiptStatus === "sending" &&
      now - donation.updatedAt < 5 * 60 * 1000
    ) {
      return { claimed: false, reason: "in_flight" };
    }

    // Claim lease atomically
    await ctx.db.patch(args.donationId, {
      receiptStatus: "sending",
      updatedAt: now,
    });

    return { claimed: true, donation };
  },
});

/**
 * Updates the receipt delivery status after an email attempt.
 */
export const updateReceiptStatus = mutation({
  args: {
    donationId: v.id("donations"),
    receiptStatus: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("needs_review"),
    ),
    receiptSentAt: v.optional(v.number()),
    receiptError: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.donationId, {
      receiptStatus: args.receiptStatus,
      receiptSentAt: args.receiptSentAt,
      receiptError: args.receiptError,
      updatedAt: Date.now(),
    });
  },
});

/**
 * External Action: Executes the donor receipt email delivery via Resend API.
 * Uses atomic leasing to prevent duplicate emails across retries or multiple webhook calls.
 */
export const sendDonationReceipt = action({
  args: {
    donationId: v.id("donations"),
    // apiKey and fromEmail are intentionally NOT accepted as arguments.
    // Credentials are read exclusively from the Convex deployment environment
    // variables (RESEND_API_KEY, RESEND_FROM_EMAIL) so they never travel
    // over the wire in action call payloads.
  },
  handler: async (ctx, args): Promise<ReceiptActionResult> => {
    // 1. Claim the sending lease atomically
    const claim: ClaimResult = await ctx.runMutation(
      api.donations.claimReceiptSending,
      {
        donationId: args.donationId,
      },
    );

    if (!claim.claimed || !claim.donation) {
      return {
        success: false,
        skipped: true,
        reason: claim.reason || "already_processed",
      };
    }

    const donation = claim.donation;

    // Read credentials exclusively from Convex environment variables.
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress  = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !fromAddress) {
      const err = "Resend configuration missing (API key or sender email).";
      await ctx.runMutation(api.donations.updateReceiptStatus, {
        donationId: args.donationId,
        receiptStatus: "failed",
        receiptError: err,
      });
      return { success: false, error: err };
    }

    // 2. Format receipt content per UNIHOPE specification
    const formattedAmount = `₹${new Intl.NumberFormat("en-IN").format(donation.amount)}`;
    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeZone: "Asia/Kolkata",
    }).format(new Date(donation.createdAt));

    // Build HTML + plain-text receipt using the invoice template
    const { html: htmlReceipt, text: textFallback } = buildDonationReceiptEmail({
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
          subject: `Payment Receipt — UNIHOPE Foundation`,
          html: htmlReceipt,
          text: textFallback,
        }),
      });

      if (response.ok) {
        await ctx.runMutation(api.donations.updateReceiptStatus, {
          donationId: args.donationId,
          receiptStatus: "sent",
          receiptSentAt: Date.now(),
        });
        return { success: true, receiptStatus: "sent" };
      }

      // Handle provider errors
      const errorText = await response.text();
      let parsedError = "Resend delivery error";
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.message || errorJson.name || errorText;
      } catch {
        parsedError = errorText.slice(0, 300);
      }

      // 4xx errors indicate invalid parameters (e.g. invalid recipient)
      // 5xx / 429 indicate provider issues or rate limiting -> mark as needs_review
      const newStatus =
        response.status >= 500 || response.status === 429
          ? ("needs_review" as const)
          : ("failed" as const);

      await ctx.runMutation(api.donations.updateReceiptStatus, {
        donationId: args.donationId,
        receiptStatus: newStatus,
        receiptError: `Resend status ${response.status}: ${parsedError}`,
      });

      return { success: false, error: parsedError, receiptStatus: newStatus };
    } catch (networkErr: unknown) {
      const msg =
        networkErr instanceof Error
          ? networkErr.message
          : "Network failure connecting to Resend";
      await ctx.runMutation(api.donations.updateReceiptStatus, {
        donationId: args.donationId,
        receiptStatus: "needs_review",
        receiptError: msg,
      });
      return { success: false, error: msg, receiptStatus: "needs_review" };
    }
  },
});

/**
 * Retrieves a donation record by Razorpay payment ID.
 */
export const getDonationByPaymentId = query({
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
