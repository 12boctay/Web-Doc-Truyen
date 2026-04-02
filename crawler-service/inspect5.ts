import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });

  await page.goto('https://truyenqqno.com/truyen-tranh/dai-quan-gia-la-ma-hoang-7015', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(3000);
  console.log('Title:', await page.title());

  // Get selectors
  const found = await page.evaluate(() => {
    var selectors = [
      '.book_detail',
      '.book_info',
      '.detail-info',
      '.story-detail',
      '.book_other',
      '.book_name',
      '.list_chapter',
      '.list-chapter',
      '.works-chapter-list',
      '.book_avatar',
      '.book_desc',
      '.story-detail-info',
    ];
    var result = {};
    for (var i = 0; i < selectors.length; i++) {
      var e = document.querySelector(selectors[i]);
      if (e) (result as any)[selectors[i]] = e.textContent?.substring(0, 150)?.trim() || '(empty)';
    }
    return result;
  });
  console.log('\n=== FOUND SELECTORS ===');
  console.log(JSON.stringify(found, null, 2));

  // Get relevant classes
  const classes = await page.evaluate(() => {
    var els = document.querySelectorAll(
      '[class*="book"], [class*="detail"], [class*="chapter"], [class*="story"]',
    );
    var result = [];
    for (var i = 0; i < Math.min(els.length, 30); i++) {
      result.push({
        tag: els[i].tagName,
        cls: els[i].className.toString().substring(0, 120),
        txt: els[i].textContent?.substring(0, 80)?.trim() || '',
      });
    }
    return result;
  });
  console.log('\n=== RELEVANT CLASSES ===');
  console.log(JSON.stringify(classes, null, 2));

  // Get main HTML
  const html = await page.evaluate(() => {
    var main =
      document.querySelector('.book_detail') ||
      document.querySelector('.detail') ||
      document.querySelector('main');
    if (main) return main.outerHTML.substring(0, 6000);
    return document.body.innerHTML.substring(3000, 9000);
  });
  console.log('\n=== HTML ===');
  console.log(html);

  // Get chapter page HTML
  const chapterHtml = await page.evaluate(() => {
    var chList =
      document.querySelector('.list_chapter') ||
      document.querySelector('.list-chapter') ||
      document.querySelector('[class*="chapter"]');
    if (chList) return chList.outerHTML.substring(0, 3000);
    return 'NOT FOUND';
  });
  console.log('\n=== CHAPTER LIST HTML ===');
  console.log(chapterHtml);

  await browser.close();
}
inspect().catch(console.error);
