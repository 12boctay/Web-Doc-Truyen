## ADDED Requirements

### Requirement: Auto crawler n8n workflow

The system SHALL provide an n8n workflow JSON file (`n8n/workflows/crawler-truyenqq.json`) that: triggers every 30 minutes via cron, calls POST crawler-service/crawl/all with configured comic URLs, handles success/error responses.

#### Scenario: Scheduled crawl execution

- **WHEN** the cron trigger fires
- **THEN** n8n calls the crawler service which crawls all configured comics

### Requirement: Notify new chapters workflow

The system SHALL provide an n8n workflow JSON file (`n8n/workflows/notify-new-chapter.json`) that: receives webhook from backend when new chapter is created, fetches followers, creates notification for each follower.

#### Scenario: New chapter notification

- **WHEN** a new chapter webhook is received
- **THEN** n8n creates notifications for all users following that comic

### Requirement: Docker compose n8n service

The docker-compose.yml SHALL include n8n service on port 5678 with persistent volume for workflows and credentials.

#### Scenario: Start n8n

- **WHEN** docker-compose up is run
- **THEN** n8n is accessible at http://localhost:5678

### Requirement: Docker compose crawler service

The docker-compose.yml SHALL include crawler-service built from its Dockerfile, connected to the same network as backend and n8n.

#### Scenario: Start crawler

- **WHEN** docker-compose up is run
- **THEN** crawler service is accessible at http://localhost:3002
