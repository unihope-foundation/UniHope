const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function test() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  
  // Test drawing rounded rectangle via SVG path
  const x = 50, y = 500, w = 200, h = 50, r = 8;
  const path = `M ${x + r} ${y} h ${w - 2*r} q ${r} 0 ${r} ${r} v ${h - 2*r} q 0 ${r} -${r} ${r} h -${w - 2*r} q -${r} 0 -${r} -${r} v -${h - 2*r} q 0 -${r} ${r} -${r} Z`;
  
  page.drawSvgPath(path, {
    color: rgb(0.9, 0.95, 1.0),
    borderColor: rgb(0.1, 0.3, 0.6),
    borderWidth: 1,
  });

  const bytes = await doc.save();
  console.log('Saved SVG path test:', bytes.length);
}

test().catch(console.error);

