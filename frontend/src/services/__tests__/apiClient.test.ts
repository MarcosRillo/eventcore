import apiClient, {
  getAuthToken,
  isAuthenticated,
  makeApiRequest,
  removeAuthToken,
  setAuthToken,
} from '@/services/apiClient'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('apiClient instance', () => {
    it('should have correct base configuration', () => {
      expect(apiClient.defaults.baseURL).toBeDefined()
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
      expect(apiClient.defaults.headers['Accept']).toBe('application/json')
      expect(apiClient.defaults.timeout).toBe(10000)
    })
  })

  describe('setAuthToken (storeTokens)', () => {
    const mockRefreshToken = 'mock-refresh-token'
    const mockExpiresAt = '2025-12-31T23:59:59.000Z'

    it('should set all tokens in localStorage', () => {
      setAuthToken('test-token-123', mockRefreshToken, mockExpiresAt)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'test-token-123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', mockRefreshToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiresAt', mockExpiresAt)
    })

    it('should handle empty token', () => {
      setAuthToken('', mockRefreshToken, mockExpiresAt)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', '')
    })

    it('should handle long tokens', () => {
      const longToken = 'a'.repeat(1000)
      setAuthToken(longToken, mockRefreshToken, mockExpiresAt)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', longToken)
    })
  })

  describe('removeAuthToken', () => {
    it('should remove authToken from localStorage', () => {
      removeAuthToken()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
    })

    it('should remove user from localStorage', () => {
      removeAuthToken()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should be idempotent (can be called multiple times)', () => {
      removeAuthToken()
      removeAuthToken()
      removeAuthToken()

      // clearTokens removes 4 items: authToken, refreshToken, tokenExpiresAt, user
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(12) // 4 calls per removeAuthToken
    })
  })

  describe('getAuthToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('stored-token')

      const result = getAuthToken()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken')
      expect(result).toBe('stored-token')
    })

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = getAuthToken()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('valid-token')

      const result = isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = isAuthenticated()

      expect(result).toBe(false)
    })

    it('should return true for any non-null token', () => {
      localStorageMock.getItem.mockReturnValue('')

      const result = isAuthenticated()

      // Empty string is still truthy for existence check
      expect(result).toBe(true)
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

    it('should add Authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('my-auth-token')

      const requestConfig = {
        url: '/test',
        headers: {} as Record<string, string>,
      }

      const interceptors = apiClient.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (config: unknown) => unknown }>
      }
      const requestInterceptor = interceptors.handlers[0].fulfilled

      const result = requestInterceptor(requestConfig) as {
        headers: { Authorization: string }
      }

      expect(result.headers.Authorization).toBe('Bearer my-auth-token')
    })
  })

  describe('makeApiRequest', () => {
    it('should be a function', () => {
      expect(typeof makeApiRequest).toBe('function')
    })
  })
})
