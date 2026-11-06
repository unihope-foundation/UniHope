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
  await page.waitForFunction(() => {
    const img = document.getElementById('img');
    return img && img.complete && img.naturalWidth > 0;
  });

  const res = await page.evaluate(() => {
    const img = document.getElementById('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;

    // First find the white page bounds
    let pMinX = c.width, pMaxX = 0, pMinY = c.height, pMaxY = 0;
    for (let y = 0; y < c.height; y += 4) {
      for (let x = 0; x < c.width; x += 4) {
        const idx = (y * c.width + x) * 4;
        if (data[idx] > 245 && data[idx + 1] > 245 && data[idx + 2] > 245) {
          if (x < pMinX) pMinX = x;
          if (x > pMaxX) pMaxX = x;
          if (y < pMinY) pMinY = y;
          if (y > pMaxY) pMaxY = y;
        }
      }
    }
    const pageBounds = { x: pMinX, y: pMinY, w: pMaxX - pMinX, h: pMaxY - pMinY };

    // Logo area: within pageBounds at top-left
    const logoArea = {
      x: pageBounds.x + Math.round(pageBounds.w * 0.04),
      y: pageBounds.y + Math.round(pageBounds.h * 0.035),
      w: Math.round(pageBounds.w * 0.52),
      h: Math.round(pageBounds.h * 0.12),
    };

    // Signature area: within pageBounds at bottom-right above Authorized Signatory
    const sigArea = {
      x: pageBounds.x + Math.round(pageBounds.w * 0.52),
      y: pageBounds.y + Math.round(pageBounds.h * 0.65),
      w: Math.round(pageBounds.w * 0.44),
      h: Math.round(pageBounds.h * 0.16),
    };

    // Helper to crop to data URI
    function crop(r) {
      const c2 = document.createElement('canvas');
      c2.width = r.w;
      c2.height = r.h;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
      return c2.toDataURL('image/png');
    }

    return {
      pageBounds,
      logoArea,
      sigArea,
      fullPageDataUrl: crop(pageBounds),
      logoDataUrl: crop(logoArea),
      sigDataUrl: crop(sigArea),
    };
  });

  console.log('Detected page bounds:', res.pageBounds);
  console.log('Logo crop area:', res.logoArea);
  console.log('Signature crop area:', res.sigArea);

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

  console.log('Saved clean crops successfully');
  await browser.close();
}

main().catch(console.error);

