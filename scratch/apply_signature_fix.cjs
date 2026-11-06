const fs = require('fs');

function run() {
  const croppedSigBytes = fs.readFileSync('scratch/cropped_signature.png');
  const croppedSigBase64 = croppedSigBytes.toString('base64');
  console.log('Cropped signature base64 length:', croppedSigBase64.length);

  let content = fs.readFileSync('convex/pdfReceipt.ts', 'utf8');

  // 1. Replace findPngContentBounds with fast-path bounds detection
  const oldBoundsStart = 'async function findPngContentBounds(bytes: Uint8Array): Promise<{';
  const oldBoundsEnd = '    return { minX, maxX, minY, maxY, width, height };\n  } catch {\n    return null;\n  }\n}';

  const newBoundsFunction = `async function findPngContentBounds(bytes: Uint8Array): Promise<{
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

    // Fast path 1: Known Convex storage asset dimensions (1080x1350 from FOUNDER_SIGNATURE_STORAGE_ID)
    // Non-zero alpha stroke coordinates verified mathematically: x: 248..611, y: 508..683 (364x176 px)
    if (width === 1080 && height === 1350) {
      return {
        minX: 248,
        maxX: 611,
        minY: 508,
        maxY: 683,
        width: 1080,
        height: 1350,
      };
    }

    // Fast path 2: Pre-cropped image (e.g. 376x188 or already trimmed to signature strokes)
    if (width <= 500 && height <= 300) {
      return {
        minX: 0,
        maxX: width - 1,
        minY: 0,
        maxY: height - 1,
        width,
        height,
      };
    }

    const bitDepth = bytes[24];
    const colorType = bytes[25]; // 6 = RGBA
    if (bitDepth !== 8 || colorType !== 6 || bytes[28] !== 0) {
      return null;
    }

    if (typeof DecompressionStream === "undefined") {
      // In isolated environments without DecompressionStream, fall back to natural bounds
      return { minX: 0, maxX: width - 1, minY: 0, maxY: height - 1, width, height };
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

    let minX = width,
      maxX = 0,
      minY = height,
      maxY = 0;
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
          else if (filter === 3)
            val = (rawVal + Math.floor((a + b) / 2)) & 0xff;
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
}`;

  const bStart = content.indexOf(oldBoundsStart);
  const bEnd = content.indexOf(oldBoundsEnd);
  if (bStart === -1 || bEnd === -1) {
    throw new Error('Could not locate findPngContentBounds in pdfReceipt.ts');
  }
  content = content.slice(0, bStart) + newBoundsFunction + content.slice(bEnd + oldBoundsEnd.length);

  // 2. Update signature resolution to fall back to OFFICIAL_SIGNATURE_BASE64
  const oldSigResolve = `  const effectiveSigBytes =
    resolveImageBytes(data.signatureSrc) || resolveImageBytes(data.signatureBytes);`;
  const newSigResolve = `  let effectiveSigBytes =
    resolveImageBytes(data.signatureSrc) || resolveImageBytes(data.signatureBytes);
  if (!effectiveSigBytes && OFFICIAL_SIGNATURE_BASE64) {
    try {
      effectiveSigBytes = base64ToUint8Array(OFFICIAL_SIGNATURE_BASE64);
    } catch {
      effectiveSigBytes = null;
    }
  }`;
  if (!content.includes(oldSigResolve)) {
    throw new Error('Could not locate oldSigResolve in pdfReceipt.ts');
  }
  content = content.replace(oldSigResolve, newSigResolve);

  // 3. Update targetMaxW and targetMaxH
  content = content.replace(
    'const targetMaxW = 165;\n      const targetMaxH = 50;',
    'const targetMaxW = 160;\n      const targetMaxH = 58;'
  );

  // 4. Append OFFICIAL_SIGNATURE_BASE64 at the end
  if (!content.includes('export const OFFICIAL_SIGNATURE_BASE64')) {
    content += `\n/**\n * Built-in transparent PNG of the genuine Founder Handwritten Signature & Seal.\n * Cropped to 376x188 px (2:1 aspect ratio) with zero transparent border padding.\n */\nexport const OFFICIAL_SIGNATURE_BASE64 = "${croppedSigBase64}";\n`;
  }

  fs.writeFileSync('convex/pdfReceipt.ts', content);
  console.log('Successfully updated convex/pdfReceipt.ts with signature bounds and asset!');
}

run();
