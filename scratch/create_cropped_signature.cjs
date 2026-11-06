const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function run() {
  const bytes = fs.readFileSync('scratch/prod_signature.png');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);

  let offset = 8;
  const idatParts = [];
  while (offset < bytes.length) {
    const chunkLen = view.getUint32(offset);
    const chunkType = String.fromCharCode(
      bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]
    );
    if (chunkType === 'IDAT') {
      idatParts.push(bytes.subarray(offset + 8, offset + 8 + chunkLen));
    }
    offset += 12 + chunkLen;
  }

  const raw = zlib.inflateSync(Buffer.concat(idatParts));
  const stride = 1 + width * 4;
  const prevRow = new Uint8Array(width * 4);
  const curRow = new Uint8Array(width * 4);
  const uncompressedRows = [];

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    const filter = raw[rowOffset];
    const rowPixels = new Uint8Array(width * 4);

    for (let x = 0; x < width; x++) {
      const pxIdx = x * 4;
      const rawIdx = rowOffset + 1 + pxIdx;

      for (let c = 0; c < 4; c++) {
        const rawVal = raw[rawIdx + c];
        const a = x > 0 ? rowPixels[pxIdx - 4 + c] : 0;
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
        rowPixels[pxIdx + c] = val;
      }

      const alpha = rowPixels[pxIdx + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    prevRow.set(rowPixels);
    uncompressedRows.push(rowPixels);
  }

  console.log('Stroke bounds:', { minX, maxX, minY, maxY, w: maxX - minX + 1, h: maxY - minY + 1 });

  // Add 6px padding around strokes
  const pad = 6;
  const cropMinX = Math.max(0, minX - pad);
  const cropMaxX = Math.min(width - 1, maxX + pad);
  const cropMinY = Math.max(0, minY - pad);
  const cropMaxY = Math.min(height - 1, maxY + pad);

  const cropW = cropMaxX - cropMinX + 1;
  const cropH = cropMaxY - cropMinY + 1;

  console.log('Cropped bounds:', { cropMinX, cropMaxX, cropMinY, cropMaxY, cropW, cropH });

  // Build raw uncompressed rows for cropped image (filter type 0 for all rows)
  const croppedRaw = Buffer.alloc((1 + cropW * 4) * cropH);
  let wOffset = 0;
  for (let y = cropMinY; y <= cropMaxY; y++) {
    croppedRaw[wOffset++] = 0; // Filter 0 (None)
    const srcRow = uncompressedRows[y];
    for (let x = cropMinX; x <= cropMaxX; x++) {
      const srcPx = x * 4;
      croppedRaw[wOffset++] = srcRow[srcPx];     // R
      croppedRaw[wOffset++] = srcRow[srcPx + 1]; // G
      croppedRaw[wOffset++] = srcRow[srcPx + 2]; // B
      croppedRaw[wOffset++] = srcRow[srcPx + 3]; // A
    }
  }

  const deflated = zlib.deflateSync(croppedRaw, { level: 9 });

  const sigHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cropW, 0);
  ihdr.writeUInt32BE(cropH, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const finalPng = Buffer.concat([sigHeader, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync('scratch/cropped_signature.png', finalPng);
  console.log('Saved scratch/cropped_signature.png, bytes:', finalPng.length);
}

run();

