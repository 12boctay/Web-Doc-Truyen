## ADDED Requirements

### Requirement: Admin n8n monitor page

The admin panel SHALL provide `/n8n` page showing: n8n workflow list (name, status, last executed), execution history, and a "Trigger Crawl" button.

#### Scenario: View n8n status

- **WHEN** admin visits /n8n
- **THEN** workflows and recent executions are displayed

#### Scenario: Manual trigger crawl

- **WHEN** admin clicks "Trigger Crawl"
- **THEN** the system calls POST /api/n8n/trigger-crawl and shows status toast

### Requirement: Admin crawl sources page

The admin panel SHALL provide `/crawl-sources` page with: table of all sources (name, URL, active status, last crawl time, success/error stats), add/edit/delete actions, test button.

#### Scenario: Manage crawl sources

- **WHEN** admin visits /crawl-sources
- **THEN** all crawl sources are displayed with CRUD actions

#### Scenario: Test source from admin

- **WHEN** admin clicks "Test" on a crawl source
- **THEN** the system calls POST /api/crawl-sources/:id/test and shows result
