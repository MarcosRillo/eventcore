/**
 * Content Security Policy utilities.
 *
 * Separates CSP concerns into pure, testable functions.
 * Admin routes use nonce-based CSP; public/ISR routes use unsafe-inline.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const IS_DEV = process.env.NODE_ENV === 'development'

/** Route prefixes that are fully dynamic (no ISR caching). */
const ADMIN_PREFIXES = [
  '/internal-calendar',
  '/organizer',
  '/events',
  '/event-types',
  '/locations',
  '/users',
  '/organizations',
  '/registration-requests',
  '/invitations',
  '/entities',
  '/approvals',
  '/dashboard',
] as const

/**
 * Check if a pathname belongs to an admin (dynamic) route.
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Generate a cryptographically random nonce for CSP.
 * Uses Web Crypto API available in Edge Runtime.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * Build CSP header for admin routes (nonce-based, no unsafe-inline for scripts).
 */
export function buildAdminCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${IS_DEV ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${API_URL}`.trim(),
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

/**
 * Build CSP header for public routes (unsafe-inline for ISR compatibility).
 */
export function buildPublicCsp(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${IS_DEV ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self' ${API_URL}`.trim(),
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}
