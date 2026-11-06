const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../convex/pdfReceipt.ts');

// Read existing OFFICIAL_LOGO_BASE64 from pdfReceipt.ts
const existingContent = fs.readFileSync(targetPath, 'utf8');
const logoMatch = existingContent.match(/export const OFFICIAL_LOGO_BASE64 = "([^"]+)";/);
if (!logoMatch) {
  console.error("Could not find OFFICIAL_LOGO_BASE64 in existing file!");
  process.exit(1);
}
const logoBase64 = logoMatch[1];

const newCode = `import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, Color } from "pdf-lib";

export interface OrgDetails {
  name?: string;
  registeredAddress?: string;
  pan?: string;
  trustRegistrationNo?: string;
  email?: string;
  website?: string;
}

export interface TaxDetails {
  approvalSection?: string;
  provisionalUrn?: string;
  approvalDate?: string;
  validFrom?: string;
  validUntil?: string;
  statutoryWording?: string;
  disclaimer?: string;
}

export interface PdfReceiptData {
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  anonymous: boolean;
  amount: number;
  purpose: string;
  currency?: string;
  quantity?: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  formattedDate: string;
  formattedAmount: string;
  receiptNumber?: string;
  transactionRef?: string;
  status?: string;
  description?: string;
  signatoryTitle?: string;
  logoBytes?: Uint8Array | null;
  signatureBytes?: Uint8Array | null;
  orgDetails?: OrgDetails;
  taxDetails?: TaxDetails;
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND PALETTE TOKENS (Exact UNIHOPE Brand Specifications)
// ─────────────────────────────────────────────────────────────────────────────
const NAVY = rgb(16 / 255, 44 / 255, 80 / 255);        // #102C50
const TEAL = rgb(22 / 255, 140 / 255, 134 / 255);     // #168C86
const LIGHT_BG = rgb(243 / 255, 246 / 255, 250 / 255); // #F3F6FA
const BODY_TEXT = rgb(38 / 255, 52 / 255, 69 / 255); // #263445
const MUTED = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748B
const BORDER = rgb(220 / 255, 228 / 255, 237 / 255);  // #DCE4ED
const SUCCESS = rgb(22 / 255, 140 / 255, 85 / 255);   // #168C55
const WHITE = rgb(1, 1, 1);

export const DEFAULT_ORG: OrgDetails = {
  name: "UNIHOPE Foundation",
  trustRegistrationNo: "R/Chennai North Joint I/Book-4/228/2026",
  pan: undefined,
  registeredAddress:
    "2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026",
  website: "unihopefoundation.org",
  email: "unihopefoundation.official@gmail.com",
};

/**
 * Converts a Uint8Array into a Base64 string safely across Node & V8 runtimes.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string into a Uint8Array safely across Node & V8 runtimes.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Wraps text into lines that do not exceed maxWidth points.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  if (!text || text.trim().length === 0) return [];
  const words = text.split(/\\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? \`\${currentLine} \${word}\` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const char of word) {
          if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
            chunk += char;
          } else {
            lines.push(chunk);
            chunk = char;
          }
        }
        currentLine = chunk;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// In drawSvgPath, y is the top coordinate in PDF space, extending downward by height
function drawRoundedRectTop(
  page: PDFPage,
  x: number,
  topY: number,
  width: number,
  height: number,
  radius: number,
  options: {
    color?: Color;
    borderColor?: Color;
    borderWidth?: number;
  } = {}
) {
  const r = Math.min(radius, width / 2, height / 2);
  const k = 0.5522847498;
  const kr = r * k;

  const pathData = \`M \${r} 0 \` +
    \`L \${width - r} 0 \` +
    \`C \${width - r + kr} 0 \${width} \${r - kr} \${width} \${r} \` +
    \`L \${width} \${height - r} \` +
    \`C \${width} \${height - r + kr} \${width - r + kr} \${height} \${width - r} \${height} \` +
    \`L \${r} \${height} \` +
    \`C \${r - kr} \${height} 0 \${height - r + kr} 0 \${height - r} \` +
    \`L 0 \${r} \` +
    \`C 0 \${r - kr} \${r - kr} 0 \${r} 0 Z\`;

  page.drawSvgPath(pathData, {
    x,
    y: topY,
    color: options.color,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth ?? 0,
  });
}

function drawCheckmark(
  page: PDFPage,
  cx: number,
  cy: number,
  radius: number,
  fillColor: Color,
  checkColor: Color = WHITE
) {
  page.drawCircle({
    x: cx,
    y: cy,
    size: radius,
    color: fillColor,
  });
  const p1 = { x: cx - radius * 0.44, y: cy + radius * 0.02 };
  const p2 = { x: cx - radius * 0.12, y: cy - radius * 0.33 };
  const p3 = { x: cx + radius * 0.46, y: cy + radius * 0.32 };
  const thick = Math.max(1, radius * 0.22);
  page.drawLine({ start: p1, end: p2, thickness: thick, color: checkColor });
  page.drawLine({ start: p2, end: p3, thickness: thick, color: checkColor });
}

export const receiptFileName = (d: Pick<PdfReceiptData, "receiptNumber"> | { receiptNumber: string }) =>
  \`UNIHOPE-Donation-Receipt-\${(d.receiptNumber || "RECEIPT").replace(/[^A-Za-z0-9_-]/g, "")}.pdf\`;

/**
 * Builds a premium, corporate nonprofit financial donation receipt PDF.
 * Designed to match the approved UNIHOPE Foundation receipt design.
 */
export async function buildDonationReceiptPdf(data: PdfReceiptData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Organization & Statutory Data (no sample text placeholders)
  const orgName = data.orgDetails?.name || process.env.ORG_NAME || DEFAULT_ORG.name || "UNIHOPE Foundation";
  const orgRegNo = data.orgDetails?.trustRegistrationNo || process.env.ORG_TRUST_REGISTRATION_NO || DEFAULT_ORG.trustRegistrationNo || "";
  const orgPan = data.orgDetails?.pan || process.env.ORG_PAN || "";
  const orgAddress = data.orgDetails?.registeredAddress || process.env.ORG_REGISTERED_ADDRESS || DEFAULT_ORG.registeredAddress || "";
  const orgEmail = data.orgDetails?.email || process.env.ORG_EMAIL || DEFAULT_ORG.email || "";
  const orgWebsite = data.orgDetails?.website || process.env.ORG_WEBSITE || DEFAULT_ORG.website || "";

  // Tax details (only display if actually provided and not placeholder)
  const cleanTaxVal = (val?: string) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) return "";
    return trimmed;
  };

  const taxSection = cleanTaxVal(data.taxDetails?.approvalSection || process.env.ORG_80G_PROVISIONAL_APPROVAL_SECTION);
  const taxUrn = cleanTaxVal(data.taxDetails?.provisionalUrn || process.env.ORG_80G_PROVISIONAL_URN);
  const taxDate = cleanTaxVal(data.taxDetails?.approvalDate || process.env.ORG_80G_APPROVAL_DATE);
  const taxValidFrom = cleanTaxVal(data.taxDetails?.validFrom || process.env.ORG_80G_VALID_FROM);
  const taxValidUntil = cleanTaxVal(data.taxDetails?.validUntil || process.env.ORG_80G_VALID_UNTIL);
  const validityPeriod = [taxValidFrom, taxValidUntil].filter(Boolean).join(" to ");
  const statutoryWording = cleanTaxVal(data.taxDetails?.statutoryWording) ||
    "Donations to UNIHOPE Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.";
  const disclaimer = cleanTaxVal(data.taxDetails?.disclaimer) ||
    "This is a computer-generated official receipt issued by UNIHOPE Foundation. Valid without a physical seal.";

  const hasTaxDetails = !!(taxSection || taxUrn || taxDate || validityPeriod || data.taxDetails?.statutoryWording);

  // Financial & Transaction Data
  const currency = data.currency || "INR";
  const qty = data.quantity || 1;
  const rawId = (data.razorpayPaymentId || "UH000000").replace(/^pay_/, "").toUpperCase();
  const year = new Date().getFullYear();
  const receiptNo = data.receiptNumber || \`UH-\${year}-\${rawId.slice(-6).padStart(6, "0")}\`;
  const transactionRef = data.transactionRef || data.razorpayPaymentId || "N/A";
  const purpose = data.purpose || "General Donation";
  const statusText = (data.status || "PAID").toUpperCase();
  const isPaid = statusText === "PAID" || statusText === "CAPTURED";
  const statusColor = isPaid ? SUCCESS : MUTED;

  const rawAmountNum = typeof data.amount === "number" ? data.amount : parseFloat(String(data.amount)) || 0;
  const formattedAmountStr = \`\${currency} \${rawAmountNum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;
  const unitAmountStr = \`\${currency} \${(rawAmountNum / qty).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;

  const displayName = data.anonymous ? "Supporter" : (data.donorName || "Supporter");
  const displayEmail = data.donorEmail || "";
  const displayPhone = data.donorPhone || "";

  // Page Geometry: Standard A4 (595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 515.28 pt
  const rightX = marginX + contentWidth;         // 555.28 pt
  const footerH = 50;

  const pages: PDFPage[] = [];

  function createNewPage(): PDFPage {
    const p = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(p);
    return p;
  }

  let currentPage = createNewPage();

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. HEADER (Page 1)
  // ─────────────────────────────────────────────────────────────────────────────
  const headerTopY = pageHeight - 34; // 807.89
  const logoSize = 58;
  const logoX = marginX;
  const logoY = headerTopY - logoSize; // 749.89

  // Resolve logo bytes
  let effectiveLogoBytes = data.logoBytes;
  if (!effectiveLogoBytes && OFFICIAL_LOGO_BASE64) {
    try {
      effectiveLogoBytes = base64ToUint8Array(OFFICIAL_LOGO_BASE64);
    } catch {
      effectiveLogoBytes = null;
    }
  }

  let logoRendered = false;
  if (effectiveLogoBytes && effectiveLogoBytes.length > 0) {
    try {
      const logoImg = await pdfDoc.embedPng(effectiveLogoBytes);
      currentPage.drawImage(logoImg, {
        x: logoX,
        y: logoY,
        width: logoSize,
        height: logoSize,
      });
      logoRendered = true;
    } catch {
      logoRendered = false;
    }
  }

  if (!logoRendered) {
    currentPage.drawCircle({
      x: logoX + logoSize / 2,
      y: logoY + logoSize / 2,
      size: logoSize / 2,
      color: NAVY,
    });
    currentPage.drawText("U", {
      x: logoX + 21,
      y: logoY + 18,
      size: 22,
      font: fontBold,
      color: WHITE,
    });
  }

  // Organization Text
  const orgTextX = logoX + logoSize + 12; // 110
  let orgTextY = headerTopY - 18;         // 789.89

  currentPage.drawText(orgName, {
    x: orgTextX,
    y: orgTextY,
    size: 20,
    font: fontBold,
    color: NAVY,
  });

  const idParts: string[] = [];
  if (orgRegNo) idParts.push(\`Trust Reg. No.: \${orgRegNo}\`);
  if (orgPan && !orgPan.startsWith("[")) idParts.push(\`PAN: \${orgPan}\`);

  if (idParts.length > 0) {
    orgTextY -= 14;
    currentPage.drawText(idParts.join("   |   "), {
      x: orgTextX,
      y: orgTextY,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
  }

  if (orgAddress) {
    orgTextY -= 10;
    const addrLines = wrapText(orgAddress, 275, fontRegular, 8);
    for (const al of addrLines.slice(0, 2)) {
      currentPage.drawText(al, {
        x: orgTextX,
        y: orgTextY,
        size: 8,
        font: fontRegular,
        color: MUTED,
      });
      orgTextY -= 10;
    }
  }

  // Header Right: Verified by Razorpay pill + Status Pill
  const verifyPillW = 120;
  const verifyPillH = 20;
  const verifyPillX = rightX - verifyPillW;
  const verifyPillTopY = headerTopY;

  drawRoundedRectTop(currentPage, verifyPillX, verifyPillTopY, verifyPillW, verifyPillH, 10, {
    borderColor: BORDER,
    borderWidth: 0.8,
    color: WHITE,
  });
  drawCheckmark(currentPage, verifyPillX + 11, verifyPillTopY - 10, 5.5, TEAL);
  currentPage.drawText("Verified by Razorpay", {
    x: verifyPillX + 22,
    y: verifyPillTopY - 13.5,
    size: 8,
    font: fontBold,
    color: NAVY,
  });

  const statusLabel = "PAYMENT STATUS";
  const statusLabelW = fontRegular.widthOfTextAtSize(statusLabel, 7);
  const statusLabelY = verifyPillTopY - verifyPillH - 9;
  currentPage.drawText(statusLabel, {
    x: rightX - statusLabelW,
    y: statusLabelY,
    size: 7,
    font: fontRegular,
    color: MUTED,
  });

  const paidPillW = 56;
  const paidPillH = 17;
  const paidPillX = rightX - paidPillW;
  const paidPillTopY = statusLabelY - 3;
  drawRoundedRectTop(currentPage, paidPillX, paidPillTopY, paidPillW, paidPillH, 8.5, {
    color: statusColor,
  });
  const paidTextW = fontBold.widthOfTextAtSize(statusText, 9);
  currentPage.drawText(statusText, {
    x: paidPillX + (paidPillW - paidTextW) / 2,
    y: paidPillTopY - 11.5,
    size: 9,
    font: fontBold,
    color: WHITE,
  });

  // Header Divider Rule with Teal accent
  const divY = Math.min(logoY - 10, orgTextY - 8);
  currentPage.drawLine({
    start: { x: marginX, y: divY },
    end: { x: rightX, y: divY },
    thickness: 0.8,
    color: BORDER,
  });
  currentPage.drawLine({
    start: { x: marginX, y: divY + 0.6 },
    end: { x: marginX + 60, y: divY + 0.6 },
    thickness: 2,
    color: TEAL,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RECEIPT TITLE & METADATA BLOCK
  // ─────────────────────────────────────────────────────────────────────────────
  const titleY = divY - 26;
  currentPage.drawText("DONATION RECEIPT", {
    x: marginX,
    y: titleY,
    size: 26,
    font: fontBold,
    color: NAVY,
  });

  currentPage.drawText("Official Donation Receipt / Payment Acknowledgement", {
    x: marginX,
    y: titleY - 14,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });

  // Meta Box (right)
  const metaBoxW = 215;
  const metaBoxX = rightX - metaBoxW;
  let metaY = titleY + 4;
  const metaItems = [
    { label: "Receipt No.", value: receiptNo },
    { label: "Transaction Ref.", value: transactionRef },
    { label: "Donation Purpose", value: purpose },
  ];
  for (const mi of metaItems) {
    currentPage.drawText(mi.label, {
      x: metaBoxX,
      y: metaY,
      size: 7.5,
      font: fontRegular,
      color: MUTED,
    });
    const valLines = wrapText(mi.value, 135, fontBold, 8.5);
    const displayVal = valLines[0] || mi.value;
    const valW = fontBold.widthOfTextAtSize(displayVal, 8.5);
    currentPage.drawText(displayVal, {
      x: rightX - valW,
      y: metaY,
      size: 8.5,
      font: fontBold,
      color: BODY_TEXT,
    });
    metaY -= 12;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. AMOUNT RECEIVED PANEL
  // ─────────────────────────────────────────────────────────────────────────────
  const amtPanelTopY = titleY - 34;
  const amtPanelH = 58;
  drawRoundedRectTop(currentPage, marginX, amtPanelTopY, contentWidth, amtPanelH, 6, {
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.8,
  });
  currentPage.drawRectangle({
    x: marginX,
    y: amtPanelTopY - amtPanelH,
    width: 4,
    height: amtPanelH,
    color: TEAL,
  });

  currentPage.drawText("AMOUNT RECEIVED", {
    x: marginX + 24,
    y: amtPanelTopY - 18,
    size: 9.5,
    font: fontBold,
    color: NAVY,
  });
  currentPage.drawText(formattedAmountStr, {
    x: marginX + 24,
    y: amtPanelTopY - 47,
    size: 32,
    font: fontBold,
    color: NAVY,
  });

  // Right Content: Checkmark + PAID + Payment Date
  const paidRowY = amtPanelTopY - 22;
  const paidRowRightX = rightX - 22;
  const paidWordW = fontBold.widthOfTextAtSize(statusText, 15);
  const paidWordX = paidRowRightX - paidWordW;
  const checkCircleRadius = 9;
  const checkCircleX = paidWordX - 7 - checkCircleRadius;
  const checkCircleY = paidRowY + 5;

  drawCheckmark(currentPage, checkCircleX, checkCircleY, checkCircleRadius, statusColor);
  currentPage.drawText(statusText, {
    x: paidWordX,
    y: paidRowY,
    size: 15,
    font: fontBold,
    color: statusColor,
  });

  const note1 = isPaid ? "Payment received successfully" : "Payment status";
  const note1W = fontRegular.widthOfTextAtSize(note1, 7.5);
  currentPage.drawText(note1, {
    x: paidRowRightX - note1W,
    y: paidRowY - 13,
    size: 7.5,
    font: fontRegular,
    color: MUTED,
  });

  const note2 = data.formattedDate;
  const note2W = fontRegular.widthOfTextAtSize(note2, 7.5);
  currentPage.drawText(note2, {
    x: paidRowRightX - note2W,
    y: paidRowY - 24,
    size: 7.5,
    font: fontRegular,
    color: MUTED,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TWO COLUMNS: DONOR DETAILS & PAYMENT DETAILS
  // ─────────────────────────────────────────────────────────────────────────────
  const colGap = 26;
  const colW = (contentWidth - colGap) / 2; // 244.64
  const col1X = marginX;
  const col2X = marginX + colW + colGap;   // 310.64
  let curY = (amtPanelTopY - amtPanelH) - 22;

  function drawSectionHeading(page: PDFPage, x: number, y: number, title: string) {
    page.drawText(title, {
      x,
      y,
      size: 10,
      font: fontBold,
      color: NAVY,
    });
    const lineY = y - 5;
    page.drawLine({
      start: { x, y: lineY },
      end: { x: x + colW, y: lineY },
      thickness: 0.8,
      color: BORDER,
    });
    page.drawLine({
      start: { x, y: lineY },
      end: { x: x + 26, y: lineY },
      thickness: 1.6,
      color: TEAL,
    });
  }

  drawSectionHeading(currentPage, col1X, curY, "DONOR DETAILS");
  drawSectionHeading(currentPage, col2X, curY, "PAYMENT DETAILS");

  let fY = curY - 18;

  // Donor Details Fields
  currentPage.drawText("Donor Full Name", { x: col1X, y: fY, size: 7.5, font: fontRegular, color: MUTED });
  const nameLines = wrapText(displayName, colW, fontBold, 11);
  for (const nl of nameLines.slice(0, 2)) {
    currentPage.drawText(nl, { x: col1X, y: fY - 11, size: 11, font: fontBold, color: BODY_TEXT });
    fY -= 12;
  }
  fY += (nameLines.slice(0, 2).length - 1) * 12; // normalize

  currentPage.drawText("Email Address", { x: col1X, y: fY - 26, size: 7.5, font: fontRegular, color: MUTED });
  const emailLines = wrapText(displayEmail || "Not provided", colW, fontRegular, 9.5);
  currentPage.drawText(emailLines[0] || displayEmail, { x: col1X, y: fY - 37, size: 9.5, font: fontRegular, color: BODY_TEXT });

  currentPage.drawText("Phone Number", { x: col1X, y: fY - 51, size: 7.5, font: fontRegular, color: MUTED });
  currentPage.drawText(displayPhone || "Not provided", { x: col1X, y: fY - 62, size: 9.5, font: fontRegular, color: BODY_TEXT });

  // Payment Details Fields (2x2)
  const col2LeftW = colW * 0.52;
  const col2RightX = col2X + col2LeftW;

  currentPage.drawText("Payment Date", { x: col2X, y: curY - 18, size: 7.5, font: fontRegular, color: MUTED });
  currentPage.drawText(data.formattedDate, { x: col2X, y: curY - 29, size: 9.5, font: fontRegular, color: BODY_TEXT });

  currentPage.drawText("Payment Status", { x: col2RightX, y: curY - 18, size: 7.5, font: fontRegular, color: MUTED });
  currentPage.drawText(statusText, { x: col2RightX, y: curY - 29, size: 9.5, font: fontBold, color: statusColor });

  currentPage.drawText("Razorpay Payment ID", { x: col2X, y: curY - 44, size: 7.5, font: fontRegular, color: MUTED });
  currentPage.drawText(data.razorpayPaymentId, { x: col2X, y: curY - 55, size: 8.5, font: fontRegular, color: BODY_TEXT });

  currentPage.drawText("Razorpay Order ID", { x: col2RightX, y: curY - 44, size: 7.5, font: fontRegular, color: MUTED });
  currentPage.drawText(data.razorpayOrderId, { x: col2RightX, y: curY - 55, size: 8.5, font: fontRegular, color: BODY_TEXT });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. DONATION DETAILS TABLE
  // ─────────────────────────────────────────────────────────────────────────────
  let tableY = curY - 96;

  // Check pagination
  const requiredRemainingSpace = 240;
  if (tableY < footerH + requiredRemainingSpace) {
    currentPage = createNewPage();
    tableY = pageHeight - 50;
  }

  currentPage.drawText("DONATION DETAILS", {
    x: marginX,
    y: tableY,
    size: 10,
    font: fontBold,
    color: NAVY,
  });
  currentPage.drawLine({
    start: { x: marginX, y: tableY - 5 },
    end: { x: rightX, y: tableY - 5 },
    thickness: 0.8,
    color: BORDER,
  });
  currentPage.drawLine({
    start: { x: marginX, y: tableY - 5 },
    end: { x: marginX + 26, y: tableY - 5 },
    thickness: 1.6,
    color: TEAL,
  });

  // Table Head
  const thTopY = tableY - 12;
  const thH = 22;
  currentPage.drawRectangle({
    x: marginX,
    y: thTopY - thH,
    width: contentWidth,
    height: thH,
    color: LIGHT_BG,
  });

  const colUnitX = rightX - 95 - 65 - 95;
  const colQtyX = rightX - 95 - 65;
  const colAmtX = rightX - 95;

  currentPage.drawText("Description", { x: marginX + 12, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thUnitW = fontBold.widthOfTextAtSize("Unit Price", 8.5);
  currentPage.drawText("Unit Price", { x: colQtyX - 12 - thUnitW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thQtyW = fontBold.widthOfTextAtSize("Quantity", 8.5);
  currentPage.drawText("Quantity", { x: colAmtX - 12 - thQtyW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thAmtW = fontBold.widthOfTextAtSize("Amount", 8.5);
  currentPage.drawText("Amount", { x: rightX - 12 - thAmtW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });

  // Table Row
  const descTitle = data.description || \`Donation to \${orgName}\`;
  const descPurpose = purpose;
  const trY = thTopY - thH - 18;

  currentPage.drawText(descTitle, { x: marginX + 12, y: trY, size: 9.5, font: fontRegular, color: BODY_TEXT });
  const purposeLines = wrapText(descPurpose, 250, fontRegular, 8);
  currentPage.drawText(purposeLines[0] || descPurpose, { x: marginX + 12, y: trY - 11, size: 8, font: fontRegular, color: MUTED });

  const rUnitW = fontRegular.widthOfTextAtSize(unitAmountStr, 9.5);
  currentPage.drawText(unitAmountStr, { x: colQtyX - 12 - rUnitW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });
  const rQtyW = fontRegular.widthOfTextAtSize(String(qty), 9.5);
  currentPage.drawText(String(qty), { x: colAmtX - 12 - rQtyW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });
  const rAmtW = fontRegular.widthOfTextAtSize(formattedAmountStr, 9.5);
  currentPage.drawText(formattedAmountStr, { x: rightX - 12 - rAmtW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });

  currentPage.drawLine({
    start: { x: marginX, y: trY - 20 },
    end: { x: rightX, y: trY - 20 },
    thickness: 0.8,
    color: BORDER,
  });

  // Totals Section
  const totW = 220;
  const totX = rightX - totW;
  const totY = trY - 34;

  currentPage.drawText("Total Amount", { x: totX + 12, y: totY, size: 8.5, font: fontRegular, color: MUTED });
  const totValW = fontBold.widthOfTextAtSize(formattedAmountStr, 9.5);
  currentPage.drawText(formattedAmountStr, { x: rightX - 12 - totValW, y: totY, size: 9.5, font: fontBold, color: BODY_TEXT });

  // Amount Paid Box
  const paidBoxTopY = totY - 10;
  const paidBoxH = 28;
  drawRoundedRectTop(currentPage, totX, paidBoxTopY, totW, paidBoxH, 4, {
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.8,
  });
  currentPage.drawText("Amount Paid", { x: totX + 12, y: paidBoxTopY - 19, size: 9, font: fontBold, color: NAVY });
  const paidValW = fontBold.widthOfTextAtSize(formattedAmountStr, 12);
  currentPage.drawText(formattedAmountStr, { x: rightX - 12 - paidValW, y: paidBoxTopY - 20, size: 12, font: fontBold, color: NAVY });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. STATUTORY / TAX APPROVAL DETAILS
  // ─────────────────────────────────────────────────────────────────────────────
  let nextSectionTopY = paidBoxTopY - paidBoxH - 18;

  if (hasTaxDetails) {
    const taxH = 68;
    drawRoundedRectTop(currentPage, marginX, nextSectionTopY, contentWidth, taxH, 6, {
      color: LIGHT_BG,
      borderColor: BORDER,
      borderWidth: 0.8,
    });

    currentPage.drawText("STATUTORY / TAX APPROVAL DETAILS", {
      x: marginX + 16,
      y: nextSectionTopY - 16,
      size: 10,
      font: fontBold,
      color: NAVY,
    });

    const taxColW = (contentWidth - 32) / 4;
    const taxCols = [
      { label: "Provisional URN", val: taxUrn || "Applicable" },
      { label: "Approval Reference", val: taxSection || "Section 80G Approval" },
      { label: "Approval Date", val: taxDate || "Recorded" },
      { label: "Validity Period", val: validityPeriod || "Current" },
    ];

    taxCols.forEach((tc, idx) => {
      const tx = marginX + 16 + idx * taxColW;
      currentPage.drawText(tc.label, { x: tx, y: nextSectionTopY - 30, size: 7.5, font: fontRegular, color: MUTED });
      currentPage.drawText(tc.val, { x: tx, y: nextSectionTopY - 40, size: 8.5, font: fontRegular, color: BODY_TEXT });
    });

    currentPage.drawLine({
      start: { x: marginX + 16, y: nextSectionTopY - 47 },
      end: { x: rightX - 16, y: nextSectionTopY - 47 },
      thickness: 0.8,
      color: BORDER,
    });

    currentPage.drawText(statutoryWording, {
      x: marginX + 16,
      y: nextSectionTopY - 56,
      size: 7.5,
      font: fontRegular,
      color: BODY_TEXT,
    });
    currentPage.drawText(disclaimer, {
      x: marginX + 16,
      y: nextSectionTopY - 64,
      size: 7.5,
      font: fontRegular,
      color: MUTED,
    });

    nextSectionTopY -= (taxH + 18);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. CLOSING: ORGANIZATION & SIGNATORY
  // ─────────────────────────────────────────────────────────────────────────────
  const closeY = nextSectionTopY;

  currentPage.drawText(orgName, { x: marginX, y: closeY, size: 10.5, font: fontBold, color: NAVY });
  if (orgRegNo) {
    currentPage.drawText(\`Trust Reg. No.: \${orgRegNo}\`, { x: marginX, y: closeY - 12, size: 8, font: fontRegular, color: MUTED });
  }
  if (orgPan && !orgPan.startsWith("[")) {
    currentPage.drawText(\`PAN: \${orgPan}\`, { x: marginX, y: closeY - 22, size: 8, font: fontRegular, color: MUTED });
  }

  if (orgAddress) {
    const closeAddrLines = wrapText(orgAddress, 270, fontRegular, 8);
    let aY = orgPan && !orgPan.startsWith("[") ? closeY - 32 : closeY - 22;
    for (const cal of closeAddrLines.slice(0, 2)) {
      currentPage.drawText(cal, { x: marginX, y: aY, size: 8, font: fontRegular, color: MUTED });
      aY -= 10;
    }
  }

  // Signature box
  const sigW = 190;
  const sigX = rightX - sigW;

  if (data.signatureBytes && data.signatureBytes.length > 0) {
    try {
      const sigImg = await pdfDoc.embedPng(data.signatureBytes);
      currentPage.drawImage(sigImg, {
        x: sigX + (sigW - 140) / 2,
        y: closeY - 22,
        width: 140,
        height: 38,
      });
    } catch {
      // Graceful fallback
    }
  }

  currentPage.drawLine({
    start: { x: sigX, y: closeY - 24 },
    end: { x: rightX, y: closeY - 24 },
    thickness: 0.8,
    color: NAVY,
  });
  currentPage.drawText("Authorized Signatory", { x: sigX, y: closeY - 35, size: 9, font: fontBold, color: NAVY });
  const sigTitle = data.signatoryTitle || \`Founder, \${orgName}\`;
  currentPage.drawText(sigTitle, { x: sigX, y: closeY - 45, size: 8, font: fontRegular, color: MUTED });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. FIXED NAVY FOOTER (Applied to every page)
  // ─────────────────────────────────────────────────────────────────────────────
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    p.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: footerH,
      color: NAVY,
    });
    p.drawLine({
      start: { x: 0, y: footerH - 1.25 },
      end: { x: pageWidth, y: footerH - 1.25 },
      thickness: 2.5,
      color: TEAL,
    });

    // Row 1
    p.drawText(orgName, { x: marginX, y: 30, size: 8.5, font: fontBold, color: WHITE });
    const fLink = [orgWebsite, orgEmail].filter(Boolean).join("   |   ");
    if (fLink) {
      const fLinkW = fontRegular.widthOfTextAtSize(fLink, 8);
      p.drawText(fLink, { x: rightX - fLinkW, y: 30, size: 8, font: fontRegular, color: WHITE });
    }

    // Row 2
    p.drawText("Thank you for your generous support. Together, we create meaningful change.", {
      x: marginX,
      y: 16,
      size: 8,
      font: fontRegular,
      color: BORDER,
    });
    const pageNumStr = \`Page \${idx + 1} of \${totalPages}\`;
    p.drawText(pageNumStr, {
      x: rightX - fontRegular.widthOfTextAtSize(pageNumStr, 8),
      y: 16,
      size: 8,
      font: fontRegular,
      color: BORDER,
    });
  });

  return await pdfDoc.save();
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL ASSET DATA
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Official UNIHOPE circular logo (512x512 high-resolution transparent PNG).
 * Built-in logo for official donation receipts.
 */
export const OFFICIAL_LOGO_BASE64 = "${logoBase64}";
`;

fs.writeFileSync(targetPath, newCode, 'utf8');
console.log('Successfully updated', targetPath);

