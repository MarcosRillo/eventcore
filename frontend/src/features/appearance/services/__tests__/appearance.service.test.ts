import { apiClient } from '@/lib/api'
import { getAppearanceSettings, updateAppearanceSettings } from '../appearance.service'
import { AppearanceResponse, AppearanceFormData } from '@/types/appearance.types'

// Mock apiClient
jest.mock('@/lib/api')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('appearance.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAppearanceSettings', () => {
    it('should fetch appearance settings successfully', async () => {
      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        logo_url: 'https://example.com/logo.png',
        favicon_url: 'https://example.com/favicon.ico',
        entity_name: 'Test Organization',
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await getAppearanceSettings()

      expect(mockApiClient.get).toHaveBeenCalledWith('/admin/appearance')
      expect(result).toEqual(mockResponse)
      expect(result.primary_color).toBe('#3B82F6')
      expect(result.entity_name).toBe('Test Organization')
    })

    it('should fetch appearance settings with null optional fields', async () => {
      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: null,
        accent_color: null,
        logo_url: null,
        favicon_url: null,
        entity_name: 'Minimal Org',
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await getAppearanceSettings()

      expect(result.secondary_color).toBeNull()
      expect(result.accent_color).toBeNull()
      expect(result.logo_url).toBeNull()
      expect(result.favicon_url).toBeNull()
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
      const updateData: Partial<AppearanceFormData> = {
        primary_color: '#FF0000',
        secondary_color: '#00FF00',
        accent_color: '#0000FF',
        logo_url: 'https://example.com/new-logo.png',
        favicon_url: 'https://example.com/new-favicon.ico',
        entity_name: 'Updated Organization',
      }

      const mockResponse: AppearanceResponse = {
        primary_color: '#FF0000',
        secondary_color: '#00FF00',
        accent_color: '#0000FF',
        logo_url: 'https://example.com/new-logo.png',
        favicon_url: 'https://example.com/new-favicon.ico',
        entity_name: 'Updated Organization',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', updateData)
      expect(result).toEqual(mockResponse)
      expect(result.primary_color).toBe('#FF0000')
      expect(result.entity_name).toBe('Updated Organization')
    })

    it('should update appearance settings with partial fields', async () => {
      const updateData: Partial<AppearanceFormData> = {
        primary_color: '#123456',
      }

      const mockResponse: AppearanceResponse = {
        primary_color: '#123456',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        logo_url: 'https://example.com/logo.png',
        favicon_url: 'https://example.com/favicon.ico',
        entity_name: 'Test Organization',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', updateData)
      expect(result.primary_color).toBe('#123456')
    })

    it('should update only entity_name', async () => {
      const updateData: Partial<AppearanceFormData> = {
        entity_name: 'New Entity Name',
      }

      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        logo_url: null,
        favicon_url: null,
        entity_name: 'New Entity Name',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(result.entity_name).toBe('New Entity Name')
    })

    it('should update logo and favicon URLs', async () => {
      const updateData: Partial<AppearanceFormData> = {
        logo_url: 'https://cdn.example.com/logo-v2.png',
        favicon_url: 'https://cdn.example.com/favicon-v2.ico',
      }

      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        logo_url: 'https://cdn.example.com/logo-v2.png',
        favicon_url: 'https://cdn.example.com/favicon-v2.ico',
        entity_name: 'Test Organization',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(result.logo_url).toBe('https://cdn.example.com/logo-v2.png')
      expect(result.favicon_url).toBe('https://cdn.example.com/favicon-v2.ico')
    })

    it('should handle validation errors', async () => {
      const updateData: Partial<AppearanceFormData> = {
        primary_color: 'invalid-color',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Validation failed')
    })

    it('should handle unauthorized errors', async () => {
      const updateData: Partial<AppearanceFormData> = {
        primary_color: '#FF0000',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Forbidden')
    })

    it('should handle server errors', async () => {
      const updateData: Partial<AppearanceFormData> = {
        entity_name: 'Test',
      }

      mockApiClient.put.mockRejectedValueOnce(new Error('Internal server error'))

      await expect(updateAppearanceSettings(updateData)).rejects.toThrow('Internal server error')
    })

    it('should send empty object when no fields provided', async () => {
      const updateData: Partial<AppearanceFormData> = {}

      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#F59E0B',
        logo_url: null,
        favicon_url: null,
        entity_name: 'Test Organization',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/admin/appearance', {})
      expect(result).toEqual(mockResponse)
    })

    it('should handle null values in update', async () => {
      const updateData: Partial<AppearanceFormData> = {
        secondary_color: null,
        accent_color: null,
      }

      const mockResponse: AppearanceResponse = {
        primary_color: '#3B82F6',
        secondary_color: null,
        accent_color: null,
        logo_url: 'https://example.com/logo.png',
        favicon_url: null,
        entity_name: 'Test Organization',
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateAppearanceSettings(updateData)

      expect(result.secondary_color).toBeNull()
      expect(result.accent_color).toBeNull()
    })
  })
})
