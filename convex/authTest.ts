import { query } from "./_generated/server";

/**
 * Minimal authenticated identity verification test query.
 * Throws "Not authenticated" if unauthenticated.
 * Returns identity claims if called with a valid Clerk JWT.
 */
export const getViewerIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return {
      subject: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});

