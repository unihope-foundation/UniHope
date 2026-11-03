import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";

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
}

export interface PdfReceiptData {
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  anonymous: boolean;
  amount: number;
  purpose: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  formattedDate: string;
  formattedAmount: string;
  logoBytes?: Uint8Array | null;
  signatureBytes?: Uint8Array | null;
  orgDetails?: OrgDetails;
  taxDetails?: TaxDetails;
}

// Brand Palette Tokens
const NAVY = rgb(1 / 255, 42 / 255, 95 / 255); // #012A5F
const GREEN = rgb(43 / 255, 113 / 255, 27 / 255); // #2B711B
const BORDER_GREY = rgb(224 / 255, 224 / 255, 224 / 255); // #E0E0E0
const BOX_BG = rgb(248 / 255, 250 / 255, 252 / 255); // #F8FAFC
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
 * Word-wrapping helper for pdf-lib text drawing.
 * Splits on whitespace when possible, or breaks long character sequences
 * that exceed maxWidth (e.g. lengthy hashes, email addresses).
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
 * Builds a professional A4 PDF donation receipt.
 * Consumes organization environment variables and statutory tax approval data
 * under Form No. 106, Section 354(4), and Rule 181.
 */
export async function buildDonationReceiptPdf(
  data: PdfReceiptData,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Standard Fonts
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Resolved Organization & Statutory Data (No hardcoded identity values)
  const orgName = data.orgDetails?.name || process.env.ORG_NAME || "";
  const orgRegNo = data.orgDetails?.trustRegistrationNo || process.env.ORG_TRUST_REGISTRATION_NO || "";
  const orgPan = data.orgDetails?.pan || process.env.ORG_PAN || "";
  const orgAddress = data.orgDetails?.registeredAddress || process.env.ORG_REGISTERED_ADDRESS || "";
  const orgEmail = data.orgDetails?.email || process.env.ORG_EMAIL || "";
  const orgWebsite = data.orgDetails?.website || process.env.ORG_WEBSITE || "";

  const taxSection = data.taxDetails?.approvalSection || process.env.ORG_80G_PROVISIONAL_APPROVAL_SECTION || "";
  const taxUrn = data.taxDetails?.provisionalUrn || process.env.ORG_80G_PROVISIONAL_URN || "";
  const taxDate = data.taxDetails?.approvalDate || process.env.ORG_80G_APPROVAL_DATE || "";
  const taxFrom = data.taxDetails?.validFrom || process.env.ORG_80G_VALID_FROM || "";
  const taxUntil = data.taxDetails?.validUntil || process.env.ORG_80G_VALID_UNTIL || "";

  // Payment Presentation Values
  const displayName = data.anonymous ? "Supporter" : (data.donorName || "Supporter");
  const receiptNo = `RCPT-${data.razorpayPaymentId.replace(/^pay_/, "").toUpperCase()}`;
  const amountStr = `INR ${String(data.formattedAmount || data.amount).replace(/[^\d.,]/g, "")}`;

  // Page Dimensions & Outer Card Margins (A4: 595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const cardX = 36;
  const cardY = 36;
  const cardW = pageWidth - 72; // 523.28 pt
  const cardH = pageHeight - 72; // 769.89 pt
  const footerH = 46;

  const pages: PDFPage[] = [];

  function createNewPage(): PDFPage {
    const p = pdfDoc.addPage([pageWidth, pageHeight]);
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

  // --- 1. Header (Page 1) ---
  let logoDrawn = false;
  if (data.logoBytes && data.logoBytes.length > 0) {
    try {
      const logoImg = await pdfDoc.embedPng(data.logoBytes);
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

  if (orgName) {
    currentPage.drawText(orgName, {
      x: cardX + 78,
      y: cardY + cardH - 34,
      size: 14.5,
      font: fontBold,
      color: NAVY,
    });
  }

  const regPanItems: string[] = [];
  if (orgRegNo) regPanItems.push(`Trust Reg. No.: ${orgRegNo}`);
  if (orgPan) regPanItems.push(`PAN: ${orgPan}`);
  if (regPanItems.length > 0) {
    currentPage.drawText(regPanItems.join("  |  "), {
      x: cardX + 78,
      y: cardY + cardH - 48,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
  }

  if (orgAddress) {
    const addressLines = wrapText(orgAddress, cardW - 78 - 140, fontRegular, 7.5);
    let addrY = cardY + cardH - 58;
    for (const al of addressLines.slice(0, 2)) {
      currentPage.drawText(al, {
        x: cardX + 78,
        y: addrY,
        size: 7.5,
        font: fontRegular,
        color: MUTED,
      });
      addrY -= 9;
    }
  }

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
  const headerDividerY = cardY + cardH - (orgAddress ? 82 : 74);
  currentPage.drawLine({
    start: { x: cardX, y: headerDividerY },
    end: { x: cardX + cardW, y: headerDividerY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 2. Title & References ---
  let curY = headerDividerY - 24;
  currentPage.drawText("DONATION RECEIPT", {
    x: cardX + 24,
    y: curY,
    size: 17,
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
  curY = Math.min(curY - 24, refY - 8);
  const subtitleText = `Official donation acknowledgement for: ${data.purpose}`;
  const subtitleLines = wrapText(subtitleText, cardW - 48, fontOblique, 8.5);
  for (const line of subtitleLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: curY,
      size: 8.5,
      font: fontOblique,
      color: MUTED,
    });
    curY -= 12;
  }

  // --- 3. Amount Paid Block ---
  curY -= 12;
  currentPage.drawText("AMOUNT PAID", {
    x: cardX + 24,
    y: curY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  curY -= 22;
  currentPage.drawText(amountStr, {
    x: cardX + 24,
    y: curY,
    size: 21,
    font: fontBold,
    color: DARK_BODY,
  });
  const amtUnderlineWidth = Math.min(130, fontBold.widthOfTextAtSize(amountStr, 21));
  currentPage.drawLine({
    start: { x: cardX + 24, y: curY - 5 },
    end: { x: cardX + 24 + amtUnderlineWidth, y: curY - 5 },
    thickness: 2.5,
    color: NAVY,
  });

  // --- 4. Two-Column Section: ISSUED TO vs PAYMENT DETAILS ---
  curY -= 26;
  const colYStart = curY;
  const colWidth = (cardW - 48 - 24) / 2;

  // Left Column: ISSUED TO
  let leftY = colYStart;
  currentPage.drawText("ISSUED TO", {
    x: cardX + 24,
    y: leftY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  leftY -= 15;

  const nameLines = wrapText(displayName, colWidth, fontBold, 10);
  for (const line of nameLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: leftY,
      size: 10,
      font: fontBold,
      color: DARK_BODY,
    });
    leftY -= 13;
  }

  const emailLines = wrapText(data.donorEmail, colWidth, fontRegular, 8.5);
  for (const line of emailLines) {
    currentPage.drawText(line, {
      x: cardX + 24,
      y: leftY,
      size: 8.5,
      font: fontRegular,
      color: DARK_BODY,
    });
    leftY -= 12;
  }

  if (data.donorPhone) {
    const phoneLines = wrapText(data.donorPhone, colWidth, fontRegular, 8.5);
    for (const line of phoneLines) {
      currentPage.drawText(line, {
        x: cardX + 24,
        y: leftY,
        size: 8.5,
        font: fontRegular,
        color: DARK_BODY,
      });
      leftY -= 12;
    }
  }

  // Right Column: PAYMENT DETAILS
  const rightColX = cardX + 24 + colWidth + 24;
  let rightY = colYStart;
  currentPage.drawText("PAYMENT DETAILS", {
    x: rightColX,
    y: rightY,
    size: 8.5,
    font: fontBold,
    color: MUTED,
  });
  rightY -= 15;

  currentPage.drawText(`Paid On: ${data.formattedDate}`, {
    x: rightColX,
    y: rightY,
    size: 9,
    font: fontRegular,
    color: DARK_BODY,
  });
  rightY -= 13;

  currentPage.drawText("Status: PAID", {
    x: rightColX,
    y: rightY,
    size: 9.5,
    font: fontBold,
    color: GREEN,
  });
  rightY -= 13;

  const orderLines = wrapText(`Order ID: ${data.razorpayOrderId}`, colWidth, fontRegular, 8);
  for (const line of orderLines) {
    currentPage.drawText(line, {
      x: rightColX,
      y: rightY,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
    rightY -= 11;
  }

  curY = Math.min(leftY, rightY) - 12;

  currentPage.drawLine({
    start: { x: cardX + 24, y: curY },
    end: { x: cardX + cardW - 24, y: curY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 5. Line Items Table ---
  curY -= 14;
  const tableX = cardX + 24;
  const tableW = cardW - 48;
  const thHeight = 20;

  currentPage.drawRectangle({
    x: tableX,
    y: curY - thHeight + 4,
    width: tableW,
    height: thHeight,
    color: TABLE_HEADER_BG,
  });
  currentPage.drawText("DESCRIPTION", { x: tableX + 8, y: curY - 9, size: 8, font: fontBold, color: MUTED });
  currentPage.drawText("UNIT PRICE", { x: tableX + 260, y: curY - 9, size: 8, font: fontBold, color: MUTED });
  currentPage.drawText("QTY", { x: tableX + 355, y: curY - 9, size: 8, font: fontBold, color: MUTED });
  currentPage.drawText("AMOUNT", { x: tableX + 415, y: curY - 9, size: 8, font: fontBold, color: MUTED });

  curY -= thHeight + 8;
  const descColW = 245;
  const purposeLines = wrapText(data.purpose, descColW, fontBold, 9);

  const startRowY = curY;
  for (const line of purposeLines) {
    currentPage.drawText(line, {
      x: tableX + 8,
      y: curY,
      size: 9,
      font: fontBold,
      color: DARK_BODY,
    });
    curY -= 12;
  }
  if (orgName) {
    currentPage.drawText(`Charitable Donation to ${orgName}`, {
      x: tableX + 8,
      y: curY,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
    curY -= 13;
  }

  currentPage.drawText(amountStr, { x: tableX + 260, y: startRowY, size: 9, font: fontRegular, color: DARK_BODY });
  currentPage.drawText("1", { x: tableX + 360, y: startRowY, size: 9, font: fontRegular, color: DARK_BODY });
  currentPage.drawText(amountStr, { x: tableX + 415, y: startRowY, size: 9, font: fontBold, color: DARK_BODY });

  curY -= 6;
  currentPage.drawLine({
    start: { x: tableX, y: curY },
    end: { x: tableX + tableW, y: curY },
    thickness: 1,
    color: BORDER_GREY,
  });

  // --- 6. Totals Area ---
  curY -= 15;
  currentPage.drawText("Total:", { x: tableX + 310, y: curY, size: 9.5, font: fontBold, color: DARK_BODY });
  currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 9.5, font: fontBold, color: DARK_BODY });

  curY -= 14;
  currentPage.drawText("Amount Paid:", { x: tableX + 310, y: curY, size: 9.5, font: fontBold, color: GREEN });
  currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 9.5, font: fontBold, color: GREEN });

  curY -= 22;

  // Multi-Page Check: Ensure enough vertical space for Tax Box (~70pt) + Signatory (~75pt) + Footer
  const requiredRemainingSpace = (taxUrn || taxSection ? 70 : 0) + 95;
  if (curY < cardY + footerH + requiredRemainingSpace) {
    currentPage.drawText("... continued on next page", {
      x: cardX + cardW - 150,
      y: cardY + footerH + 14,
      size: 8,
      font: fontOblique,
      color: MUTED,
    });

    currentPage = createNewPage();
    curY = cardY + cardH - 36;

    const contTitle = orgName ? `${orgName} — Donation Receipt Continued` : "Donation Receipt Continued";
    currentPage.drawText(contTitle, {
      x: cardX + 24,
      y: curY,
      size: 11,
      font: fontBold,
      color: NAVY,
    });
    currentPage.drawText(`Receipt No: ${receiptNo}`, {
      x: cardX + cardW - 180,
      y: curY,
      size: 8.5,
      font: fontRegular,
      color: MUTED,
    });
    curY -= 14;
    currentPage.drawLine({
      start: { x: cardX + 24, y: curY },
      end: { x: cardX + cardW - 24, y: curY },
      thickness: 1,
      color: BORDER_GREY,
    });
    curY -= 22;
  } else {
    currentPage.drawLine({
      start: { x: tableX, y: curY },
      end: { x: tableX + tableW, y: curY },
      thickness: 1,
      color: BORDER_GREY,
    });
    curY -= 16;
  }

  // --- 7. Statutory Tax Approval Box (Form No. 106, Section 354(4), Rule 181) ---
  if (taxUrn || taxSection) {
    const boxW = cardW - 48;
    const boxH = taxUrn ? 68 : 52;
    const boxX = cardX + 24;

    currentPage.drawRectangle({
      x: boxX,
      y: curY - boxH,
      width: boxW,
      height: boxH,
      color: BOX_BG,
      borderColor: BORDER_GREY,
      borderWidth: 1,
    });

    currentPage.drawText("STATUTORY TAX APPROVAL DETAILS (PROVISIONAL)", {
      x: boxX + 12,
      y: curY - 13,
      size: 8,
      font: fontBold,
      color: NAVY,
    });

    let boxTextY = curY - 25;
    const sectionDisplay = taxSection || "Section 354(4) (Form No. 106, Rule 181)";
    const urnDisplay = taxUrn ? `Provisional URN: ${taxUrn}` : "";
    const line1 = urnDisplay ? `${urnDisplay}    Approval: ${sectionDisplay}` : `Approval: ${sectionDisplay}`;
    currentPage.drawText(line1, {
      x: boxX + 12,
      y: boxTextY,
      size: 7.5,
      font: fontBold,
      color: DARK_BODY,
    });
    boxTextY -= 10;

    if (taxDate || taxFrom || taxUntil) {
      const datePart = taxDate ? `Approval Date: ${taxDate}` : "";
      const validPart = (taxFrom || taxUntil) ? `Validity: ${taxFrom || "N/A"} to ${taxUntil || "N/A"}` : "";
      const line2 = [datePart, validPart].filter(Boolean).join("    ");
      currentPage.drawText(line2, {
        x: boxX + 12,
        y: boxTextY,
        size: 7,
        font: fontRegular,
        color: MUTED,
      });
      boxTextY -= 10;
    }

    currentPage.drawText(
      "Issued under Form No. 106 provisional approval pursuant to Section 354(4) and Rule 181.",
      {
        x: boxX + 12,
        y: boxTextY,
        size: 6.8,
        font: fontRegular,
        color: MUTED,
      },
    );
    boxTextY -= 8.5;
    currentPage.drawText(
      "This provisional certificate does not constitute an unconditional 100% tax exemption. Donors should consult applicable rules.",
      {
        x: boxX + 12,
        y: boxTextY,
        size: 6.8,
        font: fontRegular,
        color: MUTED,
      },
    );

    curY -= boxH + 20;
  }

  // --- 8. Signatory & Organization Details ---
  let legalY = curY;
  if (orgRegNo || orgPan || orgAddress) {
    currentPage.drawText("ORGANIZATION DETAILS", {
      x: cardX + 24,
      y: legalY,
      size: 8,
      font: fontBold,
      color: MUTED,
    });
    legalY -= 12;

    if (orgRegNo) {
      currentPage.drawText(`Trust Registration No.: ${orgRegNo}`, {
        x: cardX + 24,
        y: legalY,
        size: 7.5,
        font: fontRegular,
        color: DARK_BODY,
      });
      legalY -= 10;
    }

    if (orgPan) {
      currentPage.drawText(`Permanent Account Number (PAN): ${orgPan}`, {
        x: cardX + 24,
        y: legalY,
        size: 7.5,
        font: fontRegular,
        color: DARK_BODY,
      });
      legalY -= 10;
    }

    currentPage.drawText("Registered Public Charitable Trust", {
      x: cardX + 24,
      y: legalY,
      size: 7.5,
      font: fontRegular,
      color: MUTED,
    });
    legalY -= 10;
    currentPage.drawText("Donations received for education, healthcare, and community welfare", {
      x: cardX + 24,
      y: legalY,
      size: 7,
      font: fontRegular,
      color: MUTED,
    });
  }

  // Right side: Founder & Authorized Signatory Block
  const sigBlockW = 160;
  const sigBlockX = cardX + cardW - sigBlockW - 24;
  let sigY = curY;

  if (orgName) {
    currentPage.drawText(`For ${orgName}`, {
      x: sigBlockX,
      y: sigY,
      size: 9,
      font: fontBold,
      color: DARK_BODY,
    });
  }

  const sigLineY = curY - 38;
  if (data.signatureBytes && data.signatureBytes.length > 0) {
    try {
      const sigImg = await pdfDoc.embedPng(data.signatureBytes);
      const maxW = 130;
      const maxH = 34;
      const scale = Math.min(maxW / sigImg.width, maxH / sigImg.height, 1);
      const drawW = sigImg.width * scale;
      const drawH = sigImg.height * scale;

      currentPage.drawImage(sigImg, {
        x: sigBlockX + (sigBlockW - drawW) / 2,
        y: sigLineY + 3,
        width: drawW,
        height: drawH,
      });
    } catch (sigErr) {
      console.warn("Could not embed handwritten signature PNG:", sigErr);
    }
  }

  currentPage.drawLine({
    start: { x: sigBlockX, y: sigLineY },
    end: { x: sigBlockX + sigBlockW, y: sigLineY },
    thickness: 1,
    color: DARK_BODY,
  });

  currentPage.drawText("Founder & Authorized Signatory", {
    x: sigBlockX + (sigBlockW - fontRegular.widthOfTextAtSize("Founder & Authorized Signatory", 8)) / 2,
    y: sigLineY - 11,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  // --- 9. Footers on All Pages ---
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    p.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: footerH,
      color: FOOTER_BG,
    });

    const ft1 = orgName
      ? `${orgName}  •  Thank You For Your Generous Support!`
      : "Thank You For Your Generous Support!";
    p.drawText(ft1, {
      x: cardX + (cardW - fontBold.widthOfTextAtSize(ft1, 9)) / 2,
      y: cardY + 26,
      size: 9,
      font: fontBold,
      color: DARK_BODY,
    });

    const contactItems: string[] = [];
    if (orgWebsite) contactItems.push(orgWebsite);
    if (orgEmail) contactItems.push(orgEmail);
    if (contactItems.length > 0) {
      const contactLine = contactItems.join("    •    ");
      p.drawText(contactLine, {
        x: cardX + (cardW - fontRegular.widthOfTextAtSize(contactLine, 8)) / 2,
        y: cardY + 12,
        size: 8,
        font: fontRegular,
        color: NAVY,
      });
    }

    const pageNumText = `Page ${idx + 1} of ${totalPages}`;
    p.drawText(pageNumText, {
      x: cardX + cardW - fontRegular.widthOfTextAtSize(pageNumText, 7.5) - 16,
      y: cardY + 12,
      size: 7.5,
      font: fontRegular,
      color: MUTED,
    });
  });

  return await pdfDoc.save();
}
