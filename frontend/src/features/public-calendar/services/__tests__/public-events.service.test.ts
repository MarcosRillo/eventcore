import apiClient from '@/services/apiClient'
import { publicEventsService } from '../public-events.service'
import { EventsResponse, PublicEvent, Category, Location } from '@/features/public-calendar/types/public-calendar.types'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('publicEventsService', () => {
  const mockPublicEvent: PublicEvent = {
    id: 1,
    title: 'Public Event',
    description: 'Public Description',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    category_id: 1,
    location_id: 1,
    organizer_id: 1,
    is_featured: true,
    category_name: 'Music',
    location_name: 'Teatro San Martín',
  }

  const mockEventsResponse: EventsResponse = {
    data: [mockPublicEvent],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 1,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all public events without params', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      const result = await publicEventsService.getAll()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
      expect(result).toEqual(mockEventsResponse)
      expect(result.data).toHaveLength(1)
    })

    it('should fetch events with category_id filter', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({ category_id: 1 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?category_id=1')
    })

    it('should fetch events with location_id filter', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({ location_id: 2 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?location_id=2')
    })

    it('should fetch events with start_date filter', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({ start_date: '2025-12-01' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?start_date=2025-12-01')
    })

    it('should fetch events with end_date filter', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({ end_date: '2025-12-31' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?end_date=2025-12-31')
    })

    it('should fetch events with page filter', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({ page: 2 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?page=2')
    })

    it('should fetch events with multiple filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({
        category_id: 1,
        location_id: 2,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        page: 2,
      })

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('category_id=1')
      expect(callUrl).toContain('location_id=2')
      expect(callUrl).toContain('start_date=2025-12-01')
      expect(callUrl).toContain('end_date=2025-12-31')
      expect(callUrl).toContain('page=2')
    })

    it('should skip null filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({
        category_id: null,
        location_id: null,
        start_date: null,
        end_date: null,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
    })

    it('should skip undefined filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockEventsResponse } as any)

      await publicEventsService.getAll({
        category_id: undefined,
        location_id: undefined,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
    })

    it('should handle empty response', async () => {
      const emptyResponse: EventsResponse = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: emptyResponse } as any)

      const result = await publicEventsService.getAll()

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(publicEventsService.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('should fetch event by ID successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockPublicEvent } } as any)

      const result = await publicEventsService.getById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/1')
      expect(result.data).toEqual(mockPublicEvent)
      expect(result.data.id).toBe(1)
    })

    it('should fetch different event IDs', async () => {
      const mockEvent2 = { ...mockPublicEvent, id: 123 }
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockEvent2 } } as any)

      const result = await publicEventsService.getById(123)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/123')
      expect(result.data.id).toBe(123)
    })

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Event not found'))

      await expect(publicEventsService.getById(999)).rejects.toThrow('Event not found')
    })

    it('should handle server errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Internal server error'))

      await expect(publicEventsService.getById(1)).rejects.toThrow('Internal server error')
    })
  })

  describe('getUpcoming', () => {
    it('should fetch upcoming events successfully', async () => {
      const upcomingEvents: EventsResponse = {
        data: [mockPublicEvent, { ...mockPublicEvent, id: 2 }],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: upcomingEvents } as any)

      const result = await publicEventsService.getUpcoming()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/upcoming')
      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(2)
    })

    it('should handle empty upcoming events', async () => {
      const emptyResponse: EventsResponse = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: emptyResponse } as any)

      const result = await publicEventsService.getUpcoming()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await expect(publicEventsService.getUpcoming()).rejects.toThrow('Failed to fetch')
    })
  })

  describe('getFeatured', () => {
    it('should fetch featured events successfully', async () => {
      const featuredEvents: EventsResponse = {
        data: [
          { ...mockPublicEvent, id: 1, is_featured: true },
          { ...mockPublicEvent, id: 2, is_featured: true },
          { ...mockPublicEvent, id: 3, is_featured: true },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 6,
          total: 3,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: featuredEvents } as any)

      const result = await publicEventsService.getFeatured()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/featured')
      expect(result.data).toHaveLength(3)
      expect(result.data.every((e) => e.is_featured)).toBe(true)
    })

    it('should handle empty featured events', async () => {
      const emptyResponse: EventsResponse = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 6,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: emptyResponse } as any)

      const result = await publicEventsService.getFeatured()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await expect(publicEventsService.getFeatured()).rejects.toThrow('Failed to fetch')
    })
  })

  describe('getCategories', () => {
    it('should fetch active categories successfully', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Music', slug: 'music', color: '#FF0000' },
        { id: 2, name: 'Sports', slug: 'sports', color: '#00FF00' },
        { id: 3, name: 'Arts', slug: 'arts', color: '#0000FF' },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockCategories } } as any)

      const result = await publicEventsService.getCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/categories/active')
      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('Music')
      expect(result.data[1].name).toBe('Sports')
    })

    it('should handle empty categories list', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } } as any)

      const result = await publicEventsService.getCategories()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch categories'))

      await expect(publicEventsService.getCategories()).rejects.toThrow('Failed to fetch categories')
    })

    it('should fetch categories with all required fields', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Music', slug: 'music', color: '#FF0000' },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockCategories } } as any)

      const result = await publicEventsService.getCategories()

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('slug')
      expect(result.data[0]).toHaveProperty('color')
    })
  })

  describe('getLocations', () => {
    it('should fetch active locations successfully', async () => {
      const mockLocations: Location[] = [
        { id: 1, name: 'Teatro San Martín', address: 'Av. Corrientes 1530', city: 'CABA' },
        { id: 2, name: 'Centro Cultural Kirchner', address: 'Sarmiento 151', city: 'CABA' },
        { id: 3, name: 'Luna Park', address: 'Av. Madero 420', city: 'CABA' },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockLocations } } as any)

      const result = await publicEventsService.getLocations()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/locations/active')
      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('Teatro San Martín')
      expect(result.data[1].name).toBe('Centro Cultural Kirchner')
    })

    it('should handle empty locations list', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } } as any)

      const result = await publicEventsService.getLocations()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch locations'))

      await expect(publicEventsService.getLocations()).rejects.toThrow('Failed to fetch locations')
    })

    it('should fetch locations with all required fields', async () => {
      const mockLocations: Location[] = [
        { id: 1, name: 'Teatro San Martín', address: 'Av. Corrientes 1530', city: 'CABA' },
      ]

      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockLocations } } as any)

      const result = await publicEventsService.getLocations()

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('address')
      expect(result.data[0]).toHaveProperty('city')
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors across all methods', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'))

      await expect(publicEventsService.getAll()).rejects.toThrow('Not found')
      await expect(publicEventsService.getById(1)).rejects.toThrow('Not found')
      await expect(publicEventsService.getUpcoming()).rejects.toThrow('Not found')
      await expect(publicEventsService.getFeatured()).rejects.toThrow('Not found')
      await expect(publicEventsService.getCategories()).rejects.toThrow('Not found')
      await expect(publicEventsService.getLocations()).rejects.toThrow('Not found')
    })

    it('should handle timeout errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(publicEventsService.getAll()).rejects.toThrow('Request timeout')
    })

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(publicEventsService.getUpcoming()).rejects.toThrow('Network error')
    })
  })
})
