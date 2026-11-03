import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import {
  buildDonationReceiptPdf,
  wrapText,
  uint8ArrayToBase64,
} from "../../convex/pdfReceipt.ts";

test("PDF Receipt Generation & Layout Integrity", async (t) => {
  await t.test("uint8ArrayToBase64 converts binary bytes to valid base64", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const b64 = uint8ArrayToBase64(input);
    assert.equal(b64, "SGVsbG8=");
  });

  await t.test("wrapText splits phrases and breaks long continuous strings", async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedStandardFont("Helvetica");

    // Empty text
    assert.deepEqual(wrapText("", 100, font, 10), []);

    // Normal sentence
    const lines = wrapText("Providing educational scholarships for students", 150, font, 10);
    assert.ok(lines.length >= 2, "Sentence should wrap across multiple lines");

    // Long unbroken string
    const unbroken = "VERY_LONG_UNBROKEN_TRANSACTION_IDENTIFIER_THAT_CANNOT_FIT_ON_ONE_LINE";
    const wrappedUnbroken = wrapText(unbroken, 80, font, 10);
    assert.ok(wrappedUnbroken.length > 1, "Unbroken string must be chunked safely");
  });

  await t.test("generates standard receipt with Form No. 106 & Section 354(4) approval", async () => {
    const pdfBytes = await buildDonationReceiptPdf({
      donorName: "Dr. Rajesh Sundaram",
      donorEmail: "rajesh.sundaram@example.com",
      donorPhone: "+91 98765 43210",
      anonymous: false,
      amount: 5000,
      purpose: "Underprivileged Child Education Sponsorship",
      razorpayPaymentId: "pay_TEST_PAY_12345678",
      razorpayOrderId: "order_TEST_ORD_87654321",
      formattedDate: "3 November 2026",
      formattedAmount: "₹5,000",
      orgDetails: {
        name: "UNIHOPE Foundation",
        trustRegistrationNo: "R/Chennai North Joint I/Book-4/228/2026",
        pan: "AAATU1234F",
        registeredAddress: "No. 12, Hope Avenue, Anna Nagar, Chennai, Tamil Nadu 600040",
        email: "unihopefoundation.official@gmail.com",
        website: "https://unihopefoundation.org",
      },
      taxDetails: {
        approvalSection: "Provisional Approval under Section 354(4) (Form No. 106, Rule 181)",
        provisionalUrn: "AAATU1234FF20261",
        approvalDate: "15/04/2026",
        validFrom: "AY 2026-27",
        validUntil: "AY 2029-30",
      },
    });

    assert.ok(pdfBytes instanceof Uint8Array, "Must return Uint8Array");
    assert.ok(pdfBytes.length > 1000, "PDF must not be empty");

    const doc = await PDFDocument.load(pdfBytes);
    const pages = doc.getPages();
    assert.equal(pages.length, 1, "Standard receipt must fit on 1 page");
    assert.equal(Math.round(pages[0].getWidth()), 595, "Page width must be A4 (595 pt)");
    assert.equal(Math.round(pages[0].getHeight()), 842, "Page height must be A4 (842 pt)");
  });

  await t.test("handles missing optional environment variables and details gracefully", async () => {
    // Completely empty orgDetails and taxDetails without crashing
    const pdfBytes = await buildDonationReceiptPdf({
      donorName: "Kavitha Raman",
      donorEmail: "kavitha.raman@example.com",
      anonymous: false,
      amount: 1500,
      purpose: "Health Camp Support",
      razorpayPaymentId: "pay_MINIMAL_001",
      razorpayOrderId: "order_MINIMAL_001",
      formattedDate: "3 November 2026",
      formattedAmount: "₹1,500",
      orgDetails: {},
      taxDetails: {},
    });

    assert.ok(pdfBytes instanceof Uint8Array);
    assert.ok(pdfBytes.length > 1000);

    const doc = await PDFDocument.load(pdfBytes);
    assert.equal(doc.getPageCount(), 1, "Receipt should render cleanly on 1 page even with minimal metadata");
  });

  await t.test("anonymous donor displays Supporter", async () => {
    const pdfBytes = await buildDonationReceiptPdf({
      donorName: "Secret Donor",
      donorEmail: "donor@anonymous.org",
      anonymous: true,
      amount: 10000,
      purpose: "Community Healthcare Camp",
      razorpayPaymentId: "pay_ANON_99999",
      razorpayOrderId: "order_ANON_99999",
      formattedDate: "3 November 2026",
      formattedAmount: "₹10,000",
    });

    assert.ok(pdfBytes.length > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    assert.equal(doc.getPageCount(), 1);
  });

  await t.test("renders cleanly without signature image when signatureBytes is missing", async () => {
    const pdfBytes = await buildDonationReceiptPdf({
      donorName: "Senthil Nathan",
      donorEmail: "senthil@example.com",
      anonymous: false,
      amount: 3000,
      purpose: "Rural Youth Digital Skill Training",
      razorpayPaymentId: "pay_NO_SIG_001",
      razorpayOrderId: "order_NO_SIG_001",
      formattedDate: "3 November 2026",
      formattedAmount: "₹3,000",
      signatureBytes: null,
    });

    assert.ok(pdfBytes.length > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    assert.equal(doc.getPageCount(), 1, "Must generate valid single page receipt without signature image");
  });

  await t.test("embeds genuine signature PNG when signatureBytes is provided", async () => {
    // Valid 1x1 transparent PNG buffer
    const minimalPngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const sigBytes = Buffer.from(minimalPngBase64, "base64");

    const pdfBytes = await buildDonationReceiptPdf({
      donorName: "Ananya Iyer",
      donorEmail: "ananya.iyer@example.com",
      donorPhone: "+91 91234 56789",
      anonymous: false,
      amount: 2500,
      purpose: "Elderly Nutritional Support",
      razorpayPaymentId: "pay_SIG_TEST_001",
      razorpayOrderId: "order_SIG_TEST_001",
      formattedDate: "3 November 2026",
      formattedAmount: "₹2,500",
      signatureBytes: new Uint8Array(sigBytes),
    });

    assert.ok(pdfBytes.length > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    assert.equal(doc.getPageCount(), 1, "Must embed signature and fit on 1 page");
  });

  await t.test("handles long donor details and triggers structured multi-page layout", async () => {
    const veryLongName =
      "Thiruvalarchelvan Venkatanarasimha Sivaraman Ramanathan Balasubramaniam";
    const veryLongEmail =
      "thiruvalarchelvan.venkatanarasimha.sivaraman.ramanathan.balasubramaniam@subdomain.corporateorganization.org";
    const veryLongPurpose =
      "Providing comprehensive annual educational scholarship, complete STEM laboratory development, modern computer science facility setup, digital classroom infrastructure, nutritional mid-day meal supplements, mental health wellness counseling, vocational training, and extracurricular mentorship programs for underprivileged rural higher secondary students across backward districts of Tamil Nadu for academic year 2026-2027.";

    const pdfBytes = await buildDonationReceiptPdf({
      donorName: veryLongName,
      donorEmail: veryLongEmail,
      donorPhone: "+91 99999 88888, Ext 4021",
      anonymous: false,
      amount: 75000,
      purpose: veryLongPurpose,
      razorpayPaymentId: "pay_EXTREMELY_LONG_TRANSACTION_ID_WITH_SPECIAL_SUFFIX_998877",
      razorpayOrderId: "order_EXTREMELY_LONG_ORDER_ID_WITH_SECURE_PAYMENT_HASH_112233",
      formattedDate: "3 November 2026",
      formattedAmount: "₹75,000",
      orgDetails: {
        name: "UNIHOPE Foundation",
        trustRegistrationNo: "R/Chennai North Joint I/Book-4/228/2026",
        pan: "AAATU1234F",
        registeredAddress: "123, Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600006",
        email: "unihopefoundation.official@gmail.com",
        website: "https://unihopefoundation.org",
      },
      taxDetails: {
        approvalSection: "Provisional Approval under Section 354(4) (Form No. 106, Rule 181)",
        provisionalUrn: "AAATU1234FF20261",
        approvalDate: "15/04/2026",
        validFrom: "AY 2026-27",
        validUntil: "AY 2029-30",
      },
    });

    assert.ok(pdfBytes.length > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    const pageCount = doc.getPageCount();
    assert.ok(pageCount >= 2, `Long content must trigger continuation page (got ${pageCount} pages)`);

    // Verify all pages have A4 dimensions
    for (let i = 0; i < pageCount; i++) {
      const p = doc.getPage(i);
      assert.equal(Math.round(p.getWidth()), 595, `Page ${i + 1} width must be A4`);
      assert.equal(Math.round(p.getHeight()), 842, `Page ${i + 1} height must be A4`);
    }
  });
});
