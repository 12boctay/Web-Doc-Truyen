## ADDED Requirements

### Requirement: List comics with filtering and pagination
The system SHALL provide `GET /api/comics` that returns paginated comics with filters for country, category, status, and sort options (latest, popular, top-daily, top-weekly, top-monthly). Default: page=1, limit=20, sort=latest.

#### Scenario: List comics with default params
- **WHEN** a GET request is made to `/api/comics`
- **THEN** the system returns the first 20 comics sorted by updatedAt desc, with pagination metadata

#### Scenario: Filter by country and category
- **WHEN** a GET request is made to `/api/comics?country=manhwa&category=hanh-dong`
- **THEN** the system returns only manhwa comics in the "hanh-dong" category

#### Scenario: Sort by top daily views
- **WHEN** a GET request is made to `/api/comics?sort=top-daily`
- **THEN** the system returns comics sorted by `views.daily` descending

### Requirement: Get comic detail by slug
The system SHALL provide `GET /api/comics/:slug` that returns full comic details including populated categories. Response SHALL be cached in Redis (TTL 10 min).

#### Scenario: Valid slug
- **WHEN** a GET request is made to `/api/comics/one-punch-man`
- **THEN** the system returns the comic with populated category names and all fields

#### Scenario: Invalid slug
- **WHEN** a GET request is made with a non-existent slug
- **THEN** the system returns 404 Not Found

#### Scenario: Cache hit
- **WHEN** the same comic is requested within 10 minutes
- **THEN** the response is served from Redis cache

### Requirement: Get comic chapters list
The system SHALL provide `GET /api/comics/:slug/chapters` that returns all chapters for a comic, sorted by chapter number descending.

#### Scenario: Comic with chapters
- **WHEN** a GET request is made to `/api/comics/one-punch-man/chapters`
- **THEN** the system returns chapters array with number, title, slug, createdAt (no pages data)

### Requirement: Get hot comics
The system SHALL provide `GET /api/comics/hot` that returns top 10 comics by `views.weekly`. Cached in Redis (TTL 15 min).

#### Scenario: Request hot comics
- **WHEN** a GET request is made to `/api/comics/hot`
- **THEN** the system returns top 10 comics by weekly views

### Requirement: Get recommended comics
The system SHALL provide `GET /api/comics/recommended` that returns top 10 comics by `rating.average` with minimum 5 ratings. Cached in Redis (TTL 15 min).

#### Scenario: Request recommended comics
- **WHEN** a GET request is made to `/api/comics/recommended`
- **THEN** the system returns top 10 highest-rated comics

### Requirement: Admin create comic
The system SHALL provide `POST /api/comics` (admin role required) that creates a new comic. Input validated with Zod.

#### Scenario: Create comic successfully
- **WHEN** an admin sends POST with title, country, and optional fields
- **THEN** the system creates the comic, auto-generates slug, busts list cache, and returns 201

#### Scenario: Non-admin attempt
- **WHEN** a user with role "user" attempts to create a comic
- **THEN** the system returns 403 Forbidden

### Requirement: Admin update comic
The system SHALL provide `PUT /api/comics/:id` (admin role required) that updates a comic. Busts Redis cache for the comic slug and list caches.

#### Scenario: Update comic
- **WHEN** an admin sends PUT with updated fields
- **THEN** the comic is updated and relevant caches are invalidated

### Requirement: Admin delete comic
The system SHALL provide `DELETE /api/comics/:id` (admin role required) that soft-deletes a comic by setting `isActive: false`. Also busts caches.

#### Scenario: Delete comic
- **WHEN** an admin sends DELETE for a comic ID
- **THEN** the comic's isActive is set to false and it no longer appears in public listings
