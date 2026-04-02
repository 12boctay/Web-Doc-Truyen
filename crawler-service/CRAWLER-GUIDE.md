# Crawler Service — Hướng dẫn chi tiết

## Tổng quan

Crawler Service là một **microservice độc lập** chạy trong Docker container, chịu trách nhiệm crawl truyện tranh từ các trang nguồn (hiện tại: TruyenQQ) và gửi dữ liệu về backend qua webhooks.

## Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| **Playwright** | Headless browser (Chromium) — render JavaScript để lấy ảnh chapter |
| **Cheerio** | Parse HTML tĩnh — lấy thông tin truyện, danh sách chapter |
| **Express** | API server nhận lệnh crawl |
| **Firebase Admin** | Upload ảnh lên Firebase Storage (tùy chọn) |
| **Docker** | Container hóa với image `mcr.microsoft.com/playwright:v1.58.2-noble` |

### Crawlee vs Playwright — Phân biệt

- **Crawlee** được install trong `package.json` nhưng hiện tại **chưa sử dụng trực tiếp**. Ban đầu dự kiến dùng Crawlee framework (có sẵn queue, retry, proxy rotation) nhưng thực tế code tự quản lý logic crawl.
- **Playwright** được sử dụng trực tiếp qua `import { chromium } from 'playwright'` để:
  - Mở headless Chromium browser
  - Navigate đến trang chapter
  - Scroll trang để trigger lazy-loading ảnh
  - Lấy URL ảnh sau khi JavaScript đã render
- **Cheerio** được dùng cho các trang **không cần JavaScript rendering** (trang thông tin truyện, danh sách chapter) — nhanh hơn nhiều so với Playwright.

**Tóm lại:**
```
Cheerio  = Parse HTML tĩnh (nhanh, nhẹ)  → Comic info, chapter list
Playwright = Render JavaScript (chậm, nặng) → Chapter images (lazy-loaded)
```

## Cấu trúc thư mục

```
crawler-service/
├── src/
│   ├── index.ts              # Express API server (3 endpoints)
│   ├── config.ts             # Environment variables validation
│   ├── types.ts              # TypeScript interfaces
│   ├── crawl-manager.ts      # Điều phối crawl (singleton)
│   ├── core/
│   │   ├── base-crawler.ts   # Abstract base class (Playwright, utilities)
│   │   └── storage.ts        # Firebase Storage upload
│   └── sites/
│       ├── index.ts          # Registry: siteName → crawler instance
│       └── truyenqq.ts       # Logic riêng cho TruyenQQ
├── Dockerfile
├── package.json
└── tsconfig.json
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/health` | Health check |
| `POST` | `/crawl` | Crawl 1 truyện (`{sourceUrl, siteName}`) |
| `POST` | `/crawl/all` | Crawl nhiều truyện (`{siteName, comicUrls[]}`) |
| `GET` | `/crawl/status` | Trạng thái crawl hiện tại |

**Lưu ý:** Chỉ cho phép 1 crawl chạy tại 1 thời điểm (trả 409 nếu đang crawl).

## Luồng chạy chi tiết

### Sơ đồ tổng quan

```
n8n (Schedule 30m)
    │
    ▼
POST /crawl ──────────────────────────────────────────────────────
    │                                                              │
    ▼                                                              │
CrawlManager.crawlOne(sourceUrl, siteName)                         │
    │                                                              │
    ▼                                                              │
getCrawler("truyenqq") → TruyenQQCrawler                          │
    │                                                              │
    ├─── 1. getComicInfo(url)         ◄── Cheerio (fetch + parse) │
    │         │                                                    │
    │         ▼                                                    │
    │    Webhook → POST /api/webhooks/crawler/new-comic            │
    │         │         (Backend lưu/update comic vào MongoDB)     │
    │         ▼                                                    │
    ├─── 2. getChapterList(url)       ◄── Cheerio (fetch + parse) │
    │         │                                                    │
    │         ▼                                                    │
    │    Lấy 100 chapters mới nhất                                 │
    │         │                                                    │
    │         ▼                                                    │
    └─── 3. Lặp mỗi chapter:                                      │
              │                                                    │
              ├── getChapterImages(url)  ◄── Playwright (browser)  │
              │       │                                            │
              │       ├── Mở Chromium headless                     │
              │       ├── Navigate đến URL chapter                 │
              │       ├── Scroll xuống cuối trang (lazy-load)      │
              │       ├── Đợi 2s cho ảnh load                     │
              │       ├── Lấy tất cả img src từ DOM               │
              │       └── Đóng browser                             │
              │                                                    │
              ├── Webhook → POST /api/webhooks/crawler/new-chapter │
              │       (Backend lưu chapter + pages vào MongoDB)    │
              │                                                    │
              └── Random delay 2-5s (tránh bị block)               │
                                                                   │
    Khi xong tất cả chapters:                                      │
    Webhook → POST /api/webhooks/crawler/status                    │
              (Backend cập nhật CrawlSource stats)                 │
───────────────────────────────────────────────────────────────────
```

### Bước 1: Nhận lệnh crawl

```
POST http://localhost:3002/crawl
{
  "sourceUrl": "https://truyenqqno.com/truyen-tranh/dai-quan-gia-la-ma-hoang-7015",
  "siteName": "truyenqq"
}
```

- `CrawlManager` kiểm tra không đang crawl → bắt đầu chạy nền
- Response trả ngay: `{"message": "Crawl started"}`

### Bước 2: Lấy thông tin truyện (Cheerio)

```typescript
// TruyenQQCrawler.getComicInfo(url)
// Dùng fetch() + cheerio.load() — KHÔNG cần browser
const $ = await this.fetchPage(url);
const title = $('.book_other h1').text();
const author = $('.list-info li.author a').text();
// ... parse categories, description, coverUrl, status
```

**Tại sao dùng Cheerio?** Trang thông tin truyện render HTML phía server, không cần JavaScript → fetch thường đủ, nhanh hơn Playwright 10x.

### Bước 3: Gửi comic info về backend

```typescript
await this.sendWebhook('/api/webhooks/crawler/new-comic', {
  comic: comicInfo,  // {title, author, categories, description, coverUrl, sourceUrl}
  siteName: 'truyenqq',
});
```

Backend nhận → upsert Comic document vào MongoDB.

### Bước 4: Lấy danh sách chapters (Cheerio)

```typescript
// TruyenQQCrawler.getChapterList(url)
// Cũng dùng fetch() + cheerio
$('.works-chapter-list .works-chapter-item .name-chap a').each((i, el) => {
  // Parse href, chapter number, title
});
// Sort theo số chapter, lấy 100 mới nhất
const latestChapters = chapters.slice(-100);
```

### Bước 5: Crawl từng chapter (Playwright)

**Đây là bước DUY NHẤT dùng Playwright** vì ảnh chapter được load bằng JavaScript (lazy-loading).

```typescript
// TruyenQQCrawler.getChapterImages(url)

// 1. Mở browser Chromium headless
const browser = await chromium.launch({ headless: true });
const page = await context.newPage();

// 2. Giấu webdriver (anti-detection)
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});

// 3. Navigate đến trang chapter
await page.goto(chapterUrl, { waitUntil: 'domcontentloaded' });

// 4. Scroll xuống cuối → trigger lazy-loading tất cả ảnh
await this.scrollToBottom(page, 200);
await page.waitForTimeout(2000);

// 5. Lấy URL ảnh từ DOM (sau khi JS đã render)
const pages = await page.evaluate(() => {
  const imgs = document.querySelectorAll(
    '.chapter_content img, .page_chapter img, #chapter_content img'
  );
  // Lấy src từ data-original, data-cdn, data-src, currentSrc, src
  // Lọc bỏ ảnh trang trí (.svg, tet-, template/frontend)
});

// 6. Đóng browser (quan trọng — tránh leak memory)
await browser.close();
```

### Bước 6: Gửi chapter data về backend

```typescript
await this.sendWebhook('/api/webhooks/crawler/new-chapter', {
  comic: comicInfo,
  chapter: { chapterNumber, title, sourceUrl },
  pages: [{ pageNumber: 1, imageUrl: "https://s135.hinhhinh.com/..." }, ...],
  siteName: 'truyenqq',
});
```

Backend nhận → tạo/update Chapter document với danh sách pages.

### Bước 7: Delay & tiếp tục

- Random delay **2-5 giây** giữa mỗi chapter (tránh bị site block)
- Random delay **5-10 giây** giữa mỗi truyện (khi crawl nhiều truyện)
- Nếu 1 chapter fail → log error, tiếp tục chapter tiếp theo (không dừng)

## Strategy Pattern — Thêm site mới

Kiến trúc dùng **Strategy Pattern** để dễ dàng thêm nguồn crawl mới:

```
BaseCrawler (abstract)
├── getComicInfo(url)      ← abstract
├── getChapterList(url)    ← abstract
├── getChapterImages(url)  ← abstract
├── openPage(url)          ← Playwright browser (shared)
├── scrollToBottom(page)   ← Scroll helper (shared)
├── randomDelay()          ← Delay helper (shared)
├── retry(fn)              ← Retry with backoff (shared)
├── downloadImage(url)     ← Download image buffer (shared)
└── uploadToFirebase()     ← Upload to storage (shared)

TruyenQQCrawler extends BaseCrawler
├── getComicInfo()    → Cheerio selectors riêng TruyenQQ
├── getChapterList()  → Cheerio selectors riêng TruyenQQ
└── getChapterImages() → Playwright + selectors riêng TruyenQQ
```

**Thêm site mới (ví dụ NetTruyen):**

1. Tạo `src/sites/nettruyen.ts`:
```typescript
export class NetTruyenCrawler extends BaseCrawler {
  constructor() { super('nettruyen'); }
  async getComicInfo(url) { /* CSS selectors cho NetTruyen */ }
  async getChapterList(url) { /* CSS selectors cho NetTruyen */ }
  async getChapterImages(url) { /* CSS selectors cho NetTruyen */ }
}
```

2. Đăng ký trong `src/sites/index.ts`:
```typescript
const crawlerRegistry = {
  truyenqq: new TruyenQQCrawler(),
  nettruyen: new NetTruyenCrawler(),  // thêm dòng này
};
```

3. Gọi API: `POST /crawl { siteName: "nettruyen", sourceUrl: "..." }`

## Anti-bot / Anti-detection

| Kỹ thuật | Mô tả |
|----------|-------|
| Random User-Agent | Pool 5 UA strings, random mỗi request |
| Hide webdriver | `navigator.webdriver = false` |
| Random delay | 2-5s giữa chapters, 5-10s giữa truyện |
| Headless mode | `headless: true` (new headless, khó detect hơn) |
| No-sandbox | Docker container không cần sandbox |

## Hotlink Protection & Image Proxy

TruyenQQ bảo vệ ảnh bằng **hotlink protection** — chỉ cho phép load ảnh khi `Referer` header là `truyenqqno.com`. Khi hiển thị ảnh trên frontend (localhost), ảnh bị **403 Forbidden**.

**Giải pháp:** Backend có endpoint `/api/image-proxy?url=...` proxy request với đúng Referer:

```
Frontend <img src> → Backend /api/image-proxy?url=xxx → TruyenQQ CDN (Referer: truyenqqno.com)
                   ← image data (200 OK)             ← image data (200 OK)
```

## Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.58.2-noble  # Image có sẵn Chromium
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/index.js"]
```

**Lưu ý:** Playwright version trong `package.json` phải khớp với Docker image version, nếu không Chromium binary sẽ không tìm thấy.

## n8n Integration

n8n chạy trong Docker, trigger crawl theo schedule:

```
n8n (Schedule: mỗi 30 phút)
  └── HTTP Request: POST http://host.docker.internal:3002/crawl/all
        Body: { siteName: "truyenqq", comicUrls: [...] }
```

Workflow JSON: `n8n/workflows/crawler-truyenqq.json`

## Monitoring

```bash
# Xem trạng thái crawl
curl http://localhost:3002/crawl/status

# Xem logs
docker logs webdoctruyen-crawler --tail 50 -f

# Response mẫu
{
  "isRunning": true,
  "currentComic": "https://truyenqqno.com/truyen-tranh/dai-quan-gia-la-ma-hoang-7015",
  "progress": { "completed": 0, "total": 1 },
  "errors": ["Chapter 752: fetch failed"],
  "startedAt": "2026-03-17T11:26:53.065Z"
}
```
