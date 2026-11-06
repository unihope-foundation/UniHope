const fs = require('fs');
const path = require('path');

const logoTsPath = path.resolve(__dirname, '../convex/logoAsset.ts');
const receiptTsPath = path.resolve(__dirname, '../convex/pdfReceipt.ts');

const logoTs = fs.readFileSync(logoTsPath, 'utf8');
const receiptTs = fs.readFileSync(receiptTsPath, 'utf8');

const updated = receiptTs.replace(
  'import { OFFICIAL_LOGO_BASE64 } from "./logoAsset.ts";',
  logoTs
);

fs.writeFileSync(receiptTsPath, updated);
console.log('Successfully inlined OFFICIAL_LOGO_BASE64 into pdfReceipt.ts');

