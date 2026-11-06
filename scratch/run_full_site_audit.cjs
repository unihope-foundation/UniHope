const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.AUDIT_URL || 'https://unihopefoundation.org';

const ROUTES = [
  '/',
  '/about',
  '/our-work',
  '/donate',
  '/volunteer',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
];

const VIEWPORTS = [
  { name: 'Mobile XS', width: 320, height: 568 },
  { name: 'Mobile S', width: 375, height: 667 },
  { name: 'Mobile M', width: 430, height: 932 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop / Desktop', width: 1024, height: 768 },
  { name: 'Desktop HD', width: 1440, height: 900 },
  { name: 'Large Desktop 4K/FHD', width: 1920, height: 1080 },
];

async function runAudit() {
  console.log(`Starting comprehensive audit against: ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const auditResults = {
    target: BASE_URL,
    timestamp: new Date().toISOString(),
    routes: {},
    viewportTests: {},
    securityHeaders: {},
    interactiveTests: {},
    consoleErrors: [],
    failedRequests: []
  };

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 UNIHOPE-QA-Auditor'
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      auditResults.consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  page.on('requestfailed', request => {
    auditResults.failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown failure'
    });
  });

  // 1. Audit each route at desktop resolution
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    console.log(`Auditing Route: ${url}`);
    const routeData = {
      url,
      status: null,
      title: '',
      metaDescription: '',
      h1Count: 0,
      h1Text: [],
      images: { total: 0, missingAlt: 0, broken: 0 },
      links: { internal: 0, external: 0, broken: 0 },
      headings: []
    };

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      routeData.status = response ? response.status() : null;
      if (route === '/') {
        auditResults.securityHeaders = response ? response.headers() : {};
      }

      routeData.title = await page.title();
      routeData.metaDescription = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => 'NONE');

      const h1s = await page.$$eval('h1', els => els.map(e => e.innerText.trim()));
      routeData.h1Count = h1s.length;
      routeData.h1Text = h1s;

      // Images
      const imgData = await page.$$eval('img', imgs => {
        return imgs.map(img => ({
          src: img.src,
          alt: img.getAttribute('alt'),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete
        }));
      });
      routeData.images.total = imgData.length;
      routeData.images.missingAlt = imgData.filter(i => !i.alt || i.alt.trim() === '').length;
      routeData.images.broken = imgData.filter(i => i.complete && i.naturalWidth === 0).length;

      // Links
      const links = await page.$$eval('a[href]', anchors => anchors.map(a => a.getAttribute('href')));
      routeData.links.total = links.length;
      routeData.links.internal = links.filter(l => l && (l.startsWith('/') || l.startsWith(BASE_URL) || l.startsWith('#'))).length;
      routeData.links.external = links.filter(l => l && (l.startsWith('http') && !l.startsWith(BASE_URL))).length;

      auditResults.routes[route] = routeData;
    } catch (err) {
      console.error(`Error auditing ${route}:`, err.message);
      auditResults.routes[route] = { error: err.message };
    }
  }

  // 2. Responsive Viewport Audits (Checking for horizontal scrolling / overflow)
  console.log('\nAuditing responsive viewports for horizontal overflow...');
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const vpResults = {};

    for (const route of ['/', '/about', '/donate', '/contact']) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const overflow = await page.evaluate(() => {
          return {
            windowInnerWidth: window.innerWidth,
            docClientWidth: document.documentElement.clientWidth,
            docScrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
          };
        });
        vpResults[route] = overflow;
      } catch (e) {
        vpResults[route] = { error: e.message };
      }
    }
    auditResults.viewportTests[`${vp.width}x${vp.height} (${vp.name})`] = vpResults;
  }

  // 3. Interactive Component Testing
  console.log('\nAuditing interactive components...');

  // Test Mobile Navigation Hamburger
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const hamburgerBtn = await page.$('button[aria-label*="menu" i], button:has(svg), [data-testid="mobile-menu-btn"]');
  auditResults.interactiveTests.mobileMenu = { exists: !!hamburgerBtn };

  // Test Donation Page Form & Frequency / Amount selection
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/donate`, { waitUntil: 'networkidle' });

  const donateButtons = await page.$$eval('button', btns => btns.map(b => b.innerText.trim()).filter(Boolean));
  auditResults.interactiveTests.donateButtons = donateButtons;

  const hasCustomAmountInput = await page.$('input[name="customAmount"], input[placeholder*="amount" i], input[type="number"]');
  auditResults.interactiveTests.hasCustomAmountInput = !!hasCustomAmountInput;

  // Test Contact Page Form inputs
  await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
  const contactInputs = await page.$$eval('input, textarea, select', els => els.map(el => ({
    name: el.getAttribute('name') || el.getAttribute('id') || el.getAttribute('type'),
    tag: el.tagName.toLowerCase(),
    required: el.required
  })));
  auditResults.interactiveTests.contactFormInputs = contactInputs;

  // Test Volunteer Page Form inputs
  await page.goto(`${BASE_URL}/volunteer`, { waitUntil: 'networkidle' });
  const volunteerInputs = await page.$$eval('input, textarea, select', els => els.map(el => ({
    name: el.getAttribute('name') || el.getAttribute('id') || el.getAttribute('type'),
    tag: el.tagName.toLowerCase(),
    required: el.required
  })));
  auditResults.interactiveTests.volunteerFormInputs = volunteerInputs;

  await browser.close();

  const outPath = path.join(__dirname, 'audit_results.json');
  fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2));
  console.log(`\nAudit results written to: ${outPath}`);
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
