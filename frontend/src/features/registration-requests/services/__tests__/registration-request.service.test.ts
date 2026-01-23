/**
 * Registration Request Service Tests
 * Tests for both public (createRequest) and admin API functions
 */
import { AxiosResponse } from 'axios'

import registrationRequestService, {
  approveRegistrationRequest,
  createRegistrationRequest,
  deleteRegistrationRequest,
  getRegistrationRequestById,
  getRegistrationRequests,
  rejectRegistrationRequest,
  suspendRegistrationRequest,
  unsuspendRegistrationRequest,
} from '@/features/registration-requests/services/registration-request.service'
import { RegistrationRequest, RegistrationRequestDetail } from '@/features/registration-requests/types/registration-request.types'
import apiClient from '@/services/apiClient'


jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} } as AxiosResponse['config'],
})

describe('registrationRequestService', () => {
  const mockRequest: RegistrationRequest = {
    id: 1,
    dni: '12345678',
    full_name: 'Juan P�rez',
    email: 'juan@example.com',
    whatsapp: '+5491234567890',
    organization_name: 'Turismo SRL',
    organization_sector: 'hotel',
    website: 'https://turismo.com',
    motivation: 'Quiero publicar eventos tur�sticos en la plataforma',
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

  const mockRequestDetail: RegistrationRequestDetail = {
    ...mockRequest,
    first_name: 'Juan',
    last_name: 'P�rez',
    profile_photo: null,
    organization_cuit: '20-12345678-9',
    organization_logo: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================
  // Public Endpoint Tests
  // ============================================

  describe('createRegistrationRequest', () => {
    it('should submit registration request with all required fields', async () => {
      const createData = {
        dni: '12345678',
        first_name: 'Juan',
        last_name: 'P�rez',
        email: 'juan@example.com',
        whatsapp: '+5491234567890',
        organization_name: 'Turismo SRL',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        motivation: 'Quiero publicar eventos tur�sticos en la plataforma',
      }
      const mockResponse = {
        success: true,
        message: 'Solicitud enviada exitosamente',
        data: {
          id: 1,
          email: 'juan@example.com',
          status: 'pending' as const,
        },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await createRegistrationRequest(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/auth/register-request',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      expect(result.id).toBe(1)
      expect(result.email).toBe('juan@example.com')
      expect(result.status).toBe('pending')
    })

    it('should include optional website field when provided', async () => {
      const createData = {
        dni: '12345678',
        first_name: 'Juan',
        last_name: 'P�rez',
        email: 'juan@example.com',
        whatsapp: '+5491234567890',
        organization_name: 'Turismo SRL',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        motivation: 'Motivaci�n de prueba',
        website: 'https://turismo.com',
      }
      const mockResponse = {
        success: true,
        message: 'Solicitud enviada',
        data: { id: 2, email: 'juan@example.com', status: 'pending' as const },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      await createRegistrationRequest(createData)

      const formDataCall = mockApiClient.post.mock.calls[0][1] as FormData
      expect(formDataCall.get('website')).toBe('https://turismo.com')
    })

    it('should include profile photo file when provided', async () => {
      const mockFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' })
      const createData = {
        dni: '12345678',
        first_name: 'Juan',
        last_name: 'P�rez',
        email: 'juan@example.com',
        whatsapp: '+5491234567890',
        organization_name: 'Turismo SRL',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        motivation: 'Motivaci�n de prueba',
        profile_photo: mockFile,
      }
      const mockResponse = {
        success: true,
        message: 'Solicitud enviada',
        data: { id: 3, email: 'juan@example.com', status: 'pending' as const },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      await createRegistrationRequest(createData)

      const formDataCall = mockApiClient.post.mock.calls[0][1] as FormData
      expect(formDataCall.get('profile_photo')).toBe(mockFile)
    })

    it('should handle validation errors from server', async () => {
      const createData = {
        dni: '',
        first_name: 'Juan',
        last_name: 'P�rez',
        email: 'invalid-email',
        whatsapp: '+5491234567890',
        organization_name: 'Turismo SRL',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        motivation: 'Test',
      }
      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(createRegistrationRequest(createData)).rejects.toThrow('Validation failed')
    })

    it('should handle network errors', async () => {
      const createData = {
        dni: '12345678',
        first_name: 'Juan',
        last_name: 'P�rez',
        email: 'juan@example.com',
        whatsapp: '+5491234567890',
        organization_name: 'Turismo SRL',
        organization_cuit: '20-12345678-9',
        organization_sector: 'hotel',
        motivation: 'Motivaci�n',
      }
      mockApiClient.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(createRegistrationRequest(createData)).rejects.toThrow('Network error')
    })
  })

  // ============================================
  // Admin Endpoint Tests
  // ============================================

  describe('getRegistrationRequests', () => {
    it('should fetch all registration requests without filter', async () => {
      const mockResponse = {
        success: true,
        data: [mockRequest],
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await getRegistrationRequests()

      expect(mockApiClient.get).toHaveBeenCalledWith('/registration-requests')
      expect(result).toEqual([mockRequest])
      expect(result).toHaveLength(1)
    })

    it('should fetch requests with status filter', async () => {
      const mockResponse = {
        success: true,
        data: [mockRequest],
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await getRegistrationRequests({ status: 'pending' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/registration-requests?status=pending')
      expect(result).toEqual([mockRequest])
    })

    it('should return empty array when no requests', async () => {
      const mockResponse = {
        success: true,
        data: [],
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await getRegistrationRequests()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(getRegistrationRequests()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getRegistrationRequestById', () => {
    it('should fetch a single registration request with details', async () => {
      const mockResponse = {
        success: true,
        data: mockRequestDetail,
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await getRegistrationRequestById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/registration-requests/1')
      expect(result.id).toBe(1)
      expect(result.first_name).toBe('Juan')
      expect(result.last_name).toBe('P�rez')
      expect(result.organization_cuit).toBe('20-12345678-9')
    })

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Request not found'))

      await expect(getRegistrationRequestById(999)).rejects.toThrow('Request not found')
    })
  })

  describe('approveRegistrationRequest', () => {
    it('should approve a request and return user/org IDs', async () => {
      const mockResponse = {
        success: true,
        message: 'Solicitud aprobada exitosamente',
        data: { user_id: 10, organization_id: 5 },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await approveRegistrationRequest(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/registration-requests/1/approve')
      expect(result.user_id).toBe(10)
      expect(result.organization_id).toBe(5)
    })

    it('should handle already approved error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Request already approved'))

      await expect(approveRegistrationRequest(1)).rejects.toThrow('Request already approved')
    })

    it('should handle permission errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(approveRegistrationRequest(1)).rejects.toThrow('Permission denied')
    })
  })

  describe('rejectRegistrationRequest', () => {
    it('should reject a request with reason', async () => {
      const mockResponse = {
        success: true,
        message: 'Solicitud rechazada',
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      await expect(rejectRegistrationRequest(1, 'Informaci�n incompleta')).resolves.toBeUndefined()
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/registration-requests/1/reject',
        { reason: 'Informaci�n incompleta' }
      )
    })

    it('should handle already processed error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Request already processed'))

      await expect(rejectRegistrationRequest(1, 'Raz�n')).rejects.toThrow('Request already processed')
    })

    it('should handle empty reason error', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Reason is required'))

      await expect(rejectRegistrationRequest(1, '')).rejects.toThrow('Reason is required')
    })
  })

  describe('suspendRegistrationRequest', () => {
    it('should suspend an approved request', async () => {
      const suspendedRequest = {
        ...mockRequest,
        status: 'approved' as const,
        user_status: 'suspended' as const,
      }
      const mockResponse = {
        success: true,
        message: 'Usuario y organizaci�n suspendidos',
        data: suspendedRequest,
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await suspendRegistrationRequest(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/registration-requests/1/suspend')
      expect(result.user_status).toBe('suspended')
    })

    it('should handle suspend on non-approved request', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Can only suspend approved requests'))

      await expect(suspendRegistrationRequest(1)).rejects.toThrow('Can only suspend approved requests')
    })
  })

  describe('unsuspendRegistrationRequest', () => {
    it('should unsuspend a suspended request', async () => {
      const reactivatedRequest = {
        ...mockRequest,
        status: 'approved' as const,
        user_status: 'active' as const,
      }
      const mockResponse = {
        success: true,
        message: 'Usuario y organizaci�n reactivados',
        data: reactivatedRequest,
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await unsuspendRegistrationRequest(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/registration-requests/1/unsuspend')
      expect(result.user_status).toBe('active')
    })

    it('should handle unsuspend on non-suspended request', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Request is not suspended'))

      await expect(unsuspendRegistrationRequest(1)).rejects.toThrow('Request is not suspended')
    })
  })

  describe('deleteRegistrationRequest', () => {
    it('should delete a suspended request', async () => {
      const mockResponse = {
        success: true,
        message: 'Solicitud eliminada',
      }
      mockApiClient.delete.mockResolvedValueOnce(createMockResponse(mockResponse))

      await expect(deleteRegistrationRequest(1)).resolves.toBeUndefined()
      expect(mockApiClient.delete).toHaveBeenCalledWith('/registration-requests/1')
    })

    it('should handle delete on non-suspended request', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Can only delete suspended requests'))

      await expect(deleteRegistrationRequest(1)).rejects.toThrow('Can only delete suspended requests')
    })

    it('should handle permission errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(deleteRegistrationRequest(1)).rejects.toThrow('Permission denied')
    })
  })

  // ============================================
  // Default Export Tests
  // ============================================

  describe('default export', () => {
    it('should export all service methods', () => {
      expect(registrationRequestService.create).toBe(createRegistrationRequest)
      expect(registrationRequestService.getAll).toBe(getRegistrationRequests)
      expect(registrationRequestService.getById).toBe(getRegistrationRequestById)
      expect(registrationRequestService.approve).toBe(approveRegistrationRequest)
      expect(registrationRequestService.reject).toBe(rejectRegistrationRequest)
      expect(registrationRequestService.suspend).toBe(suspendRegistrationRequest)
      expect(registrationRequestService.unsuspend).toBe(unsuspendRegistrationRequest)
      expect(registrationRequestService.delete).toBe(deleteRegistrationRequest)
    })
  })
})
