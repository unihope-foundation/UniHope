import crypto from "crypto";
import Razorpay from "razorpay";
import { REG_NO } from "@/content/donate";

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Keep track of confirmed payment IDs to prevent duplicate processing
const confirmedPayments = new Map<string, { confirmedAt: number; orderId: string }>();

// Clean up entries older than 24 hours to keep memory tidy
function cleanupOldPayments() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, entry] of confirmedPayments.entries()) {
    if (entry.confirmedAt < cutoff) {
      confirmedPayments.delete(id);
    }
  }
}

async function sendReceiptEmail(options: {
  recipientEmail: string;
  donorName: string;
  amountInRupees: number;
  purpose: string;
  referenceId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !sender) {
    return;
  }

  const { recipientEmail, donorName, amountInRupees, purpose, referenceId } = options;
  const dateStr = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date());

  const emailText = [
    `Dear ${donorName},`,
    "",
    "Thank you for your generous contribution to UNIHOPE Foundation.",
    "",
    "Donation Acknowledgement Details:",
    `Contribution: ₹${amountInRupees.toLocaleString("en-IN")}`,
    `Purpose: ${purpose}`,
    `Transaction Reference ID: ${referenceId}`,
    `Date: ${dateStr}`,
    `Trust Registration No.: ${REG_NO}`,
    "",
    "Your support helps UNIHOPE Foundation provide healthcare, education, hunger relief, and community welfare in Chennai.",
    "",
    "Warm regards,",
    "UNIHOPE Foundation Team",
    "https://unihopefoundation.org",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipientEmail],
        subject: `Donation Acknowledgement — UNIHOPE Foundation (${referenceId})`,
        text: emailText,
      }),
    });
  } catch (error) {
    console.error("Non-fatal: failed to send donor receipt email:", error);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON format in payment verification request." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Payment verification payload must be an object." },
      { status: 400 },
    );
  }

  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

  if (!orderId || !paymentId || !signature) {
    return Response.json(
      { error: "Missing required payment verification parameters (orderId, paymentId, or signature)." },
      { status: 400 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay API credentials not configured.");
    return Response.json(
      { error: "Payment verification service is unavailable." },
      { status: 500 },
    );
  }

  // 1. Verify HMAC SHA-256 signature
  const payloadToSign = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payloadToSign)
    .digest("hex");

  const generatedBuffer = Buffer.from(generatedSignature, "utf-8");
  const receivedBuffer = Buffer.from(signature, "utf-8");

  const isSignatureValid =
    generatedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(generatedBuffer, receivedBuffer);

  if (!isSignatureValid) {
    console.warn("Invalid payment signature received for order:", orderId);
    return Response.json(
      { error: "Payment verification failed: signature mismatch." },
      { status: 400 },
    );
  }

  // 2. Prevent duplicate processing
  cleanupOldPayments();
  const existingConfirmation = confirmedPayments.get(paymentId);
  if (existingConfirmation) {
    return Response.json({
      success: true,
      referenceId: paymentId,
      orderId,
      alreadyConfirmed: true,
    });
  }

  // 3. Fetch payment from Razorpay API to verify amount, currency, order_id, and status
  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(paymentId);

    // Verify payment belongs to expected order
    if (payment.order_id !== orderId) {
      console.warn("Payment order mismatch:", {
        paymentOrderId: payment.order_id,
        expectedOrderId: orderId,
      });
      return Response.json(
        { error: "Payment verification failed: payment does not match the order." },
        { status: 400 },
      );
    }

    // Verify payment currency
    if (payment.currency !== "INR") {
      return Response.json(
        { error: "Payment verification failed: invalid currency." },
        { status: 400 },
      );
    }

    // Verify payment status
    const validStatuses = ["captured", "authorized"];
    if (!validStatuses.includes(payment.status)) {
      console.warn("Payment status is invalid:", payment.status);
      return Response.json(
        { error: `Payment not completed. Current status: ${payment.status}.` },
        { status: 400 },
      );
    }

    // Verify amount is positive
    const amountInPaise = Number(payment.amount);
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return Response.json(
        { error: "Payment verification failed: invalid payment amount." },
        { status: 400 },
      );
    }

    // Record payment confirmation
    confirmedPayments.set(paymentId, {
      confirmedAt: Date.now(),
      orderId,
    });

    // 4. Send email receipt if email configured and available in notes or payment
    const notes = payment.notes as Record<string, string> | undefined;
    const donorEmail = (notes?.donorEmail || payment.email || "").trim();
    const donorName = (notes?.donorName || "Supporter").trim();
    const purpose = (notes?.purpose || "General Fund").trim();
    const amountInRupees = Math.round(amountInPaise / 100);

    if (donorEmail) {
      // Fire-and-forget email delivery
      void sendReceiptEmail({
        recipientEmail: donorEmail,
        donorName,
        amountInRupees,
        purpose,
        referenceId: paymentId,
      });
    }

    return Response.json({
      success: true,
      referenceId: paymentId,
      orderId,
      amount: amountInRupees,
      purpose,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to verify payment with gateway.";
    console.error("Razorpay verification API error:", errorMessage);

    return Response.json(
      { error: "Unable to verify payment with the gateway. Please contact support with your payment reference." },
      { status: 500 },
    );
  }
}
