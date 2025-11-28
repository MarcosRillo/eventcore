import { approvalService } from '../approval.service'
import apiClient from '@/services/apiClient'

jest.mock('@/services/apiClient')

describe('approvalService', () => {
  const mockEvent = {
    id: 1,
    title: 'Test Event',
    status: 'pending_approval',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('approve', () => {
    it('should call apiClient.patch with correct endpoint', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      const result = await approvalService.approve(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/approve')
      expect(apiClient.patch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockEvent)
    })

    it('should handle different event IDs', async () => {
      const event = { ...mockEvent, id: 123 }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(event)

      await approvalService.approve(123)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/123/approve')
    })

    it('should propagate API errors', async () => {
      const error = new Error('API Error')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.approve(1)).rejects.toThrow('API Error')
    })
  })

  describe('reject', () => {
    it('should call apiClient.patch with correct endpoint and reason', async () => {
      const rejectedEvent = { ...mockEvent, status: 'rejected' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(rejectedEvent)

      const result = await approvalService.reject(1, 'Not appropriate')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: 'Not appropriate',
      })
      expect(result).toEqual(rejectedEvent)
    })

    it('should handle empty reason', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.reject(1, '')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: '',
      })
    })

    it('should handle long rejection reasons', async () => {
      const longReason = 'A'.repeat(500)
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.reject(1, longReason)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: longReason,
      })
    })

    it('should propagate API errors', async () => {
      const error = new Error('Rejection failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.reject(1, 'reason')).rejects.toThrow(
        'Rejection failed'
      )
    })
  })

  describe('requestChanges', () => {
    it('should call apiClient.patch with correct endpoint and comments', async () => {
      const changesRequestedEvent = { ...mockEvent, status: 'changes_requested' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(changesRequestedEvent)

      const result = await approvalService.requestChanges(1, 'Please fix the date')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        comments: 'Please fix the date',
      })
      expect(result).toEqual(changesRequestedEvent)
    })

    it('should handle empty comments', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestChanges(1, '')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        comments: '',
      })
    })

    it('should handle multiline comments', async () => {
      const multilineComments = 'Line 1\nLine 2\nLine 3'
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestChanges(1, multilineComments)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        comments: multilineComments,
      })
    })

    it('should propagate API errors', async () => {
      const error = new Error('Request changes failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.requestChanges(1, 'comments')).rejects.toThrow(
        'Request changes failed'
      )
    })
  })

  describe('publish', () => {
    it('should call apiClient.patch with correct endpoint', async () => {
      const publishedEvent = { ...mockEvent, status: 'published' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(publishedEvent)

      const result = await approvalService.publish(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/publish')
      expect(apiClient.patch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(publishedEvent)
    })

    it('should handle different event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.publish(999)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/999/publish')
    })

    it('should propagate API errors', async () => {
      const error = new Error('Publish failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.publish(1)).rejects.toThrow('Publish failed')
    })
  })

  describe('edge cases', () => {
    it('should handle event ID of 0', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(0)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/0/approve')
    })

    it('should handle very large event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(999999999)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/999999999/approve')
    })
  })
})
