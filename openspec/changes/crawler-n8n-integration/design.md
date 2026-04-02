## Context

Proposals 1–2 hoàn thành: monorepo (frontend/backend modules), 14 Mongoose models, auth, comics CRUD, chapter reader. CrawlSource model đã có. Cần xây crawler microservice riêng biệt và tích hợp n8n để schedule crawl tự động.

Các quyết định đã thống nhất từ trước:
- Dùng **Crawlee** framework (không raw Playwright)
- **Strategy Pattern** — logic riêng từng site
- **Firebase Storage** cho images
- **n8n trigger** — n8n gọi crawler, crawler không tự chạy cron
- Domain TruyenQQ cần xác nhận khi implement

## Goals / Non-Goals

**Goals:**
- Crawler microservice chạy độc lập, giao tiếp qua HTTP API
- TruyenQQCrawler crawl được 5 truyện target
- n8n orchestrate crawl schedule (30 phút/lần)
- Webhook endpoints nhận data từ crawler → save vào MongoDB
- Admin có thể trigger crawl thủ công, xem status, quản lý sources
- Docker setup cho crawler + n8n

**Non-Goals:**
- Crawler cho site khác ngoài TruyenQQ (nhưng architecture hỗ trợ mở rộng)
- Image optimization/CDN
- Distributed crawling / proxy pool
- Anti-DDOS protection cho crawler
- Crawler UI dashboard riêng (dùng admin panel)

## Decisions

### 1. Crawler as separate microservice

**Decision:** Crawler chạy riêng tại `crawler-service/` (root level, ngoài frontend/backend), có Dockerfile riêng, giao tiếp với backend qua HTTP.

**Why:** Crawlee + Playwright nặng (browser binary), không nên bundle chung với Express server. Microservice cho phép scale/restart riêng, không ảnh hưởng main server.

**Alternative:** Chạy trong backend process — rejected vì memory footprint + browser crash có thể ảnh hưởng API server.

### 2. Crawlee framework integration

**Decision:** Dùng `PlaywrightCrawler` từ Crawlee. Crawlee cung cấp:
- Request queue (auto retry, dedup)
- Built-in proxy rotation support
- Rate limiting / autoscaling
- Storage cho crawl state

BaseCrawler wrap Crawlee config + add custom methods. Mỗi site crawler extends BaseCrawler và implement 3 methods.

**Why:** Crawlee abstraction tốt hơn raw Playwright. Có sẵn queue management, retry, error handling.

### 3. Communication flow

**Decision:**
```
n8n (cron 30min) → POST crawler-service/crawl/all
  → Crawler crawls TruyenQQ
  → Cho mỗi comic/chapter mới:
    → Upload images → Firebase
    → POST backend/api/webhooks/crawler/new-comic
    → POST backend/api/webhooks/crawler/new-chapter
  → POST backend/api/webhooks/crawler/status
```

Admin manual trigger:
```
Admin panel → POST backend/api/n8n/trigger-crawl
  → Backend proxy → n8n webhook trigger
  → n8n → crawler-service/crawl
```

**Why:** n8n là orchestrator trung tâm. Backend nhận kết quả qua webhooks (loosely coupled). Admin trigger đi qua n8n (không gọi trực tiếp crawler) để có logging/execution history.

### 4. Webhook authentication

**Decision:** Shared secret token giữa crawler → backend webhooks. Header `X-Webhook-Secret`. Validated bằng middleware.

**Why:** Simple, đủ cho internal communication. Không cần JWT vì service-to-service.

### 5. Crawl state management

**Decision:** Crawler service stateless — trạng thái crawl (đang chạy, progress, errors) lưu in-memory và expose qua `GET /crawl/status`. CrawlSource model trong MongoDB lưu `lastCrawlAt`, `lastError`, `stats`.

**Why:** Stateless crawler dễ restart. Persistent state nằm ở backend DB.

### 6. Image download + upload strategy

**Decision:** Crawler download images vào memory buffer → upload trực tiếp lên Firebase Storage → trả về URL. Không lưu temp files.

**Why:** Tránh disk I/O, không cần cleanup. Buffer-based phù hợp với container environment.

### 7. n8n deployment

**Decision:** n8n self-hosted trong Docker, thêm vào docker-compose.yml. Port 5678. Persist workflows/credentials qua Docker volume.

**Why:** Đã quyết định từ trước. Self-hosted cho full control, không phụ thuộc SaaS.

## Risks / Trade-offs

- **[Risk] TruyenQQ domain thay đổi/block** → Mitigation: Domain config trong CrawlSource DB, dễ update. Stealth plugin + random delays.
- **[Risk] Crawlee/Playwright memory usage** → Mitigation: Crawler chạy riêng container, resource limits trong Docker. Close browser sau mỗi session.
- **[Risk] n8n workflow export/import** → Mitigation: Workflow JSON files committed to repo. Có thể import lại nếu n8n data bị mất.
- **[Trade-off] Stateless crawler** → Mất progress nếu restart giữa crawl. Chấp nhận vì crawl cycle ngắn (30 phút).
- **[Trade-off] No proxy rotation initial** → Crawlee hỗ trợ proxy nhưng chưa config. Thêm khi bị block.
