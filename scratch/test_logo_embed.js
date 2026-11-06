const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const pdfReceipt = fs.readFileSync(path.join(__dirname, '../convex/pdfReceipt.ts'), 'utf8');
const match = pdfReceipt.match(/export const OFFICIAL_LOGO_BASE64 = "([^"]+)";/);
if (!match) {
  console.log('No match for OFFICIAL_LOGO_BASE64');
  process.exit(1);
}
const b64 = match[1];
console.log('B64 length:', b64.length);

// Test V8 fallback path: simulating no Buffer
function atobFallback(b64Str) {
  const binary = atob(b64Str);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const bytes = atobFallback(b64);
console.log('Decoded bytes:', bytes.length, Array.from(bytes.slice(0, 8)));

async function run() {
  try {
    const doc = await PDFDocument.create();
    const img = await doc.embedPng(bytes);
    console.log('embedPng SUCCESS! width:', img.width, 'height:', img.height);
  } catch (err) {
    console.error('embedPng FAILED:', err);
  }
}
run();

