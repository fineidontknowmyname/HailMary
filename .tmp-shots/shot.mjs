import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '.tmp-shots/dark.png', fullPage: false });

// toggle to light mode via the sun/moon button in the header
const toggle = page.locator('button[aria-label="Switch to light mode"]');
await toggle.click({ timeout: 5000 }).catch(async () => {
  console.log('dark toggle button not found by that label, trying the other label');
});
await page.waitForTimeout(800);
await page.screenshot({ path: '.tmp-shots/light.png', fullPage: false });

const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
console.log('BODY TEXT SAMPLE:', bodyText);

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

await browser.close();
console.log('DONE');
