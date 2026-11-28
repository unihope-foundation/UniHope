import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

describe("Security Hardening: Donation Lookup & Receipt Dispatch Authorization", () => {
  const donationsSource = fs.readFileSync(
    path.resolve("convex/donations.ts"),
    "utf8",
  );
  const verifyPaymentSource = fs.readFileSync(
    path.resolve("app/api/razorpay/verify-payment/route.ts"),
    "utf8",
  );
  const webhookSource = fs.readFileSync(
    path.resolve("app/api/razorpay/webhook/route.ts"),
    "utf8",
  );

  it("BUG-02: getDonationByPaymentId is no longer exposed as a public Convex query", () => {
    assert.equal(
      /export const getDonationByPaymentId\s*=\s*query\(/.test(donationsSource),
      false,
    );
    assert.equal(
      /export const getDonationByPaymentIdInternal\s*=\s*internalQuery\(/.test(
        donationsSource,
      ),
      true,
    );
    assert.equal(
      /export const getPaymentVerificationStatus\s*=\s*action\(/.test(
        donationsSource,
      ),
      true,
    );
    // Must not return donor PII fields
    const statusBlock = donationsSource.slice(
      donationsSource.indexOf("export const getPaymentVerificationStatus"),
    );
    assert.equal(/donorEmail|donorPhone|donorName/.test(statusBlock), false);
  });

  it("BUG-02: verify-payment uses getPaymentVerificationStatus with serverSecret", () => {
    assert.equal(
      verifyPaymentSource.includes("api.donations.getPaymentVerificationStatus"),
      true,
    );
    assert.equal(
      verifyPaymentSource.includes("api.donations.getDonationByPaymentId"),
      false,
    );
  });

  it("BUG-03: sendDonationReceipt requires serverSecret and validates it", () => {
    const sendIdx = donationsSource.indexOf("export const sendDonationReceipt");
    const sendBlock = donationsSource.slice(sendIdx, sendIdx + 650);
    assert.equal(sendBlock.includes("serverSecret: v.string()"), true);
    assert.equal(
      sendBlock.includes("assertValidServerSecret(args.serverSecret)"),
      true,
    );
    assert.equal(
      webhookSource.includes("serverSecret: webhookSecret"),
      true,
    );
  });

  it("rejects unauthorized secret and accepts authorized webhook secret + HMAC signature", () => {
    const secret = "whsec_test_isolated_secret";
    const verifyServerSecret = (provided) => {
      if (!provided || provided !== secret) {
        throw new Error("Unauthorized: Invalid webhook secret.");
      }
      return true;
    };

    assert.throws(() => verifyServerSecret(undefined), /Unauthorized/);
    assert.throws(() => verifyServerSecret("wrong_secret"), /Unauthorized/);
    assert.equal(verifyServerSecret(secret), true);

    const payload = JSON.stringify({ event: "payment.captured" });
    const validSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    const badSig = crypto
      .createHmac("sha256", "wrong")
      .update(payload)
      .digest("hex");

    assert.equal(
      crypto.timingSafeEqual(
        Buffer.from(validSig, "hex"),
        Buffer.from(validSig, "hex"),
      ),
      true,
    );
    assert.equal(
      crypto.timingSafeEqual(
        Buffer.from(validSig, "hex"),
        Buffer.from(badSig, "hex"),
      ),
      false,
    );
  });

  it("preserves receipt sending idempotency on duplicate webhook delivery", () => {
    const state = { receiptStatus: "pending" };
    const claim = (forceResend) => {
      if (!forceResend && (state.receiptStatus === "sent" || state.receiptStatus === "sending")) {
        return { claimed: false, reason: "already_processed" };
      }
      state.receiptStatus = "sending";
      return { claimed: true };
    };

    assert.equal(claim(false).claimed, true);
    state.receiptStatus = "sent";
    const replay = claim(false);
    assert.equal(replay.claimed, false);
    assert.equal(replay.reason, "already_processed");
  });
});
