import { chromium } from 'playwright';

const domain = 'truyenqq.com.vn';
const slug = 'cuong-gia-den-tu-trai-tam-than';

async function launchBrowser() {
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
  return { browser, page };
}

// === TEST 1: getComicInfo ===
console.log('=== TEST getComicInfo ===');
{
  const { browser, page } = await launchBrowser();
  await page.goto(`https://${domain}/${slug}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  const info = await page.evaluate(() => {
    const title = document.querySelector('h1[itemprop="name"]')?.textContent?.trim() || '';
    const coverUrl = document.querySelector('.poster img')?.getAttribute('src') || '';
    const metaLines = Array.from(document.querySelectorAll('.book-meta .line'));
    let author = 'Unknown', status = 'ongoing';
    const categories = [];

    for (const line of metaLines) {
      const label = line.querySelector('.title')?.textContent?.trim() || '';
      const result = line.querySelector('.result');
      if (!result) continue;
      if (label.includes('Tác giả')) author = result.textContent?.trim() || 'Unknown';
      else if (label.includes('Trạng thái')) {
        const st = result.querySelector('.label-status')?.textContent?.trim() || '';
        status = st.includes('Hoàn thành') ? 'completed' : 'ongoing';
      } else if (label.includes('Thể loại')) {
        result.querySelectorAll('a[href*="the-loai"]').forEach(a => {
          const t = a.textContent?.trim();
          if (t) categories.push(t);
        });
      }
    }
    const description = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';
    return { title, author, categories, description, coverUrl, status };
  });

  console.log('Title:', info.title);
  console.log('Author:', info.author);
  console.log('Status:', info.status);
  console.log('Categories:', info.categories.join(', '));
  console.log('Cover:', info.coverUrl);
  console.log('Description:', info.description.substring(0, 100));
  console.log(info.title ? '✓ PASS' : '✗ FAIL');
  await browser.close();
}

// === TEST 2: getChapterList ===
console.log('\n=== TEST getChapterList ===');
{
  const { browser, page } = await launchBrowser();
  await page.goto(`https://${domain}/${slug}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  const chapters = await page.evaluate(() => {
    const results = [];
    const baseUrl = window.location.origin;
    const links = document.querySelectorAll('a.chapter-name');
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || '';
      const numMatch = text.match(/(\d+(?:\.\d+)?)/);
      const chapterNumber = numMatch ? parseFloat(numMatch[1]) : 0;
      if (chapterNumber > 0) {
        results.push({ chapterNumber, title: text, sourceUrl: baseUrl + href });
      }
    });
    return results.sort((a, b) => a.chapterNumber - b.chapterNumber);
  });

  console.log(`Found ${chapters.length} chapters`);
  console.log('First:', chapters[0]?.title, chapters[0]?.sourceUrl);
  console.log('Last:', chapters[chapters.length - 1]?.title, chapters[chapters.length - 1]?.sourceUrl);
  console.log(chapters.length > 0 ? '✓ PASS' : '✗ FAIL');
  await browser.close();
}

// === TEST 3: getChapterImages ===
console.log('\n=== TEST getChapterImages ===');
{
  const { browser, page } = await launchBrowser();
  await page.goto(`https://${domain}/${slug}/chapter-1`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  // Scroll to trigger lazy loading
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < Math.min(height / 400, 30); i++) {
    await page.evaluate((y) => window.scrollBy(0, 400), i * 400);
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(2000);

  const images = await page.evaluate(() => {
    const results = [];
    const imgs = document.querySelectorAll('.inner img[data-src], .reading .inner img');
    imgs.forEach(img => {
      const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
      if (src && !src.includes('logo') && !src.includes('data:') && !src.includes('.svg') && !src.includes('pixel') && !src.includes('icon')) {
        results.push({ pageNumber: results.length + 1, imageUrl: src });
      }
    });
    return results;
  });

  console.log(`Found ${images.length} images`);
  images.forEach(i => console.log(`  Page ${i.pageNumber}: ${i.imageUrl.substring(0, 100)}`));
  console.log(images.length > 0 ? '✓ PASS' : '✗ FAIL');
  await browser.close();
}

console.log('\n✓ All tests done!');
