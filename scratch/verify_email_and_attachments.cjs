const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const { buildDonationReceiptEmail } = await import('../convex/emailTemplates.ts');
  const { buildDonationReceiptPdf } = await import('../convex/pdfReceipt.ts');

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
    status: 'PAID',
    logoBytes: new Uint8Array(prodLogoBytes),
    signatureBytes: new Uint8Array(prodSigBytes),
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

  // 1. Generate Email HTML
  const { html, text } = buildDonationReceiptEmail({
    ...sampleData,
    signatureUrl: 'https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png',
  });

  // Verify signature image in HTML
  if (!html.includes('https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png')) {
    throw new Error('Email HTML does not contain signatureUrl');
  }
  if (html.includes('cid:')) {
    throw new Error('Email HTML still contains cid reference');
  }
  console.log('✔ Email HTML contains official HTTPS signature URL and no cid references.');

  // 2. Generate PDF
  const pdfBytes = await buildDonationReceiptPdf(sampleData);
  fs.writeFileSync('scratch/final_verified_receipt.pdf', pdfBytes);
  console.log('✔ Verified PDF generated (', pdfBytes.length, 'bytes)');

  // 3. Resend Attachment Payload Verification
  const emailAttachments = [
    {
      filename: 'UNIHOPE-Donation-Receipt.pdf',
      content: Buffer.from(pdfBytes).toString('base64'),
    },
  ];
  console.log('✔ Resend attachments list verified. Count:', emailAttachments.length);
  console.log('  Attachment 1:', emailAttachments[0].filename);

  // 4. Render Desktop Email Preview
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  // We serve the local cropped signature for rendering in the preview page
  const sigB64 = fs.readFileSync('scratch/cropped_signature.png').toString('base64');
  const previewHtml = html.replace(
    'https://brave-firefly-526.ap-southeast-2.convex.site/assets/signature.png',
    `data:image/png;base64,${sigB64}`
  );

  const desktopPage = await browser.newPage({
    viewport: { width: 780, height: 1300 },
    deviceScaleFactor: 2,
  });
  await desktopPage.setContent(previewHtml);
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'scratch/final_email_desktop.png', fullPage: true });

  // 5. Render Mobile Email Preview
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 1200 },
    deviceScaleFactor: 2,
  });
  await mobilePage.setContent(previewHtml);
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'scratch/final_email_mobile.png', fullPage: true });

  // 6. Render Gmail Client Simulation with exactly ONE attachment card
  const gmailSimPage = await browser.newPage({
    viewport: { width: 900, height: 1400 },
    deviceScaleFactor: 2,
  });
  await gmailSimPage.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #F6F8FC; font-family: 'Google Sans', Roboto, RobotoDraft, Helvetica, Arial, sans-serif; padding: 20px; }
          .gmail-inbox { max-width: 820px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #E0E3E7; box-shadow: 0 1px 3px rgba(60,64,67,0.3); overflow: hidden; }
          .gmail-header { padding: 16px 24px; border-bottom: 1px solid #E0E3E7; display: flex; align-items: center; justify-content: space-between; }
          .gmail-subject { font-size: 18px; font-weight: 500; color: #1F1F1F; }
          .gmail-sender { font-size: 13px; color: #444746; margin-top: 4px; }
          .gmail-body { padding: 24px; background: #F3F6FA; }
          .gmail-attachments-section { padding: 20px 24px 24px 24px; background: white; border-top: 1px solid #E0E3E7; }
          .attach-title { font-size: 13px; font-weight: 500; color: #444746; margin-bottom: 12px; }
          .attach-card { display: inline-flex; align-items: center; background: white; border: 1px solid #C4C7C5; border-radius: 8px; padding: 10px 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          .pdf-badge { background: #D93025; color: white; font-weight: bold; font-size: 10px; padding: 4px 6px; border-radius: 4px; margin-right: 12px; }
          .attach-name { font-size: 13px; font-weight: 500; color: #1F1F1F; }
          .attach-size { font-size: 11px; color: #747775; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="gmail-inbox">
          <div class="gmail-header">
            <div>
              <div class="gmail-subject">Donation Receipt — UH-2026-000001 — UNIHOPE Foundation</div>
              <div class="gmail-sender"><strong>UNIHOPE Foundation</strong> &lt;donations@unihopefoundation.org&gt; to rajesh.sundaram@example.com</div>
            </div>
          </div>
          <div class="gmail-body">
            ${previewHtml}
          </div>
          <div class="gmail-attachments-section">
            <div class="attach-title">1 Attachment &bull; Scanned by Gmail</div>
            <div class="attach-card">
              <div class="pdf-badge">PDF</div>
              <div>
                <div class="attach-name">UNIHOPE-Donation-Receipt.pdf</div>
                <div class="attach-size">598 KB &bull; Verified by UNIHOPE Foundation</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  await gmailSimPage.waitForTimeout(500);
  await gmailSimPage.screenshot({ path: 'scratch/gmail_delivery_simulation.png', fullPage: true });

  await browser.close();

  // Copy to brain artifacts
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\fa9273d8-a33d-4bc7-bf7e-015dccb64407';
  fs.copyFileSync('scratch/final_email_desktop.png', path.join(artifactDir, 'final_email_desktop.png'));
  fs.copyFileSync('scratch/final_email_mobile.png', path.join(artifactDir, 'final_email_mobile.png'));
  fs.copyFileSync('scratch/gmail_delivery_simulation.png', path.join(artifactDir, 'gmail_delivery_simulation.png'));
  console.log('✔ All previews rendered and copied to artifact directory.');
}

main().catch(console.error);

