import { chromium } from 'playwright';

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

// === STEP 1: Comic Detail ===
console.log('=== DETAIL PAGE ===');
await page.goto(`https://${domain}/cuong-gia-den-tu-trai-tam-than`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(3000);

const detail = await page.evaluate(() => {
  const title = document.querySelector('h1[itemprop="name"]')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim();
  const coverImg = document.querySelector('.poster img')?.getAttribute('src');

  // Meta lines
  const lines = Array.from(document.querySelectorAll('.book-meta .line'));
  const metaLines = lines.map(line => {
    const label = line.querySelector('.title')?.textContent?.trim();
    const value = line.querySelector('.result')?.textContent?.trim();
    const links = Array.from(line.querySelectorAll('.result a')).map(a => ({
      text: a.textContent?.trim(),
      href: a.getAttribute('href'),
    }));
    return { label, value: value?.substring(0, 200), links };
  });

  // Description
  const desc = document.querySelector('.book-summary .content')?.textContent?.trim()
    || document.querySelector('.book-intro')?.textContent?.trim()
    || document.querySelector('[itemprop="description"]')?.textContent?.trim();

  // Chapter list
  const chLinks = Array.from(document.querySelectorAll('a[href*="chapter"]'));
  const chapters = chLinks.map(a => ({
    text: a.textContent?.trim()?.substring(0, 80),
    href: a.getAttribute('href'),
    cls: a.className,
    parentCls: a.parentElement?.className?.substring(0, 60),
    grandCls: a.parentElement?.parentElement?.className?.substring(0, 60),
  }));

  // Main column HTML
  const mainCol = document.querySelector('.mainCol');
  const mainHtml = mainCol ? mainCol.innerHTML : 'NOT FOUND';

  return { title, coverImg, metaLines, desc: desc?.substring(0, 300), chapters: chapters.slice(0, 10), mainHtml: mainHtml.substring(0, 12000) };
});

console.log('Title:', detail.title);
console.log('Cover:', detail.coverImg);
console.log('\n--- META ---');
detail.metaLines.forEach(m => console.log(`  ${m.label} => ${m.value?.substring(0, 100)} | Links: ${JSON.stringify(m.links)}`));
console.log('\nDesc:', detail.desc);
console.log('\n--- CHAPTERS (10) ---');
console.log(JSON.stringify(detail.chapters, null, 2));
console.log('\n--- MAIN HTML ---');
console.log(detail.mainHtml);

// === STEP 2: Chapter Reading ===
const ch = detail.chapters.find(c => c.href?.includes('chapter'));
if (ch) {
  const chUrl = ch.href.startsWith('http') ? ch.href : `https://${domain}${ch.href}`;
  console.log(`\n\n=== CHAPTER: ${chUrl} ===`);
  await page.goto(chUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  // Scroll
  for (let i = 0; i < 15; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 600);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(2000);

  const chData = await page.evaluate(() => {
    // Find containers
    const sels = ['.chapter-content', '#chapter-content', '.chapter_content', '#chapter_content',
      '.page-chapter', '.reading-detail', '.content-chapter', '.chapter-detail',
      '.chapter-images', '#chapter-images'];
    const found = {};
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el) found[sel] = { children: el.children.length, imgs: el.querySelectorAll('img').length };
    }

    // All images
    const imgs = Array.from(document.querySelectorAll('img')).map(img => {
      const a = {};
      for (const attr of img.attributes) {
        a[attr.name] = attr.value.substring(0, 150);
      }
      return {
        attrs: a,
        parentCls: img.parentElement?.className?.substring(0, 80),
        w: img.naturalWidth || img.width,
        h: img.naturalHeight || img.height,
      };
    });

    const chImgs = imgs.filter(i => {
      const src = i.attrs.src || i.attrs['data-src'] || i.attrs['data-original'] || '';
      return src && !src.includes('logo') && !src.includes('.svg') && !src.includes('data:') && !src.includes('pixel') && !src.includes('icon');
    });

    // Find biggest img container
    let readingHtml = '';
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el) { readingHtml = el.outerHTML.substring(0, 8000); break; }
    }
    if (!readingHtml) {
      const divs = Array.from(document.querySelectorAll('div')).filter(d => d.querySelectorAll('img').length > 3);
      divs.sort((a, b) => b.querySelectorAll('img').length - a.querySelectorAll('img').length);
      if (divs[0]) readingHtml = divs[0].outerHTML.substring(0, 8000);
    }

    // Full body HTML to find reading area
    const bodyHtml = document.querySelector('main')?.innerHTML?.substring(0, 10000) || document.body.innerHTML.substring(2000, 12000);

    return { found, total: imgs.length, chImgs: chImgs.slice(0, 8), chImgsCount: chImgs.length, readingHtml, bodyHtml };
  });

  console.log('\n--- CONTAINERS ---');
  console.log(JSON.stringify(chData.found, null, 2));
  console.log(`Total: ${chData.total}, Chapter imgs: ${chData.chImgsCount}`);
  console.log('\n--- CHAPTER IMAGES ---');
  console.log(JSON.stringify(chData.chImgs, null, 2));
  console.log('\n--- READING HTML ---');
  console.log(chData.readingHtml || 'NOT FOUND');
  console.log('\n--- BODY HTML ---');
  console.log(chData.bodyHtml);
}

await browser.close();
console.log('\n✓ Done!');
