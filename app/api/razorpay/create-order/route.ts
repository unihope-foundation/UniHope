import Razorpay from "razorpay";
import { PURPOSES, type PaymentMethod, type Purpose } from "@/lib/donations";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,15}$/;

interface CreateOrderRequest {
  amount: number;
  purpose: Purpose;
  fullName: string;
  email: string;
  phone: string;
  anonymous: boolean;
  paymentMethod: PaymentMethod;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request payload. Please submit valid JSON." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Invalid request format." },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  const purpose = typeof body.purpose === "string" ? body.purpose.trim() : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const anonymous = Boolean(body.anonymous);
  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "online";

  // Validation
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 1 || amount > 10000000) {
    return Response.json(
      { error: "Please enter a valid donation amount in whole rupees (minimum ₹1)." },
      { status: 400 },
    );
  }

  if (!PURPOSES.includes(purpose as Purpose)) {
    return Response.json(
      { error: "Please select a valid donation purpose from the available causes." },
      { status: 400 },
    );
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return Response.json(
      { error: "Please provide a full name between 2 and 100 characters." },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  if (!PHONE_RE.test(phone) || phone.length > 20) {
    return Response.json(
      { error: "Please provide a valid phone number (10 to 15 digits)." },
      { status: 400 },
    );
  }

  if (paymentMethod !== "upi" && paymentMethod !== "online") {
    return Response.json(
      { error: "Invalid payment method for online checkout order creation." },
      { status: 400 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay API credentials missing from environment.");
    return Response.json(
      { error: "Payment gateway is not currently configured. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Convert INR rupees to paise
    const amountInPaise = Math.round(amount * 100);

    // Max 40 characters for receipt identifier
    const shortRandom = Math.random().toString(36).slice(2, 8);
    const receipt = `rcpt_${Date.now().toString(36)}_${shortRandom}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        purpose: purpose.slice(0, 100),
        donorName: anonymous ? "Anonymous" : fullName.slice(0, 100),
        donorEmail: email.slice(0, 100),
        donorPhone: phone.slice(0, 30),
        anonymous: anonymous ? "true" : "false",
        paymentMethod: paymentMethod as string,
      },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: unknown) {
    // Avoid exposing internal error details or stack traces to client
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment order.";
    console.error("Razorpay order creation failed:", errorMessage);

    return Response.json(
      { error: "Unable to initiate payment with the gateway. Please try again." },
      { status: 500 },
    );
  }
}
