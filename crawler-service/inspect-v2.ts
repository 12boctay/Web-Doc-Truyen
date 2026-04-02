import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const domain = 'truyenqq.com.vn';

  // === STEP 1: Homepage ===
  console.log('=== STEP 1: HOMEPAGE ===');
  await page.goto(`https://${domain}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  console.log('Title:', await page.title());
  console.log('URL:', page.url());

  // Get ALL links to understand URL patterns
  const homeData = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const patterns = new Map<string, string[]>();

    for (const a of links) {
      const href = a.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      // Extract path pattern
      try {
        const url = new URL(href, window.location.origin);
        const pathParts = url.pathname.split('/').filter(Boolean);
        const pattern = pathParts.length > 0 ? `/${pathParts[0]}/...` : '/';
        if (!patterns.has(pattern)) patterns.set(pattern, []);
        const arr = patterns.get(pattern)!;
        if (arr.length < 3) arr.push(href.substring(0, 120));
      } catch {}
    }

    const result: Record<string, string[]> = {};
    for (const [k, v] of patterns) result[k] = v;

    // Get first 20 unique links
    const uniqueLinks = [...new Set(links.map(a => a.getAttribute('href')))].filter(Boolean).slice(0, 30);

    // HTML structure overview
    const bodyChildren = Array.from(document.body.children).map(el => ({
      tag: el.tagName,
      cls: el.className.toString().substring(0, 80),
      id: el.id || '',
    }));

    // All images on page
    const imgs = Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
      src: (img as HTMLImageElement).src?.substring(0, 120),
      cls: img.className,
      alt: (img as HTMLImageElement).alt?.substring(0, 50),
    }));

    return { patterns: result, uniqueLinks, bodyChildren, imgs };
  });

  console.log('\n--- URL PATTERNS ---');
  for (const [pattern, examples] of Object.entries(homeData.patterns)) {
    console.log(`  ${pattern}:`);
    for (const ex of examples) console.log(`    ${ex}`);
  }
  console.log('\n--- ALL LINKS (first 30) ---');
  homeData.uniqueLinks.forEach(l => console.log(`  ${l}`));
  console.log('\n--- BODY CHILDREN ---');
  console.log(JSON.stringify(homeData.bodyChildren, null, 2));
  console.log('\n--- IMAGES ---');
  console.log(JSON.stringify(homeData.imgs, null, 2));

  // Get full HTML to analyze
  const fullHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 15000));
  console.log('\n--- FULL HTML (15000 chars) ---');
  console.log(fullHtml);

  // === STEP 2: Search for a comic ===
  console.log('\n\n=== STEP 2: SEARCH ===');
  // Try search URL patterns
  const searchUrls = [
    `https://${domain}/tim-kiem?q=one+punch+man`,
    `https://${domain}/tim-kiem/trang-1.html?q=one+punch+man`,
    `https://${domain}/search?q=one+punch+man`,
  ];

  for (const searchUrl of searchUrls) {
    console.log(`\nTrying search: ${searchUrl}`);
    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      console.log('  Title:', await page.title());
      console.log('  URL:', page.url());

      const results = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return links.filter(a => {
          const text = a.textContent?.trim() || '';
          return text.length > 5 && text.length < 100;
        }).slice(0, 10).map(a => ({
          href: a.getAttribute('href')?.substring(0, 120),
          text: a.textContent?.trim()?.substring(0, 80),
          cls: a.className?.substring(0, 60),
        }));
      });
      console.log('  Results:', JSON.stringify(results, null, 2));
      if (results.length > 2) break;
    } catch (e: any) {
      console.log('  FAIL:', e.message?.substring(0, 80));
    }
  }

  // === STEP 3: Navigate to a comic detail page ===
  console.log('\n\n=== STEP 3: COMIC DETAIL ===');
  // Try to find and click on any comic link from homepage
  const comicLink = await page.evaluate(() => {
    // Find links that look like comic detail pages (have text and image)
    const containers = Array.from(document.querySelectorAll('a[href]'));
    for (const a of containers) {
      const href = a.getAttribute('href') || '';
      const hasImg = a.querySelector('img') !== null;
      const text = a.textContent?.trim() || '';
      if (hasImg && text.length > 3 && text.length < 100 && !href.includes('#') && !href.includes('javascript:')) {
        return { href, text: text.substring(0, 80) };
      }
    }
    // Fallback: any link with reasonable text
    for (const a of containers) {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || '';
      if (href.length > 20 && text.length > 5 && text.length < 80 && !href.includes('#')) {
        return { href, text: text.substring(0, 80) };
      }
    }
    return null;
  });

  if (comicLink) {
    const detailUrl = comicLink.href.startsWith('http') ? comicLink.href : `https://${domain}${comicLink.href}`;
    console.log(`Navigating to: ${detailUrl} (${comicLink.text})`);
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('Title:', await page.title());
    console.log('URL:', page.url());

    const detailHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 15000));
    console.log('\n--- DETAIL PAGE HTML (15000 chars) ---');
    console.log(detailHtml);
  } else {
    console.log('No comic link found on the page');
  }

  await browser.close();
  console.log('\n✓ Done!');
}

inspect().catch(console.error);
