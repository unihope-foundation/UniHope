const fs = require('fs');
const { chromium } = require('@playwright/test');

async function viewSig() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 500, height: 300 } });
  const sigB64 = fs.readFileSync('scratch/cropped_signature.png').toString('base64');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 20px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h3 style="font-family: Arial; color: #102C50;">Founder Signature (Cropped Preview)</h3>
        <div style="border: 1px dashed #168C86; padding: 10px; background: #F3F6FA; border-radius: 8px;">
          <img src="data:image/png;base64,${sigB64}" style="width: 250px; height: auto;" />
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: 'scratch/view_genuine_signature.png' });
  await browser.close();
  console.log('Saved scratch/view_genuine_signature.png');
}
viewSig();

