const fs = require('fs');
const { chromium } = require('@playwright/test');

async function testEmailSig() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  const sigUrl = 'https://brave-firefly-526.ap-southeast-2.convex.cloud/api/storage/4027448f-fe78-4f0a-af71-143f64d006db';

  // Test 1: Standard img tag
  // Image is 1080x1350. Content is at x: 248..611 (w:364), y: 508..683 (h:176).
  // Top padding: 508 / 1350 = 37.6%
  // Bottom padding: 666 / 1350 = 49.3%
  // Left padding: 248 / 1080 = 23.0%
  // Right padding: 468 / 1080 = 43.3%

  // Approach A: Simple img tag
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="background: #ffffff; padding: 40px; font-family: Arial;">
        <h3>Approach A: Direct img tag</h3>
        <div style="border: 1px solid #ccc; width: 300px; padding: 10px;">
          <img src="${sigUrl}" width="180" style="display: block; margin-left: auto;" />
          <div style="border-top: 1px solid #102C50; width: 170px; margin-left: auto;"></div>
          <div style="text-align: right; font-weight: bold; color: #102C50;">Authorized Signatory</div>
        </div>

        <h3 style="margin-top: 40px;">Approach B: Cropped container (email safe)</h3>
        <div style="border: 1px solid #ccc; width: 300px; padding: 10px;">
          <!-- A fixed-height container that crops the transparent padding using overflow:hidden and negative margins or object-fit -->
          <div style="width: 170px; height: 75px; overflow: hidden; margin-left: auto; position: relative;">
            <img src="${sigUrl}" width="400" style="position: absolute; left: -85px; top: -140px; display: block;" />
          </div>
          <div style="border-top: 1px solid #102C50; width: 170px; margin-left: auto;"></div>
          <div style="text-align: right; font-weight: bold; color: #102C50;">Authorized Signatory</div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: 'scratch/test_email_sig_approaches.png' });
  await browser.close();
  console.log('Saved scratch/test_email_sig_approaches.png');
}

testEmailSig();

