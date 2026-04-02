import { chromium } from 'playwright';

async function inspect() {
  const browser = await chromium.launch({ headless: false }); // visible browser
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Try different URL patterns
  const urls = [
    'https://truyenqqno.com/truyen-tranh/one-punch-man',
    'https://truyenqqno.com/truyen-tranh/one-punch-man-128.html',
    'https://truyenqqno.com/truyen-tranh/one-punch-man-128',
  ];

  for (const url of urls) {
    console.log(`\nTrying: ${url}`);
    const resp = await page
      .goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
      .catch(() => null);
    if (resp) {
      console.log(`  Status: ${resp.status()}`);
      console.log(`  Final URL: ${page.url()}`);
      console.log(`  Title: ${await page.title()}`);
    }
  }

  // Go to homepage and find a comic link
  console.log('\n--- Checking homepage links ---');
  await page.goto('https://truyenqqno.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  const comicLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/truyen-tranh/"]'));
    const unique = new Set<string>();
    return links
      .filter((a) => {
        const href = a.getAttribute('href') || '';
        // Only detail page links (not chapter links)
        if (href.includes('chap')) return false;
        if (unique.has(href)) return false;
        unique.add(href);
        return true;
      })
      .slice(0, 15)
      .map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim()?.substring(0, 60) || '',
      }));
  });
  console.log(JSON.stringify(comicLinks, null, 2));

  // Visit first comic detail page
  if (comicLinks.length > 0) {
    const detailUrl = comicLinks[0].href!;
    console.log(`\n--- Visiting detail: ${detailUrl} ---`);
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('Final URL:', page.url());
    console.log('Title:', await page.title());

    // Dump key structure
    const structure = await page.evaluate(() => {
      return {
        bodyClasses: document.body.className,
        allIds: Array.from(document.querySelectorAll('[id]'))
          .slice(0, 20)
          .map((e) => `${e.tagName}#${e.id}`),
        mainStructure: document.body.innerHTML.substring(0, 6000),
      };
    });

    console.log('\n=== IDs on page ===');
    console.log(structure.allIds);
    console.log('\n=== HTML structure ===');
    console.log(structure.mainStructure.substring(0, 4000));
  }

  await browser.close();
}

inspect().catch(console.error);
