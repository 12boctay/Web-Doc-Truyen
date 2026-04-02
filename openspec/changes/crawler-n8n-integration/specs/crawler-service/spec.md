## ADDED Requirements

### Requirement: Crawler service project structure

The crawler service SHALL be a standalone Node.js/TypeScript project at `crawler-service/` (root level) with its own package.json, tsconfig.json, and Dockerfile. It SHALL use Crawlee framework with Playwright.

#### Scenario: Project setup

- **WHEN** developer runs `npm install` and `npm run dev` in crawler-service/
- **THEN** the service starts on port 3002 with Express API

### Requirement: BaseCrawler abstract class

The system SHALL provide a `BaseCrawler` class in `core/base-crawler.ts` that:

- Configures Crawlee `PlaywrightCrawler` with stealth settings
- Provides utility methods: downloadImage (buffer), uploadToFirebase, randomDelay, retry
- Declares 3 abstract methods: getComicInfo(url), getChapterList(url), getChapterImages(url)

#### Scenario: Subclass implements crawler

- **WHEN** a new site crawler extends BaseCrawler
- **THEN** it only needs to implement getComicInfo, getChapterList, getChapterImages

### Requirement: TruyenQQ crawler implementation

The system SHALL provide `TruyenQQCrawler` extending BaseCrawler with logic specific to TruyenQQ:

- getComicInfo: extract title, author, categories, description, cover from comic detail page
- getChapterList: extract all chapter URLs and numbers from comic page
- getChapterImages: extract all image URLs from chapter reader page, handle lazy-loading

#### Scenario: Crawl a comic from TruyenQQ

- **WHEN** TruyenQQCrawler.getComicInfo is called with a comic URL
- **THEN** it returns structured data { title, author, categories, description, coverUrl, sourceUrl }

#### Scenario: Crawl chapter images

- **WHEN** TruyenQQCrawler.getChapterImages is called with a chapter URL
- **THEN** it returns array of image URLs after handling lazy-load (scroll to load all)

### Requirement: Crawler site registry

The system SHALL provide a registry (`sites/index.ts`) mapping site names to crawler instances. E.g., `{ truyenqq: new TruyenQQCrawler() }`.

#### Scenario: Get crawler by name

- **WHEN** the system requests crawler for "truyenqq"
- **THEN** the registry returns the TruyenQQCrawler instance

### Requirement: Crawl single comic endpoint

The system SHALL provide `POST /crawl` accepting `{ sourceUrl, siteName }`. It SHALL crawl the comic, upload images to Firebase, and POST results to backend webhooks.

#### Scenario: Crawl one comic

- **WHEN** POST /crawl is called with a TruyenQQ comic URL
- **THEN** the crawler fetches comic info + all chapters, uploads images, sends webhooks to backend, returns { success, comicTitle, chaptersFound }

### Requirement: Crawl all comics endpoint

The system SHALL provide `POST /crawl/all` accepting `{ siteName, comicUrls[] }`. It SHALL crawl all comics sequentially with delays between each.

#### Scenario: Crawl multiple comics

- **WHEN** POST /crawl/all is called with 5 comic URLs
- **THEN** the crawler processes each comic one by one with random delay between them

### Requirement: Crawl status endpoint

The system SHALL provide `GET /crawl/status` returning current crawl progress: isRunning, currentComic, progress (completed/total), errors array, startedAt.

#### Scenario: Check status while crawling

- **WHEN** GET /crawl/status is called during a crawl
- **THEN** it returns { isRunning: true, currentComic: "One Punch Man", progress: { completed: 2, total: 5 }, errors: [] }

### Requirement: Anti-bot measures

The crawler SHALL use: random delays (2-5s between requests), rotating User-Agent strings, Playwright stealth plugin (`playwright-extra` + `puppeteer-extra-plugin-stealth`), new headless mode.

#### Scenario: Requests have varied timing

- **WHEN** the crawler makes sequential requests
- **THEN** each request has a random delay of 2-5 seconds

### Requirement: Firebase image upload

The crawler SHALL download chapter images as buffers and upload them to Firebase Storage under `chapters/{comicSlug}/{chapterSlug}/` path. Return public URLs.

#### Scenario: Upload chapter images

- **WHEN** crawler downloads 20 images from a chapter
- **THEN** all 20 are uploaded to Firebase and public URLs are returned

### Requirement: Dockerfile for crawler

The system SHALL provide a Dockerfile that builds the crawler service with Playwright browsers pre-installed.

#### Scenario: Docker build

- **WHEN** `docker build` is run on the Dockerfile
- **THEN** a working container image is produced with all Playwright dependencies
