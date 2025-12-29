import { approvalService } from '@/features/approval/services/approval.service'
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

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/approve', {
        comments: undefined
      })
      expect(apiClient.patch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockEvent)
    })

    it('should handle different event IDs', async () => {
      const event = { ...mockEvent, id: 123 }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(event)

      await approvalService.approve(123)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/123/approve', {
        comments: undefined
      })
    })

    it('should propagate API errors', async () => {
      const error = new Error('API Error')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.approve(1)).rejects.toThrow('API Error')
    })

    it('should send comments when provided', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(1, { comments: 'Looks good!' })

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/approve', {
        comments: 'Looks good!'
      })
    })

    it('should work without comments', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/approve', {
        comments: undefined
      })
    })

    it('should throw error if comments exceed 1000 characters', async () => {
      const longComments = 'A'.repeat(1001)

      await expect(
        approvalService.approve(1, { comments: longComments })
      ).rejects.toThrow('no pueden exceder 1000 caracteres')
    })

    it('should accept exactly 1000 characters in comments', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)
      const maxComments = 'A'.repeat(1000)

      await approvalService.approve(1, { comments: maxComments })

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/approve', {
        comments: maxComments
      })
    })
  })

  describe('reject', () => {
    it('should call apiClient.patch with correct endpoint and reason', async () => {
      const rejectedEvent = { ...mockEvent, status: 'rejected' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(rejectedEvent)

      const result = await approvalService.reject(1, 'Not appropriate content')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: 'Not appropriate content',
      })
      expect(result).toEqual(rejectedEvent)
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

      await expect(approvalService.reject(1, 'Valid reason here')).rejects.toThrow(
        'Rejection failed'
      )
    })

    it('should throw error if reason is less than 10 characters', async () => {
      await expect(
        approvalService.reject(1, 'Short')
      ).rejects.toThrow('al menos 10 caracteres')
    })

    it('should throw error if reason is empty', async () => {
      await expect(
        approvalService.reject(1, '')
      ).rejects.toThrow('al menos 10 caracteres')
    })

    it('should throw error if reason exceeds 1000 characters', async () => {
      const longReason = 'A'.repeat(1001)
      await expect(
        approvalService.reject(1, longReason)
      ).rejects.toThrow('no puede exceder 1000 caracteres')
    })

    it('should accept exactly 10 characters', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.reject(1, 'A'.repeat(10))

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: 'A'.repeat(10)
      })
    })

    it('should accept exactly 1000 characters', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)
      const maxReason = 'A'.repeat(1000)

      await approvalService.reject(1, maxReason)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/reject', {
        reason: maxReason
      })
    })
  })

  describe('requestChanges', () => {
    it('should call apiClient.patch with correct endpoint and reason', async () => {
      const changesRequestedEvent = { ...mockEvent, status: 'changes_requested' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(changesRequestedEvent)

      const result = await approvalService.requestChanges(1, 'Please fix the date field')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        reason: 'Please fix the date field',
      })
      expect(result).toEqual(changesRequestedEvent)
    })

    it('should handle multiline reasons', async () => {
      const multilineReason = 'Line 1 here\nLine 2 here\nLine 3 here'
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestChanges(1, multilineReason)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        reason: multilineReason,
      })
    })

    it('should propagate API errors', async () => {
      const error = new Error('Request changes failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.requestChanges(1, 'Valid reason here')).rejects.toThrow(
        'Request changes failed'
      )
    })

    it('should throw error if reason is less than 10 characters', async () => {
      await expect(
        approvalService.requestChanges(1, 'Short')
      ).rejects.toThrow('al menos 10 caracteres')
    })

    it('should throw error if reason is empty', async () => {
      await expect(
        approvalService.requestChanges(1, '')
      ).rejects.toThrow('al menos 10 caracteres')
    })

    it('should throw error if reason exceeds 1000 characters', async () => {
      const longReason = 'A'.repeat(1001)
      await expect(
        approvalService.requestChanges(1, longReason)
      ).rejects.toThrow('no puede exceder 1000 caracteres')
    })

    it('should accept exactly 10 characters', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestChanges(1, 'A'.repeat(10))

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        reason: 'A'.repeat(10)
      })
    })

    it('should accept exactly 1000 characters', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)
      const maxReason = 'A'.repeat(1000)

      await approvalService.requestChanges(1, maxReason)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        reason: maxReason
      })
    })

    it('should skip validation when validate:false', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestChanges(1, 'Short', { validate: false })

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', {
        reason: 'Short'
      })
    })

    it('should trim whitespace when validating', async () => {
      await expect(
        approvalService.requestChanges(1, '   ')
      ).rejects.toThrow('al menos 10 caracteres')
    })
  })

  describe('requestPublicApproval', () => {
    it('should call apiClient.patch with correct endpoint', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      const result = await approvalService.requestPublicApproval(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/request-public')
      expect(apiClient.patch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockEvent)
    })

    it('should handle different event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.requestPublicApproval(456)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/456/request-public')
    })

    it('should propagate API errors', async () => {
      const error = new Error('Public approval failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(
        approvalService.requestPublicApproval(1)
      ).rejects.toThrow('Public approval failed')
    })
  })

  describe('publish', () => {
    it('should call apiClient.patch with correct endpoint', async () => {
      const publishedEvent = { ...mockEvent, status: 'published' }
      ;(apiClient.patch as jest.Mock).mockResolvedValue(publishedEvent)

      const result = await approvalService.publish(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/publish', {
        scheduled_at: undefined
      })
      expect(apiClient.patch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(publishedEvent)
    })

    it('should handle different event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.publish(999)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/999/publish', {
        scheduled_at: undefined
      })
    })

    it('should propagate API errors', async () => {
      const error = new Error('Publish failed')
      ;(apiClient.patch as jest.Mock).mockRejectedValue(error)

      await expect(approvalService.publish(1)).rejects.toThrow('Publish failed')
    })

    it('should send scheduled_at when provided', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)
      const futureDate = new Date(Date.now() + 86400000).toISOString()

      await approvalService.publish(1, { scheduledAt: futureDate })

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/publish', {
        scheduled_at: futureDate
      })
    })

    it('should throw error if scheduledAt is not a valid date', async () => {
      await expect(
        approvalService.publish(1, { scheduledAt: 'invalid-date' })
      ).rejects.toThrow('fecha programada debe ser válida')
    })

    it('should throw error if scheduledAt is in the past', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()

      await expect(
        approvalService.publish(1, { scheduledAt: pastDate })
      ).rejects.toThrow('fecha programada debe ser futura')
    })

    it('should throw error if scheduledAt is current time', async () => {
      const now = new Date().toISOString()

      await expect(
        approvalService.publish(1, { scheduledAt: now })
      ).rejects.toThrow('fecha programada debe ser futura')
    })

    it('should accept valid future date', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)
      const futureDate = new Date(Date.now() + 3600000).toISOString() // 1 hour from now

      await approvalService.publish(1, { scheduledAt: futureDate })

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/publish', {
        scheduled_at: futureDate
      })
    })
  })

  describe('edge cases', () => {
    it('should handle event ID of 0', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(0)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/0/approve', {
        comments: undefined
      })
    })

    it('should handle very large event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.approve(999999999)

      expect(apiClient.patch).toHaveBeenCalledWith('/events/999999999/approve', {
        comments: undefined
      })
    })

    it('should handle negative event IDs', async () => {
      ;(apiClient.patch as jest.Mock).mockResolvedValue(mockEvent)

      await approvalService.reject(-1, 'Valid reason here')

      expect(apiClient.patch).toHaveBeenCalledWith('/events/-1/reject', {
        reason: 'Valid reason here'
      })
    })
  })
})
