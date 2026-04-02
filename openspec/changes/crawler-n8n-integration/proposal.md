## Why

Proposals 1–2 đã build xong foundation + comics/chapter CRUD. Nhưng toàn bộ nội dung hiện tại phải nhập thủ công. Cần crawler tự động để crawl truyện từ nguồn bên ngoài (TruyenQQ) và n8n để schedule + orchestrate quá trình crawl. Đây là tính năng cốt lõi để site có nội dung cập nhật liên tục.

## What Changes

### Crawler Service (separate microservice)

- **Crawler microservice** dùng Crawlee framework + Playwright headless browser
- **Strategy Pattern**: `BaseCrawler` class + `TruyenQQCrawler` (logic riêng cho TruyenQQ)
- **3 API endpoints**: POST /crawl (1 truyện), POST /crawl/all (tất cả), GET /crawl/status
- **BaseCrawler** cung cấp: launchBrowser, downloadImage, uploadFirebase, delay, retry
- **3 abstract methods** mỗi site implement: getComicInfo(), getChapterList(), getChapterImages()
- **Anti-bot**: random delay, rotate User-Agent, stealth plugin, new headless mode
- **Firebase Storage** upload cho chapter images
- **5 truyện target ban đầu**: Đại Quản Gia Là Ma Hoàng, Ta Trọng Sinh Là Nhân Vật Phản Diện, Ta Trùng Sinh Thành Liêu Đột Biến, One Punch Man, Sakamoto Days
- **Dockerfile** cho crawler service

### Backend Integration (apps/server)

- **n8n API routes**: trigger crawl, proxy n8n workflow/execution APIs
- **Webhook endpoints**: nhận data từ crawler/n8n — new-comic, new-chapter, crawl status
- **CrawlSource CRUD routes**: quản lý nguồn crawl qua admin panel

### Admin Panel (apps/admin)

- **n8n Monitor page**: xem workflows, executions, trigger crawl thủ công
- **Crawl Sources management page**: CRUD crawl sources

### n8n Workflows

- **Auto Crawler workflow**: Cron trigger → gọi crawler API → webhooks save data
- **Notify New Chapters workflow**: Webhook trigger → notify users following the comic
- **docker-compose.yml** update: thêm n8n service

## Capabilities

### New Capabilities

- `crawler-service`: Microservice crawl truyện dùng Crawlee + Playwright, Strategy Pattern, Firebase upload
- `n8n-integration`: Backend n8n API proxy, webhook endpoints, crawl trigger, workflow management
- `crawl-sources-api`: CRUD API cho CrawlSource model (admin)
- `admin-crawler`: Admin pages cho n8n monitor + crawl source management
- `n8n-workflows`: n8n workflow JSON files cho auto-crawl + notification

### Modified Capabilities

_(none)_

## Impact

- **New service**: `crawler-service/` — separate Node.js microservice (~15 files)
- **Backend**: ~6 new route/controller/service files for n8n + webhooks + crawl sources
- **Admin**: 2 new pages (n8n monitor, crawl sources)
- **Docker**: n8n service added to docker-compose.yml, Dockerfile for crawler
- **Dependencies**: crawlee, playwright, firebase-admin (crawler service)
- **Network**: Crawler service ↔ Backend API ↔ n8n communication
