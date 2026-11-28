"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignOutButton, useAuth, useUser, useClerk, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Loader2, ArrowLeft, LogOut, Clock } from "lucide-react";

export const ADMIN_TAB_SESSION_KEY = "unihope_admin_tab_active";
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = useQuery(api.admin.getMyAdminAccess);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();
  const router = useRouter();
  const [tabSessionValid, setTabSessionValid] = useState<boolean | null>(null);

  // 1. Tab / Browser Close Protection (sessionStorage lifecycle)
  useEffect(() => {
    if (!session) return;
    if (typeof window === "undefined") return;

    const checkTabSession = () => {
      const isTabActive = window.sessionStorage.getItem(ADMIN_TAB_SESSION_KEY);

      if (isTabActive) {
        // Existing active tab session confirmed
        setTabSessionValid(true);
      } else {
        // Tab storage is empty. Check if this is a fresh login within the last 90 seconds
        const sessionCreatedAt = session.createdAt
          ? new Date(session.createdAt).getTime()
          : 0;
        const sessionAgeMs = Date.now() - sessionCreatedAt;

        if (sessionAgeMs < 90000) {
          // Fresh login detected: register active tab session
          window.sessionStorage.setItem(ADMIN_TAB_SESSION_KEY, Date.now().toString());
          setTabSessionValid(true);
        } else {
          // Tab was closed and reopened, or browser was restarted with a stale session.
          // Terminate session so re-entry strictly requires a fresh login.
          setTabSessionValid(false);
          signOut({ redirectUrl: "/sign-in?reason=session_closed" }).then(() => {
            router.replace("/sign-in");
          });
        }
      }
    };

    // Scheduled asynchronously to prevent synchronous cascading re-renders in effect body
    const tick = setTimeout(checkTabSession, 0);
    return () => clearTimeout(tick);
  }, [session, signOut, router]);

  // 2. Inactivity Auto-Logout (15 Minutes)
  useEffect(() => {
    if (!tabSessionValid || !access?.isAdmin) return;

    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(ADMIN_TAB_SESSION_KEY);
        }
        signOut({ redirectUrl: "/sign-in?reason=inactivity" }).then(() => {
          router.replace("/sign-in");
        });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) =>
      window.addEventListener(evt, resetInactivityTimer, { passive: true })
    );

    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) =>
        window.removeEventListener(evt, resetInactivityTimer)
      );
    };
  }, [tabSessionValid, access?.isAdmin, signOut, router]);

  // Redirect ONLY when Clerk has finished loading and the user is genuinely signed out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/admin");
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state while Clerk initializes, Convex verifies identity, or tab session validates
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#012A5F]" />
        <p className="mt-3 text-sm font-medium text-gray-600">
          {isLoaded && !isSignedIn
            ? "Redirecting to admin sign-in..."
            : "Initializing authentication..."}
        </p>
      </div>
    );
  }

  if (access === undefined || (session && tabSessionValid === null)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#012A5F]" />
        <p className="mt-3 text-sm font-medium text-gray-600">
          Verifying administrative permissions...
        </p>
      </div>
    );
  }

  // Clerk is signed in, but Convex did not receive or accept a valid JWT session token.
  // Do NOT redirect back to /sign-in (which causes an infinite loop).
  if (!access.isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Authentication Synchronization Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You are signed in to Clerk, but the backend could not verify your session token. Please retry or sign out and sign back in.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Retry Verification
            </button>
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#012A5F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#012048] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out / Switch Account
              </button>
            </SignOutButton>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Session closed / expired due to tab close
  if (tabSessionValid === false) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
        <p className="mt-3 text-sm font-medium text-gray-700">
          Admin session closed. Redirecting to login...
        </p>
      </div>
    );
  }

  // Authenticated but unauthorized (not in adminUsers or isActive === false)
  if (!access.isAdmin) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            You are signed in as{" "}
            <span className="font-semibold text-gray-900">
              {access.email || user?.primaryEmailAddress?.emailAddress || "your account"}
            </span>
            , but you do not have active administrator permissions for the UNIHOPE Foundation Dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#012A5F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#012048]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out / Switch Account
              </button>
            </SignOutButton>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active verified admin
  return <>{children}</>;
}
