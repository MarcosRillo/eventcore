/**
 * Next.js Middleware - Route Protection
 * Protects routes based on user role from authentication
 * Runs before rendering any page
 *
 * Optimized for Next.js 15 Edge Runtime
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * User role codes - MUST match backend user_roles.role_code
 */
type UserRoleCode = 'platform_admin' | 'entity_admin' | 'entity_staff' | 'organizer_admin';

interface User {
  id: number;
  role?: {
    role_code: UserRoleCode;
  };
  organization_id?: number;
}

/**
 * Check if token is expired based on expires_at cookie
 * Uses a buffer of 30 seconds to prevent edge cases
 * @param request
 */
function isTokenExpired(request: NextRequest): boolean {
  const expiresAtStr = request.cookies.get('token_expires_at')?.value;

  if (!expiresAtStr) {
    // No expiry info - let it through (backwards compatibility)
    return false;
  }

  try {
    const expiresAt = new Date(decodeURIComponent(expiresAtStr)).getTime();
    const bufferMs = 30 * 1000; // 30 seconds buffer
    return Date.now() >= expiresAt - bufferMs;
  } catch {
    // Invalid date format - treat as expired for security
    return true;
  }
}

/**
 * Route configuration types for type-safe route management
 */
type ExactRoute = string;
type RoutePrefix = string;

interface RouteConfig {
  /** Exact route matches (no sub-routes) */
  exact: readonly ExactRoute[];
  /** Public route prefixes (allow sub-routes) */
  prefixes: readonly RoutePrefix[];
  /** Authenticated route prefixes (block even if matches public) */
  authenticatedPrefixes: readonly RoutePrefix[];
}

/**
 * Normalize pathname for consistent matching
 *
 * Handles:
 * - Trailing slashes: /calendar/ → /calendar
 * - Double slashes: //calendar → /calendar
 * - Multiple trailing: /calendar/// → /calendar
 *
 * @param pathname - Raw pathname from request.nextUrl.pathname
 * @returns Normalized pathname without trailing slashes
 */
function normalizePath(pathname: string): string {
  const normalized = pathname
    .replace(/\/+/g, '/') // Replace multiple slashes with single
    .replace(/\/+$/, '');  // Remove trailing slashes

  // Handle root path edge case: '/' becomes '' after removing trailing slash
  return normalized || '/';
}

/**
 * Check if pathname matches a prefix with proper boundary validation
 *
 * Prevents false positives:
 * - matchesPrefix('/calendar', '/calendar') → true
 * - matchesPrefix('/calendar/123', '/calendar') → true
 * - matchesPrefix('/calendar-admin', '/calendar') → false (boundary check)
 *
 * @param pathname - Normalized pathname
 * @param prefix - Route prefix to match
 * @returns true if pathname starts with prefix AND has valid boundary
 */
function matchesPrefix(pathname: string, prefix: string): boolean {
  // Check if pathname starts with prefix
  if (!pathname.startsWith(prefix)) {
    return false;
  }

  // Exact match (e.g., /calendar === /calendar)
  if (pathname === prefix) {
    return true;
  }

  // Sub-route match: next character MUST be slash
  // This prevents /calendar matching /calendar-admin
  return pathname.charAt(prefix.length) === '/';
}

/**
 * Type-safe route configuration (optimized for Edge Runtime)
 *
 * Performance:
 * - exact: O(1) lookup with Array.includes (small array, fast)
 * - prefixes: O(n) where n = 1-5 (negligible)
 * - authenticatedPrefixes: O(m) where m = 1-3 (checked first for security)
 */
const ROUTE_CONFIG: RouteConfig = {
  // Public routes: no authentication required
  exact: [
    '/',                  // Landing page
    '/login',             // Authentication
    '/register-request',  // Registration request form
    '/accept-invitation', // Accept invitation (public)
    '/forgot-password',   // Password recovery
    '/reset-password',    // Password reset
  ],

  // Public prefixes: allow sub-routes
  prefixes: [
    '/calendar', // Public calendar and event details (/calendar, /calendar/123)
  ],

  // Authenticated prefixes: ALWAYS require auth (checked first)
  authenticatedPrefixes: [
    '/organizer/calendar',  // Organizer calendar (protected)
    '/internal-calendar',   // Entity admin internal calendar (protected)
  ],
} as const;

/**
 * Check if route is public (no authentication required)
 *
 * Security-first design:
 * 1. Check exact routes (fastest, O(1))
 * 2. Check authenticated routes FIRST (security precedence)
 * 3. Check public prefixes last
 *
 * Optimized for Next.js 15 Edge Runtime performance
 *
 * @param pathname - Raw pathname from request.nextUrl.pathname
 * @returns true if route is public, false if requires authentication
 */
function isPublicRoute(pathname: string): boolean {
  // Normalize pathname for consistent matching
  const normalized = normalizePath(pathname);

  // Step 1: Exact match for static routes (fastest, O(1))
  if (ROUTE_CONFIG.exact.includes(normalized)) {
    return true;
  }

  // Step 2: SECURITY FIRST - Check authenticated routes
  // Authenticated routes take precedence over public prefixes
  // Example: /organizer/calendar should NOT match /calendar prefix
  if (ROUTE_CONFIG.authenticatedPrefixes.some(prefix => matchesPrefix(normalized, prefix))) {
    return false;
  }

  // Step 3: Check public prefixes with boundary validation
  // Prevents false positives (e.g., /calendar-admin matching /calendar)
  return ROUTE_CONFIG.prefixes.some(prefix => matchesPrefix(normalized, prefix));
}

/**
 * Add CSP and nonce headers to a response
 */
function addCspHeaders(response: NextResponse, nonce: string, csp: string): NextResponse {
  if (!csp) return response;
  response.headers.set('x-nonce', nonce);
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Helper function to get user from cookies with robust validation
function getUserFromCookies(request: NextRequest): User | null {
  const token = request.cookies.get('access_token')?.value;
  const userStr = request.cookies.get('user')?.value;

  if (!token || !userStr) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(userStr);
    const user = JSON.parse(decoded);

    // Validate required user structure
    if (
      typeof user !== 'object' ||
      user === null ||
      typeof user.id !== 'number' ||
      user.id <= 0
    ) {
      return null;
    }

    // Validate role structure if present
    if (user.role && (typeof user.role !== 'object' || typeof user.role.role_code !== 'string')) {
      return null;
    }

    return user as User;
  } catch {
    return null;
  }
}

// Helper function to get role code
function getRoleCode(user: User): UserRoleCode | null {
  return user?.role?.role_code || null;
}

/**
 *
 * @param request
 */
export function middleware(request: NextRequest) {
  // Generate a per-request nonce for CSP (skip in development — HMR needs eval)
  const isDev = process.env.NODE_ENV === 'development';
  const nonce = isDev ? '' : Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = isDev ? '' : [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ''}`.trim(),
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  const { pathname } = request.nextUrl;

  // Allow public routes (no authentication required)
  if (isPublicRoute(pathname)) {
    // Best Practice (Next.js): Redirect authenticated users away from /login
    if (pathname === '/login') {
      const user = getUserFromCookies(request);
      if (user && !isTokenExpired(request)) {
        const roleCode = getRoleCode(user);
        if (roleCode === 'organizer_admin') {
          return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/internal-calendar', request.url));
      }
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    return addCspHeaders(response, nonce, cspHeader);
  }

  // Get user from cookies
  const user = getUserFromCookies(request);

  // Not authenticated - redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token expired - redirect to login with expired flag
  if (isTokenExpired(request)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  const roleCode = getRoleCode(user);

  // No role - redirect to login (invalid user)
  if (!roleCode) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ROLE-BASED PROTECTION

  // Event Organizer - ONLY /organizer/* and /calendar (public)
  if (roleCode === 'organizer_admin') {
    // Allow: /organizer/*, /calendar/* (public), NO /internal-calendar
    const allowedPaths = ['/organizer', '/calendar'];
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

    // Block internal calendar for organizers
    if (pathname.startsWith('/internal-calendar')) {
      return NextResponse.redirect(new URL('/organizer/calendar', request.url));
    }

    if (!isAllowed) {
      // Trying to access Entity routes - redirect to organizer dashboard
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }
  }

  // Entity roles (Admin, Staff) - NO /organizer/*
  const entityRoles: UserRoleCode[] = ['entity_admin', 'entity_staff', 'platform_admin'];
  if (entityRoles.includes(roleCode)) {
    if (pathname.startsWith('/organizer')) {
      // Trying to access Organizer routes - redirect to internal calendar
      return NextResponse.redirect(new URL('/internal-calendar', request.url));
    }
  }

  // Entity Staff - NO write operations (handled by backend, but good UX to prevent access)
  if (roleCode === 'entity_staff') {
    const readOnlyRestrictions = [
      '/events/create',
      '/events/edit',
      '/event-types/create',
      '/event-types/edit',
      '/locations/create',
      '/locations/edit',
    ];

    if (readOnlyRestrictions.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/internal-calendar', request.url));
    }
  }

  // All checks passed - allow access
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return addCspHeaders(response, nonce, cspHeader);
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
