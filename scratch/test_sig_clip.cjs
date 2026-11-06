const fs = require('fs');
const { PDFDocument, rgb, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = require('pdf-lib');

async function testPdfMath() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const bytes = fs.readFileSync('scratch/prod_signature.png');
  const sigImg = await doc.embedPng(bytes);

  const bounds = { minX: 248, maxX: 611, minY: 508, maxY: 683, width: 1080, height: 1350 };

  const targetMaxW = 165;
  const targetMaxH = 50;
  const sigW = 190;
  const sigX = 595.28 - 40 - sigW; // right margin 40
  const sigLineY = 150;

  const contentW = bounds.maxX - bounds.minX + 1;
  const contentH = bounds.maxY - bounds.minY + 1;
  const contentAspect = contentW / contentH;

  let drawW = targetMaxW;
  let drawH = targetMaxW / contentAspect;
  if (drawH > targetMaxH) {
    drawH = targetMaxH;
    drawW = targetMaxH * contentAspect;
  }

  const targetX = sigX + (sigW - drawW) / 2;
  const targetY = sigLineY + 2;

  const scale = drawW / contentW;
  const fullImgW = bounds.width * scale;
  const fullImgH = bounds.height * scale;

  const imgDrawX = targetX - bounds.minX * scale;
  const bottomPadding = bounds.height - 1 - bounds.maxY;
  const imgDrawY = targetY - bottomPadding * scale;

  console.log({
    contentW,
    contentH,
    contentAspect,
    drawW,
    drawH,
    scale,
    fullImgW,
    fullImgH,
    targetX,
    targetY,
    imgDrawX,
    bottomPadding,
    imgDrawY
  });

  // Draw background box for debug
  page.drawRectangle({
    x: targetX,
    y: targetY,
    width: drawW,
    height: drawH,
    borderColor: rgb(1, 0, 0),
    borderWidth: 0.5,
  });

  // Draw signature line
  page.drawLine({
    start: { x: sigX, y: sigLineY },
    end: { x: sigX + sigW, y: sigLineY },
    thickness: 1,
    color: rgb(0.1, 0.2, 0.4),
  });

  // Apply clip and draw image
  page.pushOperators(
    pushGraphicsState(),
    rectangle(targetX, targetY, drawW, drawH),
    clip(),
    endPath()
  );

  page.drawImage(sigImg, {
    x: imgDrawX,
    y: imgDrawY,
    width: fullImgW,
    height: fullImgH,
  });

  page.pushOperators(popGraphicsState());

  const pdfBytes = await doc.save();
  fs.writeFileSync('scratch/test_sig_clip.pdf', pdfBytes);
  console.log('Saved scratch/test_sig_clip.pdf');
}

testPdfMath();

