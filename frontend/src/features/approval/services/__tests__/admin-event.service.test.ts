import { adminEventService } from '../admin-event.service'
import apiClient from '@/services/apiClient'

jest.mock('@/services/apiClient')

describe('adminEventService', () => {
  const mockEventsResponse = {
    data: [
      { id: 1, title: 'Event 1', status: 'pending_approval' },
      { id: 2, title: 'Event 2', status: 'approved_internal' },
    ],
    meta: {
      current_page: 1,
      total: 25,
      per_page: 10,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should call apiClient.get with base URL when no params provided', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      const result = await adminEventService.getAll()

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events')
      expect(result).toEqual(mockEventsResponse)
    })

    it('should call apiClient.get with empty params object', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      const result = await adminEventService.getAll({})

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events')
      expect(result).toEqual(mockEventsResponse)
    })

    it('should include status param when provided', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ status: 'pending_approval' })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/dashboard/events?status=pending_approval'
      )
    })

    it('should include page param when provided', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ page: 2 })

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events?page=2')
    })

    it('should include both status and page params when provided', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ status: 'approved_internal', page: 3 })

      expect(apiClient.get).toHaveBeenCalledWith(
        '/dashboard/events?status=approved_internal&page=3'
      )
    })

    it('should not include status param when null', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ status: null })

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events')
    })

    it('should not include page param when 0', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ page: 0 })

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events')
    })

    it('should handle different status values', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      const statuses = ['draft', 'pending_approval', 'approved_internal', 'published', 'rejected']

      for (const status of statuses) {
        await adminEventService.getAll({ status })
        expect(apiClient.get).toHaveBeenCalledWith(`/dashboard/events?status=${status}`)
      }
    })

    it('should handle large page numbers', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      await adminEventService.getAll({ page: 999 })

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events?page=999')
    })

    it('should propagate API errors', async () => {
      const error = new Error('Network Error')
      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(adminEventService.getAll()).rejects.toThrow('Network Error')
    })

    it('should return events response data correctly', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockEventsResponse)

      const result = await adminEventService.getAll()

      expect(result.data).toHaveLength(2)
      expect(result.meta.current_page).toBe(1)
      expect(result.meta.total).toBe(25)
      expect(result.meta.per_page).toBe(10)
    })
  })
})
