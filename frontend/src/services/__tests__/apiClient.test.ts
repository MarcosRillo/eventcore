/**
 * API Client Tests
 *
 * Tests for the axios-based API client.
 * Note: Authentication is now handled via httpOnly cookies (XSS protection).
 * - No tokens are stored in localStorage
 * - No manual Authorization headers are injected
 * - Cookies are sent automatically via withCredentials: true
 */

import apiClient, {
  isAuthenticated,
  makeApiRequest,
} from '@/services/apiClient'

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('apiClient instance', () => {
    it('should have correct base configuration', () => {
      expect(apiClient.defaults.baseURL).toBeDefined()
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
      expect(apiClient.defaults.headers['Accept']).toBe('application/json')
      expect(apiClient.defaults.timeout).toBe(35000)
    })

    it('should have withCredentials enabled for cookie-based auth', () => {
      expect(apiClient.defaults.withCredentials).toBe(true)
    })
  })

  describe('isAuthenticated', () => {
    it('should always return false (cannot read httpOnly cookies from JS)', () => {
      // With httpOnly cookies, JavaScript cannot read auth state
      // Real auth state comes from AuthContext via API calls
      const result = isAuthenticated()
      expect(result).toBe(false)
    })

    it('should return false regardless of any localStorage state', () => {
      // Even if something were in localStorage, we don't use it
      const result = isAuthenticated()
      expect(result).toBe(false)
    })
  })

  describe('request interceptor', () => {
    it('should add /api/v1 prefix to URLs', async () => {
      const requestConfig = {
        url: '/test-endpoint',
        headers: {},
      }

      // Get the request interceptor
      const interceptors = apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
      const requestInterceptor = interceptors.handlers[0].fulfilled

      const result = requestInterceptor(requestConfig) as { url: string }

      expect(result.url).toBe('/api/v1/test-endpoint')
    })

    it('should not add prefix if URL already starts with /api/v1', async () => {
      const requestConfig = {
        url: '/api/v1/existing',
        headers: {},
      }

      const interceptors = apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
      const requestInterceptor = interceptors.handlers[0].fulfilled

      const result = requestInterceptor(requestConfig) as { url: string }

      expect(result.url).toBe('/api/v1/existing')
    })

    it('should NOT add Authorization header (handled via httpOnly cookies)', async () => {
      const requestConfig = {
        url: '/test',
        headers: {} as Record<string, string>,
      }

      const interceptors = apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
      const requestInterceptor = interceptors.handlers[0].fulfilled

      const result = requestInterceptor(requestConfig) as {
        headers: { Authorization?: string }
      }

      // With httpOnly cookies, we don't inject Authorization headers
      // The cookie is sent automatically by the browser
      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('makeApiRequest', () => {
    it('should be a function', () => {
      expect(typeof makeApiRequest).toBe('function')
    })
  })
})
