const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const { buildDonationReceiptPdf } = await import('../convex/pdfReceipt.ts');

  // Read actual production signature bytes (1080x1350 from Convex storage)
  const prodSigBytes = fs.readFileSync('scratch/prod_signature.png');
  const prodLogoBytes = fs.readFileSync('scratch/prod_logo.png');

  const sampleData = {
    donorName: 'Dr. Rajesh Sundaram',
    donorEmail: 'rajesh.sundaram@example.com',
    donorPhone: '+91 98765 43210',
    anonymous: false,
    amount: 1000,
    purpose: 'General Donation',
    razorpayPaymentId: 'pay_TEST123456789',
    razorpayOrderId: 'order_TEST987654321',
    formattedDate: '04 Nov 2026, 10:30 AM',
    formattedAmount: '₹1,000',
    receiptNumber: 'UH-2026-000001',
    transactionRef: 'pay_TEST123456789',
    status: 'PAID',
    logoBytes: new Uint8Array(prodLogoBytes),
    signatureBytes: new Uint8Array(prodSigBytes),
    orgDetails: {
      name: 'UNIHOPE Foundation',
      trustRegistrationNo: 'R/Chennai North Joint I/Book-4/228/2026',
      pan: undefined,
      registeredAddress: '2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026',
      email: 'unihopefoundation.official@gmail.com',
      website: 'unihopefoundation.org',
    },
    taxDetails: {
      approvalSection: 'Section 80G Approval',
      provisionalUrn: 'AAACU1234CF20261',
      approvalDate: '15 April 2026',
      validFrom: 'AY 2026-27',
      validUntil: 'AY 2029-30',
      statutoryWording: 'Donations to UNIHOPE Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.',
      disclaimer: 'This is a computer-generated official receipt issued by UNIHOPE Foundation. Valid without a physical seal.',
    },
  };

  console.log('Building PDF with genuine production signature...');
  const pdfBytes = await buildDonationReceiptPdf(sampleData);
  const pdfPath = path.resolve(__dirname, 'test_new_receipt.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log('Saved test PDF to', pdfPath, '(', pdfBytes.length, 'bytes )');

  // Also update UNIHOPE-Sample-Receipt.pdf at root
  const rootPdfPath = path.resolve(__dirname, '../UNIHOPE-Sample-Receipt.pdf');
  fs.writeFileSync(rootPdfPath, pdfBytes);
  console.log('Updated root UNIHOPE-Sample-Receipt.pdf');

  // Render to high-res PNG using Chrome
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 2,
  });

  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const rawFullPng = path.resolve(__dirname, 'raw_full.png');
  await page.screenshot({ path: rawFullPng });
  await browser.close();
  console.log('Captured Chrome PDF render to raw_full.png');
}

main().catch(console.error);

