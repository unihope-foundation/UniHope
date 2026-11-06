const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });
  const b64 = fs.readFileSync(path.resolve(__dirname, 'preview_full.png')).toString('base64');
  await page.setContent(`<!DOCTYPE html><html><body><img id="img" src="data:image/png;base64,${b64}" /></body></html>`);
  await page.waitForFunction(() => document.getElementById('img').complete);

  const res = await page.evaluate(() => {
    const img = document.getElementById('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;

    // Scan column by column across horizontal center line (y = 500) to find the main A4 page
    const sampleY = Math.round(c.height * 0.3);
    let a4Left = 0, a4Right = 0;
    for (let x = 300; x < c.width; x++) {
      const idx = (sampleY * c.width + x) * 4;
      if (data[idx] > 245 && data[idx + 1] > 245 && data[idx + 2] > 245) {
        if (!a4Left) a4Left = x;
        a4Right = x;
      }
    }

    // Top and bottom of the main A4 page at x = a4Left + 200
    const sampleX = a4Left + 200;
    let a4Top = 0, a4Bottom = 0;
    for (let y = 0; y < c.height; y++) {
      const idx = (y * c.width + sampleX) * 4;
      if (data[idx] > 245 && data[idx + 1] > 245 && data[idx + 2] > 245) {
        if (!a4Top) a4Top = y;
        a4Bottom = y;
      }
    }

    const a4 = { x: a4Left, y: a4Top, w: a4Right - a4Left + 1, h: a4Bottom - a4Top + 1 };

    // Logo area on the main A4 page
    const logoCrop = {
      x: a4.x + Math.round(a4.w * 0.05),
      y: a4.y + Math.round(a4.h * 0.03),
      w: Math.round(a4.w * 0.58),
      h: Math.round(a4.h * 0.12),
    };

    // Signature area on the main A4 page
    const sigCrop = {
      x: a4.x + Math.round(a4.w * 0.55),
      y: a4.y + Math.round(a4.h * 0.69),
      w: Math.round(a4.w * 0.40),
      h: Math.round(a4.h * 0.18),
    };

    function crop(r) {
      const c2 = document.createElement('canvas');
      c2.width = r.w;
      c2.height = r.h;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      return c2.toDataURL('image/png');
    }

    return {
      a4,
      logoCrop,
      sigCrop,
      fullPageDataUrl: crop(a4),
      logoDataUrl: crop(logoCrop),
      sigDataUrl: crop(sigCrop),
    };
  });

  console.log('Main A4 page bounds:', res.a4);
  console.log('Logo crop area:', res.logoCrop);
  console.log('Signature crop area:', res.sigCrop);

  fs.writeFileSync(
    path.resolve(__dirname, 'clean_page.png'),
    Buffer.from(res.fullPageDataUrl.split(',')[1], 'base64')
  );
  fs.writeFileSync(
    path.resolve(__dirname, 'clean_logo_closeup.png'),
    Buffer.from(res.logoDataUrl.split(',')[1], 'base64')
  );
  fs.writeFileSync(
    path.resolve(__dirname, 'clean_signature_closeup.png'),
    Buffer.from(res.sigDataUrl.split(',')[1], 'base64')
  );

  await browser.close();
  console.log('Clean crops created successfully');
}

main().catch(console.error);

