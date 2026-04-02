import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });

  // Visit actual detail page with correct URL pattern
  await page.goto('https://truyenqqno.com/truyen-tranh/dai-quan-gia-la-ma-hoang-7015', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);
  console.log('Title:', await page.title());
  console.log('URL:', page.url());

  const data = await page.evaluate(() => {
    // Get the main content area after header
    const el = (sel: string) => document.querySelector(sel);
    const els = (sel: string) => Array.from(document.querySelectorAll(sel));

    // Try known detail selectors
    const selectors = [
      '.book_detail',
      '.book_info',
      '.detail-info',
      '.story-detail',
      '.manga-info',
      '.comic-info',
      '.book_other',
      '.book_name',
      '.list_chapter',
      '.list-chapter',
      '.works-chapter-list',
      '.book_avatar',
      '.book_desc',
      '.story-detail-info',
    ];

    const found: Record<string, string> = {};
    for (const sel of selectors) {
      const e = el(sel);
      if (e) found[sel] = e.textContent?.substring(0, 200)?.trim() || '(exists but empty)';
    }

    // Get ALL classes with 'book' or 'detail' or 'chapter' or 'story'
    const relevantEls = els(
      '[class*="book"], [class*="detail"], [class*="chapter"], [class*="story"], [class*="list_chapter"]',
    );
    const relevantClasses = relevantEls.map((e) => ({
      tag: e.tagName,
      class: e.className.toString().substring(0, 120),
      text: e.textContent?.substring(0, 100)?.trim() || '',
    }));

    // Get the full page HTML around the main area
    const mainArea =
      el('.main_content') ||
      el('#main_content') ||
      el('.content') ||
      el('.container') ||
      el('.div_middle');
    const mainHtml = mainArea
      ? mainArea.innerHTML.substring(0, 8000)
      : document.body.innerHTML.substring(2000, 10000);

    return { found, relevantClasses: relevantClasses.slice(0, 30), mainHtml };
  });

  console.log('\n=== FOUND SELECTORS ===');
  console.log(JSON.stringify(data.found, null, 2));
  console.log('\n=== RELEVANT CLASSES ===');
  console.log(JSON.stringify(data.relevantClasses, null, 2));
  console.log('\n=== MAIN HTML ===');
  console.log(data.mainHtml);

  await browser.close();
}
inspect().catch(console.error);
