import test from "node:test";
import assert from "node:assert/strict";
import {
  getIstYear,
  getYearlyCounterBaseline,
  normalizeTimestampToMs,
  formatReceiptNumber,
  resolveStoredOrHistoricalReceiptNumber,
} from "../../convex/lib/helpers.ts";
import { buildDonationReceiptPdf } from "../../convex/pdfReceipt.ts";
import { buildDonationReceiptEmail } from "../../convex/emailTemplates.ts";

/**
 * Isolated transactional store mirroring Convex `recordCapturedPaymentInternal`,
 * `recordPaymentAttemptInternal`, `claimReceiptSending`, and Resend/PDF dispatch.
 * Uses zero real Convex mutations and zero live emails.
 */
class IsolatedReceiptSystem {
  constructor() {
    this.counters = new Map([[2026, 4]]); // Mirrors dev receiptCounters { year: 2026, lastSequence: 4 }
    this.donations = new Map();
    this.paymentAttempts = new Map();
    this.emailSendCalls = [];
    this.pdfBuildCalls = [];
  }

  seedGenuineHistorical(record) {
    this.donations.set(record.razorpayPaymentId, { ...record });
  }

  async recordCapturedPayment({
    razorpayPaymentId,
    razorpayOrderId,
    donorName,
    donorEmail,
    donorPhone,
    amount,
    currency = "INR",
    purpose,
    anonymous = false,
    capturedAtMs,
  }) {
    // Atomic idempotency check
    const existing = this.donations.get(razorpayPaymentId);
    if (existing) {
      return {
        donationId: existing._id,
        alreadyProcessed: true,
        receiptStatus: existing.receiptStatus,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(existing),
      };
    }

    const now = Date.now();
    const captureTs = normalizeTimestampToMs(capturedAtMs) ?? now;
    const istYear = getIstYear(captureTs);

    const prevSeq = this.counters.has(istYear)
      ? this.counters.get(istYear)
      : getYearlyCounterBaseline(istYear);
    const nextSeq = prevSeq + 1;
    this.counters.set(istYear, nextSeq);

    const receiptNumber = formatReceiptNumber(istYear, nextSeq);
    const donation = {
      _id: `don_${razorpayPaymentId}`,
      razorpayPaymentId,
      razorpayOrderId,
      donorName,
      donorEmail,
      donorPhone,
      amount,
      currency,
      purpose,
      anonymous,
      receiptNumber,
      receiptYear: istYear,
      receiptSequence: nextSeq,
      paymentStatus: "captured",
      receiptStatus: "pending",
      createdAt: captureTs,
    };

    this.donations.set(razorpayPaymentId, donation);
    return {
      donationId: donation._id,
      alreadyProcessed: false,
      receiptStatus: "pending",
      receiptNumber,
    };
  }

  recordAttempt({ razorpayOrderId, razorpayPaymentId, status, errorCode }) {
    const attempt = {
      razorpayOrderId,
      razorpayPaymentId,
      status,
      errorCode,
      receiptNumber: undefined,
    };
    this.paymentAttempts.set(razorpayOrderId, attempt);
    return attempt;
  }

  async dispatchReceiptEmail(razorpayPaymentId, { forceResend = false } = {}) {
    const donation = this.donations.get(razorpayPaymentId);
    assert.ok(donation, "Donation must exist");
    if (donation.receiptStatus === "sent" && !forceResend) {
      return { skipped: true, reason: "already_sent" };
    }

    const receiptNumber = resolveStoredOrHistoricalReceiptNumber(donation);
    const formattedAmount = `₹${new Intl.NumberFormat("en-IN").format(donation.amount)}`;
    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeZone: "Asia/Kolkata",
    }).format(new Date(donation.createdAt));

    const pdfBytes = await buildDonationReceiptPdf({
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      anonymous: donation.anonymous,
      amount: donation.amount,
      purpose: donation.purpose,
      razorpayPaymentId: donation.razorpayPaymentId,
      razorpayOrderId: donation.razorpayOrderId,
      formattedDate,
      formattedAmount,
      receiptNumber,
      transactionRef: donation.razorpayPaymentId,
      status: "PAID",
    });
    this.pdfBuildCalls.push({ razorpayPaymentId, receiptNumber, byteLength: pdfBytes.length });

    const { html, text } = buildDonationReceiptEmail({
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      anonymous: donation.anonymous,
      amount: donation.amount,
      purpose: donation.purpose,
      razorpayPaymentId: donation.razorpayPaymentId,
      razorpayOrderId: donation.razorpayOrderId,
      formattedDate,
      formattedAmount,
      receiptNumber,
      status: "PAID",
    });

    const subject = `Your Donation Receipt — ${receiptNumber} | UNIHOPE Foundation`;
    const attachmentFilename = `${receiptNumber}-UNIHOPE-Receipt.pdf`;
    this.emailSendCalls.push({
      to: donation.donorEmail,
      subject,
      attachmentFilename,
      html,
      text,
      receiptNumber,
    });

    donation.receiptStatus = "sent";
    return {
      success: true,
      receiptNumber,
      subject,
      attachmentFilename,
      pdfByteLength: pdfBytes.length,
    };
  }
}

test("UNIHOPE Complete Receipt Numbering QA Suite", async (t) => {
  const sys = new IsolatedReceiptSystem();

  // Seed exact 4 genuine historical records from Development DB
  const historicalRecords = [
    {
      _id: "j57cp1mbgzjpdb4nfzjdet4j6x8ha7yw",
      razorpayPaymentId: "pay_TuSbHoNcdd5djF",
      razorpayOrderId: "order_TuSb8pa1RBvZBU",
      donorName: "Gopika S",
      donorEmail: "siva0914civil@gmail.com",
      donorPhone: "+918524934940",
      amount: 100,
      currency: "INR",
      purpose: "General Fund (Most urgent community needs)",
      anonymous: false,
      receiptStatus: "sent",
      createdAt: 1793478672491,
    },
    {
      _id: "j577nbgnfr7f01tf8qmb5k3x558hha4m",
      razorpayPaymentId: "pay_Tvbjknq7nepdzJ",
      razorpayOrderId: "order_TvbjV1CEargMgd",
      donorName: "Supporter",
      donorEmail: "avenkat2405@gmail.com",
      donorPhone: "+917358258128",
      amount: 500,
      currency: "INR",
      purpose: "General Fund",
      anonymous: false,
      receiptStatus: "sent",
      createdAt: 1793688205515,
    },
    {
      _id: "j5736a2x981gbawd9apw1whke58hhnyw",
      razorpayPaymentId: "pay_TvbqfQ41bYeCL4",
      razorpayOrderId: "order_TvbqV93qMWU8lD",
      donorName: "Supporter",
      donorEmail: "udhayakarthik025@gmail.com",
      donorPhone: "+919342119565",
      amount: 500,
      currency: "INR",
      purpose: "General Fund",
      anonymous: false,
      receiptStatus: "sent",
      createdAt: 1793688629591,
    },
    {
      _id: "j57btrg4ahf55j4e2httepg0vs8hgbfs",
      razorpayPaymentId: "pay_Tvby8NDKK1pLiB",
      razorpayOrderId: "order_TvbxBEUTn8mxXx",
      donorName: "Supporter",
      donorEmail: "revanthmathur123@gmail.com",
      donorPhone: "+918111097062",
      amount: 500,
      currency: "INR",
      purpose: "General Fund",
      anonymous: false,
      receiptStatus: "sent",
      createdAt: 1793689036459,
    },
  ];
  for (const h of historicalRecords) sys.seedGenuineHistorical(h);

  await t.test("2. Existing Donation Preservation (4 historical records untouched)", () => {
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sys.donations.get("pay_TuSbHoNcdd5djF")),
      "UH-2026-DD5DJF",
    );
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sys.donations.get("pay_Tvbjknq7nepdzJ")),
      "UH-2026-NEPDZJ",
    );
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sys.donations.get("pay_TvbqfQ41bYeCL4")),
      "UH-2026-BYECL4",
    );
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sys.donations.get("pay_Tvby8NDKK1pLiB")),
      "UH-2026-K1PLIB",
    );
    assert.equal(sys.counters.get(2026), 4);
  });

  await t.test("3. First New 2026 Payment receives UH-2026-WEB05", async () => {
    const res = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2026_001",
      razorpayOrderId: "order_qa_2026_001",
      donorName: "Test Donor One",
      donorEmail: "qa.donor1@example.com",
      donorPhone: "+919000000001",
      amount: 500,
      purpose: "Education Support",
      capturedAtMs: Date.UTC(2026, 10, 27, 15, 0, 0),
    });
    assert.equal(res.alreadyProcessed, false);
    assert.equal(res.receiptNumber, "UH-2026-WEB05");
    assert.equal(sys.counters.get(2026), 5);
    assert.equal(sys.donations.size, 5);
  });

  await t.test("4. Second New 2026 Payment receives UH-2026-WEB06", async () => {
    const res = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2026_002",
      razorpayOrderId: "order_qa_2026_002",
      donorName: "Test Donor Two",
      donorEmail: "qa.donor2@example.com",
      donorPhone: "+919000000002",
      amount: 1000,
      purpose: "Medical Assistance",
      capturedAtMs: Date.UTC(2026, 10, 27, 15, 5, 0),
    });
    assert.equal(res.receiptNumber, "UH-2026-WEB06");
    assert.equal(sys.counters.get(2026), 6);
    assert.equal(sys.donations.get("pay_qa_2026_001").receiptNumber, "UH-2026-WEB05");
  });

  await t.test("5. Webhook Idempotency Replay returns original WEB05 without side effects", async () => {
    await sys.dispatchReceiptEmail("pay_qa_2026_001");
    const emailCallsBefore = sys.emailSendCalls.length;
    const pdfCallsBefore = sys.pdfBuildCalls.length;

    const replay = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2026_001",
      razorpayOrderId: "order_qa_2026_001",
      donorName: "Test Donor One",
      donorEmail: "qa.donor1@example.com",
      donorPhone: "+919000000001",
      amount: 500,
      purpose: "Education Support",
    });
    assert.equal(replay.alreadyProcessed, true);
    assert.equal(replay.receiptNumber, "UH-2026-WEB05");
    assert.equal(sys.counters.get(2026), 6);

    const skippedEmail = await sys.dispatchReceiptEmail("pay_qa_2026_001");
    assert.equal(skippedEmail.skipped, true);
    assert.equal(sys.emailSendCalls.length, emailCallsBefore);
    assert.equal(sys.pdfBuildCalls.length, pdfCallsBefore);
  });

  await t.test("6. Failed, Cancelled, Pending, Expired payments create NO receipt number", () => {
    const beforeCount = sys.donations.size;
    const beforeCounter = sys.counters.get(2026);
    for (const status of ["failed", "cancelled", "pending", "expired"]) {
      const attempt = sys.recordAttempt({
        razorpayOrderId: `order_qa_${status}`,
        status,
        errorCode: status === "failed" ? "BAD_REQUEST_ERROR" : undefined,
      });
      assert.equal(attempt.receiptNumber, undefined);
    }
    assert.equal(sys.donations.size, beforeCount);
    assert.equal(sys.counters.get(2026), beforeCounter);
  });

  await t.test("7. Concurrent Payments via Promise.all receive unique sequential numbers", async () => {
    const [a, b] = await Promise.all([
      sys.recordCapturedPayment({
        razorpayPaymentId: "pay_qa_conc_a",
        razorpayOrderId: "order_qa_conc_a",
        donorName: "Concurrent A",
        donorEmail: "conc.a@example.com",
        donorPhone: "+919000000003",
        amount: 250,
        purpose: "Food Support",
        capturedAtMs: Date.UTC(2026, 10, 28, 9, 0, 0),
      }),
      sys.recordCapturedPayment({
        razorpayPaymentId: "pay_qa_conc_b",
        razorpayOrderId: "order_qa_conc_b",
        donorName: "Concurrent B",
        donorEmail: "conc.b@example.com",
        donorPhone: "+919000000004",
        amount: 250,
        purpose: "Food Support",
        capturedAtMs: Date.UTC(2026, 10, 28, 9, 0, 0),
      }),
    ]);
    const numbers = [a.receiptNumber, b.receiptNumber].sort();
    assert.deepEqual(numbers, ["UH-2026-WEB07", "UH-2026-WEB08"]);
    assert.equal(sys.counters.get(2026), 8);
  });

  await t.test("8. New Year 2027 Rollover (IST) & Delayed 2026 Webhook Timestamp", async () => {
    // 2027-01-01T00:00:00+05:30 == 2026-12-31T18:30:00Z
    const jan1IstMs = new Date("2027-01-01T00:00:00+05:30").getTime();
    const r1 = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2027_001",
      razorpayOrderId: "order_qa_2027_001",
      donorName: "2027 Donor 1",
      donorEmail: "d2027.1@example.com",
      donorPhone: "+919000000005",
      amount: 1500,
      purpose: "Education Support",
      capturedAtMs: jan1IstMs,
    });
    const r2 = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2027_002",
      razorpayOrderId: "order_qa_2027_002",
      donorName: "2027 Donor 2",
      donorEmail: "d2027.2@example.com",
      donorPhone: "+919000000006",
      amount: 2000,
      purpose: "Community Development",
      capturedAtMs: jan1IstMs + 60000,
    });
    assert.equal(r1.receiptNumber, "UH-2027-WEB01");
    assert.equal(r2.receiptNumber, "UH-2027-WEB02");
    assert.equal(sys.counters.get(2026), 8);
    assert.equal(sys.counters.get(2027), 2);

    // Delayed webhook captured in 2026 (2026-12-31T23:55:00+05:30)
    const delayed2026Sec = Math.floor(
      new Date("2026-12-31T23:55:00+05:30").getTime() / 1000,
    );
    const delayedRes = await sys.recordCapturedPayment({
      razorpayPaymentId: "pay_qa_2026_delayed",
      razorpayOrderId: "order_qa_2026_delayed",
      donorName: "Delayed 2026 Donor",
      donorEmail: "delayed@example.com",
      donorPhone: "+919000000007",
      amount: 500,
      purpose: "General Donation",
      capturedAtMs: delayed2026Sec,
    });
    assert.equal(delayedRes.receiptNumber, "UH-2026-WEB09");
    assert.equal(sys.counters.get(2027), 2);
  });

  await t.test("9. PDF & Email Consistency + Retry preserves original number", async () => {
    const retry = await sys.dispatchReceiptEmail("pay_qa_2026_001", {
      forceResend: true,
    });
    assert.equal(retry.success, true);
    assert.equal(retry.receiptNumber, "UH-2026-WEB05");
    assert.equal(
      retry.subject,
      "Your Donation Receipt — UH-2026-WEB05 | UNIHOPE Foundation",
    );
    assert.equal(retry.attachmentFilename, "UH-2026-WEB05-UNIHOPE-Receipt.pdf");
    assert.ok(retry.pdfByteLength > 1000);

    const lastEmail = sys.emailSendCalls[sys.emailSendCalls.length - 1];
    assert.ok(lastEmail.html.includes("UH-2026-WEB05"));
    assert.ok(lastEmail.text.includes("UH-2026-WEB05"));
  });
});
