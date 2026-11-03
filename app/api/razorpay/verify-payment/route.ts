import crypto from "node:crypto";
import { validateVerifyPaymentInput } from "@/lib/validations/donation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getConvexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

interface RazorpayPaymentResponse {
  id: string;
  order_id: string;
  status: string;
  currency: string;
  amount: number;
}

/**
 * Executes a resilient, timed fetch against the Razorpay REST API.
 * Uses native fetch with an explicit AbortSignal timeout to prevent
 * unhandled socket hangs or 20+ second delays.
 */
async function fetchRazorpayPayment(
  paymentId: string,
  keyId: string,
  keySecret: string,
  timeoutMs = 6000,
): Promise<{
  ok: boolean;
  status: number;
  data?: RazorpayPaymentResponse;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      },
    );

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          data?.error?.description ||
          `Razorpay gateway error (HTTP ${response.status})`,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as RazorpayPaymentResponse,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.toLowerCase().includes("abort"));

    return {
      ok: false,
      status: isAbort ? 504 : 502,
      error: isAbort
        ? "Razorpay payment fetch request timed out."
        : err instanceof Error
          ? err.message
          : "Network communication failure.",
    };
  }
}

export async function POST(request: Request) {
  console.log("[PAYMENT_VERIFY] Request received");

  // 1. Rate limiting
  const rateLimit = await checkRateLimit(
    request,
    "verify-payment",
    Number(process.env.RATE_LIMIT_VERIFY_PER_MIN || 20),
    60,
  );

  if (!rateLimit.allowed) {
    console.warn("[PAYMENT_VERIFY] Rate limit exceeded");
    return Response.json(
      { error: "Too many verification requests. Please wait a moment." },
      { status: 429 },
    );
  }

  // 2. Validate Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    console.warn("[PAYMENT_VERIFY] Unsupported Content-Type:", contentType);
    return Response.json(
      { error: "Content-Type must be application/json." },
      { status: 415 },
    );
  }

  // 3. Parse JSON safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.warn("[PAYMENT_VERIFY] Malformed JSON in request");
    return Response.json(
      { error: "Invalid JSON format in payment verification request." },
      { status: 400 },
    );
  }

  // 4. Strict input schema validation
  const validation = validateVerifyPaymentInput(body);
  if (!validation.valid) {
    console.warn("[PAYMENT_VERIFY] Input validation failed:", validation.error);
    return Response.json({ error: validation.error }, { status: 400 });
  }

  console.log("[PAYMENT_VERIFY] Input validated");

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = validation.data;

  // 5. Check Razorpay credentials
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      "[PAYMENT_VERIFY] Razorpay API credentials are not configured on server.",
    );
    return Response.json(
      { error: "Payment verification service is temporarily unavailable." },
      { status: 500 },
    );
  }

  // 6. Cryptographic HMAC-SHA256 signature verification
  const payloadToSign = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payloadToSign)
    .digest("hex");

  const generatedBuffer = Buffer.from(generatedSignature, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  const isSignatureValid =
    generatedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(generatedBuffer, receivedBuffer);

  if (!isSignatureValid) {
    console.warn(
      `[PAYMENT_VERIFY] Signature verification failed for order ${orderId}, payment ${paymentId}`,
    );
    return Response.json(
      { error: "Payment verification failed: signature mismatch." },
      { status: 400 },
    );
  }

  console.log(`[PAYMENT_VERIFY] Signature verified for ${paymentId}`);

  // 7. Fast lookup: Check if Convex has already captured this payment via webhook
  try {
    const convex = getConvexClient();
    const existing = await convex.query(api.donations.getDonationByPaymentId, {
      razorpayPaymentId: paymentId,
    });

    if (existing && existing.paymentStatus === "captured") {
      console.log(
        `[PAYMENT_VERIFY] Payment already confirmed captured in datastore for ${paymentId}`,
      );
      console.log("[PAYMENT_VERIFY] Payment validated");
      console.log("[PAYMENT_VERIFY] Response sent");

      return Response.json({
        success: true,
        referenceId: paymentId,
        orderId,
        amount: existing.amount,
        currency: existing.currency,
        paymentStatus: "captured",
        receiptPending: existing.receiptStatus !== "sent",
        message: "Payment verified successfully.",
      });
    }
  } catch (convexQueryErr: unknown) {
    const msg =
      convexQueryErr instanceof Error ? convexQueryErr.message : "unavailable";
    console.warn(`[PAYMENT_VERIFY] Datastore pre-check bypassed: ${msg}`);
  }

  // 8. Authoritative payment verification against Razorpay REST API
  console.log(`[PAYMENT_VERIFY] Razorpay fetch started for ${paymentId}`);
  const fetchResult = await fetchRazorpayPayment(
    paymentId,
    keyId,
    keySecret,
    6000,
  );
  console.log(
    `[PAYMENT_VERIFY] Razorpay fetch completed: status=${fetchResult.status}`,
  );

  if (!fetchResult.ok) {
    console.error(
      `[PAYMENT_VERIFY] Gateway lookup error: ${fetchResult.error} (HTTP ${fetchResult.status}) for ${paymentId}`,
    );

    // If Razorpay rejected credentials
    if (fetchResult.status === 401) {
      return Response.json(
        { error: "Payment gateway authentication failure. Please contact support." },
        { status: 502 },
      );
    }

    // If Razorpay reports payment does not exist
    if (fetchResult.status === 404) {
      return Response.json(
        { error: "Payment record not found on gateway." },
        { status: 400 },
      );
    }

    // If fetch timed out (504) or gateway network failed (502) after HMAC signature was verified:
    // The HMAC signature mathematically proves that Razorpay created the signature for this order and payment.
    // Return a safe pending verification response with reference ID instead of failing with 500.
    console.warn(
      `[PAYMENT_VERIFY] Fallback: Signature verified, returning pending confirmation for ${paymentId}`,
    );
    console.log("[PAYMENT_VERIFY] Payment validated");
    console.log("[PAYMENT_VERIFY] Response sent");

    return Response.json({
      success: true,
      referenceId: paymentId,
      orderId,
      paymentStatus: "pending",
      receiptPending: true,
      message:
        "Payment authorization verified. Gateway confirmation in progress.",
    });
  }

  const payment = fetchResult.data!;

  // Verify payment belongs to expected order
  if (payment.order_id !== orderId) {
    console.warn(
      `[PAYMENT_VERIFY] Order mismatch: expected ${orderId}, received ${payment.order_id}`,
    );
    return Response.json(
      { error: "Payment verification failed: payment does not match the order." },
      { status: 400 },
    );
  }

  // Verify currency is INR
  if (payment.currency !== "INR") {
    console.warn(`[PAYMENT_VERIFY] Invalid currency: ${payment.currency}`);
    return Response.json(
      { error: "Payment verification failed: invalid currency." },
      { status: 400 },
    );
  }

  // Verify payment status
  const validStatuses = ["captured", "authorized"];
  if (!validStatuses.includes(payment.status)) {
    console.warn(
      `[PAYMENT_VERIFY] Incomplete payment status on gateway: ${payment.status}`,
    );
    return Response.json(
      { error: `Payment not completed. Current status: ${payment.status}.` },
      { status: 400 },
    );
  }

  // Verify payment amount
  const amountInPaise = Number(payment.amount);
  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    console.warn(`[PAYMENT_VERIFY] Invalid payment amount: ${payment.amount}`);
    return Response.json(
      { error: "Payment verification failed: invalid amount." },
      { status: 400 },
    );
  }

  const amountInRupees = amountInPaise / 100;
  console.log(
    `[PAYMENT_VERIFY] Payment validated: status=${payment.status}, amount=₹${amountInRupees}`,
  );
  console.log("[PAYMENT_VERIFY] Response sent");

  return Response.json({
    success: true,
    referenceId: paymentId,
    orderId,
    amount: amountInRupees,
    currency: payment.currency,
    paymentStatus: payment.status,
    receiptPending: true,
    message:
      payment.status === "captured"
        ? "Payment verified successfully."
        : "Payment authorized. Waiting for capture confirmation.",
  });
}
