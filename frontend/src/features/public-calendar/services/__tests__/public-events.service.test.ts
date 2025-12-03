import apiClient from '@/services/apiClient'
import { publicEventsService } from '../public-events.service'
import { EventsResponse, PublicEvent, EventType, EventSubtype, Location } from '@/features/public-calendar/types/public-calendar.types'
import { AxiosResponse } from 'axios'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Helper to create mock axios response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} } as AxiosResponse['config'],
})

describe('publicEventsService', () => {
  const mockPublicEvent: PublicEvent = {
    id: 1,
    title: 'Public Event',
    description: 'Public Description',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    is_featured: true,
    event_type: {
      id: 1,
      name: 'Cultural',
    },
    event_subtype: {
      id: 1,
      name: 'Music Festival',
      event_type_id: 1,
    },
    locations: [{
      id: 1,
      name: 'Teatro San Martín',
      city: 'Buenos Aires',
    }],
  }

  const mockEventsResponse: EventsResponse = {
    data: [mockPublicEvent],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 1,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all public events without params', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      const result = await publicEventsService.getAll()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
      expect(result).toEqual(mockEventsResponse)
      expect(result.data).toHaveLength(1)
    })

    it('should fetch events with event_type_id filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ event_type_id: 1 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?event_type_id=1')
    })

    it('should fetch events with event_subtype_id filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ event_subtype_id: 2 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?event_subtype_id=2')
    })

    it('should fetch events with location_id filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ location_id: 2 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?location_id=2')
    })

    it('should fetch events with start_date filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ start_date: '2025-12-01' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?start_date=2025-12-01')
    })

    it('should fetch events with end_date filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ end_date: '2025-12-31' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?end_date=2025-12-31')
    })

    it('should fetch events with page filter', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({ page: 2 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?page=2')
    })

    it('should fetch events with multiple filters', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({
        event_type_id: 1,
        event_subtype_id: 2,
        location_id: 3,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        page: 2,
      })

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('event_type_id=1')
      expect(callUrl).toContain('event_subtype_id=2')
      expect(callUrl).toContain('location_id=3')
      expect(callUrl).toContain('start_date=2025-12-01')
      expect(callUrl).toContain('end_date=2025-12-31')
      expect(callUrl).toContain('page=2')
    })

    it('should skip null filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({
        event_type_id: null,
        event_subtype_id: null,
        location_id: null,
        start_date: null,
        end_date: null,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
    })

    it('should skip undefined filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockEventsResponse))

      await publicEventsService.getAll({
        event_type_id: undefined,
        event_subtype_id: undefined,
        location_id: undefined,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events')
    })

    it('should handle empty response', async () => {
      const emptyResponse: EventsResponse = {
        data: [],
        meta: {
          current_page: 1,
          per_page: 15,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(emptyResponse))

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
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockPublicEvent }))

      const result = await publicEventsService.getById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/1')
      expect(result.data).toEqual(mockPublicEvent)
      expect(result.data.id).toBe(1)
    })

    it('should fetch different event IDs', async () => {
      const mockEvent2 = { ...mockPublicEvent, id: 123 }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockEvent2 }))

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
          per_page: 10,
          total: 2,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(upcomingEvents))

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
          per_page: 10,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(emptyResponse))

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
          per_page: 6,
          total: 3,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(featuredEvents))

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
          per_page: 6,
          total: 0,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(emptyResponse))

      const result = await publicEventsService.getFeatured()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch'))

      await expect(publicEventsService.getFeatured()).rejects.toThrow('Failed to fetch')
    })
  })

  describe('getEventTypes', () => {
    it('should fetch event types from /public/event-types', async () => {
      const mockEventTypes = [
        { id: 1, name: 'Cultural', is_active: true },
        { id: 2, name: 'Business', is_active: true },
        { id: 3, name: 'Deportivo', is_active: true },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockEventTypes }))

      const result = await publicEventsService.getEventTypes()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/event-types')
      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('Cultural')
      expect(result.data[1].name).toBe('Business')
      expect(result.data[2].name).toBe('Deportivo')
    })

    it('should handle empty event types list', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: [] }))

      const result = await publicEventsService.getEventTypes()

      expect(result.data).toHaveLength(0)
    })

    it('should handle errors when fetching event types', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(publicEventsService.getEventTypes()).rejects.toThrow('Network error')
    })

    it('should fetch event types with all required fields', async () => {
      const mockEventTypes = [
        { id: 1, name: 'Cultural', is_active: true },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockEventTypes }))

      const result = await publicEventsService.getEventTypes()

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('is_active')
      expect(result.data[0].is_active).toBe(true)
    })

    it('should return only active event types', async () => {
      const mockEventTypes = [
        { id: 1, name: 'Active Type', is_active: true },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockEventTypes }))

      const result = await publicEventsService.getEventTypes()

      // Service should return data as-is (backend filters inactive types)
      expect(result.data.every(type => type.is_active)).toBe(true)
    })
  })

  describe('getEventSubtypes', () => {
    it('should fetch subtypes for specific event type', async () => {
      const mockSubtypes = [
        { id: 1, name: 'Music Festival', event_type_id: 1, is_active: true },
        { id: 2, name: 'Theatre Performance', event_type_id: 1, is_active: true },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockSubtypes }))

      const result = await publicEventsService.getEventSubtypes(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/event-types/1/subtypes')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Music Festival')
      expect(result.data[0].event_type_id).toBe(1)
    })

    it('should handle empty subtypes list', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: [] }))

      const result = await publicEventsService.getEventSubtypes(1)

      expect(result.data).toHaveLength(0)
    })

    it('should handle errors when fetching subtypes', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(publicEventsService.getEventSubtypes(1)).rejects.toThrow('Network error')
    })

    it('should fetch subtypes with all required fields', async () => {
      const mockSubtypes = [
        { id: 1, name: 'Music Festival', event_type_id: 1, is_active: true },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockSubtypes }))

      const result = await publicEventsService.getEventSubtypes(1)

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('event_type_id')
      expect(result.data[0]).toHaveProperty('is_active')
    })

    it('should call correct endpoint for different event type ids', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: [] }))

      await publicEventsService.getEventSubtypes(5)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/event-types/5/subtypes')
    })
  })

  describe('getLocations', () => {
    it('should fetch active locations successfully', async () => {
      const mockLocations: Location[] = [
        { id: 1, name: 'Teatro San Martín', city: 'CABA' },
        { id: 2, name: 'Centro Cultural Kirchner', city: 'CABA' },
        { id: 3, name: 'Luna Park', city: 'CABA' },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockLocations }))

      const result = await publicEventsService.getLocations()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/locations/active')
      expect(result.data).toHaveLength(3)
      expect(result.data[0].name).toBe('Teatro San Martín')
      expect(result.data[1].name).toBe('Centro Cultural Kirchner')
    })

    it('should handle empty locations list', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: [] }))

      const result = await publicEventsService.getLocations()

      expect(result.data).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Failed to fetch locations'))

      await expect(publicEventsService.getLocations()).rejects.toThrow('Failed to fetch locations')
    })

    it('should fetch locations with all required fields', async () => {
      const mockLocations: Location[] = [
        { id: 1, name: 'Teatro San Martín', city: 'CABA' },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockLocations }))

      const result = await publicEventsService.getLocations()

      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
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
      await expect(publicEventsService.getEventTypes()).rejects.toThrow('Not found')
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
