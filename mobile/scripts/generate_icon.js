const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPNG(width, height, pixelFn) {
  // RGBA buffer: (width * 4 + 1) * height (1 filter byte per scanline)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[idx] = r;
      rawData[idx + 1] = g;
      rawData[idx + 2] = b;
      rawData[idx + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcBuf);
  const crcOut = Buffer.alloc(4);
  crcOut.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuf, data, crcOut]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate luxury muscle man fitness icon
function renderMuscleIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Base background: Deep obsidian #070B12
  let r = 7, g = 11, b = 18, a = 255;

  const R = w * 0.42; // Outer shield radius

  // Outer glowing ring
  if (dist <= R + 6 && dist >= R - 4) {
    const ringT = 1 - Math.abs(dist - R) / 6;
    return [0, 245, 155, Math.floor(255 * ringT)]; // #00F59B
  }

  // Inside shield badge
  if (dist < R) {
    // Subtle radial gradient inside shield
    const grad = 1 - dist / R;
    r = Math.floor(15 + grad * 12);
    g = Math.floor(22 + grad * 15);
    b = Math.floor(38 + grad * 20);

    // Muscle Arm / Flexing Silhouette Drawing
    // Normalize coordinates -1 to 1 around center
    const nx = dx / (R * 0.7);
    const ny = dy / (R * 0.7);

    // Flexed bicep curve + forearm + fist geometry
    // Upper arm (horizontal oval)
    const upperArm = Math.pow((nx + 0.15) / 0.55, 2) + Math.pow((ny - 0.2) / 0.28, 2);
    // Bicep peak (rounded top peak)
    const bicepPeak = Math.pow((nx + 0.05) / 0.35, 2) + Math.pow((ny + 0.02) / 0.32, 2);
    // Forearm angled upward to fist
    const forearmX = (nx - 0.35) * 0.85 - (ny + 0.25) * 0.52;
    const forearmY = (nx - 0.35) * 0.52 + (ny + 0.25) * 0.85;
    const forearm = Math.pow(forearmX / 0.26, 2) + Math.pow(forearmY / 0.48, 2);
    // Clenched Fist at top right
    const fist = Math.pow((nx - 0.22) / 0.22, 2) + Math.pow((ny + 0.45) / 0.22, 2);
    // Shoulder base at bottom left
    const shoulder = Math.pow((nx + 0.52) / 0.28, 2) + Math.pow((ny - 0.12) / 0.35, 2);

    const isMuscle = upperArm <= 1.0 || bicepPeak <= 1.0 || forearm <= 1.0 || fist <= 1.0 || shoulder <= 1.0;

    if (isMuscle) {
      // Glowing neon emerald & gold gradient for muscle silhouette
      const muscleGlow = (ny + 0.6) / 1.2;
      return [
        Math.floor(0 * (1 - muscleGlow) + 255 * muscleGlow * 0.2),
        Math.floor(245 * (1 - muscleGlow) + 215 * muscleGlow),
        Math.floor(155 * (1 - muscleGlow) + 0),
        255
      ];
    }

    // Inner subtle glow border
    if (dist >= R - 6) {
      return [0, 245, 155, 180];
    }
  }

  return [r, g, b, a];
}

console.log('Generating luxury muscle icons...');
const icon512 = createPNG(512, 512, renderMuscleIcon);
const assetsDir = path.join(__dirname, '..', 'assets');

fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon512);
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), icon512);
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), icon512);
console.log('Successfully generated muscle man icons in mobile/assets/');

