const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../convex/pdfReceipt.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Target logo block
const logoTarget = `  // Resolve logo bytes
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
  }`;

const logoReplacement = `  // Resolve official organization logo (preserves aspect ratio & transparency; no placeholder fallback)
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
      const logoImg = await pdfDoc.embedPng(effectiveLogoBytes);
      const imgAspect = logoImg.width / logoImg.height;
      let drawW = logoSize;
      let drawH = logoSize;
      if (imgAspect > 1) {
        drawH = logoSize / imgAspect;
      } else {
        drawW = logoSize * imgAspect;
      }
      currentPage.drawImage(logoImg, {
        x: logoX + (logoSize - drawW) / 2,
        y: logoY + (logoSize - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    } catch (logoErr) {
      console.warn("Could not embed official logo PNG into PDF receipt:", logoErr);
    }
  }`;

// 2. Target signature block
const sigTarget = `  // Signature box
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
  currentPage.drawText(sigTitle, { x: sigX, y: closeY - 45, size: 8, font: fontRegular, color: MUTED });`;

const sigReplacement = `  // Signature box (Target width: 150-180 pt, height: 45-60 pt, maintaining original aspect ratio)
  const sigW = 190;
  const sigX = rightX - sigW;
  const sigLineY = closeY - 54;

  if (data.signatureBytes && data.signatureBytes.length > 0) {
    try {
      const sigImg = await pdfDoc.embedPng(data.signatureBytes);
      const targetMaxW = 165;
      const targetMaxH = 50;
      const imgAspect = sigImg.width / sigImg.height;
      let drawW = targetMaxW;
      let drawH = targetMaxW / imgAspect;
      if (drawH > targetMaxH) {
        drawH = targetMaxH;
        drawW = targetMaxH * imgAspect;
      }
      currentPage.drawImage(sigImg, {
        x: sigX + (sigW - drawW) / 2,
        y: sigLineY + 2,
        width: drawW,
        height: drawH,
      });
    } catch (sigErr) {
      console.warn("Could not embed handwritten signature PNG:", sigErr);
    }
  }

  currentPage.drawLine({
    start: { x: sigX, y: sigLineY },
    end: { x: rightX, y: sigLineY },
    thickness: 0.8,
    color: NAVY,
  });
  currentPage.drawText("Authorized Signatory", {
    x: sigX,
    y: sigLineY - 11,
    size: 9,
    font: fontBold,
    color: NAVY,
  });
  const sigTitle = data.signatoryTitle || \`Founder, \${orgName}\`;
  currentPage.drawText(sigTitle, {
    x: sigX,
    y: sigLineY - 21,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });`;

const normContent = content.replace(/\r\n/g, '\n');
const normLogoTarget = logoTarget.replace(/\r\n/g, '\n');
const normSigTarget = sigTarget.replace(/\r\n/g, '\n');

if (!normContent.includes(normLogoTarget)) {
  console.error('Logo target not found in pdfReceipt.ts');
  process.exit(1);
}

if (!normContent.includes(normSigTarget)) {
  console.error('Signature target not found in pdfReceipt.ts');
  process.exit(1);
}

let updated = normContent.replace(normLogoTarget, logoReplacement.replace(/\r\n/g, '\n'));
updated = updated.replace(normSigTarget, sigReplacement.replace(/\r\n/g, '\n'));

fs.writeFileSync(filePath, updated);
console.log('Successfully updated convex/pdfReceipt.ts');

