"use client";

import React, { Component, ReactNode } from "react";
import { useAuth, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Key,
  Server,
  AlertTriangle,
  ArrowRight,
  LogOut,
  LogIn,
} from "lucide-react";

// Safe React Error Boundary to catch any rendering or query exceptions
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class DiagnosticErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Diagnostic error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Diagnostic Execution Error
          </div>
          <p className="mt-2 text-sm text-red-700">{this.state.errorMessage}</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="mt-4 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry Diagnostics
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DevAuthCheckContent() {
  // 1. Clerk Authentication Check via useAuth()
  const {
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
    userId: clerkUserId,
  } = useAuth();

  // 2. Convex Authentication Check via useConvexAuth()
  const {
    isLoading: convexLoading,
    isAuthenticated: convexAuthenticated,
  } = useConvexAuth();

  // 3. Backend Identity Check via safe diagnostic query (called only when Convex is authenticated)
  const identity = useQuery(
    api.authTest.getViewerIdentity,
    convexAuthenticated ? {} : "skip"
  );

  // Derived Statuses
  const clerkStatus = !clerkLoaded
    ? "Loading"
    : clerkSignedIn
      ? "Signed In"
      : "Signed Out";

  const convexStatus = convexLoading
    ? "Connecting"
    : convexAuthenticated
      ? "Authenticated"
      : "Not Authenticated";

  const identityStatus = !convexAuthenticated
    ? "NOT RECEIVED"
    : identity === undefined
      ? "Querying..."
      : identity && identity.subject
        ? "RECEIVED"
        : "NOT RECEIVED";

  // Three Core Evaluation Flags
  const isClerkPass = Boolean(clerkLoaded && clerkSignedIn);
  const isConvexPass = Boolean(!convexLoading && convexAuthenticated);
  const isIdentityPass = Boolean(identity && identity.subject);

  // Overall Final Status
  let finalStatus: "PASS" | "FAIL" | "WAITING" = "WAITING";
  let statusReason = "";

  if (!clerkLoaded || convexLoading) {
    finalStatus = "WAITING";
    statusReason = "Waiting for Clerk and Convex authentication services to initialize...";
  } else if (!isClerkPass) {
    finalStatus = "FAIL";
    statusReason =
      "Clerk is not signed in. An active browser sign-in is required to test Convex identity verification.";
  } else if (!isConvexPass) {
    finalStatus = "WAITING";
    statusReason =
      "Clerk session is active. Convex is establishing secure JWT authentication with applicationID 'convex'...";
  } else if (identity === undefined) {
    finalStatus = "WAITING";
    statusReason = "Convex authenticated. Executing backend identity query...";
  } else if (isIdentityPass) {
    finalStatus = "PASS";
    statusReason =
      "All 3 layers verified: Clerk is signed in, Convex accepted the JWT, and the backend verified identity.";
  } else {
    finalStatus = "FAIL";
    statusReason =
      "Convex reported authentication, but backend ctx.auth.getUserIdentity() did not return a valid subject.";
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              DEVELOPMENT ONLY
            </span>
            <span className="text-xs text-gray-500">
              Target: hardy-spider-10
            </span>
          </div>
          {clerkSignedIn && <UserButton />}
        </div>

        {/* Title */}
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Clerk + Convex Authentication Diagnostics
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time reactive verification of client session, Convex JWT negotiation, and backend identity claims.
        </p>

        {/* Main Verdict Card */}
        <div
          className={`mt-6 rounded-2xl border p-6 shadow-sm transition-all ${
            finalStatus === "PASS"
              ? "border-emerald-200 bg-emerald-50/70"
              : finalStatus === "FAIL"
                ? "border-red-200 bg-red-50/70"
                : "border-blue-200 bg-blue-50/70"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Diagnostic Verdict
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                finalStatus === "PASS"
                  ? "bg-emerald-600 text-white"
                  : finalStatus === "FAIL"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
              }`}
            >
              {finalStatus === "PASS" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {finalStatus === "FAIL" && <XCircle className="h-3.5 w-3.5" />}
              {finalStatus === "WAITING" && <Clock className="h-3.5 w-3.5 animate-pulse" />}
              {finalStatus}
            </span>
          </div>

          <p
            className={`mt-3 text-sm font-medium ${
              finalStatus === "PASS"
                ? "text-emerald-950"
                : finalStatus === "FAIL"
                  ? "text-red-950"
                  : "text-blue-950"
            }`}
          >
            {statusReason}
          </p>
        </div>

        {/* 3-Tier Check List */}
        <div className="mt-6 space-y-4">
          {/* Tier 1: Clerk */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isClerkPass
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    CLERK AUTHENTICATION
                  </h2>
                  <p className="text-xs text-gray-500">
                    Client session state via useAuth()
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isClerkPass
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  STATUS: {isClerkPass ? "TRUE" : "FALSE"}
                </span>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                  State: {clerkStatus}
                </p>
              </div>
            </div>

            {clerkSignedIn && clerkUserId && (
              <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
                <span className="font-medium text-gray-700">Clerk User ID:</span>{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-900">
                  {clerkUserId}
                </code>
              </div>
            )}
          </div>

          {/* Tier 2: Convex */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isConvexPass
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    CONVEX AUTHENTICATION
                  </h2>
                  <p className="text-xs text-gray-500">
                    WebSocket JWT exchange via useConvexAuth()
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isConvexPass
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  STATUS: {isConvexPass ? "TRUE" : "FALSE"}
                </span>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                  State: {convexStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Tier 3: Backend Identity */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isIdentityPass
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    BACKEND IDENTITY
                  </h2>
                  <p className="text-xs text-gray-500">
                    Verified claims via ctx.auth.getUserIdentity()
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isIdentityPass
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  STATUS: {identityStatus}
                </span>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                  Query: api.authTest.getViewerIdentity
                </p>
              </div>
            </div>

            {isIdentityPass && identity && (
              <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">Verified Subject:</span>{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-gray-900">
                    {identity.subject}
                  </code>
                </p>
                {identity.email && (
                  <p className="mt-1">
                    <span className="font-medium text-gray-700">Verified Email:</span>{" "}
                    <span className="text-gray-900">{identity.email}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Interaction Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-800">
              Interactive Test Actions
            </p>
            <p className="text-[11px] text-gray-500">
              Test real-time reactive transitions on sign-in / sign-out.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!clerkSignedIn ? (
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-[#012A5F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#012048]"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In to Test
                </button>
              </SignInButton>
            ) : (
              <SignOutButton>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <LogOut className="h-3.5 w-3.5 text-gray-500" />
                  Sign Out
                </button>
              </SignOutButton>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-xs">
          <Link
            href="/"
            className="font-medium text-gray-500 transition hover:text-gray-900"
          >
            &larr; Return to Home
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1 font-semibold text-[#012A5F] transition hover:underline"
          >
            Go to Admin Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DevAuthCheckPage() {
  return (
    <DiagnosticErrorBoundary>
      <DevAuthCheckContent />
    </DiagnosticErrorBoundary>
  );
}
