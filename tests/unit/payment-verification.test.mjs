import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

describe("Payment Cryptographic Verification & Idempotency", () => {
  const secret = "test_merchant_secret_key_123456";
  const orderId = "order_O6X87test123";
  const paymentId = "pay_P9Y87test456";

  function computeSignature(orderId, paymentId, secret) {
    return crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  function verifySignature(orderId, paymentId, signature, secret) {
    const expected = computeSignature(orderId, paymentId, secret);
    const expectedBuf = Buffer.from(expected, "utf-8");
    const receivedBuf = Buffer.from(signature, "utf-8");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  }

  test("valid HMAC SHA-256 signature passes verification", () => {
    const validSignature = computeSignature(orderId, paymentId, secret);
    const result = verifySignature(orderId, paymentId, validSignature, secret);
    assert.equal(result, true, "Signature must match");
  });

  test("tampered signature is rejected", () => {
    const validSignature = computeSignature(orderId, paymentId, secret);
    const tampered = validSignature.slice(0, -2) + "aa";
    const result = verifySignature(orderId, paymentId, tampered, secret);
    assert.equal(result, false, "Tampered signature must be rejected");
  });

  test("mismatched payment ID is rejected", () => {
    const validSignature = computeSignature(orderId, paymentId, secret);
    const result = verifySignature(orderId, "pay_different_9999", validSignature, secret);
    assert.equal(result, false, "Signature calculated for different payment ID must fail");
  });

  test("mismatched order ID is rejected", () => {
    const validSignature = computeSignature(orderId, paymentId, secret);
    const result = verifySignature("order_different_9999", paymentId, validSignature, secret);
    assert.equal(result, false, "Signature calculated for different order ID must fail");
  });

  test("malformed signature length does not crash and safely fails", () => {
    const result = verifySignature(orderId, paymentId, "short_invalid", secret);
    assert.equal(result, false, "Short signature must fail safely");
  });

  test("rupee to paise conversions are exact integer subunits", () => {
    const testCases = [
      { rupees: 1, paise: 100 },
      { rupees: 500, paise: 50000 },
      { rupees: 1000, paise: 100000 },
      { rupees: 2500, paise: 250000 },
      { rupees: 5000, paise: 500000 },
      { rupees: 100000, paise: 10000000 },
    ];

    for (const { rupees, paise } of testCases) {
      assert.equal(Math.round(rupees * 100), paise);
    }
  });

  test("duplicate payment tracking prevents double confirmation", () => {
    const confirmedMap = new Map();

    function recordConfirmation(payId, ordId) {
      if (confirmedMap.has(payId)) {
        return { success: true, alreadyConfirmed: true };
      }
      confirmedMap.set(payId, { confirmedAt: Date.now(), ordId });
      return { success: true, alreadyConfirmed: false };
    }

    const first = recordConfirmation("pay_sample_1", "order_sample_1");
    assert.equal(first.alreadyConfirmed, false, "First submission must be registered");

    const duplicate = recordConfirmation("pay_sample_1", "order_sample_1");
    assert.equal(duplicate.alreadyConfirmed, true, "Subsequent duplicate must be detected");
  });
});

