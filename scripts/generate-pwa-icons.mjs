/**
 * Generates PWA install icons (public/icon-192.png, public/icon-512.png).
 *
 * Pure-pixel render (no image conversion): dark rounded-square tile with an
 * emerald checkmark on a sky accent disc. Encodes PNG with Node's built-in
 * zlib (minimal PNG writer, no external deps).
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZES = [192, 512];

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const distToSegment = (px, py, ax, ay, bx, by) => {
  const abx = bx - ax;
  const aby = by - ay;
  const t = clamp01(((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby));
  const dx = px - (ax + t * abx);
  const dy = py - (ay + t * aby);
  return Math.sqrt(dx * dx + dy * dy);
};

const inRoundedRect = (fx, fy, radius) => {
  const side = 512;
  const rr = radius * side;
  const qx = Math.abs(fx - 0.5) * side * 2;
  const qy = Math.abs(fy - 0.5) * side * 2;
  const nx = Math.max(qx - (side / 2 - rr), 0);
  const ny = Math.max(qy - (side / 2 - rr), 0);
  return Math.sqrt(nx * nx + ny * ny) <= rr;
};

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
};

const encodePng = (rgba, width, height) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const render = (size) => {
  const width = size;
  const height = size;
  const data = Buffer.alloc(width * height * 4);

  const TILE = [15, 23, 42]; // slate-900
  const DISC = [14, 165, 233]; // sky-500
  const CHECK = [34, 197, 94]; // emerald-500

  const radius = 0.22;
  const discR = 0.34;
  const thickness = 0.05;
  const check = [
    [0.35, 0.52],
    [0.47, 0.63],
    [0.66, 0.39],
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const fx = x / width;
      const fy = y / height;
      const idx = (y * width + x) * 4;

      if (!inRoundedRect(fx, fy, radius)) {
        data[idx + 3] = 0;
        continue;
      }

      let rgb = TILE;

      const cx = fx - 0.5;
      const cy = fy - 0.5;
      if (Math.sqrt(cx * cx + cy * cy) <= discR) {
        rgb = DISC;
      }

      const segA = distToSegment(fx, fy, check[0][0], check[0][1], check[1][0], check[1][1]);
      const segB = distToSegment(fx, fy, check[1][0], check[1][1], check[2][0], check[2][1]);
      if (Math.min(segA, segB) <= thickness) {
        rgb = CHECK;
      }

      data[idx] = rgb[0];
      data[idx + 1] = rgb[1];
      data[idx + 2] = rgb[2];
      data[idx + 3] = 255;
    }
  }

  return encodePng(data, width, height);
};

mkdirSync(dist, { recursive: true });

for (const size of SIZES) {
  const file = join(dist, `icon-${size}.png`);
  writeFileSync(file, render(size));
  // eslint-disable-next-line no-console
  console.log(`Generated ${file}`);
}