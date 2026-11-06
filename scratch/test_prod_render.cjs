const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function testSignatureRender() {
  const { buildDonationReceiptPdf } = await import('../convex/pdfReceipt.ts');

  // Read actual production signature bytes (1080x1350 from Convex storage)
  const prodSigBytes = fs.readFileSync('scratch/prod_signature.png');
  const prodLogoBytes = fs.readFileSync('scratch/prod_logo.png');

  const data = {
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
      pan: 'AABTU1234F',
      registeredAddress: '2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026',
      email: 'unihopefoundation.official@gmail.com',
      website: 'unihopefoundation.org',
    },
    taxDetails: {
      approvalSection: 'Section 80G(5)(iv) of Income Tax Act, 1961',
      provisionalUrn: 'AABTU1234F24EC01',
      approvalDate: '24 Oct 2026',
      validFrom: '24-10-2026',
      validUntil: 'Assessment Year 2029-2030',
    },
  };

  const pdfBytes = await buildDonationReceiptPdf(data);
  fs.writeFileSync('scratch/test_prod_sig_receipt.pdf', pdfBytes);
  console.log('Saved scratch/test_prod_sig_receipt.pdf, size:', pdfBytes.length);

  // Render to PNG using Playwright PDF viewer or PDF.js
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  
  // Use PDF.js via CDN or iframe or Chrome's native PDF renderer
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          body { margin: 0; background: #525659; display: flex; justify-content: center; padding: 20px; }
          #pdf-canvas { box-shadow: 0 4px 12px rgba(0,0,0,0.3); background: white; }
        </style>
      </head>
      <body>
        <canvas id="pdf-canvas"></canvas>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const pdfData = atob('${pdfBase64}');
          const uint8Array = new Uint8Array(pdfData.length);
          for (let i = 0; i < pdfData.length; i++) {
            uint8Array[i] = pdfData.charCodeAt(i);
          }
          pdfjsLib.getDocument({ data: uint8Array }).promise.then(pdf => {
            pdf.getPage(1).then(page => {
              const viewport = page.getViewport({ scale: 2.0 });
              const canvas = document.getElementById('pdf-canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
                document.body.setAttribute('data-rendered', 'true');
              });
            });
          });
        </script>
      </body>
    </html>
  `);

  try {
    await page.waitForSelector('body[data-rendered="true"]', { timeout: 10000 });
    const canvas = await page.$('#pdf-canvas');
    if (canvas) {
      await canvas.screenshot({ path: 'scratch/test_prod_sig_full.png' });
      console.log('Saved scratch/test_prod_sig_full.png');
    }
  } catch (err) {
    console.warn('PDF.js render timed out (offline sandbox), using alternative render');
  }

  await browser.close();
}

testSignatureRender();

