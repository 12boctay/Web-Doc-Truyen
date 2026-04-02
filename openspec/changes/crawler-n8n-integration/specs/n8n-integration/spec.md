## ADDED Requirements

### Requirement: Trigger crawl endpoint
The system SHALL provide `POST /api/n8n/trigger-crawl` (admin role required) that triggers crawl via n8n webhook or directly calls crawler service.

#### Scenario: Admin triggers crawl
- **WHEN** an admin sends POST with { siteName, comicUrls? }
- **THEN** the system triggers the crawl and returns { success, message: "Crawl triggered" }

### Requirement: n8n workflow proxy
The system SHALL provide `GET /api/n8n/workflows` and `GET /api/n8n/executions` (admin role required) that proxy requests to n8n REST API.

#### Scenario: List workflows
- **WHEN** admin requests GET /api/n8n/workflows
- **THEN** the system proxies to n8n API and returns workflow list

### Requirement: Webhook — new comic
The system SHALL provide `POST /api/webhooks/crawler/new-comic` that receives crawled comic data and creates/updates Comic document in MongoDB. Protected by X-Webhook-Secret header.

#### Scenario: Receive new comic
- **WHEN** crawler sends comic data via webhook
- **THEN** the system creates a new Comic (or updates if sourceUrl exists) with all fields populated

#### Scenario: Invalid webhook secret
- **WHEN** a request is made without valid X-Webhook-Secret
- **THEN** the system returns 401 Unauthorized

### Requirement: Webhook — new chapter
The system SHALL provide `POST /api/webhooks/crawler/new-chapter` that receives chapter data (comicId, number, title, pages[]) and creates Chapter document. Updates Comic.totalChapters and latestChapter.

#### Scenario: Receive new chapter
- **WHEN** crawler sends chapter data with pages array
- **THEN** a new Chapter is created and parent Comic is updated

#### Scenario: Duplicate chapter
- **WHEN** a chapter with same comicId + number already exists
- **THEN** the system skips creation and returns { success: true, skipped: true }

### Requirement: Webhook — crawl status
The system SHALL provide `POST /api/webhooks/crawler/status` that updates CrawlSource.lastCrawlAt, lastError, stats.

#### Scenario: Successful crawl status
- **WHEN** crawler reports success for a source
- **THEN** CrawlSource.lastCrawlAt is updated, stats.totalCrawled increments, stats.lastSuccessAt updated

#### Scenario: Error crawl status
- **WHEN** crawler reports error
- **THEN** CrawlSource.lastError is updated, stats.totalErrors increments

### Requirement: Webhook secret middleware
The system SHALL provide middleware that validates X-Webhook-Secret header against env var WEBHOOK_SECRET. Applied to all /api/webhooks/* routes.

#### Scenario: Valid secret
- **WHEN** request includes correct X-Webhook-Secret
- **THEN** request proceeds to handler

#### Scenario: Missing or wrong secret
- **WHEN** secret is missing or incorrect
- **THEN** 401 Unauthorized is returned
