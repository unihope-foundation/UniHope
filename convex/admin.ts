import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { requireAdmin, type AdminRole } from "./lib/adminAuth";

/**
 * Query to inspect the caller's admin privileges.
 * Returns only authentication and role status.
 * Never exposes donation records or sensitive data.
 */
export const getMyAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        role: null,
        displayName: null,
        email: null,
      };
    }

    const admin = await ctx.db
      .query("adminUsers")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .first();

    if (!admin || !admin.isActive) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        role: null,
        displayName: identity.name || null,
        email: identity.email || null,
      };
    }

    return {
      isAuthenticated: true,
      isAdmin: true,
      role: admin.role as AdminRole,
      displayName: admin.fullName,
      email: admin.email,
    };
  },
});

/**
 * Protected test query requiring active admin permissions.
 * Enforces server-side authentication and role check.
 * Throws if unauthenticated, inactive, or unauthorized.
 */
export const verifyAdminSession = query({
  args: {},
  handler: async (ctx) => {
    const admin = await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    return {
      status: "authorized",
      role: admin.role,
      email: admin.email,
    };
  },
});

/**
 * One-time internal bootstrap mutation to register the first owner.
 * Inaccessible to public web clients (internalMutation).
 * Strictly refuses to run if an administrator or owner is already configured.
 */
export const bootstrapFirstOwner = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    fullName: v.string(),
    issuer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Refuse to run if any admin or owner is already configured
    const existing = await ctx.db.query("adminUsers").first();
    if (existing) {
      throw new Error(
        "BOOTSTRAP_REJECTED: An administrator already exists in the system. Bootstrap can only be run once on an empty adminUsers table."
      );
    }

    if (!args.clerkUserId.startsWith("user_")) {
      throw new Error("INVALID_ID: Clerk user IDs must start with 'user_'.");
    }

    const defaultIssuer =
      process.env.CLERK_FRONTEND_API_URL ||
      "https://true-koala-9430.clerk.accounts.dev";

    const now = Date.now();
    const adminId = await ctx.db.insert("adminUsers", {
      clerkUserId: args.clerkUserId.trim(),
      issuer: (args.issuer || defaultIssuer).trim(),
      email: args.email.trim().toLowerCase(),
      fullName: args.fullName.trim(),
      role: "owner",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "system_bootstrap",
    });

    return {
      success: true,
      adminId,
      role: "owner",
      message: `First owner registered successfully for ${args.email}.`,
    };
  },
});

