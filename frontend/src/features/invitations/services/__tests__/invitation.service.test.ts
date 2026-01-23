import { AxiosResponse } from 'axios'

import invitationService from '@/features/invitations/services/invitation.service'
import { Invitation } from '@/features/invitations/types/invitation.types'
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

describe('invitationService', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: '2025-12-15T00:00:00Z',
    created_at: '2025-11-28T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getInvitations', () => {
    it('should fetch all pending invitations', async () => {
      const mockResponse = {
        success: true,
        data: [mockInvitation],
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await invitationService.getInvitations()

      expect(mockApiClient.get).toHaveBeenCalledWith('/invitations')
      expect(result).toEqual([mockInvitation])
      expect(result).toHaveLength(1)
    })

    it('should return empty array when no invitations', async () => {
      const mockResponse = {
        success: true,
        data: [],
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await invitationService.getInvitations()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(invitationService.getInvitations()).rejects.toThrow('Network error')
    })
  })

  describe('sendInvitation', () => {
    it('should send a new invitation', async () => {
      const sendData = { email: 'new@example.com', role_id: 2 }
      const mockResponse = {
        success: true,
        message: 'Invitación enviada exitosamente.',
        data: { ...mockInvitation, email: 'new@example.com' },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await invitationService.sendInvitation(sendData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/invitations', sendData)
      expect(result.email).toBe('new@example.com')
    })

    it('should handle validation errors', async () => {
      const sendData = { email: 'invalid', role_id: 2 }
      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(invitationService.sendInvitation(sendData)).rejects.toThrow('Validation failed')
    })
  })

  describe('resendInvitation', () => {
    it('should resend an invitation with new token', async () => {
      const mockResponse = {
        success: true,
        message: 'Invitación reenviada exitosamente.',
        data: { ...mockInvitation, expires_at: '2025-12-16T00:00:00Z' },
      }
      mockApiClient.post.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await invitationService.resendInvitation(1)

      expect(mockApiClient.post).toHaveBeenCalledWith('/invitations/1/resend')
      expect(result.id).toBe(1)
      expect(result.expires_at).toBe('2025-12-16T00:00:00Z')
    })

    it('should handle resend errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Cannot resend accepted invitation'))

      await expect(invitationService.resendInvitation(1)).rejects.toThrow('Cannot resend accepted invitation')
    })

    it('should handle not found errors', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('Invitation not found'))

      await expect(invitationService.resendInvitation(999)).rejects.toThrow('Invitation not found')
    })
  })

  describe('cancelInvitation', () => {
    it('should cancel an invitation', async () => {
      const mockResponse = {
        success: true,
        message: 'Invitación cancelada.',
      }
      mockApiClient.delete.mockResolvedValueOnce(createMockResponse(mockResponse))

      await expect(invitationService.cancelInvitation(1)).resolves.toBeUndefined()
      expect(mockApiClient.delete).toHaveBeenCalledWith('/invitations/1')
    })

    it('should handle cancel errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot cancel accepted invitation'))

      await expect(invitationService.cancelInvitation(1)).rejects.toThrow('Cannot cancel accepted invitation')
    })

    it('should handle permission errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(invitationService.cancelInvitation(1)).rejects.toThrow('Permission denied')
    })
  })
})
