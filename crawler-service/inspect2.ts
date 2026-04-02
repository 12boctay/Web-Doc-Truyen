import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // First: search for One Punch Man to find the real URL
  console.log('Searching for One Punch Man...');
  await page.goto('https://truyenqqno.com/tim-kiem/trang-1.html?q=one+punch+man', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const searchResults = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/truyen-tranh/"]'));
    return links.slice(0, 10).map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim()?.substring(0, 80) || '',
    }));
  });
  console.log('Search results:', JSON.stringify(searchResults, null, 2));

  // Now navigate to the first result
  if (searchResults.length > 0) {
    const detailUrl = searchResults.find(r => r.text.toLowerCase().includes('one punch'))?.href || searchResults[0].href;
    console.log('\nNavigating to:', detailUrl);
    await page.goto(detailUrl!, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    console.log('Page title:', await page.title());

    // Get detail page structure
    const detail = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(e => ({ class: e.className, parent: e.parentElement?.className?.substring(0, 80) || '', text: e.textContent?.trim()?.substring(0, 100) || '' }));

      // Look for common detail page patterns
      const detailContainers = Array.from(document.querySelectorAll('[class*="detail"], [class*="book_detail"], [class*="comic"], [class*="manga"], [class*="story"]')).map(e => ({
        tag: e.tagName,
        class: e.className.toString().substring(0, 100),
      }));

      // Info rows
      const infoItems = Array.from(document.querySelectorAll('[class*="info"] li, [class*="info"] p, [class*="detail"] li')).map(e => ({
        class: e.className.substring(0, 60),
        text: e.textContent?.trim()?.substring(0, 120) || '',
        parent: e.parentElement?.className?.substring(0, 80) || '',
      }));

      // Chapter list
      const chapters = Array.from(document.querySelectorAll('a[href*="chap"]')).slice(0, 5).map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim()?.substring(0, 80) || '',
        parent: a.parentElement?.className?.substring(0, 80) || '',
        grandParent: a.parentElement?.parentElement?.className?.substring(0, 80) || '',
      }));

      // Images that could be covers
      const imgs = Array.from(document.querySelectorAll('img')).filter(img => {
        const src = img.src || '';
        return src.includes('cover') || src.includes('book') || src.includes('upload') || img.width > 150;
      }).slice(0, 5).map(img => ({
        src: img.src?.substring(0, 150),
        class: img.className,
        parent: img.parentElement?.className?.substring(0, 80) || '',
        width: img.width,
        height: img.height,
      }));

      // Get body snippet around main content
      const mainContent = document.querySelector('[class*="book_detail"], [class*="detail_story"], [class*="story-detail"], main, .main_content, #main_content');
      const mainHtml = mainContent?.innerHTML?.substring(0, 3000) || document.body.innerHTML.substring(0, 5000);

      return { h1s, detailContainers, infoItems: infoItems.slice(0, 15), chapters, imgs, mainHtml };
    });

    console.log('\n=== H1s ===');
    console.log(JSON.stringify(detail.h1s, null, 2));
    console.log('\n=== DETAIL CONTAINERS ===');
    console.log(JSON.stringify(detail.detailContainers, null, 2));
    console.log('\n=== INFO ITEMS ===');
    console.log(JSON.stringify(detail.infoItems, null, 2));
    console.log('\n=== CHAPTERS ===');
    console.log(JSON.stringify(detail.chapters, null, 2));
    console.log('\n=== COVER IMAGES ===');
    console.log(JSON.stringify(detail.imgs, null, 2));
    console.log('\n=== MAIN HTML ===');
    console.log(detail.mainHtml.substring(0, 3000));
  }

  await browser.close();
}

inspect().catch(console.error);
