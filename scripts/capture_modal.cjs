const puppeteer = require('puppeteer-core');
const path = require('path');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWU3MzEwZDI1YWRmNmFmZGQwZGRhMzEiLCJpYXQiOjE3OTM1MzYyNzEsImV4cCI6MTc5NDE0MTA3MX0.mAyyqgTw5ZApM3t45nUswuEBbFkLoAolk6AhcgMXHVA';
const user = { id: '6ae7310d25adf6afdd0dda31', name: 'Vikrant Tewatia', email: 'report_demo@example.com' };
const BASE_URL = 'https://ppt-gen-two.vercel.app';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

  await page.evaluate((tok, usr) => {
    localStorage.setItem('pptgen_token', tok);
    localStorage.setItem('pptgen_user', JSON.stringify(usr));
  }, token, user);

  await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('AI Generate')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.type('textarea', 'Deep Space Astronomy & The James Webb Telescope');
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: path.join(__dirname, '..', 'report_screenshots_2', '4_ai_modal.png') });
  console.log('Saved 4_ai_modal.png');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
