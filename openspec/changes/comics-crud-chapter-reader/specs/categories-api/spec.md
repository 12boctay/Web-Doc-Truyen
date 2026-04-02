## ADDED Requirements

### Requirement: List all categories
The system SHALL provide `GET /api/categories` that returns all categories sorted by name. Cached in Redis (TTL 1 hour).

#### Scenario: Get categories
- **WHEN** a GET request is made to `/api/categories`
- **THEN** the system returns all categories with name, slug, description, comicCount

### Requirement: Admin create category
The system SHALL provide `POST /api/categories` (admin role required) that creates a new category. Slug auto-generated from name.

#### Scenario: Create category
- **WHEN** an admin sends POST with name "Hành động"
- **THEN** the system creates category with slug "hanh-dong" and returns 201

#### Scenario: Duplicate slug
- **WHEN** an admin creates a category with a name that generates an existing slug
- **THEN** the system returns 409 Conflict

### Requirement: Admin update category
The system SHALL provide `PUT /api/categories/:id` (admin role required).

#### Scenario: Update category
- **WHEN** an admin updates a category name
- **THEN** the category is updated and cache is busted

### Requirement: Admin delete category
The system SHALL provide `DELETE /api/categories/:id` (admin role required). SHALL NOT delete if comics are using this category.

#### Scenario: Delete unused category
- **WHEN** an admin deletes a category with comicCount 0
- **THEN** the category is deleted

#### Scenario: Delete category in use
- **WHEN** an admin deletes a category with comicCount > 0
- **THEN** the system returns 400 with message "Cannot delete category with associated comics"
