const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SVG_PATH = path.join(__dirname, '..', 'public', 'favicon.svg');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function createIcoFromPngBuffers(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  const datas = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset

    entries.push(entry);
    datas.push(item.buffer);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...datas]);
}

async function run() {
  const svgContent = fs.readFileSync(SVG_PATH, 'utf8');
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          svg {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--default-background-color=00000000']
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + SVG_PATH.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  // 180x180 Apple Touch Icon
  await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
  const buf180 = await page.screenshot({ omitBackground: true, type: 'png' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), buf180);
  console.log('Generated apple-touch-icon.png (180x180)');

  // 32x32 PNG
  await page.setViewport({ width: 32, height: 32, deviceScaleFactor: 1 });
  const buf32 = await page.screenshot({ omitBackground: true, type: 'png' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), buf32);
  console.log('Generated favicon-32x32.png (32x32)');

  // 16x16 PNG
  await page.setViewport({ width: 16, height: 16, deviceScaleFactor: 1 });
  const buf16 = await page.screenshot({ omitBackground: true, type: 'png' });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), buf16);
  console.log('Generated favicon-16x16.png (16x16)');

  // Create favicon.ico containing 16x16 and 32x32
  const icoBuffer = createIcoFromPngBuffers([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 }
  ]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (16x16 & 32x32)');

  await browser.close();
  console.log('All favicon assets generated successfully!');
}

run().catch(err => {
  console.error('Error generating favicon assets:', err);
  process.exit(1);
});
