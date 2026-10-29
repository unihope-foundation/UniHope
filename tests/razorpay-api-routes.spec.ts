import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("Server API Routes - Razorpay Order & Verification", () => {
  const validOrderPayload = {
    amount: 1000,
    purpose: "Healthcare",
    fullName: "Priya Sundaram",
    email: "priya@example.com",
    phone: "+91 91501 49339",
    anonymous: false,
    paymentMethod: "online",
  };

  test("POST /api/razorpay/create-order with valid payload creates an order", async ({ request }) => {
    const res = await request.post("/api/razorpay/create-order", {
      data: validOrderPayload,
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.orderId).toBeDefined();
    expect(body.orderId).toMatch(/^order_/);
    expect(body.amount).toBe(100000); // 1000 INR = 100000 paise
    expect(body.currency).toBe("INR");
    expect(body.keyId).toBeDefined();
  });

  test("POST /api/razorpay/create-order rejects zero, negative, or fractional amounts", async ({ request }) => {
    // Zero amount
    const resZero = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, amount: 0 },
    });
    expect(resZero.status()).toBe(400);

    // Negative amount
    const resNegative = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, amount: -500 },
    });
    expect(resNegative.status()).toBe(400);

    // Decimal amount
    const resFloat = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, amount: 99.5 },
    });
    expect(resFloat.status()).toBe(400);
  });

  test("POST /api/razorpay/create-order rejects invalid purpose", async ({ request }) => {
    const res = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, purpose: "NonExistentCause123" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("valid donation purpose");
  });

  test("POST /api/razorpay/create-order rejects invalid email or phone", async ({ request }) => {
    const resEmail = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, email: "not-an-email" },
    });
    expect(resEmail.status()).toBe(400);

    const resPhone = await request.post("/api/razorpay/create-order", {
      data: { ...validOrderPayload, phone: "123" },
    });
    expect(resPhone.status()).toBe(400);
  });

  test("POST /api/razorpay/verify-payment rejects missing parameters", async ({ request }) => {
    const res = await request.post("/api/razorpay/verify-payment", {
      data: {
        razorpay_order_id: "order_test_123",
        // payment_id and signature missing
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required payment verification parameters");
  });

  test("POST /api/razorpay/verify-payment rejects invalid HMAC signature", async ({ request }) => {
    const fakeOrderId = "order_test_random123";
    const fakePaymentId = "pay_test_random456";
    const fakeInvalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const res = await request.post("/api/razorpay/verify-payment", {
      data: {
        razorpay_order_id: fakeOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: fakeInvalidSignature,
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Payment verification failed: signature mismatch.");
  });

  test("POST /api/razorpay/verify-payment rejects malformed signature length", async ({ request }) => {
    const res = await request.post("/api/razorpay/verify-payment", {
      data: {
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "short_invalid_sig",
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Payment verification failed: signature mismatch.");
  });

  test("POST /api/donations/bank-pledge generates valid pending pledge", async ({ request }) => {
    const res = await request.post("/api/donations/bank-pledge", {
      data: {
        amount: 2500,
        purpose: "Education",
        fullName: "Karthik Raja",
        email: "karthik@example.com",
        phone: "+91 91501 49339",
        anonymous: false,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe("pending");
    expect(body.referenceId).toMatch(/^BNK-/);
  });
});

