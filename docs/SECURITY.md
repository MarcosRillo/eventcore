# Security Architecture

Technical reference for reviewers evaluating the security posture of eventcore.

---

## 1. Authentication Model

Cookie-based authentication using Laravel Sanctum. Tokens are never exposed to JavaScript — they are set exclusively via `Set-Cookie` on the backend.

| Property | Value |
|---|---|
| Transport | httpOnly cookies (`SameSite=Lax`, `Secure` in prod) |
| Access token TTL | Dynamic (calculated from `expires_at`) |
| Refresh token TTL | 7 days (10080 min) |
| Token storage | httpOnly cookies — not `localStorage`, not memory |

**Token rotation:** Every `/auth/refresh` call issues both a new access token and a new refresh token, rotating the pair atomically.

**Refresh flow:**

1. Edge middleware detects `access_token` cookie is absent or expired.
2. If `refresh_token` cookie exists, middleware lets the request through.
3. Axios response interceptor catches 401, calls `POST /api/v1/auth/refresh` (sends `refresh_token` cookie automatically).
4. Backend rotates both tokens; new cookies are set; original request is retried.

**Logout:** The backend revokes all tokens (Sanctum `tokens()->delete()`). Cookies are cleared by setting them to an empty value with `expires=-1`.

**Middleware token expiry check:** A 30-second buffer is applied — if `token_expires_at` is within 30 seconds, it is treated as expired, avoiding race conditions at the edge.

---

## 2. XSS Defense — Three Layers

Defense-in-depth strategy. Each layer catches what the previous one might miss.

| Layer | Where | Implementation |
|---|---|---|
| 1 — Backend sanitization | Laravel Form Requests (`prepareForValidation`) | `HtmlSanitizer` service strips disallowed tags before data hits the DB |
| 2 — CSP | Edge middleware | Blocks inline script execution even if layer 1 fails (see Section 4) |
| 3 — Frontend sanitization | React hook `useSanitizedHTML` | DOMPurify strips HTML before `dangerouslySetInnerHTML` renders it |

**`useSanitizedHTML` allowlist** (`frontend/src/shared/hooks/useSanitizedHTML.ts`):

- Allowed tags: `p`, `br`, `strong`, `em`, `u`, `b`, `i`, `a`, `ul`, `ol`, `li`, `h2`, `h3`, `h4`, `span`, `div`
- Allowed attributes: `href`, `title`, `class`
- Forbidden tags: `script`, `iframe`, `object`, `embed`, `form`
- Forbidden attributes: `onerror`, `onload`, `onclick`, `onmouseover`
- `ALLOW_DATA_ATTR: false` — data attributes fully disabled

---

## 3. Multi-Tenancy Isolation

Data isolation is enforced at the ORM layer via a global Eloquent scope (`TenantScope`), not at the query call site. This means isolation cannot be accidentally omitted by a developer writing a new query.

**Scope logic** (`backend/app/Models/Scopes/TenantScope.php`):

| Role | Filter applied |
|---|---|
| `platform_admin` | No filter — sees all data |
| `entity_admin` / `entity_staff` | `WHERE entity_id = user.organization_id` |
| `organizer_admin` (entity-owned resources) | `WHERE entity_id = organizer.parent_entity_id` |
| `organizer_admin` (events) | `WHERE organization_id = user.organization_id` |

**Authorization layer** (`backend/app/Policies/EventPolicy.php`):

Policies are registered via `Gate::policy(Event::class, EventPolicy::class)` and enforced with `Gate::authorize()` in controllers. The policy's `before()` hook grants platform admins full access before any other check runs.

| Ability | entity_admin | entity_staff | organizer_admin |
|---|---|---|---|
| `viewAny` | yes | yes | yes |
| `view` | own entity | own entity | own org |
| `create` | yes | no | yes |
| `update` | yes | no | yes (own org) |
| `delete` | yes | no | yes (own org) |
| `toggleFeatured` | yes | no | no |

---

## 4. Content Security Policy

Two CSP profiles are applied per-request by the Edge middleware (`frontend/src/middleware.ts`), based on whether the route is fully dynamic (admin) or potentially ISR-cached (public).

**Why two profiles?** Nonces are incompatible with ISR: a cached HTML page would carry a stale nonce, breaking every script load. Public routes use `unsafe-inline` as the trade-off.

| Directive | Admin routes (nonce-based) | Public/ISR routes |
|---|---|---|
| `script-src` | `'self' 'nonce-{random}'` | `'self' 'unsafe-inline'` |
| `style-src` | `'self' 'unsafe-inline'` | `'self' 'unsafe-inline'` |
| `img-src` | `'self' data: blob: https:` | same |
| `connect-src` | `'self' {NEXT_PUBLIC_API_URL}` | same |
| `frame-ancestors` | `'self'` | same |
| `object-src` | `'none'` | same |
| `base-uri` | `'self'` | same |
| `form-action` | `'self'` | same |
| `report-uri` | `/api/csp-report` | same |

**Nonce generation:** `crypto.getRandomValues()` via the Web Crypto API (Edge Runtime). The nonce is propagated as an `x-nonce` request header so RSC layouts can inject it into `<script>` tags server-side.

**Admin route detection** (`frontend/src/lib/csp.ts`): Any path under `/internal-calendar`, `/organizer`, `/events`, `/event-types`, `/locations`, `/users`, `/organizations`, `/registration-requests`, `/invitations`, `/entities`, `/approvals`, or `/dashboard` uses the nonce profile.

---

## 5. Rate Limiting Strategy

Configured in `backend/app/Providers/AppServiceProvider.php`. Three named limiters with per-endpoint granularity applied in route definitions.

| Limiter | Applies to | Key | Limit |
|---|---|---|---|
| `public` | Standard public endpoints | `CF-Connecting-IP` or `request->ip()` | 60 req/min |
| `public-heavy` | Expensive queries (search, stats, calendar) | Same | 20 req/min |
| `authenticated` | Authenticated endpoints | `user.id` (IP fallback) | 120 req/min |

Cloudflare's `CF-Connecting-IP` header is preferred over `request->ip()` to get the real client IP behind the proxy.

---

## 6. Security Headers

Applied to every response via `next.config.ts` `headers()`. CSP is handled separately by the middleware (see Section 4).

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS for 2 years, all subdomains |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Block clickjacking from external frames |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage to cross-origin requests |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable browser feature APIs |

**Image sandbox** (`next.config.ts`): Next.js Image Optimization sets `Content-Security-Policy: default-src 'self'; script-src 'none'; sandbox;` and `Content-Disposition: attachment` on optimized images, preventing them from being used as XSS vectors.
