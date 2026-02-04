/**
 * useRegistrationRequests Hook Tests
 * Tests for admin registration requests management with SWR
 *
 * Test patterns used:
 * - SWR is mocked via apiFetcher mock
 * - SWRConfig wrapper with fresh cache for each test
 * - Service is mocked for mutation operations only
 * - All async operations are wrapped in act()
 * - waitFor is used to wait for SWR loading to complete
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { useRegistrationRequests } from '@/features/registration-requests/hooks/useRegistrationRequests'
import registrationRequestService from '@/features/registration-requests/services/registration-request.service'
import { RegistrationRequest, RegistrationRequestDetail } from '@/features/registration-requests/types/registration-request.types'

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}))

jest.mock('../../services/registration-request.service')

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock
const mockService = registrationRequestService as jest.Mocked<typeof registrationRequestService>

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
)

/**
 * Helper function to wait for SWR to finish loading
 */
const waitForLoaded = async (result: { current: ReturnType<typeof useRegistrationRequests> }) => {
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
    // Default mock for apiFetcher to return empty list
    mockedFetcher.mockResolvedValue({ success: true, data: [] })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('initial state and fetching', () => {
    it('should fetch requests on mount and update state correctly', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      expect(result.current.requests).toEqual([mockRequest])
      expect(result.current.requests).toHaveLength(1)
      expect(result.current.error).toBeNull()
      expect(mockedFetcher).toHaveBeenCalled()
    })

    it('should handle fetch error and set error message', async () => {
      mockedFetcher.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      expect(result.current.requests).toEqual([])
      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
    })

    it('should return empty array when no requests exist', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [] })

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      expect(result.current.requests).toEqual([])
      expect(result.current.requests).toHaveLength(0)
      expect(result.current.error).toBeNull()
    })

    it('should initialize with default display filter', async () => {
      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      // Check initial value
      expect(result.current.displayFilter).toBe('default')
      expect(result.current.selectedRequest).toBeNull()
      expect(result.current.actionLoading).toBe(false)
      expect(result.current.detailLoading).toBe(false)

      await waitForLoaded(result)
    })
  })

  describe('selectRequest', () => {
    it('should load request details when selecting a valid id', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.getById.mockRejectedValueOnce(new Error('Not found'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      await act(async () => {
        await result.current.selectRequest(999)
      })

      expect(result.current.error).toBe('Error al cargar el detalle de la solicitud')
      expect(result.current.selectedRequest).toBeNull()
      expect(result.current.detailLoading).toBe(false)
    })
  })

  describe('approveRequest', () => {
    it('should approve request and revalidate via SWR', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.approve.mockResolvedValueOnce({ user_id: 10, organization_id: 5 })

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      // After approve, SWR will revalidate - mock the revalidation response
      const approvedRequest = {
        ...mockRequest,
        status: 'approved' as const,
        user_id: 10,
        organization_id: 5,
        user_status: 'active' as const,
        organization_status: 'active' as const,
      }
      mockedFetcher.mockResolvedValue({ success: true, data: [approvedRequest] })

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.approve.mockRejectedValueOnce(new Error('Cannot approve'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)
      mockService.approve.mockResolvedValueOnce({ user_id: 10, organization_id: 5 })

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
    it('should reject request with reason and revalidate via SWR', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.reject.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      const rejectionReason = 'Informacion incompleta'

      // After reject, SWR will revalidate
      const rejectedRequest = {
        ...mockRequest,
        status: 'rejected' as const,
        rejection_reason: rejectionReason,
      }
      mockedFetcher.mockResolvedValue({ success: true, data: [rejectedRequest] })

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.reject.mockRejectedValueOnce(new Error('Cannot reject'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
    it('should suspend an approved request and revalidate via SWR', async () => {
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

      mockedFetcher.mockResolvedValue({ success: true, data: [approvedRequest] })
      mockService.suspend.mockResolvedValueOnce(suspendedRequest)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      // After suspend, SWR will revalidate
      mockedFetcher.mockResolvedValue({ success: true, data: [suspendedRequest] })

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.suspend.mockRejectedValueOnce(new Error('Cannot suspend'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      let success = true
      await act(async () => {
        success = await result.current.suspendRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al suspender la solicitud')
    })
  })

  describe('unsuspendRequest', () => {
    it('should unsuspend a suspended request and revalidate via SWR', async () => {
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

      mockedFetcher.mockResolvedValue({ success: true, data: [suspendedRequest] })
      mockService.unsuspend.mockResolvedValueOnce(reactivatedRequest)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      // After unsuspend, SWR will revalidate
      mockedFetcher.mockResolvedValue({ success: true, data: [reactivatedRequest] })

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
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.unsuspend.mockRejectedValueOnce(new Error('Cannot unsuspend'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      let success = true
      await act(async () => {
        success = await result.current.unsuspendRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al reactivar la solicitud')
    })
  })

  describe('deleteRequest', () => {
    it('should soft delete a request and revalidate via SWR', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.delete.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      expect(result.current.requests[0].is_deleted).toBe(false)

      // After delete, SWR will revalidate
      const deletedRequest = { ...mockRequest, is_deleted: true }
      mockedFetcher.mockResolvedValue({ success: true, data: [deletedRequest] })

      let success = false
      await act(async () => {
        success = await result.current.deleteRequest(1)
      })

      expect(success).toBe(true)
      expect(mockService.delete).toHaveBeenCalledWith(1)
      expect(result.current.requests[0].is_deleted).toBe(true)
    })

    it('should handle delete error and preserve original state', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.delete.mockRejectedValueOnce(new Error('Cannot delete'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      let success = true
      await act(async () => {
        success = await result.current.deleteRequest(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toContain('Error al eliminar')
      expect(result.current.requests[0].is_deleted).toBe(false)
    })

    it('should clear selection after deleting the currently selected request', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.getById.mockResolvedValueOnce(mockRequestDetail)
      mockService.delete.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
    it('should revalidate SWR data when refresh is called', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      expect(result.current.requests).toHaveLength(1)

      // Update mock for revalidation
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest, mockRequest2] })

      await act(async () => {
        await result.current.refresh()
      })

      await waitFor(() => {
        expect(result.current.requests).toHaveLength(2)
      })
    })
  })

  describe('clearError', () => {
    it('should clear the error state', async () => {
      mockedFetcher.mockResolvedValue({ success: true, data: [mockRequest] })
      mockService.approve.mockRejectedValueOnce(new Error('Cannot approve'))

      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

      // Trigger an error via a failed mutation
      await act(async () => {
        await result.current.approveRequest(1)
      })

      expect(result.current.error).toBe('Error al aprobar la solicitud')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('setDisplayFilter', () => {
    it('should update display filter state', async () => {
      const { result } = renderHook(() => useRegistrationRequests(), { wrapper })

      await waitForLoaded(result)

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
