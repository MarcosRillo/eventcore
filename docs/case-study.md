# Case Study: Multi-Tenant Event Management Platform

> Solo developer. Built from scratch. Currently in staging for a public-sector organization.
> I cannot share the repository or URLs due to professional ethics with my current employer.

---

## What I Built

A full-stack platform for managing and publishing public events across multiple organizations. Multi-tenant architecture where each entity manages its own events, locations, and staff — with a unified public calendar.

**Key workflows**: event creation with approval chains, role-based internal calendars, public calendar with search and filtering, organization onboarding with invitation system.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript (strict), Tailwind 4 |
| Backend | Laravel 12, PHP 8.3, Sanctum (cookie-based auth) |
| Database | PostgreSQL 15 |
| Testing | Jest + Testing Library, Playwright E2E, Pest + PHPUnit |
| Infrastructure | Docker Compose, GitHub Actions CI |

## Architecture Decisions

**Feature-based organization** — both frontend and backend are structured by business domain (events, locations, auth, approvals), not by technical layer. Each feature is self-contained with its own controllers/services/types.

**Smart/Dumb component pattern** — containers handle data fetching and state; presentational components are pure and testable. Strict separation enforced across 15 feature modules.

**Multi-tenancy via ORM-level scoping** — a global query scope automatically filters data by tenant on every query. Combined with authorization policies that verify resource ownership before every operation. No endpoint can leak cross-tenant data.

**Cookie-based auth over token storage** — access tokens live in HttpOnly cookies (not localStorage) to prevent XSS token theft. Refresh token rotation with automatic retry on 401. Frontend middleware handles route protection at the edge.

**Content Security Policy with route-aware nonces** — admin routes (fully dynamic) use per-request nonces in script-src. Public routes keep unsafe-inline for ISR cache compatibility. Violation reporting endpoint for security observability.

## By the Numbers

| Metric | Value |
|--------|-------|
| Frontend source files | 557 |
| Backend source files | 143 |
| Frontend tests | 2,778 (156 suites) |
| Backend tests | 566 (2,191 assertions) |
| E2E test specs | 15 (Playwright, multi-role) |
| Database migrations | 59 |
| Commits | 480+ |
| Feature modules | 15 frontend, 13 backend |

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
