import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin, recordAdminAudit, type AdminRole } from "./lib/adminAuth";

/**
 * Query to inspect the caller's admin privileges.
 * Returns only authentication and role status.
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

    // Verify issuer match
    if (admin.issuer && admin.issuer !== identity.issuer) {
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
 */
export const bootstrapFirstOwner = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    fullName: v.string(),
    issuer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

/**
 * List all admin users (Owner & Admin can view; only Owner can modify).
 */
export const listAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx, ["owner", "admin"]);
    const users = await ctx.db.query("adminUsers").collect();
    return users.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Owner-only: Add / invite a new administrator by Clerk User ID + email + role.
 */
export const addAdminUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx, ["owner"]);
    const clerkUserId = args.clerkUserId.trim();
    const email = args.email.trim().toLowerCase();
    const fullName = args.fullName.trim();

    if (!clerkUserId.startsWith("user_")) {
      throw new Error("INVALID_ID: Clerk User ID must start with 'user_'.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("INVALID_EMAIL: Valid email is required.");
    }

    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
    if (existing) {
      throw new Error("CONFLICT: An admin user with this Clerk User ID already exists.");
    }

    const identity = await ctx.auth.getUserIdentity();
    const issuer =
      process.env.CLERK_FRONTEND_API_URL || identity?.issuer || "";

    const now = Date.now();
    const newId = await ctx.db.insert("adminUsers", {
      clerkUserId,
      issuer,
      email,
      fullName: fullName || email,
      role: args.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: caller.email,
    });

    await recordAdminAudit(ctx, caller, {
      action: "ADMIN_INVITED",
      resourceType: "adminUsers",
      resourceId: String(newId),
      metadata: { targetEmail: email, role: args.role },
    });

    return { success: true, adminId: newId };
  },
});

/**
 * Owner-only: Change an administrator's role (cannot demote/replace Owner).
 */
export const updateAdminRole = mutation({
  args: {
    adminId: v.id("adminUsers"),
    role: v.union(v.literal("admin"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx, ["owner"]);
    const target = await ctx.db.get(args.adminId);
    if (!target) {
      throw new Error("NOT_FOUND: Administrator record not found.");
    }
    if (target.role === "owner") {
      throw new Error("FORBIDDEN: Owner role cannot be modified or replaced.");
    }

    await ctx.db.patch(args.adminId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    await recordAdminAudit(ctx, caller, {
      action: "ADMIN_ROLE_CHANGED",
      resourceType: "adminUsers",
      resourceId: String(args.adminId),
      metadata: {
        targetEmail: target.email,
        previousRole: target.role,
        newRole: args.role,
      },
    });

    return { success: true };
  },
});

/**
 * Owner-only: Activate or deactivate an administrator account (cannot deactivate Owner).
 */
export const toggleAdminActive = mutation({
  args: {
    adminId: v.id("adminUsers"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx, ["owner"]);
    const target = await ctx.db.get(args.adminId);
    if (!target) {
      throw new Error("NOT_FOUND: Administrator record not found.");
    }
    if (target.role === "owner") {
      throw new Error("FORBIDDEN: Owner account cannot be deactivated.");
    }

    await ctx.db.patch(args.adminId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    await recordAdminAudit(ctx, caller, {
      action: args.isActive ? "ADMIN_ACTIVATED" : "ADMIN_DEACTIVATED",
      resourceType: "adminUsers",
      resourceId: String(args.adminId),
      metadata: { targetEmail: target.email, isActive: args.isActive },
    });

    return { success: true };
  },
});

/**
 * Record a client-initiated administrative audit event (e.g. PDF download, CSV export, login).
 * Uses verified Clerk identity on backend, never trusting client-supplied email/role.
 */
export const logAdminEvent = mutation({
  args: {
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const caller = await requireAdmin(ctx, ["owner", "admin", "viewer"]);
    await ctx.db.insert("adminAuditLogs", {
      adminUserId: caller.clerkUserId,
      adminEmail: caller.email,
      action: args.action.slice(0, 64),
      resourceType: args.resourceType.slice(0, 64),
      resourceId: args.resourceId?.slice(0, 128),
      metadata: args.metadata?.slice(0, 1000),
      timestamp: Date.now(),
    });
    return { logged: true };
  },
});

/**
 * Query audit logs (Owner & Admin).
 */
export const listAuditLogs = query({
  args: {
    actionFilter: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, ["owner", "admin"]);
    const maxItems = Math.min(Math.max(args.limit ?? 100, 10), 250);

    const logs = await ctx.db
      .query("adminAuditLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(maxItems);

    if (args.actionFilter && args.actionFilter !== "all") {
      return logs.filter((l) => l.action === args.actionFilter);
    }
    return logs;
  },
});
