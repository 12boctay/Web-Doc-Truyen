## 1. Crawler Service — Project Setup

- [ ] 1.1 Create `crawler-service/` at root with package.json (crawlee, playwright, firebase-admin, express, typescript)
- [ ] 1.2 Create tsconfig.json and entry point `src/index.ts` with Express app on port 3002
- [ ] 1.3 Create `src/types.ts` — CrawlResult, ComicInfo, ChapterInfo, PageInfo interfaces
- [ ] 1.4 Create `src/config.ts` — env config (BACKEND*URL, WEBHOOK_SECRET, FIREBASE*\*)

## 2. Crawler Service — Core

- [ ] 2.1 Create `src/core/storage.ts` — Firebase Admin init + uploadImage(buffer, path) → URL
- [ ] 2.2 Create `src/core/base-crawler.ts` — BaseCrawler abstract class with Crawlee PlaywrightCrawler config, stealth settings, randomDelay, retry, downloadImage, abstract methods (getComicInfo, getChapterList, getChapterImages)
- [ ] 2.3 Create `src/sites/truyenqq.ts` — TruyenQQCrawler extends BaseCrawler, implement getComicInfo (parse detail page), getChapterList (parse chapter list), getChapterImages (scroll + extract lazy-loaded images)
- [ ] 2.4 Create `src/sites/index.ts` — Site registry mapping name → crawler instance

## 3. Crawler Service — API + Orchestration

- [ ] 3.1 Create `src/crawl-manager.ts` — CrawlManager class: crawlOne(url, siteName), crawlAll(urls, siteName), getStatus(). Manages state (isRunning, progress, errors). Calls webhooks on backend after each comic/chapter.
- [ ] 3.2 Create API routes in `src/index.ts`: POST /crawl, POST /crawl/all, GET /crawl/status
- [ ] 3.3 Create Dockerfile with Playwright base image, install deps, build + start

## 4. Backend — Webhook Endpoints

- [ ] 4.1 Create `middlewares/webhook.middleware.ts` — validate X-Webhook-Secret header
- [ ] 4.2 Create `services/webhook.service.ts` — handleNewComic (create/update Comic), handleNewChapter (create Chapter + update Comic), handleCrawlStatus (update CrawlSource)
- [ ] 4.3 Create `controllers/webhook.controller.ts` + `routes/webhook.routes.ts` — POST /webhooks/crawler/new-comic, /new-chapter, /status
- [ ] 4.4 Wire up webhook routes in app.ts

## 5. Backend — n8n Integration Routes

- [ ] 5.1 Add WEBHOOK_SECRET and N8N_URL to config/env.ts
- [ ] 5.2 Create `services/n8n.service.ts` — triggerCrawl, listWorkflows, listExecutions (proxy to n8n API)
- [ ] 5.3 Create `controllers/n8n.controller.ts` + `routes/n8n.routes.ts` — POST /n8n/trigger-crawl, GET /n8n/workflows, GET /n8n/executions
- [ ] 5.4 Wire up n8n routes in app.ts

## 6. Backend — CrawlSource CRUD

- [ ] 6.1 Create `services/crawl-source.service.ts` — list, create, update, delete, test (HTTP request to source URL)
- [ ] 6.2 Create `controllers/crawl-source.controller.ts` + `routes/crawl-source.routes.ts` — CRUD + POST test
- [ ] 6.3 Wire up crawl-source routes in app.ts

## 7. Admin Panel — Crawler Pages

- [ ] 7.1 Create `app/n8n/page.tsx` — workflow list, execution history, trigger crawl button
- [ ] 7.2 Create `app/crawl-sources/page.tsx` — CRUD table for crawl sources with test button

## 8. n8n Workflows + Docker

- [ ] 8.1 Create `n8n/workflows/crawler-truyenqq.json` — cron trigger → POST crawler/crawl/all
- [ ] 8.2 Create `n8n/workflows/notify-new-chapter.json` — webhook trigger → create notifications
- [ ] 8.3 Update `docker-compose.yml` — add n8n service (port 5678, volume) + crawler-service (port 3002, build from Dockerfile)

## 9. Integration & Verification

- [ ] 9.1 Verify crawler-service starts and responds to GET /crawl/status
- [ ] 9.2 Verify webhook endpoints accept valid secret and reject invalid
- [ ] 9.3 Verify admin pages render n8n and crawl sources
- [ ] 9.4 Verify docker-compose includes all services
- [ ] 9.5 TypeScript compilation clean for crawler-service and backend
