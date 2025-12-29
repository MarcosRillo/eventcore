import { getAppearanceSettings, updateAppearanceSettings } from '@/features/appearance/services/appearance.service'
import apiClient from '@/services/apiClient'
import { ThemeSettings } from '@/types/appearance.types'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('appearance.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAppearanceSettings', () => {
    it('should fetch appearance settings successfully', async () => {
      const mockResponse: ThemeSettings = {
        color_primary: '#3B82F6',
        color_secondary: '#10B981',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: 'https://example.com/logo.png',
        banner_url: 'https://example.com/banner.png',
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getAppearanceSettings()

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/appearance')
      expect(result).toEqual(mockResponse)
      expect(result.color_primary).toBe('#3B82F6')
      expect(result.color_secondary).toBe('#10B981')
    })

    it('should fetch appearance settings with null optional fields', async () => {
      const mockResponse: ThemeSettings = {
        color_primary: '#3B82F6',
        color_secondary: '#64748b',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: null,
        banner_url: null,
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getAppearanceSettings()

      expect(result.logo_url).toBeNull()
      expect(result.banner_url).toBeNull()
    })

    it('should handle errors when fetching appearance settings', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(getAppearanceSettings()).rejects.toThrow('Unauthorized')
    })

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(getAppearanceSettings()).rejects.toThrow('Network error')
    })
  })

  describe('updateAppearanceSettings', () => {
    it('should update appearance settings with all fields', async () => {
      const updateData: Partial<ThemeSettings> = {
        color_primary: '#FF0000',
        color_secondary: '#00FF00',
        color_background: '#f5f5f5',
        color_text: '#333333',
        logo_url: 'https://example.com/new-logo.png',
        banner_url: 'https://example.com/new-banner.png',
      }

      const mockResponse: ThemeSettings = {
        color_primary: '#FF0000',
        color_secondary: '#00FF00',
        color_background: '#f5f5f5',
        color_text: '#333333',
        logo_url: 'https://example.com/new-logo.png',
        banner_url: 'https://example.com/new-banner.png',
      }

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', updateData)
      expect(result).toEqual(mockResponse)
      expect(result.color_primary).toBe('#FF0000')
    })

    it('should update appearance settings with partial fields', async () => {
      const updateData: Partial<ThemeSettings> = {
        color_primary: '#123456',
      }

      const mockResponse: ThemeSettings = {
        color_primary: '#123456',
        color_secondary: '#10B981',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: 'https://example.com/logo.png',
        banner_url: null,
      }

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', updateData)
      expect(result.color_primary).toBe('#123456')
    })

    it('should update logo and banner URLs', async () => {
      const updateData: Partial<ThemeSettings> = {
        logo_url: 'https://cdn.example.com/logo-v2.png',
        banner_url: 'https://cdn.example.com/banner-v2.png',
      }

      const mockResponse: ThemeSettings = {
        color_primary: '#3B82F6',
        color_secondary: '#10B981',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: 'https://cdn.example.com/logo-v2.png',
        banner_url: 'https://cdn.example.com/banner-v2.png',
      }

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await updateAppearanceSettings(updateData)

      expect(result.logo_url).toBe('https://cdn.example.com/logo-v2.png')
      expect(result.banner_url).toBe('https://cdn.example.com/banner-v2.png')
    })

    it('should handle validation errors', async () => {
      const updateData: Partial<ThemeSettings> = {
        color_primary: 'invalid-color',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Validation failed')
    })

    it('should handle unauthorized errors', async () => {
      const updateData: Partial<ThemeSettings> = {
        color_primary: '#FF0000',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Forbidden')
    })

    it('should handle server errors', async () => {
      const updateData: Partial<ThemeSettings> = {
        color_secondary: '#Test123',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Internal server error'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Internal server error')
    })

    it('should send empty object when no fields provided', async () => {
      const updateData: Partial<ThemeSettings> = {}

      const mockResponse: ThemeSettings = {
        color_primary: '#3B82F6',
        color_secondary: '#10B981',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: null,
        banner_url: null,
      }

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', {})
      expect(result).toEqual(mockResponse)
    })

    it('should handle null values in update', async () => {
      const updateData: Partial<ThemeSettings> = {
        logo_url: null,
        banner_url: null,
      }

      const mockResponse: ThemeSettings = {
        color_primary: '#3B82F6',
        color_secondary: '#64748b',
        color_background: '#ffffff',
        color_text: '#1e293b',
        logo_url: null,
        banner_url: null,
      }

      mockApiClient.put.mockResolvedValueOnce({ data: mockResponse })

      const result = await updateAppearanceSettings(updateData)

      expect(result.logo_url).toBeNull()
      expect(result.banner_url).toBeNull()
    })
  })
})
