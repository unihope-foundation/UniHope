import { ConvexHttpClient } from "convex/browser";

let convexClient: ConvexHttpClient | null = null;

/**
 * Returns a singleton instance of ConvexHttpClient for server-side Next.js route handlers.
 */
export function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not configured in environment variables.",
    );
  }

  if (!convexClient) {
    convexClient = new ConvexHttpClient(convexUrl);
  }

  return convexClient;
}

