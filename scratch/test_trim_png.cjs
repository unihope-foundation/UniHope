// Helper to trim transparent borders from a standard 8-bit RGBA PNG
async function trimPngTransparentPadding(bytes) {
  try {
    if (!bytes || bytes.length < 33) return bytes;
    // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) {
      return bytes;
    }

    // Read IHDR chunk (starts at byte 8)
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    const bitDepth = bytes[24];
    const colorType = bytes[25]; // 6 = RGBA

    // Only process 8-bit RGBA non-interlaced PNG
    if (bitDepth !== 8 || colorType !== 6 || bytes[28] !== 0) {
      return bytes;
    }

    // Extract all IDAT chunks
    let offset = 8;
    const idatParts = [];
    while (offset < bytes.length) {
      const chunkLen = view.getUint32(offset);
      const chunkType = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7]
      );
      if (chunkType === 'IDAT') {
        idatParts.push(bytes.subarray(offset + 8, offset + 8 + chunkLen));
      }
      offset += 12 + chunkLen;
    }

    if (idatParts.length === 0) return bytes;

    // Concatenate IDAT data
    const totalIdatLen = idatParts.reduce((acc, p) => acc + p.length, 0);
    const compressedData = new Uint8Array(totalIdatLen);
    let cur = 0;
    for (const p of idatParts) {
      compressedData.set(p, cur);
      cur += p.length;
    }

    // Decompress raw scanlines (zlib format)
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(compressedData);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const raw = new Uint8Array(totalLen);
    let rCur = 0;
    for (const c of chunks) {
      raw.set(c, rCur);
      rCur += c.length;
    }

    const stride = 1 + width * 4;
    if (raw.length !== stride * height) return bytes;

    // Reconstruct un-filtered scanlines to find bounding box of alpha > 10
    let minX = width, maxX = 0, minY = height, maxY = 0;
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
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      prevRow.set(curRow);
    }

    // If completely empty or already tight
    if (minX > maxX || minY > maxY) return bytes;

    // Check padding ratio: if padding is less than 8%, keep original
    const padLeft = minX / width;
    const padRight = (width - 1 - maxX) / width;
    const padTop = minY / height;
    const padBottom = (height - 1 - maxY) / height;

    if (padLeft < 0.08 && padRight < 0.08 && padTop < 0.08 && padBottom < 0.08) {
      return bytes;
    }

    console.log(`Detected excessive transparent padding: L:${(padLeft*100).toFixed(1)}% R:${(padRight*100).toFixed(1)}% T:${(padTop*100).toFixed(1)}% B:${(padBottom*100).toFixed(1)}%`);
    return bytes;
  } catch (err) {
    console.warn('Transparent padding detection warning:', err);
    return bytes;
  }
}

module.exports = { trimPngTransparentPadding };

