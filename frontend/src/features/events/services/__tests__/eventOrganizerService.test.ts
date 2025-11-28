import {
  eventOrganizerService,
  eventOrganizerCommunicationService,
  combinedEventOrganizerService,
} from '../eventOrganizerService'
import apiClient from '@/services/apiClient'
import { Event, EVENT_STATUS, EVENT_TYPE, EventStatusCode, EventTypeCode, EventFormData } from '@/types/event.types'

jest.mock('@/services/apiClient')

// Helper to create valid Event mock
const createMockEvent = (overrides: Partial<Event> & { id: number; title: string }): Event => ({
  description: 'Test event description',
  start_date: '2030-12-01T10:00:00.000Z',
  end_date: '2030-12-01T18:00:00.000Z',
  type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
  status: EVENT_STATUS.DRAFT as EventStatusCode,
  category_id: 1,
  category: {
    id: 1,
    name: 'Test Category',
    slug: 'test-category',
    entity_id: 1,
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  locations: [],
  is_featured: false,
  approval_history: [],
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('eventOrganizerService', () => {
  const mockEvent = createMockEvent({
    id: 1,
    title: 'Test Event',
    start_date: '2030-12-01',
  })

  const mockPagination = {
    data: [mockEvent],
    current_page: 1,
    last_page: 3,
    total: 25,
    per_page: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMyEvents', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockPagination })

      const result = await eventOrganizerService.getMyEvents()

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events?')
      expect(result).toEqual(mockPagination)
    })

    it('should include filter params in URL', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockPagination })

      await eventOrganizerService.getMyEvents({ status: 'draft', page: 2 })

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=draft')
      )
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
    })

    it('should exclude undefined values from params', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockPagination })

      await eventOrganizerService.getMyEvents({ status: undefined, page: undefined })

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events?')
    })

    it('should handle only page filter', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockPagination })

      await eventOrganizerService.getMyEvents({ page: 1 })

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events?page=1')
    })
  })

  describe('getMyEvent', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const result = await eventOrganizerService.getMyEvent(1)

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events/1')
      expect(result).toEqual(mockEvent)
    })

    it('should handle different event IDs', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      await eventOrganizerService.getMyEvent(999)

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events/999')
    })
  })

  describe('createEvent', () => {
    it('should call apiClient.post with correct endpoint and payload', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const formData: EventFormData = {
        title: 'New Event',
        description: 'Description',
        start_date: '2030-12-01',
        end_date: '2030-12-02',
        type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
        category_id: 1,
        location_ids: [1],
      }

      const result = await eventOrganizerService.createEvent(formData)

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events', {
        ...formData,
        status: 'draft',
      })
      expect(result).toEqual(mockEvent)
    })

    it('should set end_date to start_date if not provided', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const formData: EventFormData = {
        title: 'New Event',
        description: 'Description',
        start_date: '2030-12-01',
        type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
        category_id: 1,
        location_ids: [1],
      }

      await eventOrganizerService.createEvent(formData)

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events', {
        ...formData,
        status: 'draft',
        end_date: '2030-12-01',
      })
    })
  })

  describe('updateEvent', () => {
    it('should call apiClient.put with correct endpoint and payload', async () => {
      ;(apiClient.put as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const updateData = { title: 'Updated Title' }

      const result = await eventOrganizerService.updateEvent(1, updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/organizer/events/1', updateData)
      expect(result).toEqual(mockEvent)
    })

    it('should set end_date to start_date if start_date provided but no end_date', async () => {
      ;(apiClient.put as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      await eventOrganizerService.updateEvent(1, { start_date: '2030-12-15' })

      expect(apiClient.put).toHaveBeenCalledWith('/organizer/events/1', {
        start_date: '2030-12-15',
        end_date: '2030-12-15',
      })
    })
  })

  describe('deleteEvent', () => {
    it('should call apiClient.delete with correct endpoint', async () => {
      ;(apiClient.delete as jest.Mock).mockResolvedValue({})

      await eventOrganizerService.deleteEvent(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/organizer/events/1')
    })

    it('should handle different event IDs', async () => {
      ;(apiClient.delete as jest.Mock).mockResolvedValue({})

      await eventOrganizerService.deleteEvent(999)

      expect(apiClient.delete).toHaveBeenCalledWith('/organizer/events/999')
    })
  })

  describe('duplicateEvent', () => {
    it('should call apiClient.post with correct endpoint', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const result = await eventOrganizerService.duplicateEvent(1)

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/duplicate', {})
      expect(result).toEqual(mockEvent)
    })

    it('should include overrides in payload', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      await eventOrganizerService.duplicateEvent(1, { title: 'Duplicated Event' })

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/duplicate', {
        title: 'Duplicated Event',
      })
    })
  })

  describe('submitForApproval', () => {
    it('should call apiClient.post with correct endpoint', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      const result = await eventOrganizerService.submitForApproval?.(1)

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/submit', {
        comment: undefined,
      })
      expect(result).toEqual(mockEvent)
    })

    it('should include comment in payload', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

      await eventOrganizerService.submitForApproval?.(1, 'Please review')

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/submit', {
        comment: 'Please review',
      })
    })
  })

  describe('saveAsTemplate', () => {
    it('should call apiClient.post with correct endpoint and name', async () => {
      const mockTemplate = { id: 1, name: 'My Template' }
      ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { data: mockTemplate } })

      const result = await eventOrganizerService.saveAsTemplate?.(1, 'My Template')

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/save-template', {
        name: 'My Template',
      })
      expect(result).toEqual(mockTemplate)
    })
  })

  describe('getMyTemplates', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      const mockTemplates = [{ id: 1, name: 'Template 1' }]
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockTemplates } })

      const result = await eventOrganizerService.getMyTemplates?.()

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/templates')
      expect(result).toEqual(mockTemplates)
    })
  })
})

describe('eventOrganizerCommunicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMessageToAdmin', () => {
    it('should call apiClient.post with correct endpoint and payload', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({})

      await eventOrganizerCommunicationService.sendMessageToAdmin(1, 'Subject', 'Message')

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/events/1/message', {
        subject: 'Subject',
        message: 'Message',
      })
    })
  })

  describe('getEventMessages', () => {
    it('should call correct endpoint without event_id', async () => {
      const mockMessages = [{ id: 1, content: 'Message' }]
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockMessages } })

      const result = await eventOrganizerCommunicationService.getEventMessages()

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/messages')
      expect(result).toEqual(mockMessages)
    })

    it('should call correct endpoint with event_id', async () => {
      const mockMessages = [{ id: 1, content: 'Message' }]
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockMessages } })

      await eventOrganizerCommunicationService.getEventMessages({ event_id: 1 })

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/events/1/messages')
    })
  })

  describe('markMessageAsRead', () => {
    it('should call apiClient.post with correct endpoint', async () => {
      ;(apiClient.post as jest.Mock).mockResolvedValue({})

      await eventOrganizerCommunicationService.markMessageAsRead(1)

      expect(apiClient.post).toHaveBeenCalledWith('/organizer/messages/1/read')
    })
  })

  describe('getUnreadMessagesCount', () => {
    it('should call apiClient.get and return count', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { count: 5 } })

      const result = await eventOrganizerCommunicationService.getUnreadMessagesCount()

      expect(apiClient.get).toHaveBeenCalledWith('/organizer/messages/unread-count')
      expect(result).toBe(5)
    })
  })
})

describe('combinedEventOrganizerService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delegate getEvents to getMyEvents', async () => {
    const mockPagination = { data: [], current_page: 1, last_page: 1, total: 0 }
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: mockPagination })

    await combinedEventOrganizerService.getEvents()

    expect(apiClient.get).toHaveBeenCalledWith('/organizer/events?')
  })

  it('should delegate getEvent to getMyEvent', async () => {
    const mockEvent = { id: 1, title: 'Test' }
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { data: mockEvent } })

    await combinedEventOrganizerService.getEvent(1)

    expect(apiClient.get).toHaveBeenCalledWith('/organizer/events/1')
  })

  it('should have communication service attached', () => {
    expect(combinedEventOrganizerService.communication).toBe(
      eventOrganizerCommunicationService
    )
  })
})
