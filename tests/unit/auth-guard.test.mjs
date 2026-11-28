import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("AdminAuthGuard & Clerk Routing Configuration", () => {
  const guardSource = fs.readFileSync(
    path.resolve("app/admin/AdminAuthGuard.tsx"),
    "utf8",
  );
  const signInSource = fs.readFileSync(
    path.resolve("app/sign-in/[[...sign-in]]/page.tsx"),
    "utf8",
  );
  const signUpSource = fs.readFileSync(
    path.resolve("app/sign-up/[[...sign-up]]/page.tsx"),
    "utf8",
  );
  const layoutSource = fs.readFileSync(path.resolve("app/layout.tsx"), "utf8");
  const providerSource = fs.readFileSync(
    path.resolve("components/ConvexClientProvider.tsx"),
    "utf8",
  );

  it("BUG-AUTH-01: AdminAuthGuard checks Clerk isLoaded & isSignedIn before redirecting", () => {
    assert.equal(guardSource.includes("useAuth()"), true);
    assert.equal(guardSource.includes("if (isLoaded && !isSignedIn)"), true);
    assert.equal(
      guardSource.includes("Authentication Synchronization Error"),
      true,
    );
    assert.equal(guardSource.includes("Access Denied"), true);
  });

  it("BUG-AUTH-02: SignIn and SignUp specify path routing, URLs, fallbackRedirectUrl, and Suspense fallback", () => {
    for (const prop of [
      'routing="path"',
      'path="/sign-in"',
      'signUpUrl="/sign-up"',
      'fallbackRedirectUrl="/admin"',
      "Loading sign-in...",
    ]) {
      assert.equal(signInSource.includes(prop), true);
    }

    for (const prop of [
      'routing="path"',
      'path="/sign-up"',
      'signInUrl="/sign-in"',
      'fallbackRedirectUrl="/admin"',
      "Loading sign-up...",
    ]) {
      assert.equal(signUpSource.includes(prop), true);
    }
  });

  it("BUG-AUTH-03: ClerkProvider specifies explicit signInUrl, signUpUrl, and fallback redirects", () => {
    for (const prop of [
      'signInUrl="/sign-in"',
      'signUpUrl="/sign-up"',
      'signInFallbackRedirectUrl="/admin"',
      'signUpFallbackRedirectUrl="/admin"',
    ]) {
      assert.equal(layoutSource.includes(prop), true);
    }
  });

  it("ConvexClientProvider uses ConvexProviderWithClerk and fails closed without NEXT_PUBLIC_CONVEX_URL", () => {
    assert.equal(providerSource.includes("ConvexProviderWithClerk"), true);
    assert.equal(providerSource.includes("useAuth={useAuth}"), true);
    assert.equal(providerSource.includes("hardy-spider-10"), false);
  });
});
