/*
  Generates the extension icons with Node stdlib only (zlib for PNG deflate).
  Design: a "prohibited" sign (red ring + diagonal slash) on a dark field —
  the shut mouth. Run: node scripts/generate-icons.js
*/

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const CRC_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

// A clenched monstrous mouth: interlocking bone-white fangs over a blood-red
// gullet, on a dark frame. Top fangs point down, bottom fangs point up and are
// offset by half a tooth so they interlock past the center line.
function draw(n) {
  const buf = Buffer.alloc(n * n * 4);
  const cy = (n - 1) / 2;

  const margin = Math.round(n * 0.09);
  const left = margin;
  const right = n - margin;
  const top = margin;
  const bot = n - margin;
  const w = right - left;

  const k = 4; // teeth across
  const tw = w / k; // tooth slot width
  const sep = Math.max(1, n * 0.035); // red gap between adjacent teeth
  const mouthHalf = Math.max(1.2, n * 0.06); // half-thickness of the central mouth line
  const lip = Math.max(1, n * 0.04); // thin red lip just inside the frame
  const fang = n * 0.16; // how far the pointed inner tips reach past the mouth line

  const FRAME = [10, 1, 1];
  const GULLET = [122, 10, 10];
  const TOOTH = [240, 233, 214];

  function plot(buf, i, c) {
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
    buf[i + 3] = 255;
  }

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;

      // Dark frame outside the mouth box.
      if (x < left || x >= right || y < top || y >= bot) {
        plot(buf, i, FRAME);
        continue;
      }

      let col = TOOTH;
      const relx = x - left;
      const modx = relx % tw; // position within this tooth slot
      const distToCenter = Math.abs(modx - tw / 2); // 0 at tooth center

      // Red vertical separators between teeth.
      if (modx < sep / 2 || modx > tw - sep / 2) col = GULLET;

      // Thin red lips just inside the frame.
      if (y < top + lip || y >= bot - lip) col = GULLET;

      // Central mouth line, with each tooth dipping to a point toward it
      // (upper teeth point down, lower teeth point up) so they read as fangs.
      const point = mouthHalf + fang * (1 - distToCenter / (tw / 2));
      if (Math.abs(y - cy) <= point) col = GULLET;

      plot(buf, i, col);
    }
  }
  return buf;
}

const outDir = path.join(__dirname, "..", "icons");
fs.mkdirSync(outDir, { recursive: true });

[16, 32, 48, 128].forEach(function (size) {
  const png = encodePng(size, size, draw(size));
  const file = path.join(outDir, "icon" + size + ".png");
  fs.writeFileSync(file, png);
  console.log("wrote", file, png.length + "b");
});
