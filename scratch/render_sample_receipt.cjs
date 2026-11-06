const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // 1. Generate realistic transparent handwriting signature PNG
  console.log('Generating test transparent signature PNG...');
  const sigPage = await browser.newPage({ viewport: { width: 450, height: 140 } });
  await sigPage.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 10px; background: transparent; overflow: hidden;">
        <svg width="430" height="120" viewBox="0 0 430 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M 25 75 C 50 15, 80 10, 105 60 C 125 105, 145 110, 175 45 C 200 -10, 225 35, 255 55 C 285 75, 315 25, 350 35 C 385 45, 405 80, 415 65" 
                fill="none" stroke="#102C50" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 55 90 C 130 100, 260 85, 375 95" 
                fill="none" stroke="#102C50" stroke-width="4.5" stroke-linecap="round"/>
        </svg>
      </body>
    </html>
  `);
  const testSigBytes = await sigPage.screenshot({ omitBackground: true });
  await sigPage.close();
  console.log('Generated signature PNG, size:', testSigBytes.length);

  // 2. Import buildDonationReceiptPdf
  const { buildDonationReceiptPdf } = await import('../convex/pdfReceipt.ts');

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
    signatureBytes: new Uint8Array(testSigBytes),
    orgDetails: {
      name: 'UNIHOPE Foundation',
      trustRegistrationNo: 'R/Chennai North Joint I/Book-4/228/2026',
      pan: undefined, // Omitted cleanly per requirements
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

  console.log('Generating redesigned PDF receipt from convex/pdfReceipt.ts...');
  const pdfBytes = await buildDonationReceiptPdf(sampleData);

  const pdfPath = path.resolve(__dirname, 'UNIHOPE-Donation-Receipt-Redesigned.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log('Saved PDF to', pdfPath, '(', pdfBytes.length, 'bytes )');

  // Also save to root UNIHOPE-Sample-Receipt.pdf
  const rootPdfPath = path.resolve(__dirname, '../UNIHOPE-Sample-Receipt.pdf');
  fs.writeFileSync(rootPdfPath, pdfBytes);

  // 3. Render to PNG using Chrome headless
  console.log('Rendering PDF to PNG preview via Chrome...');
  const page = await browser.newPage({
    viewport: { width: 1240, height: 1754 }, // High-resolution A4 preview
    deviceScaleFactor: 2,
  });

  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const pngPath = path.resolve(__dirname, 'UNIHOPE-Receipt-Preview.png');
  await page.screenshot({ path: pngPath });
  await browser.close();
  console.log('Screenshot saved to', pngPath);
}

main().catch(console.error);
