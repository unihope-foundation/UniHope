const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const pdfPath = path.resolve(__dirname, '../UNIHOPE-Sample-Receipt.pdf');
  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');

  console.log('Rendering full receipt page...');
  const page = await browser.newPage({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 2,
  });

  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const fullPngPath = path.resolve(__dirname, 'preview_full.png');
  await page.screenshot({ path: fullPngPath });
  console.log('Full preview saved to', fullPngPath);

  // Logo close-up (Header with official logo and organization name)
  const logoPngPath = path.resolve(__dirname, 'preview_logo_closeup.png');
  await page.screenshot({
    path: logoPngPath,
    clip: { x: 50, y: 40, width: 600, height: 220 },
  });
  console.log('Logo close-up saved to', logoPngPath);

  // Signature close-up (Signatory section with enlarged handwritten signature)
  const sigPngPath = path.resolve(__dirname, 'preview_signature_closeup.png');
  await page.screenshot({
    path: sigPngPath,
    clip: { x: 700, y: 1180, width: 490, height: 260 },
  });
  console.log('Signature close-up saved to', sigPngPath);

  await browser.close();
}

main().catch(console.error);

