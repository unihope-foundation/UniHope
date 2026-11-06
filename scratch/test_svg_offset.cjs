const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

async function test() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);

  const x = 50, y = 150, width = 300, height = 60, radius = 6;
  const r = radius;
  const k = 0.5522847498;
  const kr = r * k;

  // Path defined from (0,0) to (width, height)
  const pathData = `M ${r} 0 ` +
    `L ${width - r} 0 ` +
    `C ${width - r + kr} 0 ${width} ${r - kr} ${width} ${r} ` +
    `L ${width} ${height - r} ` +
    `C ${width} ${height - r + kr} ${width - r + kr} ${height} ${width - r} ${height} ` +
    `L ${r} ${height} ` +
    `C ${r - kr} ${height} 0 ${height - r + kr} 0 ${height - r} ` +
    `L 0 ${r} ` +
    `C 0 ${r - kr} ${r - kr} 0 ${r} 0 Z`;

  page.drawSvgPath(pathData, {
    x,
    y,
    color: rgb(243 / 255, 246 / 255, 250 / 255),
    borderColor: rgb(220 / 255, 228 / 255, 237 / 255),
    borderWidth: 1,
  });

  const pdfBytes = await doc.save();
  const pdfFile = path.resolve(__dirname, 'test_rect.pdf');
  fs.writeFileSync(pdfFile, pdfBytes);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const p = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await p.goto('file:///' + pdfFile.replace(/\\/g, '/'));
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path.resolve(__dirname, 'test_rect.png') });
  await browser.close();
  console.log('Done!');
}

test().catch(console.error);

