const fs = require('fs');
const path = require('path');

const pngPath = path.resolve(__dirname, 'logo_512.png');
const b64 = fs.readFileSync(pngPath).toString('base64');
const tsPath = path.resolve(__dirname, '../convex/logoAsset.ts');

const tsContent = `/**
 * Official UNIHOPE circular logo (512x512 high-resolution transparent PNG).
 * Built-in logo for official donation receipts.
 */
export const OFFICIAL_LOGO_BASE64 = "${b64}";
`;

fs.writeFileSync(tsPath, tsContent);
console.log('Successfully generated convex/logoAsset.ts, size:', tsContent.length);

