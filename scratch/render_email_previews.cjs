const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const { buildDonationReceiptEmail } = await import('../convex/emailTemplates.ts');

  // Read cropped signature as base64 data URI for offline email preview
  const sigB64 = fs.readFileSync('scratch/cropped_signature.png').toString('base64');
  const sigDataUri = `data:image/png;base64,${sigB64}`;

  const logoB64 = fs.readFileSync('scratch/logo_512.png').toString('base64');
  const logoDataUri = `data:image/png;base64,${logoB64}`;

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
    status: 'PAID',
    logoUrl: logoDataUri,
    signatureUrl: sigDataUri,
    orgDetails: {
      name: 'UNIHOPE Foundation',
      trustRegistrationNo: 'R/Chennai North Joint I/Book-4/228/2026',
      pan: 'AABTU1234F',
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

  const { html, text } = buildDonationReceiptEmail(sampleData);
  fs.writeFileSync('scratch/email_preview.html', html);
  fs.writeFileSync('scratch/email_preview.txt', text);
  console.log('Saved scratch/email_preview.html and .txt');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // 1. Desktop Preview (800px viewport, 2x scale)
  const desktopPage = await browser.newPage({
    viewport: { width: 780, height: 1300 },
    deviceScaleFactor: 2,
  });
  await desktopPage.setContent(html);
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'scratch/email_preview_desktop.png', fullPage: true });
  console.log('Saved scratch/email_preview_desktop.png');

  // 2. Mobile Preview (375px viewport - iPhone SE / 13 mini)
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 1200 },
    deviceScaleFactor: 2,
  });
  await mobilePage.setContent(html);
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'scratch/email_preview_mobile.png', fullPage: true });
  console.log('Saved scratch/email_preview_mobile.png');

  await browser.close();

  // Copy to brain artifacts
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\fa9273d8-a33d-4bc7-bf7e-015dccb64407';
  fs.copyFileSync('scratch/email_preview_desktop.png', path.join(artifactDir, 'email_preview_desktop.png'));
  fs.copyFileSync('scratch/email_preview_mobile.png', path.join(artifactDir, 'email_preview_mobile.png'));
  console.log('Copied email previews to artifact directory!');
}

main().catch(console.error);

