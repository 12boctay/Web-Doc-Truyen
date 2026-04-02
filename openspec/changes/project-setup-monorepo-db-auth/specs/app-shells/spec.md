## ADDED Requirements

### Requirement: Web app shell with providers
The web app (`apps/web`) SHALL be a Next.js App Router application with Redux Toolkit provider, React Query provider, and Tailwind CSS configured. It SHALL have a root layout with Header, Footer, and responsive MobileNav components.

#### Scenario: Web app starts
- **WHEN** developer runs `turbo dev` or `next dev` in apps/web
- **THEN** the web app starts on port 3000 with all providers initialized and base layout rendered

#### Scenario: Redux state persistence
- **WHEN** user refreshes the page
- **THEN** auth state and UI state (theme, sidebar) are restored from localStorage via redux-persist

### Requirement: Admin app shell with providers
The admin app (`apps/admin`) SHALL be a Next.js App Router application with Redux Toolkit provider, React Query provider, and Tailwind CSS. It SHALL have a sidebar-based admin layout.

#### Scenario: Admin app starts
- **WHEN** developer runs `turbo dev` or `next dev` in apps/admin
- **THEN** the admin app starts on port 3001 with admin layout rendered

### Requirement: Redux Toolkit store setup
Both web and admin apps SHALL configure Redux Toolkit stores with slices for: authSlice (user, tokens, isAuthenticated), uiSlice (theme, sidebarOpen). Store SHALL use redux-persist for localStorage persistence.

#### Scenario: Auth state management
- **WHEN** user logs in successfully
- **THEN** authSlice stores user object and isAuthenticated becomes true

#### Scenario: Theme toggle
- **WHEN** user toggles theme
- **THEN** uiSlice updates theme value and it persists across page reloads

### Requirement: React Query configuration
Both web and admin apps SHALL configure TanStack Query with default options: staleTime 5 minutes, retry 1, refetchOnWindowFocus true. QueryClientProvider SHALL wrap the app.

#### Scenario: API data caching
- **WHEN** a query fetches data and the same query is requested within 5 minutes
- **THEN** cached data is returned without a network request

### Requirement: Axios API client
A shared Axios instance SHALL be configured in each app's `lib/api.ts` with baseURL pointing to the server, automatic Authorization header injection from Redux store, and response interceptor for 401 → automatic token refresh.

#### Scenario: Authenticated API request
- **WHEN** an API request is made while user is authenticated
- **THEN** the Axios instance automatically adds `Authorization: Bearer <accessToken>` header

#### Scenario: Access token expired during request
- **WHEN** an API request returns 401 due to expired access token
- **THEN** the interceptor automatically calls `/api/auth/refresh`, retries the original request with new token, and updates Redux store

#### Scenario: Refresh also fails
- **WHEN** both the original request and refresh attempt fail with 401
- **THEN** the user is logged out (Redux auth state cleared) and redirected to login page

### Requirement: Tailwind CSS configuration
Both apps SHALL share a base Tailwind configuration extended from root. Theme SHALL include custom colors, fonts, and breakpoints suitable for a manga reading site.

#### Scenario: Using shared Tailwind classes
- **WHEN** a component uses Tailwind classes in either web or admin app
- **THEN** the classes render correctly with consistent theme values

### Requirement: Shared package exports
`packages/shared` SHALL export TypeScript types (User, Comic, Chapter, Category, etc.), constants (roles, categories list), and utility functions (slugify, formatDate, validation schemas). It SHALL have NO React dependency.

#### Scenario: Importing types in server
- **WHEN** the server app imports `IUser` from `@webdoctruyen/shared`
- **THEN** the type is available for use in Mongoose model definitions and controllers

#### Scenario: Importing validation in frontend
- **WHEN** the web app imports a Zod schema from `@webdoctruyen/shared`
- **THEN** the same validation schema used on the server is available for client-side form validation

### Requirement: Shared UI package
`packages/ui` SHALL export basic React components: Button, Input, Modal, Table, Pagination, Toast. Components SHALL use Tailwind classes and accept standard HTML props via TypeScript generics.

#### Scenario: Using Button component
- **WHEN** the web or admin app imports `Button` from `@webdoctruyen/ui`
- **THEN** the component renders with consistent styling and accepts variant/size props
