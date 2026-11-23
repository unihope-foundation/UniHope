import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export type AdminRole = "owner" | "admin" | "viewer";

export interface VerifiedAdmin {
  id: Doc<"adminUsers">["_id"];
  clerkUserId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
}

/**
 * Validates caller's Clerk JWT identity and checks that they exist
 * in the `adminUsers` table, are active, and hold an approved role.
 *
 * @throws {Error} if unauthenticated, inactive, or unauthorized.
 */
export async function requireAdmin(
  ctx: { auth: QueryCtx["auth"]; db: QueryCtx["db"] },
  allowedRoles: AdminRole[] = ["owner", "admin", "viewer"]
): Promise<VerifiedAdmin> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("UNAUTHENTICATED: Valid Clerk login session is required.");
  }

  // Verified Clerk subject (User ID), never client-supplied args
  const clerkUserId = identity.subject;
  const tokenIssuer = identity.issuer;

  const admin = await ctx.db
    .query("adminUsers")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!admin) {
    throw new Error("FORBIDDEN: User account is not registered as an administrator.");
  }

  // Verify Clerk issuer consistency
  if (admin.issuer && admin.issuer !== tokenIssuer) {
    throw new Error("FORBIDDEN: Authentication issuer mismatch.");
  }

  if (!admin.isActive) {
    throw new Error("FORBIDDEN: Administrator account is disabled or deactivated.");
  }

  if (!allowedRoles.includes(admin.role)) {
    throw new Error(
      `FORBIDDEN: Insufficient permissions. Required: ${allowedRoles.join(", ")}, current: ${admin.role}.`
    );
  }

  return {
    id: admin._id,
    clerkUserId: admin.clerkUserId,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
    isActive: admin.isActive,
  };
}

