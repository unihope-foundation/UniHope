const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../convex/pdfReceipt.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update pdf-lib imports to include clipping operators
const oldImport = `import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type Color } from "pdf-lib";`;
const newImport = `import {
  PDFDocument,
  rgb,
  StandardFonts,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
  type PDFFont,
  type PDFPage,
  type Color,
} from "pdf-lib";`;

content = content.replace(oldImport, newImport);

// 2. Add findPngContentBounds helper function
const helperCode = `/**
 * Inspects a PNG's alpha channel to find the bounding box of non-transparent pixels.
 * Used to automatically remove excessive transparent padding from handwritten signatures
 * so strokes render at maximum clarity and target size without clipping.
 */
async function findPngContentBounds(bytes: Uint8Array): Promise<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
} | null> {
  try {
    if (!bytes || bytes.length < 33) return null;
    if (
      bytes[0] !== 0x89 ||
      bytes[1] !== 0x50 ||
      bytes[2] !== 0x4e ||
      bytes[3] !== 0x47
    ) {
      return null;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    const bitDepth = bytes[24];
    const colorType = bytes[25]; // 6 = RGBA

    if (bitDepth !== 8 || colorType !== 6 || bytes[28] !== 0) {
      return null;
    }

    let offset = 8;
    const idatParts: Uint8Array[] = [];
    while (offset < bytes.length) {
      const chunkLen = view.getUint32(offset);
      const chunkType = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7]
      );
      if (chunkType === "IDAT") {
        idatParts.push(bytes.subarray(offset + 8, offset + 8 + chunkLen));
      }
      offset += 12 + chunkLen;
    }

    if (idatParts.length === 0) return null;

    const totalIdatLen = idatParts.reduce((acc, p) => acc + p.length, 0);
    const compressedData = new Uint8Array(totalIdatLen);
    let cur = 0;
    for (const p of idatParts) {
      compressedData.set(p, cur);
      cur += p.length;
    }

    if (typeof DecompressionStream === "undefined") return null;

    const ds = new DecompressionStream("deflate");
    const writer = ds.writable.getWriter();
    writer.write(compressedData);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const raw = new Uint8Array(totalLen);
    let rCur = 0;
    for (const c of chunks) {
      raw.set(c, rCur);
      rCur += c.length;
    }

    const stride = 1 + width * 4;
    if (raw.length !== stride * height) return null;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    const prevRow = new Uint8Array(width * 4);
    const curRow = new Uint8Array(width * 4);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * stride;
      const filter = raw[rowOffset];

      for (let x = 0; x < width; x++) {
        const pxIdx = x * 4;
        const rawIdx = rowOffset + 1 + pxIdx;

        for (let c = 0; c < 4; c++) {
          const rawVal = raw[rawIdx + c];
          const a = x > 0 ? curRow[pxIdx - 4 + c] : 0;
          const b = prevRow[pxIdx + c];
          const d = x > 0 ? prevRow[pxIdx - 4 + c] : 0;

          let val = 0;
          if (filter === 0) val = rawVal;
          else if (filter === 1) val = (rawVal + a) & 0xff;
          else if (filter === 2) val = (rawVal + b) & 0xff;
          else if (filter === 3) val = (rawVal + Math.floor((a + b) / 2)) & 0xff;
          else if (filter === 4) {
            const p = a + b - d;
            const pa = Math.abs(p - a);
            const pb = Math.abs(p - b);
            const pc = Math.abs(p - d);
            const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : d;
            val = (rawVal + pr) & 0xff;
          }
          curRow[pxIdx + c] = val;
        }

        const alpha = curRow[pxIdx + 3];
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      prevRow.set(curRow);
    }

    if (minX > maxX || minY > maxY) return null;

    return { minX, maxX, minY, maxY, width, height };
  } catch {
    return null;
  }
}
`;

if (!content.includes('function findPngContentBounds')) {
  content = content.replace(
    'async function embedImageSafely(pdfDoc: PDFDocument, bytes: Uint8Array) {',
    helperCode + '\nasync function embedImageSafely(pdfDoc: PDFDocument, bytes: Uint8Array) {'
  );
}

// 3. Update signature drawing in closing section
const oldSigBlock = `  // Signature box (Target width: 150-180 pt, height: 45-60 pt, maintaining original aspect ratio)
  const sigW = 190;
  const sigX = rightX - sigW;
  const sigLineY = closeY - 54;

  const effectiveSigBytes =
    resolveImageBytes(data.signatureSrc) || resolveImageBytes(data.signatureBytes);

  if (effectiveSigBytes && effectiveSigBytes.length > 0) {
    try {
      const sigImg = await embedImageSafely(pdfDoc, effectiveSigBytes);
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
  }`;

const newSigBlock = `  // Signature box (Target width: 150-180 pt, height: 45-60 pt, with auto-padding removal)
  const sigW = 190;
  const sigX = rightX - sigW;
  const sigLineY = closeY - 54;

  const effectiveSigBytes =
    resolveImageBytes(data.signatureSrc) || resolveImageBytes(data.signatureBytes);

  if (effectiveSigBytes && effectiveSigBytes.length > 0) {
    try {
      const sigImg = await embedImageSafely(pdfDoc, effectiveSigBytes);
      const bounds = await findPngContentBounds(effectiveSigBytes);
      const targetMaxW = 165;
      const targetMaxH = 50;

      if (bounds && (bounds.maxX - bounds.minX > 10) && (bounds.maxY - bounds.minY > 5)) {
        // Tight bounding box of visible signature handwriting
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

        currentPage.pushOperators(
          pushGraphicsState(),
          rectangle(targetX, targetY, drawW, drawH),
          clip(),
          endPath()
        );

        currentPage.drawImage(sigImg, {
          x: imgDrawX,
          y: imgDrawY,
          width: fullImgW,
          height: fullImgH,
        });

        currentPage.pushOperators(popGraphicsState());
      } else {
        // Fallback: standard aspect ratio containment
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
      }
    } catch (sigErr) {
      console.warn("Could not embed handwritten signature PNG:", sigErr);
    }
  }`;

content = content.replace(oldSigBlock, newSigBlock);
fs.writeFileSync(filePath, content);
console.log('Successfully updated convex/pdfReceipt.ts with auto-padding removal');

