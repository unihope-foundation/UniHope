import crypto from "node:crypto";
import Razorpay from "razorpay";
import { validateVerifyPaymentInput } from "@/lib/validations/donation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 1. Rate limiting
  const rateLimit = await checkRateLimit(
    request,
    "verify-payment",
    Number(process.env.RATE_LIMIT_VERIFY_PER_MIN || 20),
    60,
  );

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many verification requests. Please wait a moment." },
      { status: 429 },
    );
  }

  // 2. Validate Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
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
    return Response.json(
      { error: "Invalid JSON format in payment verification request." },
      { status: 400 },
    );
  }

  // 4. Strict input schema validation
  const validation = validateVerifyPaymentInput(body);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } =
    validation.data;

  // 5. Check Razorpay credentials
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay API credentials are not configured.");
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
    console.warn("Invalid Razorpay payment signature for order:", orderId);
    return Response.json(
      { error: "Payment verification failed: signature mismatch." },
      { status: 400 },
    );
  }

  // 7. Verify payment against Razorpay REST API
  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(paymentId);

    // Verify payment belongs to the expected order
    if (payment.order_id !== orderId) {
      console.warn("Razorpay payment order mismatch:", {
        expectedOrder: orderId,
        receivedOrder: payment.order_id,
      });
      return Response.json(
        { error: "Payment verification failed: payment does not match the order." },
        { status: 400 },
      );
    }

    // Verify currency
    if (payment.currency !== "INR") {
      return Response.json(
        { error: "Payment verification failed: invalid currency." },
        { status: 400 },
      );
    }

    // Verify payment status
    const validStatuses = ["captured", "authorized"];
    if (!validStatuses.includes(payment.status)) {
      return Response.json(
        { error: `Payment not completed. Current status: ${payment.status}.` },
        { status: 400 },
      );
    }

    // Verify amount
    const amountInPaise = Number(payment.amount);
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return Response.json(
        { error: "Payment verification failed: invalid amount." },
        { status: 400 },
      );
    }

    const amountInRupees = amountInPaise / 100;

    // 8. Return verified payment details
    // Note: The official donation acknowledgement receipt email is dispatched
    // exclusively by the Razorpay payment.captured webhook to guarantee idempotency.
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Razorpay verification error.";
    console.error("Razorpay verification API error:", errorMessage);

    return Response.json(
      {
        error:
          "Unable to verify payment with the gateway. Please contact support with reference: " +
          paymentId,
      },
      { status: 500 },
    );
  }
}
