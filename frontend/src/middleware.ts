/**
 * Next.js Middleware - Route Protection
 * Protects routes based on user role from authentication
 * Runs before rendering any page
 *
 * Optimized for Next.js 15 Edge Runtime
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Public routes configuration (optimized for Edge Runtime)
// Set provides O(1) lookup vs Array O(n)
const PUBLIC_ROUTES = new Set([
  '/',                  // Landing page
  '/login',             // Authentication
  '/register-request',  // Registration request form
  '/accept-invitation', // Accept invitation (public)
  '/forgot-password',   // Password recovery
  '/reset-password',    // Password reset
]);

// Public route prefixes (allow sub-routes)
const PUBLIC_PREFIXES = [
  '/calendar', // Public calendar and event details
];

/**
 * Check if a route is public (no authentication required)
 * Optimized for Next.js 15 Edge Runtime performance
 */
function isPublicRoute(pathname: string): boolean {
  // Exact match for static routes (O(1))
  if (PUBLIC_ROUTES.has(pathname)) {
    return true;
  }

  // Prefix match for dynamic routes
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// Helper function to get user from cookies with robust validation
function getUserFromCookies(request: NextRequest): User | null {
  const token = request.cookies.get('token')?.value;
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes (no authentication required)
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get user from cookies
  const user = getUserFromCookies(request);

  // Not authenticated - redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token expired - redirect to login with expired flag
  if (isTokenExpired(request)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  const roleCode = getRoleCode(user);

  // No role - redirect to login (invalid user)
  if (!roleCode) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ROLE-BASED PROTECTION

  // Event Organizer - ONLY /organizer/* and /calendar
  if (roleCode === 'organizer_admin') {
    // Allow: /organizer/*, /calendar/*
    const allowedPaths = ['/organizer', '/calendar'];
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed) {
      // Trying to access Entity routes - redirect to organizer dashboard
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }
  }

  // Entity roles (Admin, Staff) - NO /organizer/*
  const entityRoles: UserRoleCode[] = ['entity_admin', 'entity_staff', 'platform_admin'];
  if (entityRoles.includes(roleCode)) {
    if (pathname.startsWith('/organizer')) {
      // Trying to access Organizer routes - redirect to events
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  // Entity Staff - NO write operations (handled by backend, but good UX to prevent access)
  if (roleCode === 'entity_staff') {
    const readOnlyRestrictions = [
      '/events/create',
      '/events/edit',
      '/categories/create',
      '/categories/edit',
      '/locations/create',
      '/locations/edit',
      '/admin',
    ];

    if (readOnlyRestrictions.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  // All checks passed - allow access
  return NextResponse.next();
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
