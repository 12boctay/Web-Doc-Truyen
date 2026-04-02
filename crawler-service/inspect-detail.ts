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

  // === STEP 1: Comic Detail Page ===
  console.log('=== DETAIL PAGE ===');
  await page.goto(`https://${domain}/cuong-gia-den-tu-trai-tam-than`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  // Get FULL detail content (not just 15000 chars)
  const detail = await page.evaluate(() => {
    const $ = (sel: string) => document.querySelector(sel);
    const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

    // === COMIC INFO ===
    const title = $('h1[itemprop="name"]')?.textContent?.trim() || $('h1')?.textContent?.trim();
    const coverImg = ($('.poster img') as HTMLImageElement)?.src || ($('.book-info img') as HTMLImageElement)?.src;

    // Meta lines
    const metaLines = $$('.book-meta .line').map(line => {
      const label = line.querySelector('.title')?.textContent?.trim();
      const value = line.querySelector('.result')?.textContent?.trim();
      const links = Array.from(line.querySelectorAll('.result a')).map(a => ({
        text: a.textContent?.trim(),
        href: (a as HTMLAnchorElement).href,
      }));
      return { label, value: value?.substring(0, 200), links };
    });

    // Description
    const description = $('.book-summary .content, .book-intro, .story-detail-info, [itemprop="description"]')?.textContent?.trim()?.substring(0, 500);

    // === CHAPTER LIST ===
    const chapters = $$('.chapter-list a, .list-chapters a, .chapterbox a, a[href*="chapter"]').map(a => ({
      text: a.textContent?.trim()?.substring(0, 80),
      href: (a as HTMLAnchorElement).getAttribute('href')?.substring(0, 120),
      cls: a.className,
      parentCls: a.parentElement?.className?.substring(0, 60),
    }));

    // Get book-info HTML and chapter list HTML separately
    const bookInfoHtml = ($('.book-info') || $('.bg-wrap'))?.outerHTML?.substring(0, 5000) || 'NOT FOUND';

    // Find chapter list container
    const chapterContainers = ['.chapter-list', '.list-chapters', '.list_chapter', '.chapterbox', '#chapterList', '[id*="chapter"]', '[class*="chapter-list"]'];
    let chapterListHtml = 'NOT FOUND';
    let chapterContainerSel = '';
    for (const sel of chapterContainers) {
      const el = $(sel);
      if (el) {
        chapterContainerSel = sel;
        chapterListHtml = el.outerHTML?.substring(0, 5000);
        break;
      }
    }

    // Also look for any container after book-info that has links
    const afterBookInfo = $('.mainCol')?.innerHTML?.substring(0, 10000) || '';

    return {
      title, coverImg, metaLines, description,
      chapters: chapters.slice(0, 10),
      bookInfoHtml, chapterContainerSel, chapterListHtml,
      afterBookInfo,
    };
  });

  console.log('Title:', detail.title);
  console.log('Cover:', detail.coverImg);
  console.log('\n--- META LINES ---');
  detail.metaLines.forEach(m => console.log(`  ${m.label} => ${m.value} | Links: ${JSON.stringify(m.links)}`));
  console.log('\nDescription:', detail.description?.substring(0, 200));
  console.log('\n--- CHAPTERS (first 10) ---');
  console.log(JSON.stringify(detail.chapters, null, 2));
  console.log('\nChapter container:', detail.chapterContainerSel);
  console.log('\n--- BOOK INFO HTML ---');
  console.log(detail.bookInfoHtml);
  console.log('\n--- CHAPTER LIST HTML ---');
  console.log(detail.chapterListHtml);
  console.log('\n--- MAIN COL HTML (after book-info, first 8000) ---');
  console.log(detail.afterBookInfo.substring(0, 8000));

  // === STEP 2: Chapter Reading Page ===
  const firstChapter = detail.chapters[0]?.href;
  if (firstChapter) {
    const chapterUrl = firstChapter.startsWith('http') ? firstChapter : `https://${domain}${firstChapter}`;
    console.log(`\n\n=== CHAPTER READING PAGE: ${chapterUrl} ===`);
    await page.goto(chapterUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Scroll to trigger lazy loading
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < Math.min(pageHeight / 500, 20); i++) {
      await page.evaluate((y) => window.scrollTo(0, y), i * 500);
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);

    const chapterData = await page.evaluate(() => {
      const $ = (sel: string) => document.querySelector(sel);
      const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

      // Find image container
      const containers = [
        '.chapter-content', '#chapter-content', '.chapter_content', '#chapter_content',
        '.page-chapter', '.reading-detail', '.content-chapter', '.chapter-detail',
        '.chapter-images', '#chapter-images',
      ];
      const found: Record<string, { children: number; imgs: number }> = {};
      for (const sel of containers) {
        const el = $(sel);
        if (el) found[sel] = { children: el.children.length, imgs: el.querySelectorAll('img').length };
      }

      // Get ALL images
      const imgs = $$('img').map(img => {
        const el = img as HTMLImageElement;
        const attrs: Record<string, string> = {};
        for (const attr of el.attributes) {
          if (['src', 'data-src', 'data-original', 'data-cdn', 'data-lazy-src', 'data-lazy', 'loading', 'class', 'alt', 'id'].includes(attr.name)) {
            attrs[attr.name] = attr.value.substring(0, 150);
          }
        }
        return {
          attrs,
          parentTag: el.parentElement?.tagName,
          parentCls: el.parentElement?.className?.substring(0, 80),
          grandParentCls: el.parentElement?.parentElement?.className?.substring(0, 80),
          w: el.naturalWidth || el.width,
          h: el.naturalHeight || el.height,
        };
      });

      // Filter to likely chapter images (not logos, icons, ads)
      const chapterImgs = imgs.filter(i => {
        const src = i.attrs.src || i.attrs['data-src'] || i.attrs['data-original'] || '';
        return !src.includes('logo') && !src.includes('icon') && !src.includes('.svg')
          && !src.includes('ads') && !src.includes('pixel') && !src.includes('data:')
          && (i.w > 100 || i.w === 0);
      });

      // Get the reading area HTML
      let readingHtml = '';
      for (const sel of containers) {
        const el = $(sel);
        if (el) {
          readingHtml = el.outerHTML.substring(0, 5000);
          break;
        }
      }
      if (!readingHtml) {
        // Try to find by largest container with most images
        const allDivs = $$('div').filter(d => d.querySelectorAll('img').length > 3);
        if (allDivs.length) {
          allDivs.sort((a, b) => b.querySelectorAll('img').length - a.querySelectorAll('img').length);
          readingHtml = allDivs[0].outerHTML.substring(0, 5000);
        }
      }

      // Navigation (prev/next chapter)
      const navLinks = $$('a[href*="chapter"]').map(a => ({
        text: a.textContent?.trim()?.substring(0, 50),
        href: (a as HTMLAnchorElement).getAttribute('href')?.substring(0, 120),
        cls: a.className?.substring(0, 60),
      }));

      return {
        containers: found,
        totalImgs: imgs.length,
        chapterImgs: chapterImgs.slice(0, 10),
        allChapterImgsCount: chapterImgs.length,
        readingHtml,
        navLinks: navLinks.slice(0, 10),
      };
    });

    console.log('\n--- FOUND CONTAINERS ---');
    console.log(JSON.stringify(chapterData.containers, null, 2));
    console.log(`\nTotal imgs: ${chapterData.totalImgs}, Chapter imgs: ${chapterData.allChapterImgsCount}`);
    console.log('\n--- CHAPTER IMAGES (first 10) ---');
    console.log(JSON.stringify(chapterData.chapterImgs, null, 2));
    console.log('\n--- NAV LINKS ---');
    console.log(JSON.stringify(chapterData.navLinks, null, 2));
    console.log('\n--- READING HTML (first 5000) ---');
    console.log(chapterData.readingHtml);
  }

  await browser.close();
  console.log('\n✓ Done!');
}

inspect().catch(console.error);
