import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Admin Authorization & RBAC Security Logic", () => {
  // Pure logic replica of convex/lib/adminAuth.ts
  async function simulateRequireAdmin(ctx, allowedRoles = ["owner", "admin", "viewer"]) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("UNAUTHENTICATED: Valid Clerk login session is required.");
    }

    const clerkUserId = identity.subject;
    const tokenIssuer = identity.issuer;

    const admin = await ctx.db.findAdminByClerkId(clerkUserId);
    if (!admin) {
      throw new Error("FORBIDDEN: User account is not registered as an administrator.");
    }

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

  // Pure logic replica of bootstrapFirstOwner
  async function simulateBootstrap(existingAdmins, newOwner) {
    if (existingAdmins.length > 0) {
      throw new Error(
        "BOOTSTRAP_REJECTED: An administrator already exists in the system. Bootstrap can only be run once on an empty adminUsers table."
      );
    }

    if (!newOwner.clerkUserId || !newOwner.clerkUserId.startsWith("user_")) {
      throw new Error("INVALID_ID: Clerk user IDs must start with 'user_'.");
    }

    return {
      success: true,
      clerkUserId: newOwner.clerkUserId,
      role: "owner",
      isActive: true,
    };
  }

  test("1. Unauthenticated request is rejected with UNAUTHENTICATED error", async () => {
    const ctx = {
      auth: { getUserIdentity: async () => null },
      db: { findAdminByClerkId: async () => null },
    };

    await assert.rejects(
      async () => simulateRequireAdmin(ctx),
      /UNAUTHENTICATED: Valid Clerk login session is required/
    );
  });

  test("2. Authenticated non-admin user is rejected with FORBIDDEN error", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_non_admin_999",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
        }),
      },
      db: { findAdminByClerkId: async () => null },
    };

    await assert.rejects(
      async () => simulateRequireAdmin(ctx),
      /FORBIDDEN: User account is not registered as an administrator/
    );
  });

  test("3. Authenticated user with mismatched token issuer is rejected", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_admin_123",
          issuer: "https://rogue-issuer.clerk.accounts.dev",
        }),
      },
      db: {
        findAdminByClerkId: async () => ({
          _id: "admin_1",
          clerkUserId: "user_admin_123",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
          email: "admin@unihope.org",
          fullName: "Admin User",
          role: "admin",
          isActive: true,
        }),
      },
    };

    await assert.rejects(
      async () => simulateRequireAdmin(ctx),
      /FORBIDDEN: Authentication issuer mismatch/
    );
  });

  test("4. Disabled administrator (isActive: false) is rejected", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_disabled_123",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
        }),
      },
      db: {
        findAdminByClerkId: async () => ({
          _id: "admin_disabled",
          clerkUserId: "user_disabled_123",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
          email: "disabled@unihope.org",
          fullName: "Disabled Admin",
          role: "admin",
          isActive: false,
        }),
      },
    };

    await assert.rejects(
      async () => simulateRequireAdmin(ctx),
      /FORBIDDEN: Administrator account is disabled or deactivated/
    );
  });

  test("5. Active owner is authorized for owner and general admin actions", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_owner_001",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
        }),
      },
      db: {
        findAdminByClerkId: async () => ({
          _id: "admin_owner",
          clerkUserId: "user_owner_001",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
          email: "founder@unihopefoundation.org",
          fullName: "Founder & Owner",
          role: "owner",
          isActive: true,
        }),
      },
    };

    const result = await simulateRequireAdmin(ctx, ["owner"]);
    assert.equal(result.role, "owner");
    assert.equal(result.email, "founder@unihopefoundation.org");
    assert.equal(result.isActive, true);
  });

  test("6. Active admin is authorized for admin actions, but rejected for owner-only actions", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_admin_002",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
        }),
      },
      db: {
        findAdminByClerkId: async () => ({
          _id: "admin_regular",
          clerkUserId: "user_admin_002",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
          email: "staff@unihope.org",
          fullName: "Staff Admin",
          role: "admin",
          isActive: true,
        }),
      },
    };

    // Allowed for general admin
    const result = await simulateRequireAdmin(ctx, ["owner", "admin"]);
    assert.equal(result.role, "admin");

    // Rejected for owner-only actions
    await assert.rejects(
      async () => simulateRequireAdmin(ctx, ["owner"]),
      /FORBIDDEN: Insufficient permissions/
    );
  });

  test("7. Viewer is authorized for read-only actions, but rejected for admin/owner actions", async () => {
    const ctx = {
      auth: {
        getUserIdentity: async () => ({
          subject: "user_viewer_003",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
        }),
      },
      db: {
        findAdminByClerkId: async () => ({
          _id: "admin_viewer",
          clerkUserId: "user_viewer_003",
          issuer: "https://true-koala-9430.clerk.accounts.dev",
          email: "auditor@unihope.org",
          fullName: "Auditor Viewer",
          role: "viewer",
          isActive: true,
        }),
      },
    };

    // Allowed for viewer
    const result = await simulateRequireAdmin(ctx, ["owner", "admin", "viewer"]);
    assert.equal(result.role, "viewer");

    // Rejected for admin/owner actions
    await assert.rejects(
      async () => simulateRequireAdmin(ctx, ["owner", "admin"]),
      /FORBIDDEN: Insufficient permissions/
    );
  });

  test("8. Bootstrap refuses to run if an administrator already exists", async () => {
    const existingAdmins = [{ clerkUserId: "user_owner_001", role: "owner" }];
    const newOwner = { clerkUserId: "user_new_002", email: "new@unihope.org" };

    await assert.rejects(
      async () => simulateBootstrap(existingAdmins, newOwner),
      /BOOTSTRAP_REJECTED: An administrator already exists/
    );
  });

  test("9. Bootstrap rejects invalid Clerk user ID format", async () => {
    const existingAdmins = [];
    const invalidOwner = { clerkUserId: "invalid_id_format", email: "new@unihope.org" };

    await assert.rejects(
      async () => simulateBootstrap(existingAdmins, invalidOwner),
      /INVALID_ID: Clerk user IDs must start with 'user_'/
    );
  });
});

