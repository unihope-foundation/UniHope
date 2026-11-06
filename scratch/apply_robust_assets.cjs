const fs = require('fs');
const path = require('path');

// 1. Update convex/pdfReceipt.ts
const pdfReceiptPath = path.resolve(__dirname, '../convex/pdfReceipt.ts');
let pdfReceipt = fs.readFileSync(pdfReceiptPath, 'utf8');

// Update interface
const oldInterface = `  logoBytes?: Uint8Array | null;
  signatureBytes?: Uint8Array | null;
  orgDetails?: OrgDetails;`;

const newInterface = `  logoBytes?: Uint8Array | null;
  signatureBytes?: Uint8Array | null;
  logoSrc?: string | Uint8Array | null;
  signatureSrc?: string | Uint8Array | null;
  orgDetails?: OrgDetails;`;

pdfReceipt = pdfReceipt.replace(oldInterface, newInterface);

// Add helpers if not present
if (!pdfReceipt.includes('function resolveImageBytes')) {
  const helpersCode = `/**
 * Safely resolves an image input (Uint8Array, base64 data URI, or raw base64 string) into a Uint8Array.
 */
function resolveImageBytes(input: Uint8Array | string | null | undefined): Uint8Array | null {
  if (!input) return null;
  if (input instanceof Uint8Array) return input.byteLength > 0 ? input : null;
  if (typeof input === "string" && input.trim().length > 0) {
    const raw = input.trim();
    const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
    try {
      const bytes = base64ToUint8Array(base64);
      return bytes.byteLength > 0 ? bytes : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Safely embeds either a PNG or JPEG image into the PDFDocument based on magic header bytes.
 */
async function embedImageSafely(pdfDoc: PDFDocument, bytes: Uint8Array) {
  const isPng =
    bytes.length > 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isJpg =
    bytes.length > 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  if (isPng) {
    return await pdfDoc.embedPng(bytes);
  } else if (isJpg) {
    return await pdfDoc.embedJpg(bytes);
  } else {
    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  }
}
`;

  pdfReceipt = pdfReceipt.replace(
    'function base64ToUint8Array(base64: string): Uint8Array {',
    helpersCode + '\nfunction base64ToUint8Array(base64: string): Uint8Array {'
  );
}

// Update logo resolution
const oldLogoResolution = `  // Resolve official organization logo (preserves aspect ratio & transparency; no placeholder fallback)
  let effectiveLogoBytes = data.logoBytes;
  if (!effectiveLogoBytes && OFFICIAL_LOGO_BASE64) {
    try {
      effectiveLogoBytes = base64ToUint8Array(OFFICIAL_LOGO_BASE64);
    } catch {
      effectiveLogoBytes = null;
    }
  }

  if (effectiveLogoBytes && effectiveLogoBytes.length > 0) {
    try {
      const logoImg = await pdfDoc.embedPng(effectiveLogoBytes);`;

const newLogoResolution = `  // Resolve official organization logo (preserves aspect ratio & transparency; no placeholder fallback)
  let effectiveLogoBytes =
    resolveImageBytes(data.logoSrc) || resolveImageBytes(data.logoBytes);
  if (!effectiveLogoBytes && OFFICIAL_LOGO_BASE64) {
    try {
      effectiveLogoBytes = base64ToUint8Array(OFFICIAL_LOGO_BASE64);
    } catch {
      effectiveLogoBytes = null;
    }
  }

  if (effectiveLogoBytes && effectiveLogoBytes.length > 0) {
    try {
      const logoImg = await embedImageSafely(pdfDoc, effectiveLogoBytes);`;

pdfReceipt = pdfReceipt.replace(oldLogoResolution, newLogoResolution);

// Update signature resolution
const oldSigResolution = `  // Signature box (Target width: 150-180 pt, height: 45-60 pt, maintaining original aspect ratio)
  const sigW = 190;
  const sigX = rightX - sigW;
  const sigLineY = closeY - 54;

  if (data.signatureBytes && data.signatureBytes.length > 0) {
    try {
      const sigImg = await pdfDoc.embedPng(data.signatureBytes);`;

const newSigResolution = `  // Signature box (Target width: 150-180 pt, height: 45-60 pt, maintaining original aspect ratio)
  const sigW = 190;
  const sigX = rightX - sigW;
  const sigLineY = closeY - 54;

  const effectiveSigBytes =
    resolveImageBytes(data.signatureSrc) || resolveImageBytes(data.signatureBytes);

  if (effectiveSigBytes && effectiveSigBytes.length > 0) {
    try {
      const sigImg = await embedImageSafely(pdfDoc, effectiveSigBytes);`;

pdfReceipt = pdfReceipt.replace(oldSigResolution, newSigResolution);

fs.writeFileSync(pdfReceiptPath, pdfReceipt);
console.log('Successfully updated convex/pdfReceipt.ts');

// 2. Update convex/donations.ts
const donationsPath = path.resolve(__dirname, '../convex/donations.ts');
let donations = fs.readFileSync(donationsPath, 'utf8');

const oldDonationsCall = `        formattedAmount,
        logoBytes,
        signatureBytes,
        orgDetails,
        taxDetails,`;

const newDonationsCall = `        formattedAmount,
        logoBytes,
        logoSrc: logoBytes,
        signatureBytes,
        signatureSrc: signatureBytes,
        orgDetails,
        taxDetails,`;

donations = donations.replace(oldDonationsCall, newDonationsCall);
fs.writeFileSync(donationsPath, donations);
console.log('Successfully updated convex/donations.ts');

