## ADDED Requirements

### Requirement: User registration
The system SHALL provide `POST /api/auth/register` accepting email, password, and name. It SHALL validate input with Zod, check for duplicate email, hash password with bcrypt, create User document, and return access token + set refresh token cookie.

#### Scenario: Successful registration
- **WHEN** a POST request is made to `/api/auth/register` with valid email, password (min 6 chars), and name
- **THEN** the system creates a new User, returns `{ accessToken, user }` with status 201, and sets HttpOnly refresh token cookie (7 days)

#### Scenario: Duplicate email registration
- **WHEN** a POST request is made with an email that already exists
- **THEN** the system returns 409 Conflict with message "Email already exists"

#### Scenario: Invalid input
- **WHEN** a POST request is made with invalid email format or password shorter than 6 characters
- **THEN** the system returns 400 Bad Request with Zod validation error details

### Requirement: User login
The system SHALL provide `POST /api/auth/login` accepting email and password. It SHALL verify credentials and return JWT tokens.

#### Scenario: Successful login
- **WHEN** a POST request is made with correct email and password
- **THEN** the system returns `{ accessToken, user }`, sets HttpOnly refresh token cookie, and updates user's lastLogin

#### Scenario: Wrong credentials
- **WHEN** a POST request is made with wrong email or password
- **THEN** the system returns 401 Unauthorized with generic message "Invalid email or password" (no leak of which field is wrong)

#### Scenario: Banned user login
- **WHEN** a banned user attempts to login
- **THEN** the system returns 403 Forbidden with ban reason and bannedUntil date

### Requirement: Token refresh
The system SHALL provide `POST /api/auth/refresh` that reads refresh token from HttpOnly cookie, validates it, and issues new token pair (rotation).

#### Scenario: Successful refresh
- **WHEN** a valid refresh token is sent via cookie
- **THEN** the system returns new `{ accessToken }`, sets new refresh token cookie, and invalidates the old refresh token

#### Scenario: Expired or invalid refresh token
- **WHEN** an expired or invalid refresh token is sent
- **THEN** the system returns 401 Unauthorized and clears the refresh token cookie

#### Scenario: Reused refresh token (replay attack)
- **WHEN** a previously rotated (invalidated) refresh token is reused
- **THEN** the system invalidates ALL refresh tokens for that user (security measure) and returns 401

### Requirement: User logout
The system SHALL provide `POST /api/auth/logout` that invalidates the current refresh token and adds access token to Redis blacklist.

#### Scenario: Successful logout
- **WHEN** an authenticated user sends POST to `/api/auth/logout`
- **THEN** the refresh token is invalidated, access token is blacklisted in Redis (TTL = remaining access token lifetime), and refresh cookie is cleared

### Requirement: Forgot password
The system SHALL provide `POST /api/auth/forgot-password` accepting email. It SHALL generate a password reset token and store it (hashed) in the database.

#### Scenario: Forgot password for existing email
- **WHEN** a POST request is made with a registered email
- **THEN** the system generates a reset token (expires in 1 hour), stores the hash in the User document, and returns 200 with message "Reset link sent" (actual email sending is out of scope for this proposal)

#### Scenario: Forgot password for non-existent email
- **WHEN** a POST request is made with an unregistered email
- **THEN** the system returns 200 with same message (prevent email enumeration)

### Requirement: Reset password
The system SHALL provide `POST /api/auth/reset-password` accepting reset token and new password.

#### Scenario: Successful reset
- **WHEN** a valid reset token and new password are provided
- **THEN** the system updates the password hash, clears the reset token, invalidates all existing refresh tokens for the user, and returns 200

#### Scenario: Expired or invalid reset token
- **WHEN** an expired or invalid reset token is provided
- **THEN** the system returns 400 Bad Request

### Requirement: Get current user
The system SHALL provide `GET /api/auth/me` that returns the authenticated user's profile (excluding password).

#### Scenario: Authenticated request
- **WHEN** a request is made with a valid access token
- **THEN** the system returns the user object without password field

#### Scenario: Unauthenticated request
- **WHEN** a request is made without a token or with an invalid token
- **THEN** the system returns 401 Unauthorized

### Requirement: JWT auth middleware
The system SHALL provide middleware that extracts Bearer token from Authorization header, verifies JWT signature, checks Redis blacklist, and attaches user to request object.

#### Scenario: Valid access token
- **WHEN** a request includes a valid, non-blacklisted Bearer token
- **THEN** the middleware attaches `req.user` with userId and role, and passes to next handler

#### Scenario: Blacklisted access token
- **WHEN** a request includes a token that has been blacklisted (user logged out)
- **THEN** the middleware returns 401 Unauthorized

#### Scenario: Missing or malformed token
- **WHEN** a request has no Authorization header or malformed token
- **THEN** the middleware returns 401 Unauthorized

### Requirement: Role-based authorization middleware
The system SHALL provide middleware that checks `req.user.role` against required minimum role level. Role hierarchy: guest < user < moderator < admin < superadmin.

#### Scenario: Sufficient role
- **WHEN** a user with role "admin" accesses an endpoint requiring "moderator" or higher
- **THEN** the middleware allows the request through

#### Scenario: Insufficient role
- **WHEN** a user with role "user" accesses an endpoint requiring "admin"
- **THEN** the middleware returns 403 Forbidden

### Requirement: Rate limiting
The system SHALL apply rate limiting using Redis store. General API: 100 req/15min per IP. Auth endpoints: 5 req/15min per IP.

#### Scenario: Rate limit exceeded
- **WHEN** a client exceeds 5 login attempts in 15 minutes
- **THEN** the system returns 429 Too Many Requests with `Retry-After` header

#### Scenario: Normal usage
- **WHEN** a client makes requests within the rate limit
- **THEN** all requests are processed normally with `X-RateLimit-Remaining` header
