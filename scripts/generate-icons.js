import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 2; // Truecolor (RGB)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines: width * 3 bytes + 1 filter byte per row
  const rawData = Buffer.alloc(height * (width * 3 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Draw subtle rounded squircle / gradient
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const isCenter = dist < width * 0.45;
      if (isCenter) {
        rawData[offset++] = r;
        rawData[offset++] = g;
        rawData[offset++] = b;
      } else {
        rawData[offset++] = Math.max(0, r - 20);
        rawData[offset++] = Math.max(0, g - 20);
        rawData[offset++] = Math.max(0, b - 20);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const chunkType = Buffer.from(type, 'ascii');
  const body = Buffer.concat([chunkType, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calculateCRC(body), 0);

  return Buffer.concat([len, body, crc]);
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCRC(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate PWA icons in #00567c (0, 86, 124)
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 0, 86, 124));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 0, 86, 124));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 0, 86, 124));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 0, 86, 124));

console.log('Successfully generated PWA icon PNGs in public/');
