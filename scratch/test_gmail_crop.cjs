const fs = require('fs');
const { chromium } = require('@playwright/test');

async function testGmailCrop() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 900 } });

  const sigUrl = 'https://brave-firefly-526.ap-southeast-2.convex.cloud/api/storage/4027448f-fe78-4f0a-af71-143f64d006db';

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="background: #ffffff; padding: 40px; font-family: Arial;">

        <!-- Option 1: Negative margin-bottom on image to pull the line up -->
        <h3>Option 1: Negative margin-bottom</h3>
        <div style="border: 1px solid #ccc; width: 250px; padding: 15px; margin-bottom: 30px;">
          <div style="text-align: right;">
            <img src="${sigUrl}" width="220" style="display: block; margin-left: auto; margin-bottom: -80px; margin-top: -50px;" />
            <div style="border-top: 1px solid #102C50; width: 170px; margin-left: auto;"></div>
            <div style="font-size: 11px; font-weight: bold; color: #102C50; margin-top: 4px;">Authorized Signatory</div>
            <div style="font-size: 9.5px; color: #64748B;">Founder, UNIHOPE Foundation</div>
          </div>
        </div>

        <!-- Option 2: Table with height and overflow hidden -->
        <h3>Option 2: Table wrapper with clip / max-height</h3>
        <div style="border: 1px solid #ccc; width: 250px; padding: 15px; margin-bottom: 30px;">
          <div style="text-align: right;">
            <div style="width: 170px; height: 65px; overflow: hidden; margin-left: auto;">
              <img src="${sigUrl}" width="260" style="display: block; margin-left: -40px; margin-top: -65px;" />
            </div>
            <div style="border-top: 1px solid #102C50; width: 170px; margin-left: auto;"></div>
            <div style="font-size: 11px; font-weight: bold; color: #102C50; margin-top: 4px;">Authorized Signatory</div>
            <div style="font-size: 9.5px; color: #64748B;">Founder, UNIHOPE Foundation</div>
          </div>
        </div>

        <!-- Option 3: Natural width with tight line spacing -->
        <h3>Option 3: Scaled width without margin hacks</h3>
        <div style="border: 1px solid #ccc; width: 250px; padding: 15px;">
          <div style="text-align: right;">
            <img src="${sigUrl}" width="140" style="display: block; margin-left: auto;" />
            <div style="border-top: 1px solid #102C50; width: 170px; margin-left: auto;"></div>
            <div style="font-size: 11px; font-weight: bold; color: #102C50; margin-top: 4px;">Authorized Signatory</div>
            <div style="font-size: 9.5px; color: #64748B;">Founder, UNIHOPE Foundation</div>
          </div>
        </div>

      </body>
    </html>
  `);

  await page.screenshot({ path: 'scratch/test_gmail_crop.png' });
  await browser.close();
  console.log('Saved scratch/test_gmail_crop.png');
}

testGmailCrop();

