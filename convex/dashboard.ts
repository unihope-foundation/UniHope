import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin, recordAdminAudit } from "./lib/adminAuth";
import {
  computeDonorKey,
  deduplicateByPaymentId,
  escapeCsvCell,
  getIstDateKey,
  getIstDayBounds,
  getIstYear,
  resolveStoredOrHistoricalReceiptNumber,
} from "./lib/helpers";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function isCapturedLike(status: string): boolean {
  return (
    status === "captured" ||
    status === "refunded" ||
    status === "partially_refunded"
  );
}

/**
 * Executive Overview KPIs, Trend Series, Purpose Breakdown & Recent Donations.
 * Protected: requires owner, admin, or viewer.
 */
export const getOverviewMetrics = query({
  args: {
    startMs: v.optional(v.number()),
    endMs: v.optional(v.number()),
    granularity: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const now = Date.now();
    const startMs = args.startMs ?? 0;
    const endMs = args.endMs ?? now;
    const granularity = args.granularity ?? "daily";

    // Read donations ordered by creation timestamp
    const allDonations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const allAttempts = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const allRefunds = await ctx.db
      .query("refunds")
      .withIndex("by_requested_at")
      .order("desc")
      .collect();

    // Period filtering (deduplicated by unique Razorpay Payment ID)
    const inPeriodDonations = deduplicateByPaymentId(
      allDonations.filter(
        (d) =>
          isCapturedLike(d.paymentStatus) &&
          d.createdAt >= startMs &&
          d.createdAt <= endMs,
      ),
    );
    const inPeriodAttempts = allAttempts.filter(
      (a) =>
        a.status === "failed" &&
        a.createdAt >= startMs &&
        a.createdAt <= endMs,
    );
    const inPeriodCompletedRefunds = allRefunds.filter(
      (r) =>
        r.status === "completed" &&
        (r.completedAt ?? r.requestedAt) >= startMs &&
        (r.completedAt ?? r.requestedAt) <= endMs,
    );

    // Previous period comparison (only meaningful when a finite window is selected)
    let prevGrossDonations: number | null = null;
    let prevSuccessfulCount: number | null = null;
    let prevTotalDonors: number | null = null;
    let prevReceiptDeliveryRate: number | null = null;
    if (startMs > 0 && endMs > startMs) {
      const duration = endMs - startMs;
      const prevStart = startMs - duration;
      const prevEnd = startMs - 1;
      const prevCaptured = deduplicateByPaymentId(
        allDonations.filter(
          (d) =>
            isCapturedLike(d.paymentStatus) &&
            d.createdAt >= prevStart &&
            d.createdAt <= prevEnd,
        ),
      );
      prevGrossDonations = prevCaptured.reduce((s, d) => s + d.amount, 0);
      prevSuccessfulCount = prevCaptured.length;
      const prevDonorKeys = new Set<string>();
      let prevSent = 0;
      for (const d of prevCaptured) {
        prevDonorKeys.add(
          d.donorKey ||
            computeDonorKey({
              donorEmail: d.donorEmail,
              donorPhone: d.donorPhone,
              anonymous: d.anonymous,
              razorpayPaymentId: d.razorpayPaymentId,
            }),
        );
        if (d.receiptStatus === "sent") prevSent += 1;
      }
      prevTotalDonors = prevDonorKeys.size;
      prevReceiptDeliveryRate =
        prevCaptured.length > 0
          ? Math.round((prevSent / prevCaptured.length) * 1000) / 10
          : null;
    }

    const grossDonations = inPeriodDonations.reduce((s, d) => s + d.amount, 0);
    const totalRefundedAmount = inPeriodCompletedRefunds.reduce(
      (s, r) => s + r.refundedAmount,
      0,
    );
    const netDonations = Math.max(0, grossDonations - totalRefundedAmount);
    const successfulPayments = inPeriodDonations.length;
    const failedPayments = inPeriodAttempts.length;

    const donorKeys = new Set<string>();
    for (const d of inPeriodDonations) {
      donorKeys.add(
        d.donorKey ||
          computeDonorKey({
            donorEmail: d.donorEmail,
            donorPhone: d.donorPhone,
            anonymous: d.anonymous,
            razorpayPaymentId: d.razorpayPaymentId,
          }),
      );
    }

    // Today & This Month in Asia/Kolkata
    const todayKey = getIstDateKey(now);
    const { start: todayStart, end: todayEnd } = getIstDayBounds(todayKey);
    const istNow = new Date(now + IST_OFFSET_MS);
    const monthStartIst = Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      1,
      0,
      0,
      0,
      0,
    ) - IST_OFFSET_MS;

    const todaysDonations = allDonations
      .filter(
        (d) =>
          isCapturedLike(d.paymentStatus) &&
          d.createdAt >= todayStart &&
          d.createdAt <= todayEnd,
      )
      .reduce((s, d) => s + d.amount, 0);

    const thisMonthDonations = allDonations
      .filter(
        (d) =>
          isCapturedLike(d.paymentStatus) &&
          d.createdAt >= monthStartIst &&
          d.createdAt <= now,
      )
      .reduce((s, d) => s + d.amount, 0);

    const prevMonthStartIst = Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    ) - IST_OFFSET_MS;
    const prevMonthEndIst = monthStartIst - 1;

    const lastMonthDonations = allDonations
      .filter(
        (d) =>
          isCapturedLike(d.paymentStatus) &&
          d.createdAt >= prevMonthStartIst &&
          d.createdAt <= prevMonthEndIst,
      )
      .reduce((s, d) => s + d.amount, 0);

    const monthlyGrowthPct =
      lastMonthDonations > 0
        ? Math.round(((thisMonthDonations - lastMonthDonations) / lastMonthDonations) * 1000) / 10
        : null;

    const receiptsSentCount = inPeriodDonations.filter(
      (d) => d.receiptStatus === "sent",
    ).length;
    const receiptDeliveryRate =
      inPeriodDonations.length > 0
        ? Math.round((receiptsSentCount / inPeriodDonations.length) * 1000) / 10
        : null;

    // Trend aggregation in Asia/Kolkata
    const trendMap = new Map<
      string,
      { label: string; amount: number; count: number }
    >();

    for (const d of inPeriodDonations) {
      const ist = new Date(d.createdAt + IST_OFFSET_MS);
      const y = ist.getUTCFullYear();
      const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
      const day = String(ist.getUTCDate()).padStart(2, "0");

      let key = `${y}-${m}-${day}`;
      if (granularity === "monthly") {
        key = `${y}-${m}`;
      } else if (granularity === "yearly") {
        key = `${y}`;
      } else if (granularity === "weekly") {
        // Week starting Monday in IST
        const weekday = (ist.getUTCDay() + 6) % 7;
        const weekStart = new Date(ist.getTime() - weekday * 86400000);
        const wy = weekStart.getUTCFullYear();
        const wm = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
        const wd = String(weekStart.getUTCDate()).padStart(2, "0");
        key = `${wy}-${wm}-${wd}`;
      }

      const prev = trendMap.get(key) || { label: key, amount: 0, count: 0 };
      prev.amount += d.amount;
      prev.count += 1;
      trendMap.set(key, prev);
    }

    const trendSeries = Array.from(trendMap.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );

    // Purpose-wise breakdown from actual stored purposes
    const purposeMap = new Map<
      string,
      { purpose: string; amount: number; count: number }
    >();
    for (const d of inPeriodDonations) {
      const purposeName = d.purpose || "General Donation";
      const prev = purposeMap.get(purposeName) || {
        purpose: purposeName,
        amount: 0,
        count: 0,
      };
      prev.amount += d.amount;
      prev.count += 1;
      purposeMap.set(purposeName, prev);
    }
    const purposeBreakdown = Array.from(purposeMap.values()).sort(
      (a, b) => b.amount - a.amount,
    );

    // Payment method breakdown for donut chart
    const methodMap = new Map<
      string,
      { method: string; amount: number; count: number }
    >();
    for (const d of inPeriodDonations) {
      const methodName = (d.paymentMethod || "Razorpay").trim() || "Razorpay";
      const prev = methodMap.get(methodName) || {
        method: methodName,
        amount: 0,
        count: 0,
      };
      prev.amount += d.amount;
      prev.count += 1;
      methodMap.set(methodName, prev);
    }
    const paymentMethodBreakdown = Array.from(methodMap.values())
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage:
          grossDonations > 0
            ? Math.round((item.amount / grossDonations) * 1000) / 10
            : 0,
      }));

    // Payment status breakdown
    const capturedOnly = inPeriodDonations.filter(
      (d) => d.paymentStatus === "captured",
    );
    const refundedOnly = inPeriodDonations.filter(
      (d) =>
        d.paymentStatus === "refunded" ||
        d.paymentStatus === "partially_refunded",
    );
    const paymentStatusBreakdown = [
      {
        status: "Captured",
        count: capturedOnly.length,
        amount: capturedOnly.reduce((s, d) => s + d.amount, 0),
      },
      {
        status: "Refunded",
        count: refundedOnly.length,
        amount: totalRefundedAmount,
      },
      {
        status: "Failed",
        count: inPeriodAttempts.length,
        amount: inPeriodAttempts.reduce((s, a) => s + a.amount, 0),
      },
    ];

    // Latest 8 successful donations
    const recentDonations = allDonations
      .filter((d) => isCapturedLike(d.paymentStatus))
      .slice(0, 8)
      .map((d) => ({
        _id: d._id,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(d),
        donorName: d.anonymous ? "Anonymous Donor" : d.donorName,
        donorEmail: d.donorEmail,
        amount: d.amount,
        currency: d.currency,
        purpose: d.purpose,
        paymentMethod: d.paymentMethod || "Razorpay",
        createdAt: d.createdAt,
        receiptStatus: d.receiptStatus,
        paymentStatus: d.paymentStatus,
      }));

    return {
      kpis: {
        grossDonations,
        successfulPayments,
        totalDonors: donorKeys.size,
        failedPayments,
        todaysDonations,
        thisMonthDonations,
        lastMonthDonations,
        monthlyGrowthPct,
        totalRefundedAmount,
        netDonations,
        receiptDeliveryRate,
        receiptsSentCount,
        prevGrossDonations,
        prevSuccessfulCount,
        prevTotalDonors,
        prevReceiptDeliveryRate,
      },
      trendSeries,
      purposeBreakdown,
      paymentMethodBreakdown,
      paymentStatusBreakdown,
      recentDonations,
      lastUpdatedAt: now,
    };
  },
});

/**
 * Daily donation activity for the Overview Calendar widget in Asia/Kolkata.
 */
export const getCalendarActivity = query({
  args: {
    year: v.number(),
    month: v.number(), // 0-indexed (0 = Jan, 11 = Dec)
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const monthStartMs =
      Date.UTC(args.year, args.month, 1, 0, 0, 0, 0) - IST_OFFSET_MS;
    const monthEndMs =
      Date.UTC(args.year, args.month + 1, 1, 0, 0, 0, 0) - 1 - IST_OFFSET_MS;

    const monthDocs = await ctx.db
      .query("donations")
      .withIndex("by_created_at", (q) =>
        q.gte("createdAt", monthStartMs).lte("createdAt", monthEndMs),
      )
      .order("desc")
      .collect();

    const captured = monthDocs.filter((d) => isCapturedLike(d.paymentStatus));

    const daysMap: Record<
      string,
      { dateKey: string; amount: number; count: number }
    > = {};

    const donations = captured.map((d) => {
      const dateKey = getIstDateKey(d.createdAt);
      if (!daysMap[dateKey]) {
        daysMap[dateKey] = { dateKey, amount: 0, count: 0 };
      }
      daysMap[dateKey].amount += d.amount;
      daysMap[dateKey].count += 1;

      return {
        _id: d._id,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(d),
        donorName: d.anonymous ? "Anonymous Donor" : d.donorName,
        amount: d.amount,
        purpose: d.purpose,
        paymentMethod: d.paymentMethod || "Razorpay",
        createdAt: d.createdAt,
        dateKey,
        paymentStatus: d.paymentStatus,
        receiptStatus: d.receiptStatus,
      };
    });

    const totalAmount = captured.reduce((s, d) => s + d.amount, 0);
    return {
      year: args.year,
      month: args.month,
      totalAmount,
      totalCount: captured.length,
      days: daysMap,
      donations,
    };
  },
});

/**
 * Operational alerts for the Admin Header notification bell.
 */
export const getAdminNotifications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const [recentAttempts, recentDonations, recentWebhooks] = await Promise.all([
      ctx.db
        .query("paymentAttempts")
        .withIndex("by_created_at")
        .order("desc")
        .take(25),
      ctx.db
        .query("donations")
        .withIndex("by_created_at")
        .order("desc")
        .take(50),
      ctx.db
        .query("webhookEvents")
        .withIndex("by_created_at")
        .order("desc")
        .take(25),
    ]);

    const items: Array<{
      id: string;
      type: "failed_payment" | "receipt_attention" | "webhook_error";
      title: string;
      subtitle: string;
      href: string;
      createdAt: number;
    }> = [];

    for (const a of recentAttempts) {
      if (a.status === "failed") {
        items.push({
          id: `attempt-${a._id}`,
          type: "failed_payment",
          title: `Failed payment: ₹${a.amount.toLocaleString("en-IN")}`,
          subtitle: a.donorName || a.donorEmail || a.errorDescription || "Payment attempt failed",
          href: "/admin/failed-payments",
          createdAt: a.createdAt,
        });
      }
    }

    for (const d of recentDonations) {
      if (d.receiptStatus === "failed" || d.receiptStatus === "needs_review") {
        items.push({
          id: `receipt-${d._id}`,
          type: "receipt_attention",
          title: `Receipt ${d.receiptStatus.replace("_", " ")}`,
          subtitle: `${resolveStoredOrHistoricalReceiptNumber(d)} · ${d.anonymous ? "Anonymous Donor" : d.donorName}`,
          href: `/admin/donations/${d._id}`,
          createdAt: d.createdAt,
        });
      }
    }

    for (const w of recentWebhooks) {
      if (w.status === "error") {
        items.push({
          id: `webhook-${w._id}`,
          type: "webhook_error",
          title: `Webhook error (${w.eventType})`,
          subtitle: w.errorMessage || "Check system logs",
          href: "/admin/settings",
          createdAt: w.createdAt,
        });
      }
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    const top = items.slice(0, 10);
    return {
      items: top,
      unreadCount: top.length,
    };
  },
});

/**
 * Paginated, searchable, filterable donations list for /admin/donations.
 * Uses Convex cursor pagination and indexes.
 */
export const listDonationsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    purpose: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    receiptStatus: v.optional(v.string()),
    refundStatus: v.optional(v.string()),
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
    startMs: v.optional(v.number()),
    endMs: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("latest"),
        v.literal("oldest"),
        v.literal("highest"),
        v.literal("lowest"),
        v.literal("receipt"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const sortDir = args.sortBy === "oldest" ? "asc" : "desc";
    const pageResult = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order(sortDir)
      .paginate(args.paginationOpts);

    const searchLower = args.search?.trim().toLowerCase() || "";

    let items = pageResult.page.map((d) => ({
      ...d,
      resolvedReceiptNumber: resolveStoredOrHistoricalReceiptNumber(d),
    }));

    if (searchLower) {
      items = items.filter(
        (d) =>
          d.resolvedReceiptNumber.toLowerCase().includes(searchLower) ||
          d.donorName.toLowerCase().includes(searchLower) ||
          d.donorEmail.toLowerCase().includes(searchLower) ||
          d.donorPhone.toLowerCase().includes(searchLower) ||
          d.razorpayPaymentId.toLowerCase().includes(searchLower) ||
          d.razorpayOrderId.toLowerCase().includes(searchLower),
      );
    }

    if (args.purpose && args.purpose !== "all") {
      items = items.filter((d) => d.purpose === args.purpose);
    }
    if (args.paymentMethod && args.paymentMethod !== "all") {
      items = items.filter(
        (d) => (d.paymentMethod || "razorpay").toLowerCase() === args.paymentMethod!.toLowerCase(),
      );
    }
    if (args.receiptStatus && args.receiptStatus !== "all") {
      items = items.filter((d) => d.receiptStatus === args.receiptStatus);
    }
    if (args.refundStatus && args.refundStatus !== "all") {
      items = items.filter(
        (d) => (d.refundStatus || "none") === args.refundStatus,
      );
    }
    if (args.minAmount !== undefined) {
      items = items.filter((d) => d.amount >= args.minAmount!);
    }
    if (args.maxAmount !== undefined) {
      items = items.filter((d) => d.amount <= args.maxAmount!);
    }
    if (args.startMs !== undefined) {
      items = items.filter((d) => d.createdAt >= args.startMs!);
    }
    if (args.endMs !== undefined) {
      items = items.filter((d) => d.createdAt <= args.endMs!);
    }

    if (args.sortBy === "highest") {
      items.sort((a, b) => b.amount - a.amount);
    } else if (args.sortBy === "lowest") {
      items.sort((a, b) => a.amount - b.amount);
    } else if (args.sortBy === "receipt") {
      items.sort((a, b) =>
        b.resolvedReceiptNumber.localeCompare(a.resolvedReceiptNumber),
      );
    }

    return {
      ...pageResult,
      page: items,
    };
  },
});

/**
 * Full donation detail view + email delivery logs + refund history.
 */
export const getDonationDetail = query({
  args: { donationId: v.id("donations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) return null;

    const refunds = await ctx.db
      .query("refunds")
      .withIndex("by_donation_id", (q) => q.eq("donationId", args.donationId))
      .collect();

    const emailLogs = await ctx.db
      .query("emailLogs")
      .withIndex("by_donation_id", (q) => q.eq("donationId", args.donationId))
      .order("desc")
      .collect();

    return {
      ...donation,
      resolvedReceiptNumber: resolveStoredOrHistoricalReceiptNumber(donation),
      refunds,
      emailLogs,
    };
  },
});

/**
 * Aggregated Donor Management listing (/admin/donors).
 */
export const listDonors = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const donorMap = new Map<
      string,
      {
        donorKey: string;
        donorName: string;
        donorEmail: string;
        donorPhone: string;
        anonymous: boolean;
        totalDonations: number;
        lifetimeContribution: number;
        firstDonationAt: number;
        lastDonationAt: number;
        donorType: "Repeat" | "One-Time" | "Anonymous";
      }
    >();

    for (const d of donations) {
      if (!isCapturedLike(d.paymentStatus)) continue;
      const key =
        d.donorKey ||
        computeDonorKey({
          donorEmail: d.donorEmail,
          donorPhone: d.donorPhone,
          anonymous: d.anonymous,
          razorpayPaymentId: d.razorpayPaymentId,
        });

      const existing = donorMap.get(key);
      if (!existing) {
        donorMap.set(key, {
          donorKey: key,
          donorName: d.anonymous ? "Anonymous Donor" : d.donorName,
          donorEmail: d.anonymous ? "Protected (Anonymous)" : d.donorEmail,
          donorPhone: d.anonymous ? "Protected" : d.donorPhone,
          anonymous: d.anonymous,
          totalDonations: 1,
          lifetimeContribution: d.amount,
          firstDonationAt: d.createdAt,
          lastDonationAt: d.createdAt,
          donorType: d.anonymous ? "Anonymous" : "One-Time",
        });
      } else {
        existing.totalDonations += 1;
        existing.lifetimeContribution += d.amount;
        existing.firstDonationAt = Math.min(existing.firstDonationAt, d.createdAt);
        existing.lastDonationAt = Math.max(existing.lastDonationAt, d.createdAt);
        if (!existing.anonymous && existing.totalDonations > 1) {
          existing.donorType = "Repeat";
        }
      }
    }

    let donors = Array.from(donorMap.values()).sort(
      (a, b) => b.lifetimeContribution - a.lifetimeContribution,
    );

    const q = args.search?.trim().toLowerCase() || "";
    if (q) {
      donors = donors.filter(
        (donor) =>
          donor.donorName.toLowerCase().includes(q) ||
          donor.donorEmail.toLowerCase().includes(q) ||
          donor.donorPhone.toLowerCase().includes(q),
      );
    }

    return donors;
  },
});

/**
 * Full Donor Profile with timeline, receipt history, and refund history (/admin/donors/[id]).
 */
export const getDonorProfile = query({
  args: { donorKey: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const allDonations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const matching = allDonations.filter((d) => {
      if (!isCapturedLike(d.paymentStatus)) return false;
      const key =
        d.donorKey ||
        computeDonorKey({
          donorEmail: d.donorEmail,
          donorPhone: d.donorPhone,
          anonymous: d.anonymous,
          razorpayPaymentId: d.razorpayPaymentId,
        });
      return key === args.donorKey;
    });

    if (matching.length === 0) return null;

    const latest = matching[0];
    const lifetimeContribution = matching.reduce((s, d) => s + d.amount, 0);
    const totalDonations = matching.length;
    const avgDonation = Math.round(lifetimeContribution / totalDonations);
    const firstDonationAt = Math.min(...matching.map((d) => d.createdAt));
    const lastDonationAt = Math.max(...matching.map((d) => d.createdAt));

    const donationIds = new Set(matching.map((d) => String(d._id)));
    const allRefunds = await ctx.db.query("refunds").collect();
    const donorRefunds = allRefunds.filter((r) =>
      donationIds.has(String(r.donationId)),
    );

    return {
      donorKey: args.donorKey,
      donorName: latest.anonymous ? "Anonymous Donor" : latest.donorName,
      donorEmail: latest.anonymous ? "Protected (Anonymous)" : latest.donorEmail,
      donorPhone: latest.anonymous ? "Protected" : latest.donorPhone,
      anonymous: latest.anonymous,
      lifetimeContribution,
      totalDonations,
      avgDonation,
      firstDonationAt,
      lastDonationAt,
      donations: matching.map((d) => ({
        ...d,
        resolvedReceiptNumber: resolveStoredOrHistoricalReceiptNumber(d),
      })),
      refunds: donorRefunds,
    };
  },
});

/**
 * Payment Attempts & Failed Payments (/admin/payment-attempts & /admin/failed-payments).
 */
export const listPaymentAttempts = query({
  args: {
    statusFilter: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const attempts = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_created_at")
      .order("desc")
      .take(250);

    let filtered = attempts;
    if (args.statusFilter && args.statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === args.statusFilter);
    }
    const q = args.search?.trim().toLowerCase() || "";
    if (q) {
      filtered = filtered.filter(
        (a) =>
          (a.donorName || "").toLowerCase().includes(q) ||
          (a.donorEmail || "").toLowerCase().includes(q) ||
          a.razorpayOrderId.toLowerCase().includes(q) ||
          (a.razorpayPaymentId || "").toLowerCase().includes(q) ||
          (a.errorCode || "").toLowerCase().includes(q),
      );
    }
    return filtered;
  },
});

/**
 * Receipts Registry & Counter summary (/admin/receipts).
 */
export const listReceipts = query({
  args: {
    statusFilter: v.optional(v.string()),
    yearFilter: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const counters = await ctx.db.query("receiptCounters").collect();
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .take(300);

    let items = donations
      .filter((d) => isCapturedLike(d.paymentStatus))
      .map((d) => ({
        _id: d._id,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(d),
        receiptYear: d.receiptYear ?? getIstYear(d.createdAt),
        receiptSequence: d.receiptSequence ?? null,
        razorpayPaymentId: d.razorpayPaymentId,
        donorName: d.anonymous ? "Anonymous Donor" : d.donorName,
        donorEmail: d.donorEmail,
        amount: d.amount,
        currency: d.currency,
        purpose: d.purpose,
        receiptStatus: d.receiptStatus,
        receiptSentAt: d.receiptSentAt,
        receiptError: d.receiptError,
        emailRetryCount: d.emailRetryCount ?? 0,
        createdAt: d.createdAt,
      }));

    if (args.statusFilter && args.statusFilter !== "all") {
      items = items.filter((i) => i.receiptStatus === args.statusFilter);
    }
    if (args.yearFilter) {
      items = items.filter((i) => i.receiptYear === args.yearFilter);
    }
    const q = args.search?.trim().toLowerCase() || "";
    if (q) {
      items = items.filter(
        (i) =>
          i.receiptNumber.toLowerCase().includes(q) ||
          i.donorName.toLowerCase().includes(q) ||
          i.donorEmail.toLowerCase().includes(q) ||
          i.razorpayPaymentId.toLowerCase().includes(q),
      );
    }

    return {
      counters: counters.sort((a, b) => b.year - a.year),
      receipts: items,
    };
  },
});

/**
 * Financial Reports & Analytics (/admin/reports).
 */
export const getReportsData = query({
  args: {
    startMs: v.optional(v.number()),
    endMs: v.optional(v.number()),
    purpose: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const startMs = args.startMs ?? 0;
    const endMs = args.endMs ?? Date.now();

    const allDonations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    const allAttempts = await ctx.db
      .query("paymentAttempts")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    const allRefunds = await ctx.db
      .query("refunds")
      .withIndex("by_requested_at")
      .order("desc")
      .collect();

    const filteredDonations = allDonations.filter((d) => {
      if (!isCapturedLike(d.paymentStatus)) return false;
      if (d.createdAt < startMs || d.createdAt > endMs) return false;
      if (args.purpose && args.purpose !== "all" && d.purpose !== args.purpose) {
        return false;
      }
      if (
        args.paymentMethod &&
        args.paymentMethod !== "all" &&
        (d.paymentMethod || "razorpay").toLowerCase() !==
          args.paymentMethod.toLowerCase()
      ) {
        return false;
      }
      return true;
    });

    const filteredAttempts = allAttempts.filter(
      (a) => a.createdAt >= startMs && a.createdAt <= endMs,
    );
    const filteredRefunds = allRefunds.filter(
      (r) => r.requestedAt >= startMs && r.requestedAt <= endMs,
    );

    const grossDonations = filteredDonations.reduce((s, d) => s + d.amount, 0);
    const completedRefunds = filteredRefunds
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + r.refundedAmount, 0);
    const netDonations = Math.max(0, grossDonations - completedRefunds);

    // Monthly breakdown
    const monthlyMap = new Map<string, { month: string; gross: number; count: number }>();
    const methodMap = new Map<string, { method: string; amount: number; count: number }>();
    const purposeMap = new Map<string, { purpose: string; amount: number; count: number }>();

    for (const d of filteredDonations) {
      const ist = new Date(d.createdAt + IST_OFFSET_MS);
      const mKey = `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}`;
      const mEntry = monthlyMap.get(mKey) || { month: mKey, gross: 0, count: 0 };
      mEntry.gross += d.amount;
      mEntry.count += 1;
      monthlyMap.set(mKey, mEntry);

      const methodKey = d.paymentMethod || "Razorpay";
      const pmEntry = methodMap.get(methodKey) || {
        method: methodKey,
        amount: 0,
        count: 0,
      };
      pmEntry.amount += d.amount;
      pmEntry.count += 1;
      methodMap.set(methodKey, pmEntry);

      const pKey = d.purpose || "General Donation";
      const pEntry = purposeMap.get(pKey) || { purpose: pKey, amount: 0, count: 0 };
      pEntry.amount += d.amount;
      pEntry.count += 1;
      purposeMap.set(pKey, pEntry);
    }

    const receiptSummary = {
      sent: filteredDonations.filter((d) => d.receiptStatus === "sent").length,
      pending: filteredDonations.filter((d) => d.receiptStatus === "pending").length,
      failed: filteredDonations.filter(
        (d) => d.receiptStatus === "failed" || d.receiptStatus === "needs_review",
      ).length,
    };

    const distinctPurposes = Array.from(
      new Set(allDonations.map((d) => d.purpose).filter(Boolean)),
    );

    return {
      summary: {
        grossDonations,
        completedRefunds,
        netDonations,
        successfulCount: filteredDonations.length,
        failedCount: filteredAttempts.filter((a) => a.status === "failed").length,
        refundCount: filteredRefunds.length,
      },
      monthlyComparison: Array.from(monthlyMap.values()).sort((a, b) =>
        a.month.localeCompare(b.month),
      ),
      paymentMethods: Array.from(methodMap.values()).sort(
        (a, b) => b.amount - a.amount,
      ),
      purposeDistribution: Array.from(purposeMap.values()).sort(
        (a, b) => b.amount - a.amount,
      ),
      receiptSummary,
      distinctPurposes,
      refunds: filteredRefunds,
    };
  },
});

/**
 * Formula-injection-safe CSV export mutation (logs export in adminAuditLogs).
 * Only Owner and Admin can export donor PII; Viewer exports anonymized summary.
 */
export const exportDonationsCsv = mutation({
  args: {
    startMs: v.optional(v.number()),
    endMs: v.optional(v.number()),
    purpose: v.optional(v.string()),
    reportType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const startMs = args.startMs ?? 0;
    const endMs = args.endMs ?? Date.now();
    const canViewPii = admin.role === "owner" || admin.role === "admin";

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const rows = donations.filter((d) => {
      if (d.createdAt < startMs || d.createdAt > endMs) return false;
      if (args.purpose && args.purpose !== "all" && d.purpose !== args.purpose) {
        return false;
      }
      return true;
    });

    const headers = [
      "Receipt Number",
      "Date (IST)",
      "Donor Name",
      "Donor Email",
      "Donor Phone",
      "Amount",
      "Currency",
      "Purpose",
      "Payment Method",
      "Payment Status",
      "Receipt Status",
      "Refunded Amount",
      "Razorpay Payment ID",
      "Razorpay Order ID",
    ];

    const lines = [headers.map(escapeCsvCell).join(",")];
    for (const d of rows) {
      const istDate = new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(d.createdAt));

      const hideDonor = d.anonymous || !canViewPii;

      lines.push(
        [
          resolveStoredOrHistoricalReceiptNumber(d),
          istDate,
          hideDonor ? "Protected / Anonymous" : d.donorName,
          hideDonor ? "Protected" : d.donorEmail,
          hideDonor ? "Protected" : d.donorPhone,
          d.amount,
          d.currency,
          d.purpose,
          d.paymentMethod || "Razorpay",
          d.paymentStatus,
          d.receiptStatus,
          d.refundedAmount ?? 0,
          d.razorpayPaymentId,
          d.razorpayOrderId,
        ]
          .map(escapeCsvCell)
          .join(","),
      );
    }

    await recordAdminAudit(ctx, admin, {
      action: "CSV_EXPORT",
      resourceType: "reports",
      metadata: {
        reportType: args.reportType || "donations",
        rowCount: rows.length,
        purpose: args.purpose || "all",
      },
    });

    return {
      csv: lines.join("\r\n"),
      rowCount: rows.length,
    };
  },
});

/**
 * Campaigns / Donation Purposes (/admin/campaigns).
 */
export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    const campaigns = await ctx.db.query("campaigns").collect();
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_created_at")
      .collect();

    const statsByPurpose = new Map<string, { raised: number; count: number }>();
    for (const d of donations) {
      if (!isCapturedLike(d.paymentStatus)) continue;
      const p = d.purpose || "General Donation";
      const cur = statsByPurpose.get(p) || { raised: 0, count: 0 };
      cur.raised += d.amount;
      cur.count += 1;
      statsByPurpose.set(p, cur);
    }

    return {
      campaigns: campaigns.sort((a, b) => a.sortOrder - b.sortOrder),
      purposeTotals: Array.from(statsByPurpose.entries()).map(([purpose, st]) => ({
        purpose,
        ...st,
      })),
    };
  },
});

export const upsertCampaign = mutation({
  args: {
    id: v.optional(v.id("campaigns")),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    targetAmount: v.optional(v.number()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, ["owner", "admin"]);
    const now = Date.now();

    if (args.id) {
      await ctx.db.patch(args.id, {
        title: args.title.trim(),
        slug: args.slug.trim().toLowerCase(),
        description: args.description.trim(),
        targetAmount: args.targetAmount,
        isActive: args.isActive,
        sortOrder: args.sortOrder,
        updatedAt: now,
      });
      await recordAdminAudit(ctx, admin, {
        action: "CAMPAIGN_UPDATED",
        resourceType: "campaigns",
        resourceId: String(args.id),
        metadata: { title: args.title },
      });
      return { id: args.id };
    }

    const newId = await ctx.db.insert("campaigns", {
      title: args.title.trim(),
      slug: args.slug.trim().toLowerCase(),
      description: args.description.trim(),
      targetAmount: args.targetAmount,
      isActive: args.isActive,
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
    await recordAdminAudit(ctx, admin, {
      action: "CAMPAIGN_CREATED",
      resourceType: "campaigns",
      resourceId: String(newId),
      metadata: { title: args.title },
    });
    return { id: newId };
  },
});

/**
 * Owner-only: Record a verified refund entry (requires explicit Razorpay Refund ID).
 * Never initiates live refunds automatically or creates a new receipt number.
 */
export const recordVerifiedRefundByAdmin = mutation({
  args: {
    donationId: v.id("donations"),
    razorpayRefundId: v.string(),
    refundedAmount: v.number(),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, ["owner"]);
    const donation = await ctx.db.get(args.donationId);
    if (!donation) {
      throw new Error("NOT_FOUND: Donation record not found.");
    }
    if (args.refundedAmount <= 0 || args.refundedAmount > donation.amount) {
      throw new Error("INVALID_AMOUNT: Refund amount must be between ₹1 and the captured donation amount.");
    }

    const now = Date.now();
    const receiptNumber = resolveStoredOrHistoricalReceiptNumber(donation);
    const refundType =
      args.refundedAmount >= donation.amount ? ("full" as const) : ("partial" as const);

    const refundId = await ctx.db.insert("refunds", {
      donationId: donation._id,
      receiptNumber,
      razorpayPaymentId: donation.razorpayPaymentId,
      razorpayRefundId: args.razorpayRefundId.trim(),
      refundedAmount: args.refundedAmount,
      currency: donation.currency,
      refundType,
      reason: args.reason.trim(),
      status: args.status,
      requestedByAdminId: admin.clerkUserId,
      requestedAt: now,
      completedAt: args.status === "completed" ? now : undefined,
      updatedAt: now,
    });

    const allRefunds = await ctx.db
      .query("refunds")
      .withIndex("by_donation_id", (q) => q.eq("donationId", donation._id))
      .collect();

    const completedSum = allRefunds
      .filter((r) => r.status === "completed")
      .reduce((s, r) => s + r.refundedAmount, 0);

    await ctx.db.patch(donation._id, {
      refundStatus:
        completedSum >= donation.amount
          ? "refunded"
          : completedSum > 0
            ? "partially_refunded"
            : args.status === "pending"
              ? "pending"
              : "none",
      paymentStatus:
        completedSum >= donation.amount
          ? "refunded"
          : completedSum > 0
            ? "partially_refunded"
            : donation.paymentStatus,
      refundedAmount: completedSum,
      refundReference: args.razorpayRefundId.trim(),
      refundedAt: args.status === "completed" ? now : donation.refundedAt,
      updatedAt: now,
    });

    await recordAdminAudit(ctx, admin, {
      action: "REFUND_RECORDED",
      resourceType: "refunds",
      resourceId: String(refundId),
      metadata: {
        receiptNumber,
        refundedAmount: args.refundedAmount,
        status: args.status,
      },
    });

    return { success: true, refundId };
  },
});

/**
 * System Settings & Health diagnostics (/admin/settings).
 * Returns boolean configuration indicators only — never exposes secret values.
 */
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ["owner", "admin", "viewer"]);

    const webhookEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);

    const emailLogs = await ctx.db
      .query("emailLogs")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);

    const donationsPending = await ctx.db
      .query("donations")
      .withIndex("by_receipt_status", (q) => q.eq("receiptStatus", "pending"))
      .collect();

    const donationsFailed = await ctx.db
      .query("donations")
      .withIndex("by_receipt_status", (q) => q.eq("receiptStatus", "failed"))
      .collect();

    const lastWebhook = webhookEvents.find((w) => w.status === "processed") || null;
    const recentWebhookErrors = webhookEvents.filter((w) => w.status === "error");
    const duplicateWebhookCount = webhookEvents.filter(
      (w) => w.status === "duplicate",
    ).length;

    const lastSentEmail = emailLogs.find((e) => e.status === "sent") || null;
    const recentEmailFailures = emailLogs.filter(
      (e) => e.status === "failed" || e.status === "needs_review",
    );

    return {
      services: {
        clerkConfigured: Boolean(process.env.CLERK_FRONTEND_API_URL),
        convexConnected: true,
        razorpayWebhookConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
        resendConfigured:
          Boolean(process.env.RESEND_API_KEY) &&
          Boolean(process.env.RESEND_FROM_EMAIL),
        pdfServiceReady: true,
        logoConfigured: Boolean(process.env.ORG_LOGO_STORAGE_ID),
        signatureConfigured: Boolean(process.env.FOUNDER_SIGNATURE_STORAGE_ID),
      },
      webhookHealth: {
        lastSuccessfulAt: lastWebhook?.createdAt ?? null,
        processedCount: webhookEvents.filter((w) => w.status === "processed").length,
        duplicateCount: duplicateWebhookCount,
        recentErrors: recentWebhookErrors.slice(0, 10),
      },
      emailHealth: {
        lastSentAt: lastSentEmail?.createdAt ?? null,
        pendingCount: donationsPending.length,
        failedDonationCount: donationsFailed.length,
        recentFailures: recentEmailFailures.slice(0, 10),
      },
    };
  },
});
