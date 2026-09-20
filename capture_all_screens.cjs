const { chromium } = require('./apps/web/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina 2x for ultra-crisp screenshots
  });
  const page = await context.newPage();

  console.log('1. Capturing Landing Page...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('cm_demo'));
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide1_landing.png'), fullPage: false });
    console.log('Saved slide1_landing.png');
  } catch (e) {
    console.error('Error on landing:', e.message);
  }

  console.log('2. Capturing List Waste...');
  try {
    await page.goto('http://localhost:5173/list-waste?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide2_list_waste.png') });
    console.log('Saved slide2_list_waste.png');
  } catch (e) {
    console.error('Error on list-waste:', e.message);
  }

  console.log('3. Capturing Listings & Passport...');
  try {
    await page.goto('http://localhost:5173/listings?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide2_listings.png') });

    // Try passport on first listing
    const passportLink = await page.$('a[href*="passport"]');
    if (passportLink) {
      await passportLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, 'slide2_passport.png') });
      console.log('Saved slide2_passport.png');
    }
  } catch (e) {
    console.error('Error on listings/passport:', e.message);
  }

  console.log('4. Capturing Seller & Buyer Dashboards...');
  try {
    await page.goto('http://localhost:5173/dashboard?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide3_seller_dashboard.png') });
    console.log('Saved slide3_seller_dashboard.png');

    await page.goto('http://localhost:5173/dashboard?demo=buyer', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide3_buyer_dashboard.png') });
    console.log('Saved slide3_buyer_dashboard.png');
  } catch (e) {
    console.error('Error on dashboards:', e.message);
  }

  console.log('5. Capturing Match Details / Match Breakdown...');
  try {
    await page.goto('http://localhost:5173/dashboard?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const matchLink = await page.$('a[href*="match"]');
    if (matchLink) {
      await matchLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, 'slide4_match_detail.png') });
      console.log('Saved slide4_match_detail.png via click');
    } else {
      await page.goto('http://localhost:5173/matches/mat-1?demo=seller', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, 'slide4_match_detail.png') });
      console.log('Saved slide4_match_detail.png direct');
    }
  } catch (e) {
    console.error('Error on matches:', e.message);
  }

  console.log('6. Capturing Impact & Economics...');
  try {
    await page.goto('http://localhost:5173/impact?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide5_impact.png') });
    console.log('Saved slide5_impact.png');
  } catch (e) {
    console.error('Error on impact:', e.message);
  }

  console.log('7. Capturing Admin Config...');
  try {
    await page.goto('http://localhost:5173/admin?demo=admin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'slide6_admin.png') });
    console.log('Saved slide6_admin.png');
  } catch (e) {
    console.error('Error on admin:', e.message);
  }

  console.log('8. Capturing Delhi NCR Map / Passport Detail for Slide 7...');
  try {
    await page.goto('http://localhost:5173/map?demo=seller', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, 'slide7_map.png') });
    console.log('Saved slide7_map.png');
  } catch (e) {
    console.error('Error on map:', e.message);
  }

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture();
