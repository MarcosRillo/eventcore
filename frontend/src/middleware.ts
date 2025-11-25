/**
 * Next.js Middleware - Route Protection
 * Protects routes based on user role from authentication
 * Runs before rendering any page
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface User {
  id: number;
  role?: {
    role_name: string;
  };
  organization_id?: number;
}

// Helper function to get user from cookies
function getUserFromCookies(request: NextRequest): User | null {
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;

  if (!token || !userStr) {
    return null;
  }

  try {
    const user = JSON.parse(decodeURIComponent(userStr)) as User;
    return user;
  } catch {
    return null;
  }
}

// Helper function to get role name
function getRoleName(user: User): string | null {
  return user?.role?.role_name || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ['/login', '/calendar'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
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

  const roleName = getRoleName(user);

  // No role - redirect to login (invalid user)
  if (!roleName) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ROLE-BASED PROTECTION

  // Event Organizer - ONLY /organizer/* and /calendar
  if (roleName === 'Event Organizer') {
    // Allow: /organizer/*, /calendar/*
    const allowedPaths = ['/organizer', '/calendar'];
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed) {
      // Trying to access Entity routes - redirect to organizer dashboard
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }
  }

  // Entity roles (Admin, Staff) - NO /organizer/*
  const entityRoles = ['Entity Administrator', 'Entity Staff', 'Platform Administrator'];
  if (entityRoles.includes(roleName)) {
    if (pathname.startsWith('/organizer')) {
      // Trying to access Organizer routes - redirect to events
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  // Entity Staff - NO write operations (handled by backend, but good UX to prevent access)
  if (roleName === 'Entity Staff') {
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
