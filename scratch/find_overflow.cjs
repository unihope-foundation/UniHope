const { chromium } = require('@playwright/test');

async function findOverflow() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('https://unihopefoundation.org', { waitUntil: 'networkidle' });

  const wideElements = await page.evaluate(() => {
    const results = [];
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > 320 || el.offsetWidth > 320 || el.scrollWidth > 320) {
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className ? String(el.className).substring(0, 80) : '',
          scrollWidth: el.scrollWidth,
          offsetWidth: el.offsetWidth,
          rectRight: rect.right
        });
      }
    }
    return results.slice(0, 10);
  });

  console.log('Wide elements on 320px screen:');
  console.log(JSON.stringify(wideElements, null, 2));
  await browser.close();
}

findOverflow().catch(console.error);

