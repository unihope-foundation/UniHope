const { PDFDocument, rgb } = require('pdf-lib');

async function test() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([300, 300]);
  
  const x = 50, y = 50, w = 150, h = 80, r = 10;
  const k = 0.5522847498;
  const kr = r * k;
  
  // Using standard C (cubic bezier)
  const path = `M ${x + r} ${y} ` +
    `L ${x + w - r} ${y} ` +
    `C ${x + w - r + kr} ${y} ${x + w} ${y + r - kr} ${x + w} ${y + r} ` +
    `L ${x + w} ${y + h - r} ` +
    `C ${x + w} ${y + h - r + kr} ${x + w - r + kr} ${y + h} ${x + w - r} ${y + h} ` +
    `L ${x + r} ${y + h} ` +
    `C ${x + r - kr} ${y + h} ${x} ${y + h - r + kr} ${x} ${y + h - r} ` +
    `L ${x} ${y + r} ` +
    `C ${x} ${y + r - kr} ${x + r - kr} ${y} ${x + r} ${y} Z`;
    
  page.drawSvgPath(path, {
    color: rgb(0.95, 0.96, 0.98),
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
  });

  const bytes = await doc.save();
  console.log('Saved C bezier test, size:', bytes.length);
}

test().catch(console.error);

