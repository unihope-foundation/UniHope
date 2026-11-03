/**
 * Sample PDF generator — runs in the UniHope project directory
 * so pdf-lib is resolved from node_modules.
 * Run: node scratch/gen_pdf.mjs
 */
import { writeFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const NAVY        = rgb(1/255,   42/255,  95/255);
const GREEN       = rgb(43/255,  113/255, 27/255);
const BORDER_GREY = rgb(224/255, 224/255, 224/255);
const BOX_BG      = rgb(248/255, 250/255, 252/255);
const TABLE_HEADER_BG = rgb(245/255, 247/255, 250/255);
const FOOTER_BG   = rgb(235/255, 235/255, 235/255);
const DARK_BODY   = rgb(51/255,  51/255,  51/255);
const MUTED       = rgb(102/255, 102/255, 102/255);
const WHITE       = rgb(1, 1, 1);

function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = String(text).split(/\s+/);
  const lines = []; let currentLine = "";
  for (const word of words) {
    if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
      if (currentLine) { lines.push(currentLine); currentLine = ""; }
      let chunk = "";
      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) chunk += char;
        else { if (chunk) lines.push(chunk); chunk = char; }
      }
      if (chunk) currentLine = chunk;
      continue;
    }
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) currentLine = testLine;
    else { if (currentLine) lines.push(currentLine); currentLine = word; }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

const orgDetails = {
  name: "UNIHOPE Foundation",
  registeredAddress: "123, MG Road, Bengaluru, Karnataka, India - 560001",
  pan: "AAACU1234C",
  trustRegistrationNo: "KAR/2020/0012345",
  email: "contact@unihopefoundation.org",
  website: "https://unihopefoundation.org",
};
const taxDetails = {
  approvalSection: "Section 354(4) (Form No. 106, Rule 181)",
  provisionalUrn: "AAACU1234C20241AS001",
  approvalDate: "15 March 2024",
  validFrom: "01 April 2023",
  validUntil: "31 March 2026",
};
const data = {
  donorName: "Rajesh Kumar Venkataraman Subramaniam",
  donorEmail: "rajesh.venkataraman.subramaniam@longemaildomain.co.in",
  donorPhone: "+91-9876543210",
  anonymous: false,
  amount: 50000,
  purpose: "Education Support for Underprivileged Children in Rural Karnataka",
  razorpayPaymentId: "pay_Tvd5grfIaaMego",
  razorpayOrderId: "order_Tvd5grfIaaMego123",
  formattedDate: "3 November 2026",
  formattedAmount: "₹50,000",
  signatureBytes: null,
};

const orgName    = orgDetails.name;
const orgRegNo   = orgDetails.trustRegistrationNo;
const orgPan     = orgDetails.pan;
const orgAddress = orgDetails.registeredAddress;
const orgEmail   = orgDetails.email;
const orgWebsite = orgDetails.website;
const taxSection = taxDetails.approvalSection;
const taxUrn     = taxDetails.provisionalUrn;
const taxDate    = taxDetails.approvalDate;
const taxFrom    = taxDetails.validFrom;
const taxUntil   = taxDetails.validUntil;

const displayName = data.anonymous ? "Supporter" : (data.donorName || "Supporter");
const receiptNo   = `RCPT-${data.razorpayPaymentId.replace(/^pay_/, "").toUpperCase()}`;
const amountStr   = `INR ${String(data.formattedAmount || data.amount).replace(/[^\d.,]/g, "")}`;

const pageWidth = 595.28, pageHeight = 841.89;
const cardX = 36, cardY = 36;
const cardW = pageWidth - 72, cardH = pageHeight - 72;
const footerH = 46;
const pages = [];

const pdfDoc = await PDFDocument.create();
const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
const fontBold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

function createNewPage() {
  const p = pdfDoc.addPage([pageWidth, pageHeight]);
  p.drawRectangle({ x: cardX, y: cardY, width: cardW, height: cardH, borderColor: BORDER_GREY, borderWidth: 1, color: WHITE });
  pages.push(p); return p;
}

let currentPage = createNewPage();

// 1. Header
currentPage.drawCircle({ x: cardX + 46, y: cardY + cardH - 42, size: 22, color: NAVY });
currentPage.drawText("U", { x: cardX + 39, y: cardY + cardH - 49, size: 18, font: fontBold, color: WHITE });
currentPage.drawText(orgName, { x: cardX + 78, y: cardY + cardH - 34, size: 14.5, font: fontBold, color: NAVY });

const regPanItems = [];
if (orgRegNo) regPanItems.push(`Trust Reg. No.: ${orgRegNo}`);
if (orgPan)   regPanItems.push(`PAN: ${orgPan}`);
if (regPanItems.length > 0)
  currentPage.drawText(regPanItems.join("  |  "), { x: cardX + 78, y: cardY + cardH - 48, size: 8, font: fontRegular, color: MUTED });

if (orgAddress) {
  const addrLines = wrapText(orgAddress, cardW - 78 - 140, fontRegular, 7.5);
  let addrY = cardY + cardH - 58;
  for (const al of addrLines.slice(0, 2)) {
    currentPage.drawText(al, { x: cardX + 78, y: addrY, size: 7.5, font: fontRegular, color: MUTED });
    addrY -= 9;
  }
}

const badgeW = 124, badgeH = 34;
const badgeX = cardX + cardW - badgeW - 24, badgeY = cardY + cardH - 58;
currentPage.drawRectangle({ x: badgeX, y: badgeY, width: badgeW, height: badgeH, borderColor: BORDER_GREY, borderWidth: 1, color: WHITE });
currentPage.drawText("Secured Payment", { x: badgeX + 16, y: badgeY + 18, size: 10, font: fontBold, color: NAVY });
currentPage.drawText("Razorpay Verified", { x: badgeX + 22, y: badgeY + 6, size: 8, font: fontRegular, color: MUTED });

const headerDividerY = cardY + cardH - (orgAddress ? 82 : 74);
currentPage.drawLine({ start: { x: cardX, y: headerDividerY }, end: { x: cardX + cardW, y: headerDividerY }, thickness: 1, color: BORDER_GREY });

// 2. Title & References
let curY = headerDividerY - 24;
currentPage.drawText("DONATION RECEIPT", { x: cardX + 24, y: curY, size: 17, font: fontBold, color: DARK_BODY });

const rightBlockW = 220, rightBlockX = cardX + cardW - rightBlockW - 24;
const refLines  = wrapText(`Txn Ref: ${data.razorpayPaymentId}`, rightBlockW, fontRegular, 8.5);
const rcptLines = wrapText(`Receipt No: ${receiptNo}`, rightBlockW, fontRegular, 8.5);
let refY = curY + 2;
for (const line of [...refLines, ...rcptLines]) {
  const w = fontRegular.widthOfTextAtSize(line, 8.5);
  currentPage.drawText(line, { x: rightBlockX + (rightBlockW - w), y: refY, size: 8.5, font: fontRegular, color: MUTED });
  refY -= 11;
}

curY = Math.min(curY - 24, refY - 8);
const subtitleLines = wrapText(`Official donation acknowledgement for: ${data.purpose}`, cardW - 48, fontOblique, 8.5);
for (const line of subtitleLines) {
  currentPage.drawText(line, { x: cardX + 24, y: curY, size: 8.5, font: fontOblique, color: MUTED });
  curY -= 12;
}

// 3. Amount
curY -= 12;
currentPage.drawText("AMOUNT PAID", { x: cardX + 24, y: curY, size: 8.5, font: fontBold, color: MUTED });
curY -= 22;
currentPage.drawText(amountStr, { x: cardX + 24, y: curY, size: 21, font: fontBold, color: DARK_BODY });
const amtW = Math.min(130, fontBold.widthOfTextAtSize(amountStr, 21));
currentPage.drawLine({ start: { x: cardX + 24, y: curY - 5 }, end: { x: cardX + 24 + amtW, y: curY - 5 }, thickness: 2.5, color: NAVY });

// 4. Two-column
curY -= 26;
const colYStart = curY, colWidth = (cardW - 48 - 24) / 2;
let leftY = colYStart;
currentPage.drawText("ISSUED TO", { x: cardX + 24, y: leftY, size: 8.5, font: fontBold, color: MUTED });
leftY -= 15;
for (const line of wrapText(displayName, colWidth, fontBold, 10)) {
  currentPage.drawText(line, { x: cardX + 24, y: leftY, size: 10, font: fontBold, color: DARK_BODY }); leftY -= 13;
}
for (const line of wrapText(data.donorEmail, colWidth, fontRegular, 8.5)) {
  currentPage.drawText(line, { x: cardX + 24, y: leftY, size: 8.5, font: fontRegular, color: DARK_BODY }); leftY -= 12;
}
if (data.donorPhone) {
  for (const line of wrapText(data.donorPhone, colWidth, fontRegular, 8.5)) {
    currentPage.drawText(line, { x: cardX + 24, y: leftY, size: 8.5, font: fontRegular, color: DARK_BODY }); leftY -= 12;
  }
}

const rightColX = cardX + 24 + colWidth + 24;
let rightY = colYStart;
currentPage.drawText("PAYMENT DETAILS", { x: rightColX, y: rightY, size: 8.5, font: fontBold, color: MUTED }); rightY -= 15;
currentPage.drawText(`Paid On: ${data.formattedDate}`, { x: rightColX, y: rightY, size: 9, font: fontRegular, color: DARK_BODY }); rightY -= 13;
currentPage.drawText("Status: PAID", { x: rightColX, y: rightY, size: 9.5, font: fontBold, color: GREEN }); rightY -= 13;
for (const line of wrapText(`Order ID: ${data.razorpayOrderId}`, colWidth, fontRegular, 8)) {
  currentPage.drawText(line, { x: rightColX, y: rightY, size: 8, font: fontRegular, color: MUTED }); rightY -= 11;
}

curY = Math.min(leftY, rightY) - 12;
currentPage.drawLine({ start: { x: cardX + 24, y: curY }, end: { x: cardX + cardW - 24, y: curY }, thickness: 1, color: BORDER_GREY });

// 5. Table
curY -= 14;
const tableX = cardX + 24, tableW = cardW - 48, thHeight = 20;
currentPage.drawRectangle({ x: tableX, y: curY - thHeight + 4, width: tableW, height: thHeight, color: TABLE_HEADER_BG });
currentPage.drawText("DESCRIPTION", { x: tableX + 8,   y: curY - 9, size: 8, font: fontBold, color: MUTED });
currentPage.drawText("UNIT PRICE",  { x: tableX + 260, y: curY - 9, size: 8, font: fontBold, color: MUTED });
currentPage.drawText("QTY",         { x: tableX + 355, y: curY - 9, size: 8, font: fontBold, color: MUTED });
currentPage.drawText("AMOUNT",      { x: tableX + 415, y: curY - 9, size: 8, font: fontBold, color: MUTED });

curY -= thHeight + 8;
const startRowY = curY;
for (const line of wrapText(data.purpose, 245, fontBold, 9)) {
  currentPage.drawText(line, { x: tableX + 8, y: curY, size: 9, font: fontBold, color: DARK_BODY }); curY -= 12;
}
currentPage.drawText(`Charitable Donation to ${orgName}`, { x: tableX + 8, y: curY, size: 8, font: fontRegular, color: MUTED }); curY -= 13;
currentPage.drawText(amountStr, { x: tableX + 260, y: startRowY, size: 9, font: fontRegular, color: DARK_BODY });
currentPage.drawText("1", { x: tableX + 360, y: startRowY, size: 9, font: fontRegular, color: DARK_BODY });
currentPage.drawText(amountStr, { x: tableX + 415, y: startRowY, size: 9, font: fontBold, color: DARK_BODY });

curY -= 6;
currentPage.drawLine({ start: { x: tableX, y: curY }, end: { x: tableX + tableW, y: curY }, thickness: 1, color: BORDER_GREY });

// 6. Totals
curY -= 15;
currentPage.drawText("Total:", { x: tableX + 310, y: curY, size: 9.5, font: fontBold, color: DARK_BODY });
currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 9.5, font: fontBold, color: DARK_BODY });
curY -= 14;
currentPage.drawText("Amount Paid:", { x: tableX + 310, y: curY, size: 9.5, font: fontBold, color: GREEN });
currentPage.drawText(amountStr, { x: tableX + 415, y: curY, size: 9.5, font: fontBold, color: GREEN });
curY -= 22;

// Multi-page check
const requiredRemainingSpace = (taxUrn || taxSection ? 70 : 0) + 95;
if (curY < cardY + footerH + requiredRemainingSpace) {
  currentPage.drawText("... continued on next page", { x: cardX + cardW - 150, y: cardY + footerH + 14, size: 8, font: fontOblique, color: MUTED });
  currentPage = createNewPage();
  curY = cardY + cardH - 36;
  currentPage.drawText(`${orgName} — Donation Receipt Continued`, { x: cardX + 24, y: curY, size: 11, font: fontBold, color: NAVY });
  currentPage.drawText(`Receipt No: ${receiptNo}`, { x: cardX + cardW - 180, y: curY, size: 8.5, font: fontRegular, color: MUTED });
  curY -= 14;
  currentPage.drawLine({ start: { x: cardX + 24, y: curY }, end: { x: cardX + cardW - 24, y: curY }, thickness: 1, color: BORDER_GREY });
  curY -= 22;
} else {
  currentPage.drawLine({ start: { x: tableX, y: curY }, end: { x: tableX + tableW, y: curY }, thickness: 1, color: BORDER_GREY });
  curY -= 16;
}

// 7. Tax Box
if (taxUrn || taxSection) {
  const boxW = cardW - 48, boxH = taxUrn ? 68 : 52, boxX = cardX + 24;
  currentPage.drawRectangle({ x: boxX, y: curY - boxH, width: boxW, height: boxH, color: BOX_BG, borderColor: BORDER_GREY, borderWidth: 1 });
  currentPage.drawText("STATUTORY TAX APPROVAL DETAILS (PROVISIONAL)", { x: boxX + 12, y: curY - 13, size: 8, font: fontBold, color: NAVY });
  let boxTextY = curY - 25;
  const urnDisplay = taxUrn ? `Provisional URN: ${taxUrn}` : "";
  const line1 = urnDisplay ? `${urnDisplay}    Approval: ${taxSection}` : `Approval: ${taxSection}`;
  currentPage.drawText(line1, { x: boxX + 12, y: boxTextY, size: 7.5, font: fontBold, color: DARK_BODY }); boxTextY -= 10;
  const line2 = [taxDate ? `Approval Date: ${taxDate}` : "", (taxFrom || taxUntil) ? `Validity: ${taxFrom} to ${taxUntil}` : ""].filter(Boolean).join("    ");
  if (line2) { currentPage.drawText(line2, { x: boxX + 12, y: boxTextY, size: 7, font: fontRegular, color: MUTED }); boxTextY -= 10; }
  currentPage.drawText("Issued under Form No. 106 provisional approval pursuant to Section 354(4) and Rule 181.", { x: boxX + 12, y: boxTextY, size: 6.8, font: fontRegular, color: MUTED }); boxTextY -= 8.5;
  currentPage.drawText("This provisional certificate does not constitute an unconditional 100% tax exemption. Donors should consult applicable rules.", { x: boxX + 12, y: boxTextY, size: 6.8, font: fontRegular, color: MUTED });
  curY -= boxH + 20;
}

// 8. Signatory & Org Details
let legalY = curY;
currentPage.drawText("ORGANIZATION DETAILS", { x: cardX + 24, y: legalY, size: 8, font: fontBold, color: MUTED }); legalY -= 12;
if (orgRegNo) { currentPage.drawText(`Trust Registration No.: ${orgRegNo}`, { x: cardX + 24, y: legalY, size: 7.5, font: fontRegular, color: DARK_BODY }); legalY -= 10; }
if (orgPan)   { currentPage.drawText(`Permanent Account Number (PAN): ${orgPan}`, { x: cardX + 24, y: legalY, size: 7.5, font: fontRegular, color: DARK_BODY }); legalY -= 10; }
currentPage.drawText("Registered Public Charitable Trust", { x: cardX + 24, y: legalY, size: 7.5, font: fontRegular, color: MUTED }); legalY -= 10;
currentPage.drawText("Donations received for education, healthcare, and community welfare", { x: cardX + 24, y: legalY, size: 7, font: fontRegular, color: MUTED });

const sigBlockW = 160, sigBlockX = cardX + cardW - sigBlockW - 24;
currentPage.drawText(`For ${orgName}`, { x: sigBlockX, y: curY, size: 9, font: fontBold, color: DARK_BODY });
const sigLineY = curY - 38;
currentPage.drawLine({ start: { x: sigBlockX, y: sigLineY }, end: { x: sigBlockX + sigBlockW, y: sigLineY }, thickness: 1, color: DARK_BODY });
currentPage.drawText("Founder & Authorized Signatory", {
  x: sigBlockX + (sigBlockW - fontRegular.widthOfTextAtSize("Founder & Authorized Signatory", 8)) / 2,
  y: sigLineY - 11, size: 8, font: fontRegular, color: MUTED
});

// 9. Footer
const totalPages = pages.length;
pages.forEach((p, idx) => {
  p.drawRectangle({ x: cardX, y: cardY, width: cardW, height: footerH, color: FOOTER_BG });
  const ft1 = `${orgName}  •  Thank You For Your Generous Support!`;
  p.drawText(ft1, { x: cardX + (cardW - fontBold.widthOfTextAtSize(ft1, 9)) / 2, y: cardY + 26, size: 9, font: fontBold, color: DARK_BODY });
  const contactLine = [orgWebsite, orgEmail].filter(Boolean).join("    •    ");
  p.drawText(contactLine, { x: cardX + (cardW - fontRegular.widthOfTextAtSize(contactLine, 8)) / 2, y: cardY + 12, size: 8, font: fontRegular, color: NAVY });
  const pgTxt = `Page ${idx + 1} of ${totalPages}`;
  p.drawText(pgTxt, { x: cardX + cardW - fontRegular.widthOfTextAtSize(pgTxt, 7.5) - 16, y: cardY + 12, size: 7.5, font: fontRegular, color: MUTED });
});

const pdfBytes = await pdfDoc.save();
writeFileSync("UNIHOPE-Sample-Receipt.pdf", Buffer.from(pdfBytes));
console.log("✓ PDF written to: UNIHOPE-Sample-Receipt.pdf");
console.log(`✓ File size: ${pdfBytes.length} bytes`);
console.log(`✓ Pages: ${totalPages}`);
console.log("\nSection checklist:");
console.log(` ✓ Header: ${orgName}, Reg ${orgRegNo}, PAN ${orgPan}`);
console.log(` ✓ Address: ${orgAddress}`);
console.log(` ✓ Tax section: ${taxSection}`);
console.log(` ✓ Tax URN: ${taxUrn}`);
console.log(` ✓ Approval date: ${taxDate}  Validity: ${taxFrom} – ${taxUntil}`);
console.log(` ✓ Footer: ${orgWebsite}  •  ${orgEmail}`);

