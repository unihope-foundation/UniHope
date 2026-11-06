const fs = require('fs');

async function findPngContentBounds(bytes) {
  try {
    if (!bytes || bytes.length < 33) return null;
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
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

    if (idatParts.length === 0) return null;

    const totalIdatLen = idatParts.reduce((acc, p) => acc + p.length, 0);
    const compressedData = new Uint8Array(totalIdatLen);
    let cur = 0;
    for (const p of idatParts) {
      compressedData.set(p, cur);
      cur += p.length;
    }

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
    if (raw.length !== stride * height) return null;

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
  } catch (err) {
    return null;
  }
}

async function run() {
  const logoBytes = fs.readFileSync('scratch/logo_512.png');
  const b = await findPngContentBounds(logoBytes);
  console.log('Logo bounds:', b);
}
run();

