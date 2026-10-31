import Razorpay from "razorpay";
import { validateCreateOrderInput } from "@/lib/validations/donation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 1. Rate limiting check
  const rateLimit = await checkRateLimit(
    request,
    "create-order",
    Number(process.env.RATE_LIMIT_ORDER_PER_MIN || 15),
    60,
  );

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many donation requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  // 2. Validate Content-Type
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return Response.json(
      { error: "Unsupported media type. Content-Type must be application/json." },
      { status: 415 },
    );
  }

  // 3. Parse JSON safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON format in request payload." },
      { status: 400 },
    );
  }

  // 4. Strict input schema validation
  const validation = validateCreateOrderInput(body);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { amount, purpose, fullName, email, phone, anonymous, paymentMethod } =
    validation.data;

  // 5. Check Razorpay credentials
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("Razorpay API credentials are not configured.");
    return Response.json(
      { error: "Payment gateway is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Convert rupees to paise (Razorpay integer requirement)
    const amountInPaise = Math.round(amount * 100);

    // Unique receipt reference (max 40 chars per Razorpay spec)
    const shortRandom = Math.random().toString(36).slice(2, 8);
    const receipt = `rcpt_${Date.now().toString(36)}_${shortRandom}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        donorName: anonymous ? "Anonymous" : fullName.slice(0, 100),
        donorEmail: email.slice(0, 100),
        donorPhone: phone.slice(0, 30),
        purpose: purpose.slice(0, 100),
        anonymous: anonymous ? "true" : "false",
        paymentMethod,
      },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create payment order.";
    console.error("Razorpay order creation failed:", errorMessage);

    return Response.json(
      { error: "Unable to initiate payment with the gateway. Please try again." },
      { status: 500 },
    );
  }
}
