const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR = path.join(__dirname, '..', 'report_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Simple SPA static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    return fs.createReadStream(filePath).pipe(res);
  }

  // SPA fallback
  const indexPath = path.join(DIST_DIR, 'index.html');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(indexPath).pipe(res);
});

async function capture() {
  server.listen(3333, async () => {
    console.log('Server running at http://localhost:3333');

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

    // 1. Landing Page
    console.log('Capturing Landing Page...');
    await page.goto('http://localhost:3333/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '1_landing.png') });

    // 2. Dashboard
    console.log('Capturing Dashboard...');
    await page.goto('http://localhost:3333/projects', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '2_dashboard.png') });

    // 3. Editor
    console.log('Capturing Editor...');
    await page.goto('http://localhost:3333/editor/proj-1', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(OUTPUT_DIR, '3_editor.png') });

    // 4. Editor with slide selection
    console.log('Capturing Slide selection...');
    // Click slide 2
    const slideButtons = await page.$$('.slide-select-btn');
    if (slideButtons.length > 1) {
      await slideButtons[1].click();
      await new Promise(r => setTimeout(r, 400));
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, '4_editor_slide2.png') });

    // 5. Export Modal
    console.log('Capturing Export Modal...');
    // Click Export button
    const exportBtn = await page.$('button.btn-black');
    if (exportBtn) {
      // Find the button that has Export
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('Export')) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 600));
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, '5_export_modal.png') });

    console.log('Screenshots captured successfully!');
    await browser.close();
    server.close();
    process.exit(0);
  });
}

capture().catch(err => {
  console.error(err);
  server.close();
  process.exit(1);
});
