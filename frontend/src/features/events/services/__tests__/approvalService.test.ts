import apiClient from '@/services/apiClient'
import { approvalService, approvalValidation } from '../approvalService'
import { Event } from '@/types/event.types'

// Mock apiClient
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('approvalService', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    status: 'pending_internal_approval',
    category_id: 1,
    location_id: 1,
    organizer_id: 1,
    is_featured: false,
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('approveInternal', () => {
    it('should approve event internally without comment', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Approved', data: { ...mockEvent, status: 'approved_internal' } },
      } as any)

      const result = await approvalService.approveInternal(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/approve', { comment: '' })
      expect(result).toEqual({ ...mockEvent, status: 'approved_internal' })
    })

    it('should approve event internally with comment', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Approved', data: { ...mockEvent, status: 'approved_internal' } },
      } as any)

      const result = await approvalService.approveInternal(1, 'Looks good')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/approve', { comment: 'Looks good' })
      expect(result.status).toBe('approved_internal')
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(approvalService.approveInternal(1)).rejects.toThrow('Unauthorized')
    })
  })

  describe('requestPublicApproval', () => {
    it('should request public approval without comment', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Requested', data: { ...mockEvent, status: 'pending_public_approval' } },
      } as any)

      const result = await approvalService.requestPublicApproval(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/request-public', { comment: '' })
      expect(result.status).toBe('pending_public_approval')
    })

    it('should request public approval with comment', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Requested', data: { ...mockEvent, status: 'pending_public_approval' } },
      } as any)

      const result = await approvalService.requestPublicApproval(1, 'Ready for public')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/request-public', { comment: 'Ready for public' })
      expect(result.status).toBe('pending_public_approval')
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Invalid state'))

      await expect(approvalService.requestPublicApproval(1)).rejects.toThrow('Invalid state')
    })
  })

  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Published', data: { ...mockEvent, status: 'published' } },
      } as any)

      const result = await approvalService.publishEvent(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/publish')
      expect(result.status).toBe('published')
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Cannot publish'))

      await expect(approvalService.publishEvent(1)).rejects.toThrow('Cannot publish')
    })
  })

  describe('requestChanges', () => {
    it('should request changes with feedback', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Changes requested', data: { ...mockEvent, status: 'requires_changes' } },
      } as any)

      const result = await approvalService.requestChanges(1, 'Please fix the date')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/request-changes', { feedback: 'Please fix the date' })
      expect(result.status).toBe('requires_changes')
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(approvalService.requestChanges(1, 'Fix this')).rejects.toThrow('Validation failed')
    })
  })

  describe('rejectEvent', () => {
    it('should reject event with reason', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Rejected', data: { ...mockEvent, status: 'rejected' } },
      } as any)

      const result = await approvalService.rejectEvent(1, 'Does not meet criteria')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/reject', { reason: 'Does not meet criteria' })
      expect(result.status).toBe('rejected')
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Cannot reject'))

      await expect(approvalService.rejectEvent(1, 'Bad event')).rejects.toThrow('Cannot reject')
    })
  })

  describe('toggleFeatured', () => {
    it('should toggle featured status to true', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Toggled', data: { ...mockEvent, is_featured: true } },
      } as any)

      const result = await approvalService.toggleFeatured(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/toggle-featured')
      expect(result.is_featured).toBe(true)
    })

    it('should toggle featured status to false', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Toggled', data: { ...mockEvent, is_featured: false } },
      } as any)

      const result = await approvalService.toggleFeatured(1)

      expect(result.is_featured).toBe(false)
    })

    it('should handle API errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(approvalService.toggleFeatured(1)).rejects.toThrow('Forbidden')
    })
  })

  describe('approveEvent (legacy)', () => {
    it('should call approveInternal', async () => {
      mockApiClient.patch.mockResolvedValueOnce({
        data: { message: 'Approved', data: { ...mockEvent, status: 'approved_internal' } },
      } as any)

      const result = await approvalService.approveEvent(1, 'Legacy approve')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/events/1/approve', { comment: 'Legacy approve' })
      expect(result.status).toBe('approved_internal')
    })
  })
})

describe('approvalValidation', () => {
  const createEvent = (status: string): Event => ({
    id: 1,
    title: 'Test Event',
    description: 'Test',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    status,
    category_id: 1,
    location_id: 1,
    organizer_id: 1,
    is_featured: false,
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  })

  const createEventWithStatusObject = (statusCode: string): Event => ({
    id: 1,
    title: 'Test Event',
    description: 'Test',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    status: { status_code: statusCode, display_name: statusCode },
    category_id: 1,
    location_id: 1,
    organizer_id: 1,
    is_featured: false,
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  })

  describe('canApproveInternal', () => {
    it('should return true for pending_internal_approval status', () => {
      const event = createEvent('pending_internal_approval')
      expect(approvalValidation.canApproveInternal(event)).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(approvalValidation.canApproveInternal(createEvent('draft'))).toBe(false)
      expect(approvalValidation.canApproveInternal(createEvent('approved_internal'))).toBe(false)
      expect(approvalValidation.canApproveInternal(createEvent('published'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_internal_approval')
      expect(approvalValidation.canApproveInternal(event)).toBe(true)
    })
  })

  describe('canRequestPublicApproval', () => {
    it('should return true for approved_internal status', () => {
      const event = createEvent('approved_internal')
      expect(approvalValidation.canRequestPublicApproval(event)).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(approvalValidation.canRequestPublicApproval(createEvent('draft'))).toBe(false)
      expect(approvalValidation.canRequestPublicApproval(createEvent('pending_internal_approval'))).toBe(false)
      expect(approvalValidation.canRequestPublicApproval(createEvent('published'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('approved_internal')
      expect(approvalValidation.canRequestPublicApproval(event)).toBe(true)
    })
  })

  describe('canPublish', () => {
    it('should return true for pending_public_approval status', () => {
      const event = createEvent('pending_public_approval')
      expect(approvalValidation.canPublish(event)).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(approvalValidation.canPublish(createEvent('draft'))).toBe(false)
      expect(approvalValidation.canPublish(createEvent('approved_internal'))).toBe(false)
      expect(approvalValidation.canPublish(createEvent('published'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_public_approval')
      expect(approvalValidation.canPublish(event)).toBe(true)
    })
  })

  describe('canRequestChanges', () => {
    it('should return true for most statuses', () => {
      expect(approvalValidation.canRequestChanges(createEvent('draft'))).toBe(true)
      expect(approvalValidation.canRequestChanges(createEvent('pending_internal_approval'))).toBe(true)
      expect(approvalValidation.canRequestChanges(createEvent('approved_internal'))).toBe(true)
      expect(approvalValidation.canRequestChanges(createEvent('pending_public_approval'))).toBe(true)
    })

    it('should return false for rejected, published, or cancelled', () => {
      expect(approvalValidation.canRequestChanges(createEvent('rejected'))).toBe(false)
      expect(approvalValidation.canRequestChanges(createEvent('published'))).toBe(false)
      expect(approvalValidation.canRequestChanges(createEvent('cancelled'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('rejected')
      expect(approvalValidation.canRequestChanges(event)).toBe(false)
    })
  })

  describe('canReject', () => {
    it('should return true for most statuses', () => {
      expect(approvalValidation.canReject(createEvent('draft'))).toBe(true)
      expect(approvalValidation.canReject(createEvent('pending_internal_approval'))).toBe(true)
      expect(approvalValidation.canReject(createEvent('approved_internal'))).toBe(true)
      expect(approvalValidation.canReject(createEvent('pending_public_approval'))).toBe(true)
    })

    it('should return false for rejected, published, or cancelled', () => {
      expect(approvalValidation.canReject(createEvent('rejected'))).toBe(false)
      expect(approvalValidation.canReject(createEvent('published'))).toBe(false)
      expect(approvalValidation.canReject(createEvent('cancelled'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('rejected')
      expect(approvalValidation.canReject(event)).toBe(false)
    })
  })

  describe('isInternallyApproved', () => {
    it('should return true for approved_internal, pending_public_approval, and published', () => {
      expect(approvalValidation.isInternallyApproved(createEvent('approved_internal'))).toBe(true)
      expect(approvalValidation.isInternallyApproved(createEvent('pending_public_approval'))).toBe(true)
      expect(approvalValidation.isInternallyApproved(createEvent('published'))).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(approvalValidation.isInternallyApproved(createEvent('draft'))).toBe(false)
      expect(approvalValidation.isInternallyApproved(createEvent('pending_internal_approval'))).toBe(false)
      expect(approvalValidation.isInternallyApproved(createEvent('rejected'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('approved_internal')
      expect(approvalValidation.isInternallyApproved(event)).toBe(true)
    })
  })

  describe('isPublished', () => {
    it('should return true only for published status', () => {
      expect(approvalValidation.isPublished(createEvent('published'))).toBe(true)
    })

    it('should return false for other statuses', () => {
      expect(approvalValidation.isPublished(createEvent('draft'))).toBe(false)
      expect(approvalValidation.isPublished(createEvent('pending_internal_approval'))).toBe(false)
      expect(approvalValidation.isPublished(createEvent('approved_internal'))).toBe(false)
      expect(approvalValidation.isPublished(createEvent('rejected'))).toBe(false)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('published')
      expect(approvalValidation.isPublished(event)).toBe(true)
    })
  })

  describe('getWorkflowStage', () => {
    it('should return correct Spanish description for each status', () => {
      expect(approvalValidation.getWorkflowStage(createEvent('draft'))).toBe('Borrador')
      expect(approvalValidation.getWorkflowStage(createEvent('pending_internal_approval'))).toBe('Pendiente aprobación interna')
      expect(approvalValidation.getWorkflowStage(createEvent('approved_internal'))).toBe('Aprobado para calendario interno')
      expect(approvalValidation.getWorkflowStage(createEvent('pending_public_approval'))).toBe('Pendiente aprobación pública')
      expect(approvalValidation.getWorkflowStage(createEvent('published'))).toBe('Publicado en calendario público')
      expect(approvalValidation.getWorkflowStage(createEvent('requires_changes'))).toBe('Requiere cambios')
      expect(approvalValidation.getWorkflowStage(createEvent('rejected'))).toBe('Rechazado')
      expect(approvalValidation.getWorkflowStage(createEvent('cancelled'))).toBe('Cancelado')
    })

    it('should return "Estado desconocido" for unknown status', () => {
      expect(approvalValidation.getWorkflowStage(createEvent('unknown_status'))).toBe('Estado desconocido')
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('draft')
      expect(approvalValidation.getWorkflowStage(event)).toBe('Borrador')
    })
  })

  describe('getAvailableActions', () => {
    it('should return correct actions for pending_internal_approval', () => {
      const actions = approvalValidation.getAvailableActions(createEvent('pending_internal_approval'))
      expect(actions).toContain('approve_internal')
      expect(actions).toContain('request_changes')
      expect(actions).toContain('reject')
      expect(actions).not.toContain('request_public')
      expect(actions).not.toContain('publish')
    })

    it('should return correct actions for approved_internal', () => {
      const actions = approvalValidation.getAvailableActions(createEvent('approved_internal'))
      expect(actions).toContain('request_public')
      expect(actions).toContain('request_changes')
      expect(actions).toContain('reject')
      expect(actions).not.toContain('approve_internal')
      expect(actions).not.toContain('publish')
    })

    it('should return correct actions for pending_public_approval', () => {
      const actions = approvalValidation.getAvailableActions(createEvent('pending_public_approval'))
      expect(actions).toContain('publish')
      expect(actions).toContain('request_changes')
      expect(actions).toContain('reject')
      expect(actions).not.toContain('approve_internal')
      expect(actions).not.toContain('request_public')
    })

    it('should return no actions for published status', () => {
      const actions = approvalValidation.getAvailableActions(createEvent('published'))
      expect(actions).toHaveLength(0)
    })

    it('should return no actions for rejected status', () => {
      const actions = approvalValidation.getAvailableActions(createEvent('rejected'))
      expect(actions).toHaveLength(0)
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_internal_approval')
      const actions = approvalValidation.getAvailableActions(event)
      expect(actions).toContain('approve_internal')
    })
  })

  describe('canApprove (legacy)', () => {
    it('should call canApproveInternal', () => {
      const event = createEvent('pending_internal_approval')
      expect(approvalValidation.canApprove(event)).toBe(true)
      expect(approvalValidation.canApprove(event)).toBe(approvalValidation.canApproveInternal(event))
    })
  })
})
