## ADDED Requirements

### Requirement: List crawl sources

The system SHALL provide `GET /api/crawl-sources` (admin role required) returning all crawl sources.

#### Scenario: Get sources

- **WHEN** admin requests crawl sources
- **THEN** all CrawlSource documents are returned with name, baseUrl, isActive, lastCrawlAt, stats

### Requirement: Create crawl source

The system SHALL provide `POST /api/crawl-sources` (admin role required) accepting name, baseUrl, selectors, headers, schedule.

#### Scenario: Create source

- **WHEN** admin creates a new crawl source "TruyenQQ"
- **THEN** the source is created with isActive=true and returns 201

### Requirement: Update crawl source

The system SHALL provide `PUT /api/crawl-sources/:id` (admin role required).

#### Scenario: Update source config

- **WHEN** admin updates baseUrl of a source
- **THEN** the source is updated

### Requirement: Delete crawl source

The system SHALL provide `DELETE /api/crawl-sources/:id` (admin role required).

#### Scenario: Delete source

- **WHEN** admin deletes a crawl source
- **THEN** the source is removed from database

### Requirement: Test crawl source

The system SHALL provide `POST /api/crawl-sources/:id/test` (admin role required) that makes a test request to the source URL and validates the response.

#### Scenario: Test successful

- **WHEN** admin tests a source and the URL is reachable
- **THEN** the system returns { success: true, message: "Source reachable" }
