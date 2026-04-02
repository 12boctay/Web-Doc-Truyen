## ADDED Requirements

### Requirement: Search comics
The system SHALL provide `GET /api/search?q=keyword` that performs full-text search on comic title and otherNames using MongoDB text index. Results paginated.

#### Scenario: Search with keyword
- **WHEN** a GET request is made to `/api/search?q=punch`
- **THEN** the system returns comics matching "punch" in title or otherNames, sorted by text score

#### Scenario: Empty query
- **WHEN** a GET request is made with empty q parameter
- **THEN** the system returns 400 Bad Request

### Requirement: Search autocomplete
The system SHALL provide `GET /api/search/suggest?q=keyword` that returns top 5 comic titles matching prefix. Uses regex prefix match.

#### Scenario: Autocomplete suggestions
- **WHEN** a GET request is made to `/api/search/suggest?q=one`
- **THEN** the system returns up to 5 comics with titles starting with or containing "one", returning only { title, slug, coverUrl }

#### Scenario: Short query
- **WHEN** q is shorter than 2 characters
- **THEN** the system returns empty array
