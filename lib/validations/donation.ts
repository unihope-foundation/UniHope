import { PURPOSES, type Purpose, type PaymentMethod } from "@/lib/donations";

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const PHONE_REGEX = /^\+?[0-9\s-]{10,15}$/;
export const HEX_64_REGEX = /^[a-fA-F0-9]{64}$/;

export interface ValidatedCreateOrderInput {
  amount: number;
  purpose: Purpose;
  fullName: string;
  email: string;
  phone: string;
  anonymous: boolean;
  paymentMethod: PaymentMethod;
}

export interface ValidatedVerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function validateCreateOrderInput(
  body: unknown,
): { valid: true; data: ValidatedCreateOrderInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Invalid request payload format." };
  }

  const record = body as Record<string, unknown>;

  const amount = Number(record.amount);
  if (
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > 1_000_000
  ) {
    return {
      valid: false,
      error: "Please enter a valid donation amount in whole rupees (between ₹1 and ₹10,00,000).",
    };
  }

  const purpose = typeof record.purpose === "string" ? record.purpose.trim() : "";
  if (!PURPOSES.includes(purpose as Purpose)) {
    return {
      valid: false,
      error: "Please select a valid donation purpose from the available causes.",
    };
  }

  const fullName = typeof record.fullName === "string" ? record.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 100) {
    return {
      valid: false,
      error: "Please provide a donor full name between 2 and 100 characters.",
    };
  }

  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return {
      valid: false,
      error: "Please provide a valid email address.",
    };
  }

  const phone = typeof record.phone === "string" ? record.phone.trim() : "";
  const digitsOnly = phone.replace(/\D/g, "");
  if (!PHONE_REGEX.test(phone) || digitsOnly.length < 10 || digitsOnly.length > 15) {
    return {
      valid: false,
      error: "Please provide a valid phone number (10 to 15 digits).",
    };
  }

  const anonymous = Boolean(record.anonymous);
  const paymentMethod: PaymentMethod =
    record.paymentMethod === "upi" ? "upi" : "online";

  return {
    valid: true,
    data: {
      amount,
      purpose: purpose as Purpose,
      fullName,
      email,
      phone,
      anonymous,
      paymentMethod,
    },
  };
}

export function validateVerifyPaymentInput(
  body: unknown,
): { valid: true; data: ValidatedVerifyPaymentInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, error: "Payment verification payload must be a JSON object." };
  }

  const record = body as Record<string, unknown>;

  const orderId =
    typeof record.razorpay_order_id === "string"
      ? record.razorpay_order_id.trim()
      : "";
  const paymentId =
    typeof record.razorpay_payment_id === "string"
      ? record.razorpay_payment_id.trim()
      : "";
  const signature =
    typeof record.razorpay_signature === "string"
      ? record.razorpay_signature.trim()
      : "";

  if (!orderId || !orderId.startsWith("order_")) {
    return { valid: false, error: "Invalid or missing Razorpay order ID." };
  }

  if (!paymentId || !paymentId.startsWith("pay_")) {
    return { valid: false, error: "Invalid or missing Razorpay payment ID." };
  }

  if (!signature || !HEX_64_REGEX.test(signature)) {
    return { valid: false, error: "Invalid payment verification signature format." };
  }

  return {
    valid: true,
    data: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    },
  };
}

