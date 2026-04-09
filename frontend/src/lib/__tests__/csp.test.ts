import { buildAdminCsp, buildPublicCsp, generateNonce, isAdminRoute } from '@/lib/csp'

describe('CSP utilities', () => {
  describe('isAdminRoute', () => {
    it.each([
      '/internal-calendar',
      '/internal-calendar/events',
      '/organizer',
      '/organizer/dashboard',
      '/organizer/calendar',
      '/events',
      '/events/create',
      '/event-types',
      '/locations',
      '/users',
      '/organizations',
      '/dashboard',
    ])('returns true for admin route: %s', (path) => {
      expect(isAdminRoute(path)).toBe(true)
    })

    it.each([
      '/',
      '/login',
      '/calendar',
      '/calendar/123',
      '/register-request',
      '/forgot-password',
    ])('returns false for public route: %s', (path) => {
      expect(isAdminRoute(path)).toBe(false)
    })

    it('does not match partial prefixes', () => {
      expect(isAdminRoute('/internal-calendar-other')).toBe(false)
      expect(isAdminRoute('/organizer-panel')).toBe(false)
    })
  })

  describe('buildAdminCsp', () => {
    it('includes nonce and does NOT include unsafe-inline for scripts', () => {
      const nonce = 'test-nonce-123'
      const csp = buildAdminCsp(nonce)

      expect(csp).toContain(`'nonce-${nonce}'`)
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/)
    })

    it('keeps unsafe-inline for styles (Tailwind)', () => {
      const csp = buildAdminCsp('nonce')
      expect(csp).toMatch(/style-src[^;]*'unsafe-inline'/)
    })

    it('includes all security directives', () => {
      const csp = buildAdminCsp('nonce')
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).toContain("frame-ancestors 'self'")
      expect(csp).toContain("base-uri 'self'")
      expect(csp).toContain("form-action 'self'")
    })
  })

  describe('buildPublicCsp', () => {
    it('includes unsafe-inline for scripts (ISR compatibility)', () => {
      const csp = buildPublicCsp()
      expect(csp).toMatch(/script-src[^;]*'unsafe-inline'/)
    })

    it('does NOT include any nonce', () => {
      const csp = buildPublicCsp()
      expect(csp).not.toContain('nonce-')
    })
  })

  describe('generateNonce', () => {
    it('returns a non-empty base64 string', () => {
      const nonce = generateNonce()
      expect(nonce).toBeTruthy()
      expect(nonce.length).toBeGreaterThan(0)
    })

    it('generates unique values', () => {
      const nonce1 = generateNonce()
      const nonce2 = generateNonce()
      expect(nonce1).not.toBe(nonce2)
    })
  })
})
