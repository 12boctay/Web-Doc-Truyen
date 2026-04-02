import { chromium } from 'playwright';

async function inspect() {
  console.log('Launching browser (visible mode to bypass Cloudflare)...');
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

  const workingDomain = 'truyenqq.com.vn';
  console.log(`Using domain: ${workingDomain}`);

  if (!workingDomain) {
    console.log('\nKhông tìm được domain hoạt động!');
    await browser.close();
    return;
  }

  // === 2. Phân tích trang chủ — tìm link truyện ===
  console.log('\n========== TRANG CHỦ ==========');
  const homeLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/truyen-tranh/"]'));
    const seen = new Set<string>();
    return links.filter(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('chap') || seen.has(href)) return false;
      seen.add(href);
      return true;
    }).slice(0, 10).map(a => ({
      href: a.getAttribute('href'),
      text: a.textContent?.trim()?.substring(0, 60),
    }));
  });
  console.log('Comic links on homepage:');
  console.log(JSON.stringify(homeLinks, null, 2));

  // === 3. Vào trang chi tiết truyện ===
  const detailUrl = homeLinks[0]?.href;
  if (!detailUrl) {
    console.log('Không tìm thấy link truyện!');
    await browser.close();
    return;
  }

  const fullDetailUrl = detailUrl.startsWith('http') ? detailUrl : `https://${workingDomain}${detailUrl}`;
  console.log(`\n========== TRANG CHI TIẾT: ${fullDetailUrl} ==========`);
  await page.goto(fullDetailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(3000);

  const detail = await page.evaluate(() => {
    const $ = (sel: string) => document.querySelector(sel);
    const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

    // Tìm tất cả selectors có thể
    const selectorTests: Record<string, string> = {};
    const trySelectors = [
      // Title
      '.book_other h1', 'h1', '.book_name', '.title-manga', '.comic-title',
      // Author
      '.list-info li.author', '.list-info li.author a', '.info-item .author',
      // Categories
      '.list01 a', '.list-info li.kind a', '.genre a', '.category a',
      // Description
      '.story-detail-info', '.book_desc', '.detail-content', '.manga-info-content',
      // Cover
      '.book_avatar img', '.detail-info img', '.manga-info img',
      // Status
      '.list-info li.status', '.list-info li.status .col-xs-9',
      // Chapter list
      '.works-chapter-list', '.list_chapter', '.list-chapter',
      '.works-chapter-list .works-chapter-item',
      '.works-chapter-list .works-chapter-item .name-chap a',
      '.list_chapter .row a', '.list_chapter a',
    ];

    for (const sel of trySelectors) {
      const el = $(sel);
      if (el) {
        const tag = el.tagName.toLowerCase();
        const attrs: string[] = [];
        if ((el as HTMLImageElement).src) attrs.push(`src="${(el as HTMLImageElement).src.substring(0, 100)}"`);
        if ((el as HTMLAnchorElement).href) attrs.push(`href="${(el as HTMLAnchorElement).href.substring(0, 100)}"`);
        selectorTests[sel] = `[${tag}] ${el.textContent?.trim()?.substring(0, 120) || '(empty)'} ${attrs.join(' ')}`;
      }
    }

    // Tìm tất cả IDs
    const ids = $$('[id]').slice(0, 30).map(e => `${e.tagName}#${e.id}`);

    // Tìm class có keyword quan trọng
    const relevantEls = $$('[class*="book"], [class*="detail"], [class*="chapter"], [class*="story"], [class*="info"], [class*="list"]');
    const classes = relevantEls.slice(0, 40).map(e => ({
      tag: e.tagName,
      cls: e.className.toString().substring(0, 100),
      txt: e.textContent?.substring(0, 60)?.trim(),
    }));

    // HTML chính
    const mainEl = $('main') || $('.main_content') || $('#main_content') || $('[class*="book_detail"]') || $('[class*="detail"]');
    const mainHtml = mainEl?.outerHTML?.substring(0, 6000) || document.body.innerHTML.substring(1000, 7000);

    // Chapter links cụ thể
    const chapterLinks = $$('a[href*="chap"]').slice(0, 5).map(a => ({
      href: a.getAttribute('href')?.substring(0, 120),
      text: a.textContent?.trim()?.substring(0, 80),
      parentClass: a.parentElement?.className?.substring(0, 80),
      grandParentClass: a.parentElement?.parentElement?.className?.substring(0, 80),
    }));

    return { selectorTests, ids, classes, chapterLinks, mainHtml };
  });

  console.log('\n--- SELECTOR TESTS ---');
  for (const [sel, val] of Object.entries(detail.selectorTests)) {
    console.log(`  ${sel} => ${val}`);
  }
  console.log('\n--- IDs ---');
  console.log(detail.ids.join(', '));
  console.log('\n--- RELEVANT CLASSES ---');
  console.log(JSON.stringify(detail.classes, null, 2));
  console.log('\n--- CHAPTER LINKS ---');
  console.log(JSON.stringify(detail.chapterLinks, null, 2));
  console.log('\n--- MAIN HTML (first 4000 chars) ---');
  console.log(detail.mainHtml.substring(0, 4000));

  // === 4. Vào trang đọc chapter ===
  const chapterUrl = detail.chapterLinks[0]?.href;
  if (chapterUrl) {
    const fullChapterUrl = chapterUrl.startsWith('http') ? chapterUrl : `https://${workingDomain}${chapterUrl}`;
    console.log(`\n========== TRANG ĐỌC CHAPTER: ${fullChapterUrl} ==========`);
    await page.goto(fullChapterUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Scroll to load lazy images
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(500);
    }

    const chapter = await page.evaluate(() => {
      const $ = (sel: string) => document.querySelector(sel);
      const $$ = (sel: string) => Array.from(document.querySelectorAll(sel));

      // Test image selectors
      const imgSelectors = [
        '.chapter_content img', '.page_chapter img', '#chapter_content img',
        '.chapter-detail img', '.reading-detail img', '.content-chapter img',
        '.chapter-content img', 'img.lazy', 'img[data-original]', 'img[data-src]',
        'img[data-cdn]', 'img[data-lazy-src]',
      ];

      const imgResults: Record<string, number> = {};
      for (const sel of imgSelectors) {
        const count = $$(sel).length;
        if (count > 0) imgResults[sel] = count;
      }

      // Get all images with their attributes
      const allImgs = $$('img').map(img => {
        const el = img as HTMLImageElement;
        return {
          src: el.src?.substring(0, 120),
          dataSrc: el.getAttribute('data-src')?.substring(0, 120),
          dataOriginal: el.getAttribute('data-original')?.substring(0, 120),
          dataCdn: el.getAttribute('data-cdn')?.substring(0, 120),
          dataLazy: el.getAttribute('data-lazy-src')?.substring(0, 120),
          cls: el.className?.substring(0, 60),
          parent: el.parentElement?.className?.substring(0, 60),
          w: el.width, h: el.height,
        };
      }).filter(i =>
        !i.src?.includes('data:') && !i.src?.includes('.svg') && !i.src?.includes('pixel')
        && !i.src?.includes('logo') && !i.src?.includes('icon') && !i.src?.includes('ads')
      );

      // Container structure
      const containers = [
        '.chapter_content', '#chapter_content', '.page_chapter',
        '.chapter-detail', '.reading-detail', '.content-chapter',
      ];
      const foundContainers: Record<string, string> = {};
      for (const sel of containers) {
        const el = $(sel);
        if (el) foundContainers[sel] = `children: ${el.children.length}, imgs: ${el.querySelectorAll('img').length}`;
      }

      const mainHtml = ($('.chapter_content') || $('#chapter_content') || $('[class*="chapter"]'))?.innerHTML?.substring(0, 3000) || 'NOT FOUND';

      return { imgResults, allImgs: allImgs.slice(0, 15), foundContainers, mainHtml };
    });

    console.log('\n--- IMAGE SELECTOR COUNTS ---');
    console.log(JSON.stringify(chapter.imgResults, null, 2));
    console.log('\n--- FOUND CONTAINERS ---');
    console.log(JSON.stringify(chapter.foundContainers, null, 2));
    console.log('\n--- ALL IMAGES (first 15) ---');
    console.log(JSON.stringify(chapter.allImgs, null, 2));
    console.log('\n--- CHAPTER HTML (first 2000 chars) ---');
    console.log(chapter.mainHtml.substring(0, 2000));
  }

  await browser.close();
  console.log('\n✓ Done!');
}

inspect().catch(console.error);
