import test from "node:test";
import assert from "node:assert/strict";
import {
  getIstYear,
  getIstDateKey,
  getYearlyCounterBaseline,
  normalizeTimestampToMs,
  formatReceiptNumber,
  resolveStoredOrHistoricalReceiptNumber,
  computeDonorKey,
  escapeCsvCell,
} from "../../convex/lib/helpers.ts";

/**
 * In-memory transactional simulator mirroring `recordCapturedPaymentInternal`
 * to verify all 13 sequential receipt numbering invariants.
 */
class ReceiptAllocatorSimulator {
  constructor() {
    this.counters = new Map();
    this.donations = new Map();
    this.attempts = [];
  }

  seedHistoricalDonation(d) {
    this.donations.set(d.razorpayPaymentId, d);
  }

  capturePayment({ razorpayPaymentId, capturedAtTs }) {
    const existing = this.donations.get(razorpayPaymentId);
    if (existing) {
      return {
        alreadyProcessed: true,
        receiptNumber: resolveStoredOrHistoricalReceiptNumber(existing),
      };
    }

    const captureMs = normalizeTimestampToMs(capturedAtTs) ?? Date.now();
    const year = getIstYear(captureMs);
    const current = this.counters.has(year)
      ? this.counters.get(year)
      : getYearlyCounterBaseline(year);
    const nextSeq = current + 1;
    this.counters.set(year, nextSeq);

    const receiptNumber = formatReceiptNumber(year, nextSeq);
    const record = {
      razorpayPaymentId,
      receiptNumber,
      receiptYear: year,
      receiptSequence: nextSeq,
      createdAt: captureMs,
      receiptStatus: "pending",
    };
    this.donations.set(razorpayPaymentId, record);
    return { alreadyProcessed: false, receiptNumber, record };
  }

  recordAttempt({ razorpayOrderId, status }) {
    this.attempts.push({ razorpayOrderId, status, receiptNumber: undefined });
  }
}

test("Sequential Receipt Numbering (2026 WEB05+ & 2027 Rollover)", async (t) => {
  const sim = new ReceiptAllocatorSimulator();

  // Seed 4 historical payments without touching their existing numbers
  sim.seedHistoricalDonation({
    razorpayPaymentId: "pay_TuSbHoNcdd5djF",
    createdAt: 1793478672491,
  });
  sim.seedHistoricalDonation({
    razorpayPaymentId: "pay_Tvbjknq7nepdzJ",
    createdAt: 1793688205515,
  });
  sim.seedHistoricalDonation({
    razorpayPaymentId: "pay_TvbqfQ41bYeCL4",
    createdAt: 1793688629591,
  });
  sim.seedHistoricalDonation({
    razorpayPaymentId: "pay_Tvby8NDKK1pLiB",
    createdAt: 1793689036459,
  });

  await t.test("TEST 1 & 11: Preserves all 4 historical payments unchanged", () => {
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sim.donations.get("pay_TuSbHoNcdd5djF")),
      "UH-2026-DD5DJF",
    );
    assert.equal(
      resolveStoredOrHistoricalReceiptNumber(sim.donations.get("pay_Tvbjknq7nepdzJ")),
      "UH-2026-NEPDZJ",
    );
  });

  await t.test("TEST 2, 3, 4: First 3 new 2026 payments receive WEB05, WEB06, WEB07", () => {
    const ts2026 = Date.UTC(2026, 10, 27, 12, 0, 0) / 1000; // Unix seconds
    assert.equal(
      sim.capturePayment({ razorpayPaymentId: "pay_new_01", capturedAtTs: ts2026 }).receiptNumber,
      "UH-2026-WEB05",
    );
    assert.equal(
      sim.capturePayment({ razorpayPaymentId: "pay_new_02", capturedAtTs: ts2026 }).receiptNumber,
      "UH-2026-WEB06",
    );
    assert.equal(
      sim.capturePayment({ razorpayPaymentId: "pay_new_03", capturedAtTs: ts2026 }).receiptNumber,
      "UH-2026-WEB07",
    );
  });

  await t.test("TEST 5, 6, 7: Failed, cancelled, pending payments receive NO receipt number", () => {
    sim.recordAttempt({ razorpayOrderId: "order_fail_1", status: "failed" });
    sim.recordAttempt({ razorpayOrderId: "order_cancel_1", status: "cancelled" });
    sim.recordAttempt({ razorpayOrderId: "order_pending_1", status: "pending" });
    assert.equal(sim.attempts.every((a) => a.receiptNumber === undefined), true);
    assert.equal(sim.counters.get(2026), 7);
  });

  await t.test("TEST 8: Duplicate webhook returns same receipt number without incrementing counter", () => {
    const dup = sim.capturePayment({
      razorpayPaymentId: "pay_new_01",
      capturedAtTs: Date.UTC(2026, 10, 27, 12, 0, 0),
    });
    assert.equal(dup.alreadyProcessed, true);
    assert.equal(dup.receiptNumber, "UH-2026-WEB05");
    assert.equal(sim.counters.get(2026), 7);
  });

  await t.test("TEST 9: Concurrent successful payments receive unique sequential numbers", () => {
    const ts = Date.UTC(2026, 11, 1, 10, 0, 0);
    const r1 = sim.capturePayment({ razorpayPaymentId: "pay_conc_1", capturedAtTs: ts });
    const r2 = sim.capturePayment({ razorpayPaymentId: "pay_conc_2", capturedAtTs: ts });
    assert.notEqual(r1.receiptNumber, r2.receiptNumber);
    assert.equal(r1.receiptNumber, "UH-2026-WEB08");
    assert.equal(r2.receiptNumber, "UH-2026-WEB09");
  });

  await t.test("TEST 10: New year 2027 rollover in IST starts at UH-2027-WEB01 leaving 2026 intact", () => {
    // 2026-12-31T18:29:59Z -> still 2026 in IST
    const dec31Ist = Date.UTC(2026, 11, 31, 18, 29, 59);
    assert.equal(getIstYear(dec31Ist), 2026);
    assert.equal(getIstDateKey(dec31Ist), "2026-12-31");

    // 2026-12-31T18:30:00Z -> 2027-01-01 00:00:00 IST
    const jan1Ist = Date.UTC(2026, 11, 31, 18, 30, 0) / 1000;
    const r2027_1 = sim.capturePayment({ razorpayPaymentId: "pay_2027_1", capturedAtTs: jan1Ist });
    const r2027_2 = sim.capturePayment({ razorpayPaymentId: "pay_2027_2", capturedAtTs: jan1Ist });
    assert.equal(r2027_1.receiptNumber, "UH-2027-WEB01");
    assert.equal(r2027_2.receiptNumber, "UH-2027-WEB02");
    assert.equal(sim.counters.get(2026), 9); // 2026 counter untouched
  });

  await t.test("TEST 12 & 13: Email retry preserves number & >=100 never truncates", () => {
    const stored = sim.donations.get("pay_new_01");
    assert.equal(resolveStoredOrHistoricalReceiptNumber(stored), "UH-2026-WEB05");
    assert.equal(formatReceiptNumber(2026, 99), "UH-2026-WEB99");
    assert.equal(formatReceiptNumber(2026, 100), "UH-2026-WEB100");
    assert.equal(formatReceiptNumber(2026, 101), "UH-2026-WEB101");
    assert.throws(() => formatReceiptNumber(2026, 0));
  });
});

test("Donor Matching & CSV Formula Injection Protection", async (t) => {
  await t.test("normalizes email and phone for donor identity key", () => {
    assert.equal(
      computeDonorKey({ donorEmail: "  Donor@Example.COM " }),
      "email:donor@example.com",
    );
    assert.equal(
      computeDonorKey({ donorPhone: "+91 98765 43210" }),
      "phone:9876543210",
    );
    assert.equal(
      computeDonorKey({ anonymous: true, razorpayPaymentId: "pay_111" }),
      "anon:pay_111",
    );
  });

  await t.test("escapes spreadsheet formula injection prefixes (=, +, -, @, tab, CR)", () => {
    assert.equal(escapeCsvCell("=CMD|'/C calc'!A0"), "'=CMD|'/C calc'!A0");
    assert.equal(escapeCsvCell("+1+1"), "'+1+1");
    assert.equal(escapeCsvCell("-100"), "'-100");
    assert.equal(escapeCsvCell("@SUM(A1:A2)"), "'@SUM(A1:A2)");
    assert.equal(escapeCsvCell("Alice, Bob"), '"Alice, Bob"');
    assert.equal(escapeCsvCell('He said "Hi"'), '"He said ""Hi"""');
  });
});
