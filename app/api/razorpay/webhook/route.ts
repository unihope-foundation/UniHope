import crypto from "node:crypto";
import { getConvexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

type RazorpayPaymentEntity = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
};

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    return (
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    );
  } catch {
    return false;
  }
}

async function getOrderNotes(orderId: string): Promise<Record<string, string>> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API credentials are missing from environment.");
  }

  const response = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.warn("Unable to fetch order notes from Razorpay for order:", orderId);
    return {};
  }

  const order = await response.json();
  return (order.notes ?? {}) as Record<string, string>;
}

export async function POST(request: Request) {
  try {
    // 1. Read raw request text before parsing JSON (crucial for HMAC signature check)
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("Webhook verification failed: missing signature header or secret.");
      return Response.json(
        { error: "Webhook signature or secret missing." },
        { status: 400 },
      );
    }

    // 2. Cryptographic timing-safe verification
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.warn("Invalid Razorpay webhook signature detected.");
      return Response.json(
        { error: "Invalid webhook signature." },
        { status: 401 },
      );
    }

    // 3. Parse JSON only after signature verification
    const event = JSON.parse(rawBody);

    // Filter events: only process captured payments
    if (event.event !== "payment.captured") {
      return Response.json({
        received: true,
        message: `Ignored event: ${event.event}. Only payment.captured generates final receipts.`,
      });
    }

    const payment = event.payload?.payment?.entity as
      | RazorpayPaymentEntity
      | undefined;

    if (
      !payment?.id ||
      !payment.order_id ||
      payment.status !== "captured" ||
      payment.amount <= 0 ||
      payment.currency !== "INR"
    ) {
      console.error("Invalid payment payload in webhook:", payment?.id);
      return Response.json(
        { error: "Invalid captured payment data structure." },
        { status: 400 },
      );
    }

    // 4. Extract verified donor details from notes
    const paymentNotes = payment.notes || {};
    let orderNotes: Record<string, string> = {};

    // If critical donor information is missing from payment notes, retrieve the order notes
    if (!paymentNotes.donorEmail || !paymentNotes.donorName) {
      orderNotes = await getOrderNotes(payment.order_id);
    }

    const combinedNotes = { ...orderNotes, ...paymentNotes };

    const donorEmail =
      combinedNotes.donorEmail || payment.email || "";
    const donorName =
      combinedNotes.donorName || "Supporter";
    const donorPhone =
      combinedNotes.donorPhone || payment.contact || "";
    const purpose =
      combinedNotes.purpose || "General Fund";
    const anonymous =
      combinedNotes.anonymous === "true";

    // 5. Validate donor email — an invalid/missing email must block receipt
    //    delivery entirely and must NOT produce a false "sent" status.
    const emailValid =
      !!donorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);

    if (!emailValid) {
      console.warn(
        "Donor email missing or invalid in captured payment metadata. " +
        "Payment will be recorded but receipt will NOT be sent. Payment ID:",
        payment.id,
      );
    }

    // 6. Persist captured payment into Convex (idempotent write)
    const convex = getConvexClient();
    const amountInRupees = payment.amount / 100;

    const result = await convex.action(api.donations.recordCapturedPayment, {
      serverSecret: webhookSecret,
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
      donorName,
      donorEmail,
      donorPhone,
      amount: amountInRupees,
      currency: payment.currency,
      purpose,
      anonymous,
    });

    // 7. Trigger receipt ONLY when:
    //    a) donor email is present and valid, AND
    //    b) this is a new record OR receipt is still pending (not already sent).
    //
    //    Credentials are NEVER passed as action arguments.
    //    sendDonationReceipt reads RESEND_API_KEY and RESEND_FROM_EMAIL
    //    directly from the Convex deployment environment variables.
    if (emailValid && (!result.alreadyProcessed || result.receiptStatus === "pending")) {
      try {
        await convex.action(api.donations.sendDonationReceipt, {
          donationId: result.donationId,
        });
      } catch (emailErr) {
        // Non-fatal for webhook response — receipt status is tracked in Convex.
        console.error("Convex receipt action dispatch error:", emailErr);
      }
    }

    return Response.json({
      received: true,
      donationId: result.donationId,
      alreadyProcessed: result.alreadyProcessed,
      status: "captured",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Webhook internal error.";
    console.error("Razorpay webhook handler error:", errorMessage);

    return Response.json(
      { error: "Webhook processing encountered an error." },
      { status: 500 },
    );
  }
}
