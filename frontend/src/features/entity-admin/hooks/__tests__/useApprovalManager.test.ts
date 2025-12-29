import { renderHook, act, waitFor } from '@testing-library/react'

import { useApprovalManager } from '@/features/entity-admin/hooks/useApprovalManager'
import { approvalService, approvalValidation } from '@/features/events/services/approvalService'
import { Event } from '@/types/event.types'

// Mock approval service
jest.mock('@/features/events/services/approvalService')

const mockApprovalService = approvalService as jest.Mocked<typeof approvalService>
const mockApprovalValidation = approvalValidation as jest.Mocked<typeof approvalValidation>

describe('useApprovalManager', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    type: 'sede_unica',
    start_date: '2025-12-01T10:00:00',
    end_date: '2025-12-01T18:00:00',
    status: 'pending_internal_approval',
    category_id: 1,
    category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    locations: [],
    location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
    is_featured: false,
    approval_history: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useApprovalManager())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should expose all workflow actions', () => {
      const { result } = renderHook(() => useApprovalManager())

      expect(typeof result.current.approveInternal).toBe('function')
      expect(typeof result.current.requestPublicApproval).toBe('function')
      expect(typeof result.current.publishEvent).toBe('function')
      expect(typeof result.current.requestChanges).toBe('function')
      expect(typeof result.current.rejectEvent).toBe('function')
      expect(typeof result.current.toggleFeatured).toBe('function')
    })

    it('should expose validation helpers', () => {
      const { result } = renderHook(() => useApprovalManager())

      expect(result.current.canApproveInternal).toBeDefined()
      expect(result.current.canRequestPublicApproval).toBeDefined()
      expect(result.current.canPublish).toBeDefined()
      expect(result.current.canRequestChanges).toBeDefined()
      expect(result.current.canReject).toBeDefined()
    })

    it('should expose legacy methods for backward compatibility', () => {
      const { result } = renderHook(() => useApprovalManager())

      expect(typeof result.current.approveEvent).toBe('function')
      expect(result.current.canApprove).toBeDefined()
    })
  })

  describe('approveInternal', () => {
    it('should approve event internally successfully', async () => {
      const approvedEvent: Event = {
        ...mockEvent,
        status: 'approved_internal',
      }

      mockApprovalService.approveInternal.mockResolvedValueOnce(approvedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.approveInternal(1)
      })

      expect(mockApprovalService.approveInternal).toHaveBeenCalledWith(1, undefined)
      expect(returnedEvent).toEqual(approvedEvent)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should approve event with comment', async () => {
      const approvedEvent: Event = {
        ...mockEvent,
        status: 'approved_internal',
      }

      mockApprovalService.approveInternal.mockResolvedValueOnce(approvedEvent)

      const { result } = renderHook(() => useApprovalManager())

      await act(async () => {
        await result.current.approveInternal(1, 'Looks good!')
      })

      expect(mockApprovalService.approveInternal).toHaveBeenCalledWith(1, 'Looks good!')
    })

    it('should handle approval error', async () => {
      const error = new Error('Approval failed')
      mockApprovalService.approveInternal.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.approveInternal(1)
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Approval failed' })
      expect(result.current.isLoading).toBe(false)
    })

    it('should set loading state during approval', async () => {
      mockApprovalService.approveInternal.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEvent), 100))
      )

      const { result } = renderHook(() => useApprovalManager())

      act(() => {
        result.current.approveInternal(1)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 200 })
    })
  })

  describe('requestPublicApproval', () => {
    it('should request public approval successfully', async () => {
      const updatedEvent: Event = {
        ...mockEvent,
        status: 'pending_public_approval',
      }

      mockApprovalService.requestPublicApproval.mockResolvedValueOnce(updatedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestPublicApproval(1)
      })

      expect(mockApprovalService.requestPublicApproval).toHaveBeenCalledWith(1, undefined)
      expect(returnedEvent).toEqual(updatedEvent)
      expect(result.current.error).toBeNull()
    })

    it('should request public approval with comment', async () => {
      const updatedEvent: Event = {
        ...mockEvent,
        status: 'pending_public_approval',
      }

      mockApprovalService.requestPublicApproval.mockResolvedValueOnce(updatedEvent)

      const { result } = renderHook(() => useApprovalManager())

      await act(async () => {
        await result.current.requestPublicApproval(1, 'Ready for public review')
      })

      expect(mockApprovalService.requestPublicApproval).toHaveBeenCalledWith(1, 'Ready for public review')
    })

    it('should handle request public approval error', async () => {
      mockApprovalService.requestPublicApproval.mockRejectedValueOnce(new Error('Request failed'))

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestPublicApproval(1)
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Request failed' })
    })
  })

  describe('publishEvent', () => {
    it('should publish event successfully', async () => {
      const publishedEvent: Event = {
        ...mockEvent,
        status: 'published',
      }

      mockApprovalService.publishEvent.mockResolvedValueOnce(publishedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.publishEvent(1)
      })

      expect(mockApprovalService.publishEvent).toHaveBeenCalledWith(1)
      expect(returnedEvent).toEqual(publishedEvent)
      expect(result.current.error).toBeNull()
    })

    it('should handle publish error', async () => {
      mockApprovalService.publishEvent.mockRejectedValueOnce(new Error('Publish failed'))

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.publishEvent(1)
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Publish failed' })
    })
  })

  describe('requestChanges', () => {
    it('should request changes successfully', async () => {
      const updatedEvent: Event = {
        ...mockEvent,
        status: 'draft',
      }

      mockApprovalService.requestChanges.mockResolvedValueOnce(updatedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestChanges(1, 'Please add more details about the venue')
      })

      expect(mockApprovalService.requestChanges).toHaveBeenCalledWith(1, 'Please add more details about the venue')
      expect(returnedEvent).toEqual(updatedEvent)
      expect(result.current.error).toBeNull()
    })

    it('should reject feedback with less than 5 characters', async () => {
      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestChanges(1, 'Bad')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'El feedback debe tener al menos 5 caracteres' })
      expect(mockApprovalService.requestChanges).not.toHaveBeenCalled()
    })

    it('should reject empty feedback', async () => {
      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestChanges(1, '')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'El feedback debe tener al menos 5 caracteres' })
    })

    it('should reject whitespace-only feedback', async () => {
      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestChanges(1, '   ')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'El feedback debe tener al menos 5 caracteres' })
    })

    it('should handle request changes API error', async () => {
      mockApprovalService.requestChanges.mockRejectedValueOnce(new Error('Request changes failed'))

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.requestChanges(1, 'Valid feedback text')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Request changes failed' })
    })
  })

  describe('rejectEvent', () => {
    it('should reject event successfully', async () => {
      const rejectedEvent: Event = {
        ...mockEvent,
        status: 'rejected',
      }

      mockApprovalService.rejectEvent.mockResolvedValueOnce(rejectedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.rejectEvent(1, 'Event does not meet quality standards')
      })

      expect(mockApprovalService.rejectEvent).toHaveBeenCalledWith(1, 'Event does not meet quality standards')
      expect(returnedEvent).toEqual(rejectedEvent)
      expect(result.current.error).toBeNull()
    })

    it('should reject reason with less than 5 characters', async () => {
      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.rejectEvent(1, 'No')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'El motivo del rechazo debe tener al menos 5 caracteres' })
      expect(mockApprovalService.rejectEvent).not.toHaveBeenCalled()
    })

    it('should reject empty reason', async () => {
      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.rejectEvent(1, '')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'El motivo del rechazo debe tener al menos 5 caracteres' })
    })

    it('should handle reject event API error', async () => {
      mockApprovalService.rejectEvent.mockRejectedValueOnce(new Error('Reject failed'))

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.rejectEvent(1, 'Valid reject reason')
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Reject failed' })
    })
  })

  describe('toggleFeatured', () => {
    it('should toggle featured status successfully', async () => {
      const featuredEvent: Event = {
        ...mockEvent,
        is_featured: true,
      }

      mockApprovalService.toggleFeatured.mockResolvedValueOnce(featuredEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.toggleFeatured(1)
      })

      expect(mockApprovalService.toggleFeatured).toHaveBeenCalledWith(1)
      expect(returnedEvent).toEqual(featuredEvent)
      expect(result.current.error).toBeNull()
    })

    it('should handle toggle featured error', async () => {
      mockApprovalService.toggleFeatured.mockRejectedValueOnce(new Error('Toggle failed'))

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.toggleFeatured(1)
      })

      expect(returnedEvent).toBeNull()
      expect(result.current.error).toEqual({ message: 'Toggle failed' })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors with details', async () => {
      const apiError = {
        message: 'Validation failed',
        details: { title: ['Title is required'] },
      }

      mockApprovalService.approveInternal.mockRejectedValueOnce(apiError)

      const { result } = renderHook(() => useApprovalManager())

      await act(async () => {
        await result.current.approveInternal(1)
      })

      expect(result.current.error?.message).toBe('Validation failed')
      expect(result.current.error?.details).toBe(JSON.stringify({ title: ['Title is required'] }))
    })

    it('should handle unknown errors', async () => {
      mockApprovalService.approveInternal.mockRejectedValueOnce('Unknown error')

      const { result } = renderHook(() => useApprovalManager())

      await act(async () => {
        await result.current.approveInternal(1)
      })

      expect(result.current.error).toEqual({ message: 'Ha ocurrido un error inesperado' })
    })

    it('should clear error state', () => {
      const { result } = renderHook(() => useApprovalManager())

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('should clear error before new operation', async () => {
      // First operation fails
      mockApprovalService.approveInternal.mockRejectedValueOnce(new Error('First error'))

      const { result } = renderHook(() => useApprovalManager())

      await act(async () => {
        await result.current.approveInternal(1)
      })

      expect(result.current.error).toEqual({ message: 'First error' })

      // Second operation succeeds
      mockApprovalService.approveInternal.mockResolvedValueOnce(mockEvent)

      await act(async () => {
        await result.current.approveInternal(1)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Legacy Methods', () => {
    it('should call approveInternal when approveEvent is called', async () => {
      const approvedEvent: Event = {
        ...mockEvent,
        status: 'approved_internal',
      }

      mockApprovalService.approveInternal.mockResolvedValueOnce(approvedEvent)

      const { result } = renderHook(() => useApprovalManager())

      let returnedEvent: Event | null = null
      await act(async () => {
        returnedEvent = await result.current.approveEvent(1, 'Test comment')
      })

      expect(mockApprovalService.approveInternal).toHaveBeenCalledWith(1, 'Test comment')
      expect(returnedEvent).toEqual(approvedEvent)
    })

    it('should expose canApprove validation method', () => {
      mockApprovalValidation.canApprove.mockReturnValue(true)

      const { result } = renderHook(() => useApprovalManager())

      const canApprove = result.current.canApprove(mockEvent)

      expect(canApprove).toBe(true)
      expect(mockApprovalValidation.canApprove).toHaveBeenCalledWith(mockEvent)
    })
  })

  describe('Validation Helpers', () => {
    it('should expose canApproveInternal from validation service', () => {
      mockApprovalValidation.canApproveInternal.mockReturnValue(true)

      const { result } = renderHook(() => useApprovalManager())

      const can = result.current.canApproveInternal(mockEvent)

      expect(can).toBe(true)
    })

    it('should expose canRequestPublicApproval from validation service', () => {
      mockApprovalValidation.canRequestPublicApproval.mockReturnValue(false)

      const { result } = renderHook(() => useApprovalManager())

      const can = result.current.canRequestPublicApproval(mockEvent)

      expect(can).toBe(false)
    })

    it('should expose canPublish from validation service', () => {
      mockApprovalValidation.canPublish.mockReturnValue(true)

      const { result } = renderHook(() => useApprovalManager())

      const can = result.current.canPublish(mockEvent)

      expect(can).toBe(true)
    })

    it('should expose isInternallyApproved from validation service', () => {
      mockApprovalValidation.isInternallyApproved.mockReturnValue(true)

      const { result } = renderHook(() => useApprovalManager())

      const is = result.current.isInternallyApproved(mockEvent)

      expect(is).toBe(true)
    })

    it('should expose getWorkflowStage from validation service', () => {
      mockApprovalValidation.getWorkflowStage.mockReturnValue('Pendiente de Aprobación Interna')

      const { result } = renderHook(() => useApprovalManager())

      const stage = result.current.getWorkflowStage(mockEvent)

      expect(stage).toBe('Pendiente de Aprobación Interna')
    })

    it('should expose getAvailableActions from validation service', () => {
      mockApprovalValidation.getAvailableActions.mockReturnValue(['approve', 'reject'])

      const { result } = renderHook(() => useApprovalManager())

      const actions = result.current.getAvailableActions(mockEvent)

      expect(actions).toEqual(['approve', 'reject'])
    })
  })
})
