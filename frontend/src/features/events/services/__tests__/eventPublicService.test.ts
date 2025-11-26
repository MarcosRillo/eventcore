import apiClient from '@/services/apiClient'
import { eventPublicService, eventPublicExportService, combinedEventPublicService } from '../eventPublicService'
import { Event, EventPagination } from '@/types/event.types'
import { PublicEventFilters } from '@/types/filter.types'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('eventPublicService', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Public Event',
    description: 'Public Description',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    status: 'published',
    category_id: 1,
    location_id: 1,
    organizer_id: 1,
    is_featured: true,
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  }

  const mockPagination: EventPagination = {
    data: [mockEvent],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 1,
      from: 1,
      to: 1,
    },
    links: {
      first: 'http://api/public/events?page=1',
      last: 'http://api/public/events?page=1',
      prev: null,
      next: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEvents', () => {
    it('should get events without filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const result = await eventPublicService.getEvents()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?')
      expect(result).toEqual(mockPagination)
      expect(result.data).toHaveLength(1)
    })

    it('should get events with filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const filters: PublicEventFilters = {
        category_id: 1,
        start_date: '2025-12-01',
        featured: true,
      }

      await eventPublicService.getEvents(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/public/events?')
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('category_id=1')
      )
    })

    it('should skip null and undefined filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const filters: PublicEventFilters = {
        category_id: undefined,
        start_date: null as any,
        featured: true,
      }

      await eventPublicService.getEvents(filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).not.toContain('category_id')
      expect(callUrl).not.toContain('start_date')
      expect(callUrl).toContain('featured=true')
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(eventPublicService.getEvents()).rejects.toThrow('Network error')
    })
  })

  describe('getEvent', () => {
    it('should get single event by ID', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockEvent } } as any)

      const result = await eventPublicService.getEvent(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/1')
      expect(result).toEqual(mockEvent)
      expect(result.id).toBe(1)
    })

    it('should handle 404 errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(eventPublicService.getEvent(999)).rejects.toThrow('Not found')
    })
  })

  describe('getPublicEvents', () => {
    it('should get public events without filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const result = await eventPublicService.getPublicEvents()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events?')
      expect(result).toEqual(mockPagination)
    })

    it('should get public events with multiple filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const filters: PublicEventFilters = {
        category_id: 1,
        location_id: 2,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        featured: true,
        page: 2,
        per_page: 20,
      }

      await eventPublicService.getPublicEvents(filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('category_id=1')
      expect(callUrl).toContain('location_id=2')
      expect(callUrl).toContain('start_date=2025-12-01')
      expect(callUrl).toContain('end_date=2025-12-31')
      expect(callUrl).toContain('featured=true')
      expect(callUrl).toContain('page=2')
      expect(callUrl).toContain('per_page=20')
    })

    it('should handle empty results', async () => {
      const emptyPagination: EventPagination = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: 0,
          to: 0,
        },
        links: {
          first: null,
          last: null,
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: emptyPagination } as any)

      const result = await eventPublicService.getPublicEvents()

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })
  })

  describe('getPublicEvent', () => {
    it('should get public event by ID', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockEvent } } as any)

      const result = await eventPublicService.getPublicEvent(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/1')
      expect(result).toEqual(mockEvent)
    })

    it('should get public event by slug', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockEvent } } as any)

      const result = await eventPublicService.getPublicEvent('public-event-slug')

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/public-event-slug')
      expect(result).toEqual(mockEvent)
    })

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Event not found'))

      await expect(eventPublicService.getPublicEvent('invalid-slug')).rejects.toThrow('Event not found')
    })
  })

  describe('searchEvents', () => {
    it('should search events with query', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const result = await eventPublicService.searchEvents('music')

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/public/events/search?')
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('q=music')
      )
      expect(result).toEqual(mockPagination)
    })

    it('should search events with query and filters', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockPagination } as any)

      const filters: PublicEventFilters = {
        category_id: 1,
        featured: true,
      }

      await eventPublicService.searchEvents('concert', filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('q=concert')
      expect(callUrl).toContain('category_id=1')
      expect(callUrl).toContain('featured=true')
    })

    it('should handle empty search results', async () => {
      const emptyPagination: EventPagination = {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: 0,
          to: 0,
        },
        links: {
          first: null,
          last: null,
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: emptyPagination } as any)

      const result = await eventPublicService.searchEvents('nonexistent')

      expect(result.data).toHaveLength(0)
      expect(result.meta.total).toBe(0)
    })
  })

  describe('getFeaturedEvents', () => {
    it('should get featured events with default limit', async () => {
      const mockFeaturedEvents = [mockEvent, { ...mockEvent, id: 2 }]
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockFeaturedEvents } } as any)

      const result = await eventPublicService.getFeaturedEvents()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/featured?limit=6')
      expect(result).toEqual(mockFeaturedEvents)
      expect(result).toHaveLength(2)
    })

    it('should get featured events with custom limit', async () => {
      const mockFeaturedEvents = [mockEvent]
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockFeaturedEvents } } as any)

      const result = await eventPublicService.getFeaturedEvents(3)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/featured?limit=3')
      expect(result).toHaveLength(1)
    })

    it('should handle empty featured events', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } } as any)

      const result = await eventPublicService.getFeaturedEvents()

      expect(result).toHaveLength(0)
    })
  })

  describe('getUpcomingEvents', () => {
    it('should get upcoming events with default limit', async () => {
      const mockUpcomingEvents = [mockEvent, { ...mockEvent, id: 2 }]
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockUpcomingEvents } } as any)

      const result = await eventPublicService.getUpcomingEvents()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/upcoming?limit=10')
      expect(result).toEqual(mockUpcomingEvents)
      expect(result).toHaveLength(2)
    })

    it('should get upcoming events with custom limit', async () => {
      const mockUpcomingEvents = [mockEvent]
      mockApiClient.get.mockResolvedValueOnce({ data: { data: mockUpcomingEvents } } as any)

      const result = await eventPublicService.getUpcomingEvents(5)

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/upcoming?limit=5')
      expect(result).toHaveLength(1)
    })

    it('should handle empty upcoming events', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: { data: [] } } as any)

      const result = await eventPublicService.getUpcomingEvents()

      expect(result).toHaveLength(0)
    })
  })
})

describe('eventPublicExportService', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getRSSFeedUrl', () => {
    it('should generate RSS feed URL without filters', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

      const url = eventPublicExportService.getRSSFeedUrl()

      expect(url).toBe('http://api.example.com/api/public/events/rss?')
    })

    it('should generate RSS feed URL with filters', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

      const filters: PublicEventFilters = {
        category_id: 1,
        featured: true,
      }

      const url = eventPublicExportService.getRSSFeedUrl(filters)

      expect(url).toContain('http://api.example.com/api/public/events/rss?')
      expect(url).toContain('category_id=1')
      expect(url).toContain('featured=true')
    })

    it('should use default URL when NEXT_PUBLIC_API_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL

      const url = eventPublicExportService.getRSSFeedUrl()

      expect(url).toBe('http://localhost:8000/api/public/events/rss?')
    })
  })

  describe('getICalUrl', () => {
    it('should generate iCal URL without filters', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

      const url = eventPublicExportService.getICalUrl()

      expect(url).toBe('http://api.example.com/api/public/events/ical?')
    })

    it('should generate iCal URL with filters', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

      const filters: PublicEventFilters = {
        location_id: 2,
        start_date: '2025-12-01',
      }

      const url = eventPublicExportService.getICalUrl(filters)

      expect(url).toContain('http://api.example.com/api/public/events/ical?')
      expect(url).toContain('location_id=2')
      expect(url).toContain('start_date=2025-12-01')
    })

    it('should use default URL when NEXT_PUBLIC_API_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL

      const url = eventPublicExportService.getICalUrl()

      expect(url).toBe('http://localhost:8000/api/public/events/ical?')
    })
  })

  describe('getEventICalUrl', () => {
    it('should generate event-specific iCal URL', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://api.example.com'

      const url = eventPublicExportService.getEventICalUrl(123)

      expect(url).toBe('http://api.example.com/api/public/events/123/ical')
    })

    it('should use default URL when NEXT_PUBLIC_API_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL

      const url = eventPublicExportService.getEventICalUrl(456)

      expect(url).toBe('http://localhost:8000/api/public/events/456/ical')
    })
  })

  describe('downloadICalFile', () => {
    it('should download iCal file without filters', async () => {
      const mockBlob = new Blob(['mock ical data'], { type: 'text/calendar' })
      mockApiClient.get.mockResolvedValueOnce({ data: mockBlob } as any)

      const result = await eventPublicExportService.downloadICalFile()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/events/ical?', {
        responseType: 'blob',
      })
      expect(result).toEqual(mockBlob)
    })

    it('should download iCal file with filters', async () => {
      const mockBlob = new Blob(['mock ical data'], { type: 'text/calendar' })
      mockApiClient.get.mockResolvedValueOnce({ data: mockBlob } as any)

      const filters: PublicEventFilters = {
        category_id: 1,
      }

      await eventPublicExportService.downloadICalFile(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/public/events/ical?'),
        { responseType: 'blob' }
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('category_id=1'),
        { responseType: 'blob' }
      )
    })

    it('should handle download errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Download failed'))

      await expect(eventPublicExportService.downloadICalFile()).rejects.toThrow('Download failed')
    })
  })

  describe('getGoogleCalendarUrl', () => {
    it('should generate Google Calendar URL for event', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: 1,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
        location: { id: 1, name: 'Test Venue', address: '123 Main St', city: 'Test City', province: 'Test', country: 'Argentina' },
      }

      const url = eventPublicExportService.getGoogleCalendarUrl(mockEvent)

      expect(url).toContain('https://calendar.google.com/calendar/render?')
      expect(url).toContain('action=TEMPLATE')
      expect(url).toContain('text=Test+Event')
      expect(url).toContain('dates=')
      expect(url).toContain('details=Test+Description')
      expect(url).toContain('location=123+Main+St')
    })

    it('should handle event without location object', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'Online Event',
        description: 'Virtual event',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: null,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
        location_text: 'Zoom Meeting',
      }

      const url = eventPublicExportService.getGoogleCalendarUrl(mockEvent)

      expect(url).toContain('location=Zoom+Meeting')
    })

    it('should handle event without description', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'No Description Event',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: 1,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
      }

      const url = eventPublicExportService.getGoogleCalendarUrl(mockEvent)

      expect(url).toContain('details=')
      expect(url).not.toContain('details=undefined')
    })
  })

  describe('getOutlookCalendarUrl', () => {
    it('should generate Outlook Calendar URL for event', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: 1,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
        location: { id: 1, name: 'Test Venue', address: '456 Oak Ave', city: 'Test City', province: 'Test', country: 'Argentina' },
      }

      const url = eventPublicExportService.getOutlookCalendarUrl(mockEvent)

      expect(url).toContain('https://outlook.live.com/calendar/0/deeplink/compose?')
      expect(url).toContain('subject=Test+Event')
      expect(url).toContain('startdt=2025-12-01T10%3A00%3A00.000Z')
      expect(url).toContain('enddt=2025-12-01T12%3A00%3A00.000Z')
      expect(url).toContain('body=Test+Description')
      expect(url).toContain('location=456+Oak+Ave')
    })

    it('should handle event without location object', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'Online Event',
        description: 'Virtual event',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: null,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
        location_text: 'Microsoft Teams',
      }

      const url = eventPublicExportService.getOutlookCalendarUrl(mockEvent)

      expect(url).toContain('location=Microsoft+Teams')
    })

    it('should handle event without description', () => {
      const mockEvent: Event = {
        id: 1,
        title: 'No Description Event',
        start_date: '2025-12-01T10:00:00Z',
        end_date: '2025-12-01T12:00:00Z',
        status: 'published',
        category_id: 1,
        location_id: 1,
        organizer_id: 1,
        is_featured: false,
        created_at: '2025-11-01',
        updated_at: '2025-11-01',
      }

      const url = eventPublicExportService.getOutlookCalendarUrl(mockEvent)

      expect(url).toContain('body=')
      expect(url).not.toContain('body=undefined')
    })
  })
})

describe('combinedEventPublicService', () => {
  it('should combine eventPublicService and export service', () => {
    expect(combinedEventPublicService).toHaveProperty('getEvents')
    expect(combinedEventPublicService).toHaveProperty('getEvent')
    expect(combinedEventPublicService).toHaveProperty('getPublicEvents')
    expect(combinedEventPublicService).toHaveProperty('getPublicEvent')
    expect(combinedEventPublicService).toHaveProperty('searchEvents')
    expect(combinedEventPublicService).toHaveProperty('getFeaturedEvents')
    expect(combinedEventPublicService).toHaveProperty('getUpcomingEvents')
    expect(combinedEventPublicService).toHaveProperty('export')
    expect(combinedEventPublicService.export).toHaveProperty('getRSSFeedUrl')
    expect(combinedEventPublicService.export).toHaveProperty('getICalUrl')
  })
})
