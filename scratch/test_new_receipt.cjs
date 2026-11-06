const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// Brand palette tokens
const NAVY = rgb(16 / 255, 44 / 255, 80 / 255);      // #102C50
const TEAL = rgb(22 / 255, 140 / 255, 134 / 255);   // #168C86
const LIGHT_BG = rgb(243 / 255, 246 / 255, 250 / 255); // #F3F6FA
const BODY_TEXT = rgb(38 / 255, 52 / 255, 69 / 255); // #263445
const MUTED = rgb(100 / 255, 116 / 255, 139 / 255); // #64748B
const BORDER = rgb(220 / 255, 228 / 255, 237 / 255); // #DCE4ED
const SUCCESS = rgb(22 / 255, 140 / 255, 85 / 255);  // #168C55
const WHITE = rgb(1, 1, 1);

// In drawSvgPath, y is the TOP coordinate in PDF space, extending downward by height
function drawRoundedRectTop(page, x, topY, width, height, radius, options = {}) {
  const r = Math.min(radius, width / 2, height / 2);
  const k = 0.5522847498;
  const kr = r * k;
  
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
    y: topY,
    color: options.color,
    borderColor: options.borderColor,
    borderWidth: options.borderWidth ?? 0,
  });
}

function drawCheckmark(page, cx, cy, radius, fillColor, checkColor = WHITE) {
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

function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = '';
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

async function generatePreview() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 515.28
  const rightX = marginX + contentWidth; // 555.28
  const footerH = 50;

  const page = doc.addPage([pageWidth, pageHeight]);

  // 1. HEADER
  const headerTopY = pageHeight - 34; // 807.89
  const logoSize = 58;
  const logoX = marginX;
  const logoY = headerTopY - logoSize; // 749.89

  // Read official logo if exists
  const logoPath = path.resolve(__dirname, '../public/UNIHOPE_LOGO__ cir.png');
  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);
    const logoImg = await doc.embedPng(logoBytes);
    page.drawImage(logoImg, {
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
    });
  }

  // Organization Text
  const orgTextX = logoX + logoSize + 12; // 110
  let orgTextY = headerTopY - 18; // 789.89

  page.drawText('UNIHOPE Foundation', {
    x: orgTextX,
    y: orgTextY,
    size: 20,
    font: fontBold,
    color: NAVY,
  });

  orgTextY -= 14;
  page.drawText('Trust Reg. No.: R/Chennai North Joint I/Book-4/228/2026', {
    x: orgTextX,
    y: orgTextY,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  orgTextY -= 10;
  const addr = '2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school, Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026';
  const addrLines = wrapText(addr, 275, fontRegular, 8);
  for (const al of addrLines.slice(0, 2)) {
    page.drawText(al, {
      x: orgTextX,
      y: orgTextY,
      size: 8,
      font: fontRegular,
      color: MUTED,
    });
    orgTextY -= 10;
  }

  // Header Right: Verified by Razorpay pill + Status Pill
  const verifyPillW = 120;
  const verifyPillH = 20;
  const verifyPillX = rightX - verifyPillW;
  const verifyPillTopY = headerTopY; // top of pill

  drawRoundedRectTop(page, verifyPillX, verifyPillTopY, verifyPillW, verifyPillH, 10, {
    borderColor: BORDER,
    borderWidth: 0.8,
    color: WHITE,
  });
  drawCheckmark(page, verifyPillX + 11, verifyPillTopY - 10, 5.5, TEAL);
  page.drawText('Verified by Razorpay', {
    x: verifyPillX + 22,
    y: verifyPillTopY - 13.5,
    size: 8,
    font: fontBold,
    color: NAVY,
  });

  // PAYMENT STATUS label
  const statusLabel = 'PAYMENT STATUS';
  const statusLabelW = fontRegular.widthOfTextAtSize(statusLabel, 7);
  const statusLabelY = verifyPillTopY - verifyPillH - 9;
  page.drawText(statusLabel, {
    x: rightX - statusLabelW,
    y: statusLabelY,
    size: 7,
    font: fontRegular,
    color: MUTED,
  });

  // PAID status pill
  const paidPillW = 56;
  const paidPillH = 17;
  const paidPillX = rightX - paidPillW;
  const paidPillTopY = statusLabelY - 3;
  drawRoundedRectTop(page, paidPillX, paidPillTopY, paidPillW, paidPillH, 8.5, {
    color: SUCCESS,
  });
  const paidTextW = fontBold.widthOfTextAtSize('PAID', 9);
  page.drawText('PAID', {
    x: paidPillX + (paidPillW - paidTextW) / 2,
    y: paidPillTopY - 11.5,
    size: 9,
    font: fontBold,
    color: WHITE,
  });

  // Header Divider Rule with Teal accent
  const divY = logoY - 10; // 739.89
  page.drawLine({
    start: { x: marginX, y: divY },
    end: { x: rightX, y: divY },
    thickness: 0.8,
    color: BORDER,
  });
  page.drawLine({
    start: { x: marginX, y: divY + 0.6 },
    end: { x: marginX + 60, y: divY + 0.6 },
    thickness: 2,
    color: TEAL,
  });

  // 2. TITLE + META
  const titleY = divY - 26; // 713.89
  page.drawText('DONATION RECEIPT', {
    x: marginX,
    y: titleY,
    size: 26,
    font: fontBold,
    color: NAVY,
  });

  page.drawText('Official Donation Receipt / Payment Acknowledgement', {
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
    { label: 'Receipt No.', value: 'UH-2026-000001' },
    { label: 'Transaction Ref.', value: 'pay_TEST123456789' },
    { label: 'Donation Purpose', value: 'General Donation' },
  ];
  for (const mi of metaItems) {
    page.drawText(mi.label, {
      x: metaBoxX,
      y: metaY,
      size: 7.5,
      font: fontRegular,
      color: MUTED,
    });
    const valW = fontBold.widthOfTextAtSize(mi.value, 8.5);
    page.drawText(mi.value, {
      x: rightX - valW,
      y: metaY,
      size: 8.5,
      font: fontBold,
      color: BODY_TEXT,
    });
    metaY -= 12;
  }

  // 3. AMOUNT RECEIVED PANEL
  const amtPanelTopY = titleY - 34; // 679.89
  const amtPanelH = 58;
  drawRoundedRectTop(page, marginX, amtPanelTopY, contentWidth, amtPanelH, 6, {
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.8,
  });
  // Left Teal vertical accent bar
  page.drawRectangle({
    x: marginX,
    y: amtPanelTopY - amtPanelH,
    width: 4,
    height: amtPanelH,
    color: TEAL,
  });

  // Left Content
  page.drawText('AMOUNT RECEIVED', {
    x: marginX + 24,
    y: amtPanelTopY - 18,
    size: 9.5,
    font: fontBold,
    color: NAVY,
  });
  page.drawText('INR 1,000.00', {
    x: marginX + 24,
    y: amtPanelTopY - 47,
    size: 32,
    font: fontBold,
    color: NAVY,
  });

  // Right Content: Checkmark + PAID
  const paidRowY = amtPanelTopY - 22;
  const paidRowRightX = rightX - 22;
  const paidWordW = fontBold.widthOfTextAtSize('PAID', 15);
  const paidWordX = paidRowRightX - paidWordW;
  const checkCircleRadius = 9;
  const checkCircleX = paidWordX - 7 - checkCircleRadius;
  const checkCircleY = paidRowY + 5;

  drawCheckmark(page, checkCircleX, checkCircleY, checkCircleRadius, SUCCESS);
  page.drawText('PAID', {
    x: paidWordX,
    y: paidRowY,
    size: 15,
    font: fontBold,
    color: SUCCESS,
  });

  const note1 = 'Payment received successfully';
  const note1W = fontRegular.widthOfTextAtSize(note1, 7.5);
  page.drawText(note1, {
    x: paidRowRightX - note1W,
    y: paidRowY - 13,
    size: 7.5,
    font: fontRegular,
    color: MUTED,
  });

  const note2 = '04 Nov 2026, 10:30 AM';
  const note2W = fontRegular.widthOfTextAtSize(note2, 7.5);
  page.drawText(note2, {
    x: paidRowRightX - note2W,
    y: paidRowY - 24,
    size: 7.5,
    font: fontRegular,
    color: MUTED,
  });

  // 4. TWO COLUMNS: DONOR DETAILS & PAYMENT DETAILS
  const colGap = 26;
  const colW = (contentWidth - colGap) / 2; // 244.64
  const col1X = marginX;
  const col2X = marginX + colW + colGap; // 310.64
  let sectionY = (amtPanelTopY - amtPanelH) - 22; // 599.89

  function drawSectionHeading(x, y, title) {
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

  drawSectionHeading(col1X, sectionY, 'DONOR DETAILS');
  drawSectionHeading(col2X, sectionY, 'PAYMENT DETAILS');

  let fY = sectionY - 18;

  // Donor Details Fields
  page.drawText('Donor Full Name', { x: col1X, y: fY, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('Dr. Rajesh Sundaram', { x: col1X, y: fY - 11, size: 11, font: fontBold, color: BODY_TEXT });

  page.drawText('Email Address', { x: col1X, y: fY - 28, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('rajesh.sundaram@example.com', { x: col1X, y: fY - 39, size: 9.5, font: fontRegular, color: BODY_TEXT });

  page.drawText('Phone Number', { x: col1X, y: fY - 54, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('+91 98765 43210', { x: col1X, y: fY - 65, size: 9.5, font: fontRegular, color: BODY_TEXT });

  // Payment Details Fields (2x2)
  const col2LeftW = colW * 0.52;
  const col2RightX = col2X + col2LeftW;

  page.drawText('Payment Date', { x: col2X, y: fY, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('04 Nov 2026, 10:30 AM', { x: col2X, y: fY - 11, size: 9.5, font: fontRegular, color: BODY_TEXT });

  page.drawText('Payment Status', { x: col2RightX, y: fY, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('PAID', { x: col2RightX, y: fY - 11, size: 9.5, font: fontBold, color: SUCCESS });

  page.drawText('Razorpay Payment ID', { x: col2X, y: fY - 28, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('pay_TEST123456789', { x: col2X, y: fY - 39, size: 8.5, font: fontRegular, color: BODY_TEXT });

  page.drawText('Razorpay Order ID', { x: col2RightX, y: fY - 28, size: 7.5, font: fontRegular, color: MUTED });
  page.drawText('order_TEST987654321', { x: col2RightX, y: fY - 39, size: 8.5, font: fontRegular, color: BODY_TEXT });

  // 5. DONATION DETAILS TABLE
  let tableY = fY - 84; // 497.89
  page.drawText('DONATION DETAILS', {
    x: marginX,
    y: tableY,
    size: 10,
    font: fontBold,
    color: NAVY,
  });
  page.drawLine({
    start: { x: marginX, y: tableY - 5 },
    end: { x: rightX, y: tableY - 5 },
    thickness: 0.8,
    color: BORDER,
  });
  page.drawLine({
    start: { x: marginX, y: tableY - 5 },
    end: { x: marginX + 26, y: tableY - 5 },
    thickness: 1.6,
    color: TEAL,
  });

  // Table Head
  const thTopY = tableY - 12;
  const thH = 22;
  page.drawRectangle({
    x: marginX,
    y: thTopY - thH,
    width: contentWidth,
    height: thH,
    color: LIGHT_BG,
  });

  const colUnitX = rightX - 95 - 65 - 95; // 300.28
  const colQtyX = rightX - 95 - 65;        // 395.28
  const colAmtX = rightX - 95;             // 460.28

  page.drawText('Description', { x: marginX + 12, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thUnitW = fontBold.widthOfTextAtSize('Unit Price', 8.5);
  page.drawText('Unit Price', { x: colQtyX - 12 - thUnitW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thQtyW = fontBold.widthOfTextAtSize('Quantity', 8.5);
  page.drawText('Quantity', { x: colAmtX - 12 - thQtyW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });
  const thAmtW = fontBold.widthOfTextAtSize('Amount', 8.5);
  page.drawText('Amount', { x: rightX - 12 - thAmtW, y: thTopY - 15, size: 8.5, font: fontBold, color: NAVY });

  // Table Row
  const trY = thTopY - thH - 18;
  page.drawText('Donation to UNIHOPE Foundation', { x: marginX + 12, y: trY, size: 9.5, font: fontRegular, color: BODY_TEXT });
  page.drawText('General Donation', { x: marginX + 12, y: trY - 11, size: 8, font: fontRegular, color: MUTED });

  const rUnitW = fontRegular.widthOfTextAtSize('INR 1,000.00', 9.5);
  page.drawText('INR 1,000.00', { x: colQtyX - 12 - rUnitW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });
  const rQtyW = fontRegular.widthOfTextAtSize('1', 9.5);
  page.drawText('1', { x: colAmtX - 12 - rQtyW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });
  const rAmtW = fontRegular.widthOfTextAtSize('INR 1,000.00', 9.5);
  page.drawText('INR 1,000.00', { x: rightX - 12 - rAmtW, y: trY - 3, size: 9.5, font: fontRegular, color: BODY_TEXT });

  // Row bottom border
  page.drawLine({
    start: { x: marginX, y: trY - 20 },
    end: { x: rightX, y: trY - 20 },
    thickness: 0.8,
    color: BORDER,
  });

  // Totals Section
  const totW = 220;
  const totX = rightX - totW;
  const totY = trY - 34;

  page.drawText('Total Amount', { x: totX + 12, y: totY, size: 8.5, font: fontRegular, color: MUTED });
  const totValW = fontBold.widthOfTextAtSize('INR 1,000.00', 9.5);
  page.drawText('INR 1,000.00', { x: rightX - 12 - totValW, y: totY, size: 9.5, font: fontBold, color: BODY_TEXT });

  // Amount Paid Box
  const paidBoxTopY = totY - 10;
  const paidBoxH = 28;
  drawRoundedRectTop(page, totX, paidBoxTopY, totW, paidBoxH, 4, {
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.8,
  });
  page.drawText('Amount Paid', { x: totX + 12, y: paidBoxTopY - 19, size: 9, font: fontBold, color: NAVY });
  const paidValW = fontBold.widthOfTextAtSize('INR 1,000.00', 12);
  page.drawText('INR 1,000.00', { x: rightX - 12 - paidValW, y: paidBoxTopY - 20, size: 12, font: fontBold, color: NAVY });

  // 6. STATUTORY / TAX APPROVAL DETAILS
  const taxTopY = (paidBoxTopY - paidBoxH) - 18;
  const taxH = 68;
  drawRoundedRectTop(page, marginX, taxTopY, contentWidth, taxH, 6, {
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.8,
  });

  page.drawText('STATUTORY / TAX APPROVAL DETAILS', {
    x: marginX + 16,
    y: taxTopY - 16,
    size: 10,
    font: fontBold,
    color: NAVY,
  });

  const taxColW = (contentWidth - 32) / 4; // ~120
  const taxCols = [
    { label: 'Provisional URN', val: 'AAACU1234CF20261' },
    { label: 'Approval Reference', val: 'Section 80G Approval' },
    { label: 'Approval Date', val: '15 April 2026' },
    { label: 'Validity Period', val: 'AY 2026-27 to 2029-30' },
  ];

  taxCols.forEach((tc, idx) => {
    const tx = marginX + 16 + idx * taxColW;
    page.drawText(tc.label, { x: tx, y: taxTopY - 30, size: 7.5, font: fontRegular, color: MUTED });
    page.drawText(tc.val, { x: tx, y: taxTopY - 40, size: 8.5, font: fontRegular, color: BODY_TEXT });
  });

  page.drawLine({
    start: { x: marginX + 16, y: taxTopY - 47 },
    end: { x: rightX - 16, y: taxTopY - 47 },
    thickness: 0.8,
    color: BORDER,
  });

  page.drawText('Donations to UNIHOPE Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961.', {
    x: marginX + 16,
    y: taxTopY - 56,
    size: 7.5,
    font: fontRegular,
    color: BODY_TEXT,
  });
  page.drawText('This is a computer-generated official receipt issued by UNIHOPE Foundation. Valid without a physical seal.', {
    x: marginX + 16,
    y: taxTopY - 64,
    size: 7.5,
    font: fontRegular,
    color: MUTED,
  });

  // 7. CLOSING: ORGANIZATION & SIGNATURE
  const closeY = (taxTopY - taxH) - 18;
  page.drawText('UNIHOPE Foundation', { x: marginX, y: closeY, size: 10.5, font: fontBold, color: NAVY });
  page.drawText('Trust Reg. No.: R/Chennai North Joint I/Book-4/228/2026', { x: marginX, y: closeY - 12, size: 8, font: fontRegular, color: MUTED });
  page.drawText('2nd floor, No:73, S Sivan Kovil St, opp. to ambiga driving school,', { x: marginX, y: closeY - 22, size: 8, font: fontRegular, color: MUTED });
  page.drawText('Ottagapalayam, Sector 15, Vadapalani, Chennai, Tamil Nadu 600026', { x: marginX, y: closeY - 32, size: 8, font: fontRegular, color: MUTED });

  // Signature box
  const sigW = 190;
  const sigX = rightX - sigW;
  page.drawLine({
    start: { x: sigX, y: closeY - 24 },
    end: { x: rightX, y: closeY - 24 },
    thickness: 0.8,
    color: NAVY,
  });
  page.drawText('Authorized Signatory', { x: sigX, y: closeY - 35, size: 9, font: fontBold, color: NAVY });
  page.drawText('Founder, UNIHOPE Foundation', { x: sigX, y: closeY - 45, size: 8, font: fontRegular, color: MUTED });

  // 8. NAVY FOOTER
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: footerH,
    color: NAVY,
  });
  page.drawLine({
    start: { x: 0, y: footerH - 1.25 },
    end: { x: pageWidth, y: footerH - 1.25 },
    thickness: 2.5,
    color: TEAL,
  });

  // Footer Row 1
  page.drawText('UNIHOPE Foundation', { x: marginX, y: 30, size: 8.5, font: fontBold, color: WHITE });
  const fLink = 'unihopefoundation.org   |   unihopefoundation.official@gmail.com';
  const fLinkW = fontRegular.widthOfTextAtSize(fLink, 8);
  page.drawText(fLink, { x: rightX - fLinkW, y: 30, size: 8, font: fontRegular, color: WHITE });

  // Footer Row 2
  page.drawText('Thank you for your generous support. Together, we create meaningful change.', {
    x: marginX,
    y: 16,
    size: 8,
    font: fontRegular,
    color: BORDER,
  });
  page.drawText('Page 1 of 1', {
    x: rightX - fontRegular.widthOfTextAtSize('Page 1 of 1', 8),
    y: 16,
    size: 8,
    font: fontRegular,
    color: BORDER,
  });

  const pdfBytes = await doc.save();
  const outPdf = path.resolve(__dirname, 'test_new_receipt.pdf');
  fs.writeFileSync(outPdf, pdfBytes);
  console.log('Saved test PDF to', outPdf);

  // Render to PNG
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const p = await browser.newPage({
    viewport: { width: 1240, height: 1754 },
    deviceScaleFactor: 2,
  });
  await p.goto('file:///' + outPdf.replace(/\\/g, '/'), { waitUntil: 'load' });
  await p.waitForTimeout(3000);
  const outPng = path.resolve(__dirname, 'test_new_receipt.png');
  await p.screenshot({ path: outPng });
  await browser.close();
  console.log('Saved test PNG to', outPng);
}

generatePreview().catch(console.error);
