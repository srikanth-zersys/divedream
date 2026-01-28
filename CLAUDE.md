# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Laravel 11 + Inertia.js + React + TypeScript** starter application. It uses Inertia.js to bridge Laravel backend with a React/TypeScript frontend, providing a modern SPA-like experience while maintaining Laravel's backend architecture.

## Development Commands

### Starting Development Environment
```bash
# Start all services (server, queue, logs, vite) - PRIMARY COMMAND
composer dev

# Alternative: Start services individually
php artisan serve              # Start Laravel server
php artisan queue:listen --tries=1  # Start queue worker
php artisan pail --timeout=0   # Start log viewer
npm run dev                    # Start Vite dev server
```

### Frontend Development
```bash
npm run dev       # Start Vite development server
npm run build     # Build production assets
npm run preview   # Preview production build
```

### Testing
```bash
./vendor/bin/phpunit                    # Run all tests
./vendor/bin/phpunit tests/Unit         # Run unit tests
./vendor/bin/phpunit tests/Feature      # Run feature tests
./vendor/bin/phpunit --filter TestName  # Run specific test
```

### Code Quality
```bash
./vendor/bin/pint       # Format PHP code (Laravel Pint)
php artisan pail        # View Laravel logs in terminal
```

### Database
```bash
php artisan migrate              # Run migrations
php artisan db:seed              # Seed database
php artisan migrate:fresh --seed # Fresh migration with seeding
```

### Queue & Jobs
```bash
php artisan queue:listen --tries=1  # Listen to queue
php artisan horizon                 # Start Horizon dashboard (if using Redis)
```

## Architecture & Key Concepts

### Backend (Laravel)

**Controllers Structure:**
- `app/Http/Controllers/` - Main controller directory
  - `Auth/` - Authentication controllers (Breeze-based)
  - `DashboardController` - Dashboard logic
  - `UserController` - User management
  - `ProfileController` - User profile management
  - `RouteController` - Page routing logic

**Inertia Middleware:**
- `app/Http/Middleware/HandleInertiaRequests.php` shares global data with frontend:
  - `auth.user` - Authenticated user data with role
  - `ziggy` - Laravel route helpers for frontend
  - `flash` - Success/error flash messages

**Routes:**
- `routes/web.php` - Web routes with Inertia rendering
- `routes/auth.php` - Authentication routes (Laravel Breeze)
- Uses `auth:web` middleware for protected routes

**Key Laravel Packages:**
- **Inertia Laravel** - Server-side adapter
- **Ziggy** - Laravel routes in JavaScript
- **Spatie Permission** - Role/permission management
- **Laravel Horizon** - Queue monitoring (Redis-based)
- **Spatie Health** - Application health checks at `/health`
- **Sentry** - Error tracking

### Frontend (React + TypeScript)

**Entry Point:**
- `resources/js/app.tsx` - Main application entry
  - Sets up Inertia app with React
  - Wraps app in Redux Provider
  - Initializes theme from localStorage

**Pages Structure:**
- `resources/js/Pages/` - Inertia page components
  - `auth/` - Authentication pages
  - `dashboard/` - Dashboard pages
  - `Profile/` - Profile pages
  - `page/` - Utility pages (404, 500, starter)

**Layout System:**
- `resources/js/layout/` - Layout components
  - `Layout.tsx` - Main app layout with sidebar/topbar
  - `Topbar.tsx` - Top navigation bar
  - `Sidebar.tsx` - Sidebar navigation
  - `Footer.tsx` - Footer component
  - `LayoutWrapper.tsx` - Layout wrapper logic
  - `NonLayout.tsx` - Pages without layout (auth pages)

**State Management (Redux Toolkit):**
- `resources/js/slices/` - Redux slices
  - `layout/` - Theme and layout state
  - `dashboard/` - Dashboard-specific state
  - `reducer.ts` - Root reducer combining all slices
  - `thunk.ts` - Redux thunks for async actions

**Theme Configuration:**
- Theme settings stored in localStorage with `dx-` prefix:
  - `dx-layout-mode` - Light/dark mode
  - `dx-layout-type` - Vertical/horizontal/modern/boxed/semibox
  - `dx-sidebar-size` - Default/medium/small
  - `dx-layout-direction` - LTR/RTL
  - `dx-theme-color` - Primary color scheme
  - `dx-sidebar-colors` - Sidebar color theme

**Vite Configuration:**
- Path aliases:
  - `@/` → `resources/js/`
  - `@assets/` → `resources/`
- Environment variables passed to frontend:
  - `process.env.APP_NAME`
  - `process.env.BRAND_NAME`

## Important Implementation Patterns

### Inertia Page Components
```typescript
// Page components receive props from Laravel controllers
interface Props {
  auth: { user: { id: number; name: string; email: string; role: string } | null };
  flash: { success?: string; error?: string };
  ziggy: { url: string; location: string };
}
```

### Routing Between Frontend/Backend
- Use `route()` helper from Ziggy in React components
- Routes defined in `routes/web.php` are available in frontend via Ziggy
- Inertia handles routing without full page reloads

### Shared Data Flow
1. Laravel controller returns Inertia response with props
2. `HandleInertiaRequests` middleware adds shared data (auth, flash, ziggy)
3. React page component receives combined props
4. Components access via destructured props or `usePage()` hook

### Theme Customization
- Theme state managed by Redux in `slices/layout/`
- Changes persist to localStorage and update DOM attributes
- HTML attributes control Tailwind CSS variants:
  - `data-mode` - Light/dark mode
  - `data-layout` - Layout type
  - `data-sidebar` - Sidebar size
  - `data-colors` - Color scheme

## Configuration Files

- `.env.example` - Environment variables template (uses SQLite by default)
- `vite.config.ts` - Vite configuration with Laravel plugin
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `composer.json` - PHP dependencies and scripts
- `package.json` - Node dependencies and scripts

## Testing Setup

- PHPUnit configured in `phpunit.xml`
- Test database uses in-memory SQLite or separate connection
- Feature tests in `tests/Feature/`
- Unit tests in `tests/Unit/`

## Health Monitoring

- Health check endpoint: `/health` (via Spatie Health)
- Queue monitoring: `/horizon` (if Redis configured)
- Security advisories checked via Spatie package

## User Management & Permissions

- Uses Spatie Laravel Permission package
- Roles assigned to users, accessible via `$user->getRoleNames()`
- User role shared to frontend via Inertia middleware
- Default seeder creates test user: `test@example.com`
