import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

export interface PdfReceiptData {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  anonymous: boolean;
  amount: number;
  purpose: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  formattedDate: string;
  formattedAmount: string;
  logoBytes?: Uint8Array | null;
}

const REG_NO = "R/Chennai North Joint I/Book-4/228/2026";
const ORG_NAME = "UNIHOPE Foundation";
const WEBSITE = "https://unihopefoundation.org";

// Brand Palette
const NAVY = rgb(1 / 255, 42 / 255, 95 / 255); // #012A5F
const GREEN = rgb(43 / 255, 113 / 255, 27 / 255); // #2B711B
const BORDER_GREY = rgb(224 / 255, 224 / 255, 224 / 255); // #E0E0E0
const TABLE_HEADER_BG = rgb(245 / 255, 247 / 255, 250 / 255); // #F5F7FA
const FOOTER_BG = rgb(235 / 255, 235 / 255, 235 / 255); // #EBEBEB
const DARK_BODY = rgb(51 / 255, 51 / 255, 51 / 255); // #333333
const MUTED = rgb(102 / 255, 102 / 255, 102 / 255); // #666666
const WHITE = rgb(1, 1, 1);

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
 * Robust word-wrapping helper for pdf-lib text drawing.
 * Ensures text never extends beyond maxWidth, splitting on whitespace when possible,
 * or by character chunks for long unbroken strings (e.g., long email addresses, hashes).
 */
export function wrapText(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): string[] {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      let chunk = "";
      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
          chunk += char;
        } else {
          if (chunk) lines.push(chunk);
          chunk = char;
        }
      }
      if (chunk) {
        currentLine = chunk;
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Builds a professional A4 PDF donation receipt matching the UNIHOPE brand.
 * Supports long text (donor names, emails, purposes, IDs) without overlapping or clipping,
 * and automatically adds continuation pages if content exceeds standard bounds.
 */
export async function buildDonationReceiptPdf(
  data: PdfReceiptData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Formatted Data
  const displayName = data.anonymous ? "Supporter" : data.donorName;
  const receiptNo = `RCPT-${data.razorpayPaymentId.replace(/^pay_/, "").toUpperCase()}`;
  const amountStr = `INR ${String(data.formattedAmount || data.amount).replace(/[^\d.,]/g, "")}`;

  // Page Dimensions & Card Margins (A4: 595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const cardX = 36;
  const cardY = 36;
  const cardW = pageWidth - 72; // 523.28 pt
  const cardH = pageHeight - 72; // 769.89 pt
  const footerH = 46;

  // Track pages created
  const pages: PDFPage[] = [];

  function createNewPage(): PDFPage {
    const p = pdfDoc.addPage([pageWidth, pageHeight]);
    // Draw outer card boundary
    p.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      borderColor: BORDER_GREY,
      borderWidth: 1,
      color: WHITE,
    });
    pages.push(p);
    return p;
  }

  let currentPage = createNewPage();

  // Try loading logo
  let logoBytes = data.logoBytes ?? null;
  if (!logoBytes) {
    try {
      const res = await fetch(
        "https://unihopefoundation.org/UNIHOPE_LOGO__%20cir.png",
      );
      if (res.ok) {
        const buf = await res.arrayBuffer();
        logoBytes = new Uint8Array(buf);
      }
    } catch {
      logoBytes = null;
    }
  }

  // --- 1. Header (Page 1) ---
  let logoDrawn = false;
  if (logoBytes && logoBytes.length > 0) {
    try {
      const logoImg = await pdfDoc.embedPng(logoBytes);
      currentPage.drawImage(logoImg, {
        x: cardX + 24,
        y: cardY + cardH - 64,
        width: 44,
        height: 44,
      });
      logoDrawn = true;
    } catch {
      logoDrawn = false;
    }
  }

  if (!logoDrawn) {
    // Vector circular emblem fallback
    currentPage.drawCircle({
      x: cardX + 46,
      y: cardY + cardH - 42,
      size: 22,
      color: NAVY,
    });
    currentPage.drawText("U", {
      x: cardX + 39,
      y: cardY + cardH - 49,
      size: 18,
      font: fontBold,
      color: WHITE,
    });
  }

  currentPage.drawText(ORG_NAME, {
    x: cardX + 78,
    y: cardY + cardH - 36,
    size: 15,
    font: fontBold,
    color: NAVY,
  });
  currentPage.drawText(`Reg. No. ${REG_NO}`, {
    x: cardX + 78,
    y: cardY + cardH - 52,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });

  // Top Right Status Badge
  const badgeW = 124;
  const badgeH = 34;
  const badgeX = cardX + cardW - badgeW - 24;
  const badgeY = cardY + cardH - 58;

  currentPage.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeW,
    height: badgeH,
    borderColor: BORDER_GREY,
    borderWidth: 1,
    color: WHITE,
  });
  currentPage.drawText("Secured Payment", {
    x: badgeX + 16,
    y: badgeY + 18,
    size: 10,
    font: fontBold,
    color: NAVY,
  });
  currentPage.drawText("Razorpay Verified", {
    x: badgeX + 22,
    y: badgeY + 6,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  // Header Divider
  const headerDividerY = cardY + cardH - 78;
  currentPage.drawLine({
    start: { x: cardX, y: headerDividerY },
    end: { x: cardX + cardW, y: headerDividerY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 2. Title & References ---
  let curY = headerDividerY - 28;
  currentPage.drawText("DONATION RECEIPT", {
    x: cardX + 24,
    y: curY,
    size: 18,
    font: fontBold,
    color: DARK_BODY,
  });

  const rightBlockW = 220;
  const rightBlockX = cardX + cardW - rightBlockW - 24;
  const refLines = wrapText(`Txn Ref: ${data.razorpayPaymentId}`, rightBlockW, fontRegular, 8.5);
  const rcptLines = wrapText(`Receipt No: ${receiptNo}`, rightBlockW, fontRegular, 8.5);

  let refY = curY + 2;
  for (const line of refLines) {
    const w = fontRegular.widthOfTextAtSize(line, 8.5);
    currentPage.drawText(line, {
      x: rightBlockX + (rightBlockW - w),
      y: refY,
      size: 8.5,
      font: fontRegular,
      color: MUTED,
    });
    refY -= 11;
  }
  for (const line of rcptLines) {
    const w = fontRegular.widthOfTextAtSize(line, 8.5);
    currentPage.drawText(line, {
      x: rightBlockX + (rightBlockW - w),
      y: refY,
      size: 8.5,
      font: fontRegular,
      color: MUTED,
    });
    refY -= 11;
  }

  // Subtitle
  curY = Math.min(curY - 26, refY - 8);
  const subtitleText = `Official donation acknowledgement for: ${data.purpose}`;
  const subtitleLines = wrapText(subtitleText, cardW - 48, fontOblique, 9);
  for (const line of subtitleLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: curY,
      size: 9,
      font: fontOblique,
      color: MUTED,
    });
    curY -= 13;
  }

  // --- 3. Amount Paid Block ---
  curY -= 14;
  currentPage.drawText("AMOUNT PAID", {
    x: cardX + 24,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  curY -= 24;
  currentPage.drawText(amountStr, {
    x: cardX + 24,
    y: curY,
    size: 22,
    font: fontBold,
    color: DARK_BODY,
  });
  const amtUnderlineWidth = Math.min(120, fontBold.widthOfTextAtSize(amountStr, 22));
  currentPage.drawLine({
    start: { x: cardX + 24, y: curY - 5 },
    end: { x: cardX + 24 + amtUnderlineWidth, y: curY - 5 },
    thickness: 2.5,
    color: NAVY,
  });

  // --- 4. Two-Column Section: ISSUED TO vs PAID ON ---
  curY -= 28;
  const colYStart = curY;
  const colWidth = (cardW - 48 - 24) / 2; // ~225 pt

  // Left Column
  let leftY = colYStart;
  currentPage.drawText("ISSUED TO", {
    x: cardX + 24,
    y: leftY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  leftY -= 16;

  const nameLines = wrapText(displayName, colWidth, fontBold, 10.5);
  for (const line of nameLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: leftY,
      size: 10.5,
      font: fontBold,
      color: DARK_BODY,
    });
    leftY -= 14;
  }

  const emailLines = wrapText(data.donorEmail, colWidth, fontRegular, 9);
  for (const line of emailLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: leftY,
      size: 9,
      font: fontRegular,
      color: DARK_BODY,
    });
    leftY -= 12;
  }

  if (data.donorPhone) {
    const phoneLines = wrapText(data.donorPhone, colWidth, fontRegular, 9);
    for (const line of phoneLines) {
      currentPage.drawText(line, {
        x: cardX + 24,
        y: leftY,
        size: 9,
        font: fontRegular,
        color: DARK_BODY,
      });
      leftY -= 12;
    }
  }

  // Right Column
  const rightColX = cardX + 24 + colWidth + 24;
  let rightY = colYStart;
  currentPage.drawText("PAID ON", {
    x: rightColX,
    y: rightY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  rightY -= 16;

  currentPage.drawText(data.formattedDate, {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontRegular,
    color: DARK_BODY,
  });
  rightY -= 14;

  currentPage.drawText("Status: PAID", {
    x: rightColX,
    y: rightY,
    size: 10,
    font: fontBold,
    color: GREEN,
  });
  rightY -= 14;

  const orderLines = wrapText(`Order ID: ${data.razorpayOrderId}`, colWidth, fontRegular, 8.5);
  for (const line of orderLines) {
    currentPage.drawText(line, {
      x: rightColX,
      y: rightY,
      size: 8.5,
      font: fontRegular,
      color: MUTED,
    });
    rightY -= 11;
  }

  curY = Math.min(leftY, rightY) - 14;

  currentPage.drawLine({
    start: { x: cardX + 24, y: curY },
    end: { x: cardX + cardW - 24, y: curY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 5. Line Items Table ---
  curY -= 16;
  const tableX = cardX + 24;
  const tableW = cardW - 48;
  const thHeight = 22;

  currentPage.drawRectangle({
    x: tableX,
    y: curY - thHeight + 4,
    width: tableW,
    height: thHeight,
    color: TABLE_HEADER_BG,
  });
  currentPage.drawText("DESCRIPTION", { x: tableX + 8, y: curY - 10, size: 8.5, font: fontBold, color: MUTED });
  currentPage.drawText("UNIT PRICE", { x: tableX + 260, y: curY - 10, size: 8.5, font: fontBold, color: MUTED });
  currentPage.drawText("QTY", { x: tableX + 355, y: curY - 10, size: 8.5, font: fontBold, color: MUTED });
  currentPage.drawText("AMOUNT", { x: tableX + 415, y: curY - 10, size: 8.5, font: fontBold, color: MUTED });

  curY -= thHeight + 10;
  const descColW = 245;
  const purposeLines = wrapText(data.purpose, descColW, fontBold, 9.5);

  const startRowY = curY;
  for (const line of purposeLines) {
    currentPage.drawText(line, {
      x: tableX + 8,
      y: curY,
      size: 9.5,
      font: fontBold,
      color: DARK_BODY,
    });
    curY -= 13;
  }
  currentPage.drawText(`Donation to ${ORG_NAME}`, {
    x: tableX + 8,
    y: curY,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });
  curY -= 14;

  // Numeric Columns aligned to start of row
  currentPage.drawText(amountStr, { x: tableX + 260, y: startRowY, size: 9.5, font: fontRegular, color: DARK_BODY });
  currentPage.drawText("1", { x: tableX + 360, y: startRowY, size: 9.5, font: fontRegular, color: DARK_BODY });
  currentPage.drawText(amountStr, { x: tableX + 415, y: startRowY, size: 9.5, font: fontBold, color: DARK_BODY });

  curY -= 8;
  currentPage.drawLine({
    start: { x: tableX, y: curY },
    end: { x: tableX + tableW, y: curY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 6. Totals Area ---
  curY -= 18;
  currentPage.drawText("Total:", { x: tableX + 310, y: curY, size: 10.5, font: fontBold, color: DARK_BODY });
  currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 10.5, font: fontBold, color: DARK_BODY });

  curY -= 16;
  currentPage.drawText("Amount Paid:", { x: tableX + 310, y: curY, size: 10.5, font: fontBold, color: GREEN });
  currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 10.5, font: fontBold, color: GREEN });

  curY -= 32;

  // --- 7. Multi-Page Decision for Legal & Signatory ---
  // Space needed for Legal (45pt) + Signatory (65pt) + Margin (40pt) + Footer (46pt) ≈ 196 pt
  if (curY < 200) {
    // Note continuation on Page 1 before switching
    currentPage.drawText("... continued on next page", {
      x: cardX + cardW - 160,
      y: cardY + footerH + 16,
      size: 8.5,
      font: fontOblique,
      color: MUTED,
    });

    // Create Page 2
    currentPage = createNewPage();
    curY = cardY + cardH - 36;

    currentPage.drawText(`${ORG_NAME} — Donation Receipt Continued`, {
      x: cardX + 24,
      y: curY,
      size: 11,
      font: fontBold,
      color: NAVY,
    });
    curY -= 16;
    currentPage.drawLine({
      start: { x: cardX + 24, y: curY },
      end: { x: cardX + cardW - 24, y: curY },
      thickness: 1,
      color: BORDER_GREY,
    });
    curY -= 28;
  } else {
    currentPage.drawLine({
      start: { x: tableX, y: curY },
      end: { x: tableX + tableW, y: curY },
      thickness: 1,
      color: BORDER_GREY,
    });
    curY -= 20;
  }

  // --- 8. Legal Information ---
  const legal1 = `Trust Registration No.: ${REG_NO}`;
  const legal2 = "Registered under the Tamil Nadu Societies Registration Act.";
  const legal3 = "Donation received for public charitable and educational welfare activities.";

  currentPage.drawText(legal1, {
    x: cardX + (cardW - fontRegular.widthOfTextAtSize(legal1, 8.5)) / 2,
    y: curY,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });
  pageHeight;
  currentPage.drawText(legal2, {
    x: cardX + (cardW - fontRegular.widthOfTextAtSize(legal2, 8.5)) / 2,
    y: curY - 11,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });
  currentPage.drawText(legal3, {
    x: cardX + (cardW - fontRegular.widthOfTextAtSize(legal3, 8)) / 2,
    y: curY - 22,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  // --- 9. Authorized Signatory ---
  curY -= 50;
  currentPage.drawText(`For ${ORG_NAME}`, {
    x: cardX + 32,
    y: curY,
    size: 10,
    font: fontBold,
    color: DARK_BODY,
  });

  currentPage.drawLine({
    start: { x: cardX + 32, y: curY - 26 },
    end: { x: cardX + 160, y: curY - 26 },
    thickness: 1,
    color: DARK_BODY,
  });
  currentPage.drawText("Authorised Signatory", {
    x: cardX + 32,
    y: curY - 38,
    size: 8.5,
    font: fontRegular,
    color: MUTED,
  });

  // --- 10. Footers on All Pages ---
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    // Footer Bar
    p.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: footerH,
      color: FOOTER_BG,
    });

    const ft1 = `${ORG_NAME}  •  Thank You For Your Generous Support!`;
    p.drawText(ft1, {
      x: cardX + (cardW - fontBold.widthOfTextAtSize(ft1, 9.5)) / 2,
      y: cardY + 26,
      size: 9.5,
      font: fontBold,
      color: DARK_BODY,
    });
    p.drawText(WEBSITE, {
      x: cardX + (cardW - fontRegular.widthOfTextAtSize(WEBSITE, 9)) / 2,
      y: cardY + 12,
      size: 9,
      font: fontRegular,
      color: NAVY,
    });

    // Page Number
    const pageNumText = `Page ${idx + 1} of ${totalPages}`;
    p.drawText(pageNumText, {
      x: cardX + cardW - fontRegular.widthOfTextAtSize(pageNumText, 8) - 16,
      y: cardY + 12,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
  });

  return await pdfDoc.save();
}
