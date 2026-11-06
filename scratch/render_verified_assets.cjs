const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ARTIFACTS_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\fa9273d8-a33d-4bc7-bf7e-015dccb64407';

async function main() {
  const pdfPath = path.resolve(__dirname, 'actual_code_generated_receipt.pdf');
  if (!fs.existsSync(pdfPath)) {
    throw new Error('actual_code_generated_receipt.pdf does not exist!');
  }

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const page = await browser.newPage({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 2,
  });

  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
  console.log('Navigating to', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const fullPngPath = path.resolve(__dirname, 'verified_actual_receipt_full.png');
  await page.screenshot({ path: fullPngPath });
  console.log('Captured verified_actual_receipt_full.png');

  // Logo close-up (Top-left header area)
  const logoPngPath = path.resolve(__dirname, 'verified_actual_logo_closeup.png');
  await page.screenshot({
    path: logoPngPath,
    clip: { x: 50, y: 40, width: 620, height: 230 },
  });
  console.log('Captured verified_actual_logo_closeup.png');

  // Signature close-up (Bottom-right signatory area)
  const sigPngPath = path.resolve(__dirname, 'verified_actual_signature_closeup.png');
  await page.screenshot({
    path: sigPngPath,
    clip: { x: 680, y: 1140, width: 510, height: 280 },
  });
  console.log('Captured verified_actual_signature_closeup.png');

  await browser.close();

  // Copy all verified assets to artifacts directory for user presentation
  const filesToCopy = [
    { src: path.resolve(__dirname, 'decoded_official_logo.png'), dest: path.join(ARTIFACTS_DIR, 'decoded_official_logo.png') },
    { src: path.resolve(__dirname, 'decoded_official_signature.png'), dest: path.join(ARTIFACTS_DIR, 'decoded_official_signature.png') },
    { src: fullPngPath, dest: path.join(ARTIFACTS_DIR, 'verified_actual_receipt_full.png') },
    { src: logoPngPath, dest: path.join(ARTIFACTS_DIR, 'verified_actual_logo_closeup.png') },
    { src: sigPngPath, dest: path.join(ARTIFACTS_DIR, 'verified_actual_signature_closeup.png') },
  ];

  for (const { src, dest } of filesToCopy) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${path.basename(src)} -> ${dest}`);
    }
  }

  console.log('✔ All verified image assets rendered and copied successfully.');
}

main().catch(console.error);

