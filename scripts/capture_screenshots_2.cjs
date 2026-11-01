const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const OUTPUT_DIR = path.join(__dirname, '..', 'report_screenshots_2');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWU3MzEwZDI1YWRmNmFmZGQwZGRhMzEiLCJpYXQiOjE3OTM1MzYyNzEsImV4cCI6MTc5NDE0MTA3MX0.mAyyqgTw5ZApM3t45nUswuEBbFkLoAolk6AhcgMXHVA';
const user = { id: '6ae7310d25adf6afdd0dda31', name: 'Vikrant Tewatia', email: 'report_demo@example.com' };
const projectId = '6ae7311f25adf6afdd0dda37';
const BASE_URL = 'https://ppt-gen-two.vercel.app';

async function run() {
  console.log('Launching Puppeteer Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Landing Page
  console.log('1. Capturing Landing Page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '1_landing.png') });

  // 2. Authentication Page (Login)
  console.log('2. Capturing Login Page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '2_auth.png') });

  // Authenticate user in localStorage
  await page.evaluate((tok, usr) => {
    localStorage.setItem('pptgen_token', tok);
    localStorage.setItem('pptgen_user', JSON.stringify(usr));
  }, token, user);

  // 3. Projects Dashboard
  console.log('3. Capturing Dashboard...');
  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '3_dashboard.png') });

  // 4. AI Generator Modal
  console.log('4. Capturing AI Generator Modal...');
  const aiBtn = await page.$('button.btn-ai');
  if (aiBtn) {
    await aiBtn.click();
    await new Promise(r => setTimeout(r, 500));
    // Type a demo topic
    await page.type('input[placeholder*="topic" i], input[type="text"]', 'Next-Gen Quantum Computing & Neural Accelerators');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '4_ai_modal.png') });

    // Close modal by clicking Cancel
    const cancelBtn = await page.$('button.btn-outline, button.btn-secondary, .modal-footer button:first-child');
    if (cancelBtn) await cancelBtn.click();
  }

  // 5. Presentation Editor
  console.log('5. Capturing Presentation Editor...');
  await page.goto(`${BASE_URL}/editor/${projectId}`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '5_editor_split.png') });

  // 6. Phase 4 Fullscreen Present Mode
  console.log('6. Capturing Fullscreen Present Mode...');
  // Click Present button in top navbar
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Present')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '6_present_mode.png') });

  // Press Escape to exit present mode
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 800));

  // 7. Streamlined 5-Format Export Modal
  console.log('7. Capturing Streamlined Export Modal...');
  const exportButtons = await page.$$('button');
  for (const b of exportButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('Export')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '7_export_modal.png') });

  console.log('All screenshots captured successfully in report_screenshots_2!');
  await browser.close();
}

run().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
