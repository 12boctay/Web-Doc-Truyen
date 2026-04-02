import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  console.log('Navigating to TruyenQQ...');
  await page.goto('https://truyenqqno.com/truyen-tranh/one-punch-man', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Wait a bit for dynamic content
  await page.waitForTimeout(3000);

  // Get page title
  const title = await page.title();
  console.log('Page title:', title);

  // Get the HTML structure - key elements
  const structure = await page.evaluate(() => {
    const body = document.body;

    // Find all major containers
    const allDivs = Array.from(
      document.querySelectorAll('div[class], section[class], article[class]'),
    );
    const classNames = allDivs
      .map((el) => ({
        tag: el.tagName,
        class: el.className.toString().substring(0, 100),
        text: el.textContent?.substring(0, 50)?.trim() || '',
      }))
      .filter((x) => x.class.length > 0);

    // Find headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map((el) => ({
      tag: el.tagName,
      class: el.className,
      text: el.textContent?.trim()?.substring(0, 100) || '',
      parent: el.parentElement?.className?.substring(0, 80) || '',
    }));

    // Find images
    const images = Array.from(document.querySelectorAll('img'))
      .slice(0, 10)
      .map((img) => ({
        src: img.src?.substring(0, 100),
        class: img.className,
        alt: img.alt,
        parent: img.parentElement?.className?.substring(0, 80) || '',
      }));

    // Find chapter links
    const chapterLinks = Array.from(document.querySelectorAll('a[href*="chap"]'))
      .slice(0, 5)
      .map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim()?.substring(0, 80) || '',
        class: a.className,
        parent: a.parentElement?.className?.substring(0, 80) || '',
        grandParent: a.parentElement?.parentElement?.className?.substring(0, 80) || '',
      }));

    // Get first 5000 chars of body HTML to see structure
    const bodyHtml = document.body.innerHTML.substring(0, 8000);

    return { classNames: classNames.slice(0, 40), headings, images, chapterLinks, bodyHtml };
  });

  console.log('\n=== HEADINGS ===');
  console.log(JSON.stringify(structure.headings, null, 2));

  console.log('\n=== IMAGES ===');
  console.log(JSON.stringify(structure.images, null, 2));

  console.log('\n=== CHAPTER LINKS ===');
  console.log(JSON.stringify(structure.chapterLinks, null, 2));

  console.log('\n=== KEY CLASSES ===');
  console.log(JSON.stringify(structure.classNames.slice(0, 20), null, 2));

  console.log('\n=== BODY HTML (first 5000 chars) ===');
  console.log(structure.bodyHtml.substring(0, 5000));

  await browser.close();
}

inspect().catch(console.error);
