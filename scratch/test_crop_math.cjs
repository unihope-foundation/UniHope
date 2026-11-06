const { PDFDocument, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = require('pdf-lib');
const fs = require('fs');

async function test() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  
  // Create a dummy image with content bounds
  const minX = 50, maxX = 450, minY = 100, maxY = 300, width = 500, height = 400;
  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const targetMaxW = 165;
  const targetMaxH = 50;
  
  const aspect = contentW / contentH;
  let drawW = targetMaxW;
  let drawH = targetMaxW / aspect;
  if (drawH > targetMaxH) {
    drawH = targetMaxH;
    drawW = targetMaxH * aspect;
  }
  
  const sigX = 365, sigW = 190, sigLineY = 186;
  const targetX = sigX + (sigW - drawW) / 2;
  const targetY = sigLineY + 2;
  
  const scale = drawW / contentW;
  const fullImgW = width * scale;
  const fullImgH = height * scale;
  
  const imgDrawX = targetX - minX * scale;
  const bottomPadding = height - 1 - maxY;
  const imgDrawY = targetY - bottomPadding * scale;
  
  console.log({
    contentW, contentH, drawW, drawH, targetX, targetY,
    scale, fullImgW, fullImgH, imgDrawX, imgDrawY
  });
  
  // Verify clipping operators execute cleanly
  page.pushOperators(
    pushGraphicsState(),
    rectangle(targetX, targetY, drawW, drawH),
    clip(),
    endPath()
  );
  // draw image would go here
  page.pushOperators(popGraphicsState());
  
  const bytes = await doc.save();
  console.log('Saved bytes successfully:', bytes.length);
}
test();

