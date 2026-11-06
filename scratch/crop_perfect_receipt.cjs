const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });

  const page = await browser.newPage({
    viewport: { width: 2600, height: 3600 },
    deviceScaleFactor: 1,
  });

  const rawPath = path.resolve(__dirname, 'raw_full.png');
  const rawB64 = fs.readFileSync(rawPath).toString('base64');
  const dataUri = `data:image/png;base64,${rawB64}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; background: #111;">
        <img id="receipt" src="${dataUri}" />
      </body>
    </html>
  `);

  await page.waitForFunction(() => {
    const img = document.getElementById('receipt');
    return img && img.complete && img.naturalWidth > 0;
  });

  const cropResults = await page.evaluate(() => {
    const img = document.getElementById('receipt');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    // Find pure white paper bounds (r > 240, g > 240, b > 240)
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        const idx = (y * canvas.width + x) * 4;
        if (d[idx] > 240 && d[idx + 1] > 240 && d[idx + 2] > 240) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pageW = maxX - minX + 1;
    const pageH = maxY - minY + 1;

    // 1. Full page
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = pageW;
    pageCanvas.height = pageH;
    const pCtx = pageCanvas.getContext('2d');
    pCtx.drawImage(canvas, minX, minY, pageW, pageH, 0, 0, pageW, pageH);
    const fullPageData = pageCanvas.toDataURL('image/png');

    // 2. Logo close-up (top 20% left 60%)
    const logoCanvas = document.createElement('canvas');
    const logoW = Math.round(pageW * 0.65);
    const logoH = Math.round(pageH * 0.16);
    logoCanvas.width = logoW;
    logoCanvas.height = logoH;
    const lCtx = logoCanvas.getContext('2d');
    lCtx.drawImage(pageCanvas, 0, 0, logoW, logoH, 0, 0, logoW, logoH);
    const logoData = logoCanvas.toDataURL('image/png');

    // 3. Signature close-up (bottom right area: from 75% to 95% height, from 45% to 100% width)
    const sigCanvas = document.createElement('canvas');
    const sigCropX = Math.round(pageW * 0.45);
    const sigCropY = Math.round(pageH * 0.68);
    const sigCropW = Math.round(pageW * 0.53);
    const sigCropH = Math.round(pageH * 0.28);
    sigCanvas.width = sigCropW;
    sigCanvas.height = sigCropH;
    const sCtx = sigCanvas.getContext('2d');
    sCtx.drawImage(pageCanvas, sigCropX, sigCropY, sigCropW, sigCropH, 0, 0, sigCropW, sigCropH);
    const sigData = sigCanvas.toDataURL('image/png');

    return { fullPageData, logoData, sigData, minX, maxX, minY, maxY, pageW, pageH };
  });

  await browser.close();

  // Save files
  const saveB64 = (filePath, dataUrl) => {
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  };

  saveB64('scratch/test_new_receipt.png', cropResults.fullPageData);
  saveB64('scratch/clean_page.png', cropResults.fullPageData);
  saveB64('scratch/clean_logo_closeup.png', cropResults.logoData);
  saveB64('scratch/clean_signature_closeup.png', cropResults.sigData);

  // Copy to brain artifacts
  const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\fa9273d8-a33d-4bc7-bf7e-015dccb64407';
  fs.copyFileSync('scratch/clean_page.png', path.join(artifactDir, 'clean_page.png'));
  fs.copyFileSync('scratch/clean_logo_closeup.png', path.join(artifactDir, 'clean_logo_closeup.png'));
  fs.copyFileSync('scratch/clean_signature_closeup.png', path.join(artifactDir, 'clean_signature_closeup.png'));

  console.log('Successfully cropped and saved all previews!');
  console.log('Page bounds:', {
    minX: cropResults.minX,
    maxX: cropResults.maxX,
    minY: cropResults.minY,
    maxY: cropResults.maxY,
    w: cropResults.pageW,
    h: cropResults.pageH,
  });
}

main().catch(console.error);
