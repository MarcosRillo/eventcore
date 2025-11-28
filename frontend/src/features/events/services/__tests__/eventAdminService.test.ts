import apiClient from '@/services/apiClient'
import { eventAdminService, eventAdminApprovalService, combinedEventAdminService } from '../eventAdminService'
import { Event, EventFormData, EventPagination, EventFilters, EventStatistics, ApprovalStatistics, EventStatus, EVENT_STATUS, EVENT_TYPE, EventStatusCode, EventTypeCode } from '@/types/event.types'
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

// Helper to create valid Event mock
const createMockEvent = (overrides: Partial<Event> & { id: number; title: string }): Event => ({
  description: 'Test event description',
  start_date: '2025-12-01T10:00:00.000Z',
  end_date: '2025-12-01T18:00:00.000Z',
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

// Helper to create valid PaginationMeta
const createMockMeta = (overrides: Partial<{
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}> = {}) => ({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
  path: 'http://api.example.com/events',
  links: [],
  ...overrides,
})

describe('eventAdminService', () => {
  const mockEvent = createMockEvent({ id: 1, title: 'Admin Event', description: 'Admin Description' })

  const mockPagination: EventPagination = {
    data: [mockEvent],
    meta: createMockMeta({ total: 1, from: 1, to: 1 }),
    links: {
      first: 'http://api/events?page=1',
      last: 'http://api/events?page=1',
      prev: null,
      next: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEvents', () => {
    it('should get events without filters', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const result = await eventAdminService.getEvents()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events?')
      expect(result).toEqual(mockPagination)
      expect(result.data).toHaveLength(1)
    })

    it('should get events with filters', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const filters: EventFilters = {
        category_id: 1,
        status: 'draft',
        page: 2,
      }

      await eventAdminService.getEvents(filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('category_id=1')
      expect(callUrl).toContain('status=draft')
      expect(callUrl).toContain('page=2')
    })

    it('should skip null, undefined, and empty string filter values', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const filters: EventFilters = {
        category_id: undefined,
        status: undefined,
        search: '',
        page: 1,
      }

      await eventAdminService.getEvents(filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).not.toContain('category_id')
      expect(callUrl).not.toContain('status')
      expect(callUrl).not.toContain('search')
      expect(callUrl).toContain('page=1')
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(eventAdminService.getEvents()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getEvent', () => {
    it('should get single event by ID', async () => {
      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockEvent }))

      const result = await eventAdminService.getEvent(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/1')
      expect(result).toEqual(mockEvent)
      expect(result.id).toBe(1)
    })

    it('should handle 404 errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(eventAdminService.getEvent(999)).rejects.toThrow('Not found')
    })
  })

  describe('createEvent', () => {
    it('should create event with all fields', async () => {
      const formData: EventFormData = {
        title: 'New Event',
        description: 'New Description',
        start_date: '2025-12-01',
        end_date: '2025-12-02',
        type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
        category_id: 1,
        location_ids: [1],
      }

      const createdEvent = createMockEvent({ id: 2, title: 'New Event', description: 'New Description' })
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: createdEvent }))

      const result = await eventAdminService.createEvent(formData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events', {
        ...formData,
        status: 'draft',
      })
      expect(result).toEqual(createdEvent)
      expect(result.status).toBe('draft')
    })

    it('should set end_date to start_date if not provided', async () => {
      const formData: EventFormData = {
        title: 'Single Day Event',
        description: 'Single day event description',
        start_date: '2025-12-01',
        type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
        category_id: 1,
        location_ids: [1],
      }

      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: mockEvent }))

      await eventAdminService.createEvent(formData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events', {
        ...formData,
        status: 'draft',
        end_date: '2025-12-01',
      })
    })

    it('should handle validation errors', async () => {
      const formData: EventFormData = {
        title: '',
        description: '',
        start_date: '',
        type: EVENT_TYPE.SINGLE_LOCATION as EventTypeCode,
        category_id: 0,
        location_ids: [],
      }

      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(eventAdminService.createEvent(formData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateEvent', () => {
    it('should update event with partial data', async () => {
      const updateData: Partial<EventFormData> = {
        title: 'Updated Title',
      }

      const updatedEvent = { ...mockEvent, title: 'Updated Title' }
      mockApiClient.put.mockResolvedValueOnce(createMockResponse({ data: updatedEvent }))

      const result = await eventAdminService.updateEvent(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/events/1', updateData)
      expect(result.title).toBe('Updated Title')
    })

    it('should set end_date to start_date if start_date provided without end_date', async () => {
      const updateData: Partial<EventFormData> = {
        start_date: '2025-12-15',
      }

      mockApiClient.put.mockResolvedValueOnce(createMockResponse({ data: mockEvent }))

      await eventAdminService.updateEvent(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/events/1', {
        start_date: '2025-12-15',
        end_date: '2025-12-15',
      })
    })

    it('should not modify end_date if explicitly provided', async () => {
      const updateData: Partial<EventFormData> = {
        start_date: '2025-12-15',
        end_date: '2025-12-20',
      }

      mockApiClient.put.mockResolvedValueOnce(createMockResponse({ data: mockEvent }))

      await eventAdminService.updateEvent(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/events/1', updateData)
    })

    it('should handle not found errors', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Event not found'))

      await expect(eventAdminService.updateEvent(999, { title: 'Test' })).rejects.toThrow('Event not found')
    })
  })

  describe('deleteEvent', () => {
    it('should delete event successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce(createMockResponse(undefined))

      await expect(eventAdminService.deleteEvent(1)).resolves.not.toThrow()

      expect(mockApiClient.delete).toHaveBeenCalledWith('/events/1')
    })

    it('should handle delete errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete published event'))

      await expect(eventAdminService.deleteEvent(1)).rejects.toThrow('Cannot delete published event')
    })
  })

  describe('bulkDeleteEvents', () => {
    it('should bulk delete multiple events', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(undefined))

      await expect(eventAdminService.bulkDeleteEvents?.([1, 2, 3])).resolves.not.toThrow()

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-delete', { event_ids: [1, 2, 3] })
    })

    it('should handle bulk delete errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Some events cannot be deleted'))

      await expect(eventAdminService.bulkDeleteEvents?.([1, 2])).rejects.toThrow('Some events cannot be deleted')
    })
  })

  describe('duplicateEvent', () => {
    it('should duplicate event without overrides', async () => {
      const duplicatedEvent = { ...mockEvent, id: 2, title: 'Copy of Admin Event' }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: duplicatedEvent }))

      const result = await eventAdminService.duplicateEvent(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/duplicate', {})
      expect(result.id).toBe(2)
    })

    it('should duplicate event with overrides', async () => {
      const overrides: Partial<EventFormData> = {
        title: 'Custom Duplicate Title',
        start_date: '2025-12-15',
      }

      const duplicatedEvent = { ...mockEvent, id: 2, ...overrides }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: duplicatedEvent }))

      const result = await eventAdminService.duplicateEvent(1, overrides)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/duplicate', overrides)
      expect(result.title).toBe('Custom Duplicate Title')
      expect(result.start_date).toBe('2025-12-15')
    })

    it('should handle duplicate errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Event not found'))

      await expect(eventAdminService.duplicateEvent(999)).rejects.toThrow('Event not found')
    })
  })

  describe('toggleFeatured', () => {
    it('should toggle featured status', async () => {
      const featuredEvent = { ...mockEvent, is_featured: true }
      mockApiClient.patch.mockResolvedValueOnce(createMockResponse({ data: featuredEvent }))

      const result = await eventAdminService.toggleFeatured(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/toggle-featured')
      expect(result.is_featured).toBe(true)
    })

    it('should handle toggle errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(eventAdminService.toggleFeatured(1)).rejects.toThrow('Forbidden')
    })
  })

  describe('bulkUpdateStatus', () => {
    it('should bulk update event status without comment', async () => {
      const updatedEvents = [
        createMockEvent({ id: 1, title: 'Event 1', status: EVENT_STATUS.APPROVED_INTERNAL as EventStatusCode }),
        createMockEvent({ id: 2, title: 'Event 2', status: EVENT_STATUS.APPROVED_INTERNAL as EventStatusCode }),
      ]
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: updatedEvents }))

      const result = await eventAdminService.bulkUpdateStatus?.([1, 2], 'approved_internal')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-update-status', {
        event_ids: [1, 2],
        status: 'approved_internal',
        comment: undefined,
      })
      expect(result).toHaveLength(2)
      expect(result?.[0].status).toBe('approved_internal')
    })

    it('should bulk update event status with comment', async () => {
      const updatedEvents = [createMockEvent({ id: 1, title: 'Event 1', status: EVENT_STATUS.REJECTED as EventStatusCode })]
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: updatedEvents }))

      await eventAdminService.bulkUpdateStatus?.([1], 'rejected', 'Does not meet criteria')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-update-status', {
        event_ids: [1],
        status: 'rejected',
        comment: 'Does not meet criteria',
      })
    })
  })

  describe('exportEvents', () => {
    it('should export events as CSV without filters', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' })
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockBlob))

      const result = await eventAdminService.exportEvents?.()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/export/csv?', {
        responseType: 'blob',
      })
      expect(result).toEqual(mockBlob)
    })

    it('should export events with filters and format', async () => {
      const mockBlob = new Blob(['xlsx data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockBlob))

      const filters = {
        category_id: 1,
        status: 'published' as const,
      }

      await eventAdminService.exportEvents?.(filters, 'xlsx')

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('/events/export/xlsx?')
      expect(callUrl).toContain('category_id=1')
      expect(callUrl).toContain('status=published')
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.any(String),
        { responseType: 'blob' }
      )
    })

    it('should export events as PDF', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' })
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockBlob))

      await eventAdminService.exportEvents?.({}, 'pdf')

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/export/pdf?', {
        responseType: 'blob',
      })
    })
  })

  describe('getStatistics', () => {
    it('should get event statistics', async () => {
      const mockStats: EventStatistics = {
        total: 100,
        draft: 20,
        published: 25,
        cancelled: 5,
        upcoming: 30,
        featured: 10,
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockStats))

      const result = await eventAdminService.getStatistics()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/statistics')
      expect(result).toEqual(mockStats)
      expect(result.total).toBe(100)
    })

    it('should handle statistics errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(eventAdminService.getStatistics()).rejects.toThrow('Forbidden')
    })
  })
})

describe('eventAdminApprovalService', () => {
  const mockEvent = createMockEvent({
    id: 1,
    title: 'Test Event',
    description: 'Test',
    status: EVENT_STATUS.PENDING_INTERNAL_APPROVAL as EventStatusCode,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEventsByStatus', () => {
    it('should get events by status without filters', async () => {
      const mockPagination: EventPagination = {
        data: [mockEvent],
        meta: createMockMeta({ total: 1, from: 1, to: 1 }),
        links: { first: null, last: null, prev: null, next: null },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const result = await eventAdminApprovalService.getEventsByStatus('pending_internal_approval')

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/approval-status/pending_internal_approval?')
      expect(result.data).toHaveLength(1)
    })

    it('should get events by status with filters', async () => {
      const mockPagination: EventPagination = {
        data: [],
        meta: createMockMeta({ total: 0, from: null, to: null }),
        links: { first: null, last: null, prev: null, next: null },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const filters: EventFilters = { category_id: 1 }

      await eventAdminApprovalService.getEventsByStatus('published', filters)

      const callUrl = mockApiClient.get.mock.calls[0][0]
      expect(callUrl).toContain('/events/approval-status/published?')
      expect(callUrl).toContain('category_id=1')
    })
  })

  describe('getApprovalStatistics', () => {
    it('should get approval statistics', async () => {
      const mockStats: ApprovalStatistics = {
        total: 20,
        pending_internal_approval: 5,
        approved_internal: 3,
        pending_public_approval: 2,
        published: 4,
        requires_changes: 1,
        rejected: 2,
        draft: 2,
        cancelled: 1,
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockStats))

      const result = await eventAdminApprovalService.getApprovalStatistics()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/approval/statistics')
      expect(result.pending_internal_approval).toBe(5)
      expect(result.pending_public_approval).toBe(2)
    })
  })

  describe('approveInternal', () => {
    it('should approve event internally without comment', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'approved_internal' } }))

      const result = await eventAdminApprovalService.approveInternal(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/approve-internal', {})
      expect(result.status).toBe('approved_internal')
    })

    it('should approve event internally with comment', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'approved_internal' } }))

      await eventAdminApprovalService.approveInternal(1, 'Looks good')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/approve-internal', { comment: 'Looks good' })
    })
  })

  describe('requestPublic', () => {
    it('should request public approval', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'pending_public_approval' } }))

      const result = await eventAdminApprovalService.requestPublic(1, 'Ready for public')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/request-public', { comment: 'Ready for public' })
      expect(result.status).toBe('pending_public_approval')
    })
  })

  describe('approvePublic', () => {
    it('should approve event for public', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'published' } }))

      const result = await eventAdminApprovalService.approvePublic(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/approve-public', {})
      expect(result.status).toBe('published')
    })
  })

  describe('requestChanges', () => {
    it('should request changes with comment', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'requires_changes' } }))

      const result = await eventAdminApprovalService.requestChanges(1, 'Please fix the date')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/request-changes', { comment: 'Please fix the date' })
      expect(result.status).toBe('requires_changes')
    })
  })

  describe('rejectEvent', () => {
    it('should reject event with comment', async () => {
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: { ...mockEvent, status: 'rejected' } }))

      const result = await eventAdminApprovalService.rejectEvent(1, 'Does not meet criteria')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/1/reject', { comment: 'Does not meet criteria' })
      expect(result.status).toBe('rejected')
    })
  })

  describe('bulkApproveInternal', () => {
    it('should bulk approve events internally', async () => {
      const mockEvents = [
        { ...mockEvent, id: 1, status: 'approved_internal' as EventStatus },
        { ...mockEvent, id: 2, status: 'approved_internal' as EventStatus },
      ]
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: mockEvents }))

      const result = await eventAdminApprovalService.bulkApproveInternal([1, 2], 'Batch approved')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-approve-internal', {
        event_ids: [1, 2],
        comment: 'Batch approved',
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('bulkApprovePublic', () => {
    it('should bulk approve events for public', async () => {
      const mockEvents = [{ ...mockEvent, status: 'published' as EventStatus }]
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: mockEvents }))

      await eventAdminApprovalService.bulkApprovePublic([1])

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-approve-public', {
        event_ids: [1],
        comment: undefined,
      })
    })
  })

  describe('bulkReject', () => {
    it('should bulk reject events', async () => {
      const mockEvents = [{ ...mockEvent, status: 'rejected' as EventStatus }]
      mockApiClient.post.mockResolvedValueOnce(createMockResponse({ data: mockEvents }))

      await eventAdminApprovalService.bulkReject([1, 2], 'Rejected for review')

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/bulk-reject', {
        event_ids: [1, 2],
        comment: 'Rejected for review',
      })
    })
  })

  describe('getApprovalHistory', () => {
    it('should get approval history for event', async () => {
      const mockHistory = [
        {
          id: 1,
          event_id: 1,
          action: 'approve_internal',
          status_from: 'pending_internal_approval' as EventStatus,
          status_to: 'approved_internal' as EventStatus,
          comment: 'Approved',
          user: { id: 1, name: 'Admin' },
          created_at: '2025-11-01',
        },
      ]

      mockApiClient.get.mockResolvedValueOnce(createMockResponse({ data: mockHistory }))

      const result = await eventAdminApprovalService.getApprovalHistory(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/1/approval-history')
      expect(result).toHaveLength(1)
      expect(result[0].action).toBe('approve_internal')
    })
  })

  describe('getPendingApprovals', () => {
    it('should get pending internal approvals', async () => {
      const mockPagination: EventPagination = {
        data: [mockEvent],
        meta: createMockMeta({ total: 1, from: 1, to: 1 }),
        links: { first: null, last: null, prev: null, next: null },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      const result = await eventAdminApprovalService.getPendingApprovals()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/approval-status/pending_internal_approval?')
      expect(result.data).toHaveLength(1)
    })
  })

  describe('getPendingPublicApprovals', () => {
    it('should get pending public approvals', async () => {
      const mockPagination: EventPagination = {
        data: [],
        meta: createMockMeta({ total: 0, from: null, to: null }),
        links: { first: null, last: null, prev: null, next: null },
      }

      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockPagination))

      await eventAdminApprovalService.getPendingPublicApprovals()

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/approval-status/pending_public_approval?')
    })
  })

  describe('autoApprove', () => {
    it('should auto-approve events based on criteria', async () => {
      const mockResult = { approved: 5, skipped: 2 }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResult))

      const criteria = {
        category_ids: [1, 2],
        max_days_old: 7,
      }

      const result = await eventAdminApprovalService.autoApprove(criteria)

      expect(mockApiClient.post).toHaveBeenCalledWith('/events/auto-approve', criteria)
      expect(result.approved).toBe(5)
      expect(result.skipped).toBe(2)
    })
  })
})

describe('combinedEventAdminService', () => {
  it('should combine eventAdminService and approval service', () => {
    expect(combinedEventAdminService).toHaveProperty('getEvents')
    expect(combinedEventAdminService).toHaveProperty('createEvent')
    expect(combinedEventAdminService).toHaveProperty('updateEvent')
    expect(combinedEventAdminService).toHaveProperty('deleteEvent')
    expect(combinedEventAdminService).toHaveProperty('approval')
    expect(combinedEventAdminService.approval).toHaveProperty('approveInternal')
    expect(combinedEventAdminService.approval).toHaveProperty('getApprovalStatistics')
  })
})
