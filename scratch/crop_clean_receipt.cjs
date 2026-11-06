const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const page = await browser.newPage({
    viewport: { width: 1400, height: 1800 },
    deviceScaleFactor: 1,
  });

  const pngPath = path.resolve(__dirname, 'test_new_receipt.png');
  const pngB64 = fs.readFileSync(pngPath).toString('base64');
  const dataUri = `data:image/png;base64,${pngB64}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: #222;">
        <img id="receipt" src="${dataUri}" />
      </body>
    </html>
  `);

  await page.waitForSelector('#receipt');
  await page.waitForFunction(() => {
    const img = document.getElementById('receipt');
    return img && img.complete && img.naturalWidth > 0;
  });

  const dims = await page.evaluate(() => {
    const img = document.getElementById('receipt');
    return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
  });
  console.log('Image dimensions:', dims);

  await page.evaluate(() => {
    const img = document.getElementById('receipt');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    // Sample scan for white page (r > 240, g > 240, b > 240)
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r > 240 && g > 240 && b > 240) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    window.__pageBounds = { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 };
  });

  const bounds = await page.evaluate(() => window.__pageBounds);
  console.log('White page bounds in screenshot:', bounds);

  // 1. Crop full page cleanly
  const fullPageDataUrl = await page.evaluate((b) => {
    const img = document.getElementById('receipt');
    const c = document.createElement('canvas');
    c.width = b.w;
    c.height = b.h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, b.minX, b.minY, b.w, b.h, 0, 0, b.w, b.h);
    return c.toDataURL('image/png');
  }, bounds);

  fs.writeFileSync(
    path.resolve(__dirname, 'clean_page.png'),
    Buffer.from(fullPageDataUrl.split(',')[1], 'base64')
  );
  console.log('Saved clean_page.png');

  // 2. Crop logo close-up (Header with official logo and organization name)
  const logoDataUrl = await page.evaluate((b) => {
    const img = document.getElementById('receipt');
    const c = document.createElement('canvas');
    const cropX = b.minX + Math.round(b.w * 0.05);
    const cropY = b.minY + Math.round(b.h * 0.035);
    const cropW = Math.round(b.w * 0.55);
    const cropH = Math.round(b.h * 0.12);
    c.width = cropW;
    c.height = cropH;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return c.toDataURL('image/png');
  }, bounds);

  fs.writeFileSync(
    path.resolve(__dirname, 'clean_logo_closeup.png'),
    Buffer.from(logoDataUrl.split(',')[1], 'base64')
  );
  console.log('Saved clean_logo_closeup.png');

  // 3. Crop signature close-up (Signatory section with enlarged handwritten signature)
  const sigDataUrl = await page.evaluate((b) => {
    const img = document.getElementById('receipt');
    const c = document.createElement('canvas');
    const cropX = b.minX + Math.round(b.w * 0.55);
    const cropY = b.minY + Math.round(b.h * 0.74);
    const cropW = Math.round(b.w * 0.40);
    const cropH = Math.round(b.h * 0.15);
    c.width = cropW;
    c.height = cropH;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return c.toDataURL('image/png');
  }, bounds);

  fs.writeFileSync(
    path.resolve(__dirname, 'clean_signature_closeup.png'),
    Buffer.from(sigDataUrl.split(',')[1], 'base64')
  );
  console.log('Saved clean_signature_closeup.png');

  await browser.close();
}

main().catch(console.error);
