/**
 * useRegistrationRequests Hook Tests
 * Tests for admin registration requests management
 *
 * Test patterns used:
 * - All tests properly await initial data fetch to complete
 * - All async operations are wrapped in act()
 * - waitFor is used to wait for state transitions
 */
import { act, renderHook, waitFor } from '@testing-library/react'

import { useRegistrationRequests } from '@/features/registration-requests/hooks/useRegistrationRequests'
import registrationRequestService from '@/features/registration-requests/services/registration-request.service'
import { RegistrationRequest, RegistrationRequestDetail } from '@/features/registration-requests/types/registration-request.types'

jest.mock('../../services/registration-request.service')

const mockService = registrationRequestService as jest.Mocked<typeof registrationRequestService>

/**
 * Helper function to wait for initial data fetch to complete
 * This ensures the hook's useEffect has finished before running test assertions
 * @param result
 * @param result.current
 */
const waitForInitialFetch = async (result: { current: ReturnType<typeof useRegistrationRequests> }) => {
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
}

describe('useRegistrationRequests', () => {
  // Mock data with ASCII-safe names to avoid encoding issues
  const mockRequest: RegistrationRequest = {
    id: 1,
    dni: '12345678',
    full_name: 'Juan Perez',
    email: 'juan@example.com',
    whatsapp: '+5491234567890',
    organization_name: 'Turismo SRL',
    organization_sector: 'hotel',
    website: 'https://turismo.com',
    motivation: 'Quiero publicar eventos turisticos en la plataforma',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: '2025-11-28T10:00:00Z',
    user_id: null,
    organization_id: null,
    user_status: null,
    organization_status: null,
    is_deleted: false,
  }

  const mockRequest2: RegistrationRequest = {
    ...mockRequest,
    id: 2,
    email: 'maria@example.com',
    full_name: 'Maria Garcia',
  }

  const mockRequestDetail: RegistrationRequestDetail = {
    ...mockRequest,
    first_name: 'Juan',
    last_name: 'Perez',
    profile_photo: null,
    organization_cuit: '20-12345678-9',
    organization_logo: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for getAll to prevent unhandled promise rejections
    mockService.getAll.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('initial state and fetching', () => {
    it('should fetch requests on mount and update state correctly', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])

      const { result } = renderHook(() => useRegistrationRequests())

      // Initial state before fetch completes
      expect(result.current.loading).toBe(true)
      expect(result.current.requests).toEqual([])
      expect(result.current.error).toBeNull()

      // Wait for fetch to complete
      await waitForInitialFetch(result)

      // Verify final state
      expect(result.current.requests).toEqual([mockRequest])
      expect(result.current.requests).toHaveLength(1)
      expect(result.current.error).toBeNull()
      expect(mockService.getAll).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error and set error message', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.requests).toEqual([])
      expect(result.current.error).toBe('Error al cargar las solicitudes')
      expect(result.current.loading).toBe(false)
    })

    it('should return empty array when no requests exist', async () => {
      mockService.getAll.mockResolvedValueOnce([])

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.requests).toEqual([])
      expect(result.current.requests).toHaveLength(0)
      expect(result.current.error).toBeNull()
    })

    it('should initialize with default display filter', async () => {
      mockService.getAll.mockResolvedValueOnce([])

      const { result } = renderHook(() => useRegistrationRequests())

      // Check initial value (before fetch completes)
      expect(result.current.displayFilter).toBe('default')
      expect(result.current.selectedRequest).toBeNull()
      expect(result.current.actionLoading).toBe(false)
      expect(result.current.detailLoading).toBe(false)

      await waitForInitialFetch(result)
    })
  })

  describe('selectRequest', () => {
    it('should load request details when selecting a valid id', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      await act(async () => {
        await result.current.selectRequest(1)
      })

      expect(mockService.getById).toHaveBeenCalledWith(1)
      expect(result.current.selectedRequest).toEqual(mockRequestDetail)
      expect(result.current.selectedRequest?.first_name).toBe('Juan')
      expect(result.current.detailLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should clear selection when passing null', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      // First select a request
      await act(async () => {
        await result.current.selectRequest(1)
      })

      expect(result.current.selectedRequest).not.toBeNull()

      // Then clear the selection
      await act(async () => {
        await result.current.selectRequest(null)
      })

      expect(result.current.selectedRequest).toBeNull()
      // getById should only have been called once (for the initial selection)
      expect(mockService.getById).toHaveBeenCalledTimes(1)
    })

    it('should handle detail fetch error gracefully', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.getById.mockRejectedValueOnce(new Error('Not found'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      await act(async () => {
        await result.current.selectRequest(999)
      })

      expect(result.current.error).toBe('Error al cargar el detalle de la solicitud')
      expect(result.current.selectedRequest).toBeNull()
      expect(result.current.detailLoading).toBe(false)
    })
  })

  describe('approveRequest', () => {
    it('should approve request and update local state with new ids', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.approve.mockResolvedValueOnce({ user_id: 10, organization_id: 5 })

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = false
      await act(async () => {
        success = await result.current.approveRequest(1)
      })

      expect(success).toBe(true)
      expect(mockService.approve).toHaveBeenCalledWith(1)
      expect(result.current.requests[0].status).toBe('approved')
      expect(result.current.requests[0].user_id).toBe(10)
      expect(result.current.requests[0].organization_id).toBe(5)
      expect(result.current.requests[0].user_status).toBe('active')
      expect(result.current.actionLoading).toBe(false)
    })

    it('should handle approve error and not modify request', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.approve.mockRejectedValueOnce(new Error('Cannot approve'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      const originalStatus = result.current.requests[0].status

      let success = true
      await act(async () => {
        success = await result.current.approveRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al aprobar la solicitud')
      expect(result.current.requests[0].status).toBe(originalStatus)
      expect(result.current.actionLoading).toBe(false)
    })

    it('should clear selection after approving the currently selected request', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)
      mockService.approve.mockResolvedValueOnce({ user_id: 10, organization_id: 5 })

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      // Select the request first
      await act(async () => {
        await result.current.selectRequest(1)
      })

      expect(result.current.selectedRequest).not.toBeNull()
      expect(result.current.selectedRequest?.id).toBe(1)

      // Approve the selected request
      await act(async () => {
        await result.current.approveRequest(1)
      })

      expect(result.current.selectedRequest).toBeNull()
    })
  })

  describe('rejectRequest', () => {
    it('should reject request with reason and update local state', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.reject.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      const rejectionReason = 'Informacion incompleta'

      let success = false
      await act(async () => {
        success = await result.current.rejectRequest(1, rejectionReason)
      })

      expect(success).toBe(true)
      expect(mockService.reject).toHaveBeenCalledWith(1, rejectionReason)
      expect(result.current.requests[0].status).toBe('rejected')
      expect(result.current.requests[0].rejection_reason).toBe(rejectionReason)
      expect(result.current.actionLoading).toBe(false)
    })

    it('should handle reject error and preserve original state', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.reject.mockRejectedValueOnce(new Error('Cannot reject'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      const originalStatus = result.current.requests[0].status

      let success = true
      await act(async () => {
        success = await result.current.rejectRequest(1, 'Reason')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al rechazar la solicitud')
      expect(result.current.requests[0].status).toBe(originalStatus)
    })
  })

  describe('suspendRequest', () => {
    it('should suspend an approved request and update user status', async () => {
      const approvedRequest: RegistrationRequest = {
        ...mockRequest,
        status: 'approved',
        user_id: 10,
        organization_id: 5,
        user_status: 'active',
        organization_status: 'active',
      }
      const suspendedRequest: RegistrationRequest = {
        ...approvedRequest,
        user_status: 'suspended',
        organization_status: 'suspended',
      }

      mockService.getAll.mockResolvedValueOnce([approvedRequest])
      mockService.suspend.mockResolvedValueOnce(suspendedRequest)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = false
      await act(async () => {
        success = await result.current.suspendRequest(1)
      })

      expect(success).toBe(true)
      expect(mockService.suspend).toHaveBeenCalledWith(1)
      expect(result.current.requests[0].user_status).toBe('suspended')
      expect(result.current.requests[0].organization_status).toBe('suspended')
    })

    it('should handle suspend error gracefully', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.suspend.mockRejectedValueOnce(new Error('Cannot suspend'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = true
      await act(async () => {
        success = await result.current.suspendRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al suspender la solicitud')
    })
  })

  describe('unsuspendRequest', () => {
    it('should unsuspend a suspended request and restore active status', async () => {
      const suspendedRequest: RegistrationRequest = {
        ...mockRequest,
        status: 'approved',
        user_id: 10,
        organization_id: 5,
        user_status: 'suspended',
        organization_status: 'suspended',
      }
      const reactivatedRequest: RegistrationRequest = {
        ...suspendedRequest,
        user_status: 'active',
        organization_status: 'active',
      }

      mockService.getAll.mockResolvedValueOnce([suspendedRequest])
      mockService.unsuspend.mockResolvedValueOnce(reactivatedRequest)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = false
      await act(async () => {
        success = await result.current.unsuspendRequest(1)
      })

      expect(success).toBe(true)
      expect(mockService.unsuspend).toHaveBeenCalledWith(1)
      expect(result.current.requests[0].user_status).toBe('active')
      expect(result.current.requests[0].organization_status).toBe('active')
    })

    it('should handle unsuspend error gracefully', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.unsuspend.mockRejectedValueOnce(new Error('Cannot unsuspend'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = true
      await act(async () => {
        success = await result.current.unsuspendRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al reactivar la solicitud')
    })
  })

  describe('deleteRequest', () => {
    it('should soft delete a request and update is_deleted flag', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.delete.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.requests[0].is_deleted).toBe(false)

      let success = false
      await act(async () => {
        success = await result.current.deleteRequest(1)
      })

      expect(success).toBe(true)
      expect(mockService.delete).toHaveBeenCalledWith(1)
      expect(result.current.requests[0].is_deleted).toBe(true)
    })

    it('should handle delete error and preserve original state', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.delete.mockRejectedValueOnce(new Error('Cannot delete'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      let success = true
      await act(async () => {
        success = await result.current.deleteRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toContain('Error al eliminar')
      expect(result.current.requests[0].is_deleted).toBe(false)
    })

    it('should clear selection after deleting the currently selected request', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)
      mockService.delete.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      // Select the request first
      await act(async () => {
        await result.current.selectRequest(1)
      })

      expect(result.current.selectedRequest).not.toBeNull()

      // Delete the selected request
      await act(async () => {
        await result.current.deleteRequest(1)
      })

      expect(result.current.selectedRequest).toBeNull()
    })
  })

  describe('refresh', () => {
    it('should refetch all requests from the server', async () => {
      mockService.getAll
        .mockResolvedValueOnce([mockRequest])
        .mockResolvedValueOnce([mockRequest, mockRequest2])

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.requests).toHaveLength(1)

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.requests).toHaveLength(2)
      expect(mockService.getAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearError', () => {
    it('should clear the error state', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.error).toBe('Error al cargar las solicitudes')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('setDisplayFilter', () => {
    it('should update display filter state', async () => {
      mockService.getAll.mockResolvedValueOnce([mockRequest])

      const { result } = renderHook(() => useRegistrationRequests())

      await waitForInitialFetch(result)

      expect(result.current.displayFilter).toBe('default')

      act(() => {
        result.current.setDisplayFilter('pending')
      })

      expect(result.current.displayFilter).toBe('pending')

      act(() => {
        result.current.setDisplayFilter('suspended')
      })

      expect(result.current.displayFilter).toBe('suspended')
    })
  })
})
