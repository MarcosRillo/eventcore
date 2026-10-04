# Case Study: Multi-Tenant Event Management Platform

> Solo developer. Built from scratch. This codebase is open source — see the repository at github.com/MarcosRillo/eventcore for the full implementation.

---

## What I Built

A full-stack platform for managing and publishing public events across multiple organizations. Multi-tenant architecture where each entity manages its own events, locations, and staff — with a unified public calendar.

**Key workflows**: event creation with approval chains, role-based internal calendars, public calendar with search and filtering, organization onboarding with invitation system.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript (strict), Tailwind 4 |
| Backend | Laravel 13, PHP constraint `^8.3`, Sanctum (cookie-based auth) |
| Database | PostgreSQL 15 |
| Testing | Jest + Testing Library units; separate Playwright E2E; `php artisan test` with Pest/PHPUnit dependencies |
| Infrastructure | Docker Compose, GitHub Actions CI |

## Architecture Decisions

**Feature-based organization** — both frontend and backend are structured by business domain (events, locations, auth, approvals), not by technical layer. Each feature is self-contained with its own controllers/services/types.

**Smart/Dumb component pattern** — containers handle data fetching and state; presentational components are pure and testable. Strict separation enforced across 15 feature modules.

**Multi-tenancy via ORM-level scoping** — a global query scope automatically filters data by tenant on every query. Combined with authorization policies that verify resource ownership before every operation. No endpoint can leak cross-tenant data.

**Cookie-based auth over token storage** — access tokens live in HttpOnly cookies (not localStorage) to prevent XSS token theft. Refresh token rotation with automatic retry on 401. Frontend middleware handles route protection at the edge.

**Content Security Policy with route-aware nonces** — admin routes (fully dynamic) use per-request nonces in script-src. Public routes keep unsafe-inline for ISR cache compatibility. Violation reporting endpoint for security observability.

## Testing Evidence

Testing is reproducible from the repository configuration rather than timeless test totals:

| Scope | Working directory | Command | Source |
|-------|-------------------|---------|--------|
| Frontend units | `frontend/` | `pnpm test` | [Scripts](../frontend/package.json), [Jest config](../frontend/jest.config.js) |
| Frontend coverage | `frontend/` | `pnpm run test:coverage` | [Scripts](../frontend/package.json) |
| Browser workflows | `frontend/` | `pnpm run test:e2e` | [Playwright config](../frontend/playwright.config.ts) |
| Backend | `backend/` | `php artisan test` | [Composer dependencies](../backend/composer.json), [test config](../backend/phpunit.xml) |

The [Tests workflow](../.github/workflows/test.yml) runs `pnpm run test:ci` in `frontend/` and `php artisan test --coverage-clover=coverage.xml` in `backend/`. It does not run Playwright; browser tests require a suitable application/backend environment. Coverage collection is configured, but neither an achieved percentage nor an enforced numeric coverage gate is established by this configuration.

**Audited baseline:** [run 26138337269](https://github.com/MarcosRillo/eventcore/actions/runs/26138337269), at commit `81870e1cefcc8a04db6fffe32232f8c86e3a01c8`, had a successful frontend job and a failure in the backend **Run tests** step. This is not an all-green result or a build-failure diagnosis. Authenticated log retrieval returned HTTP 410, so executed totals, achieved coverage and the failure cause remain unknown. The commands above are reproduction instructions, not results from a new execution.

## Security Posture

- HttpOnly + Secure + SameSite cookies for auth
- 3-layer XSS defense: backend sanitization → DOMPurify → CSP
- Rate limiting per endpoint (3-120 req/min depending on sensitivity)
- HSTS, X-Frame-Options, Permissions-Policy, Referrer-Policy
- Cache invalidation via model observers (no stale lookup data)
- Tenant isolation tested at ORM, policy, and controller layers

## What I'd Show in a Take-Home

Give me a stack and a problem. I'll deliver:
- Clean architecture with clear separation of concerns
- Tests first (TDD when the domain requires it)
- Security by default, not as an afterthought
- Documentation that explains the *why*, not just the *what*
