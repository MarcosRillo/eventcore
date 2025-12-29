import { adminStatsService } from '@/features/approval/services/admin-stats.service'
import apiClient from '@/services/apiClient'

jest.mock('@/services/apiClient')

describe('adminStatsService', () => {
  const mockStats = {
    total: 100,
    pending: 15,
    approved: 45,
    published: 35,
    rejected: 5,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSummary', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStats)

      const result = await adminStatsService.getSummary()

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/events/summary')
      expect(apiClient.get).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockStats)
    })

    it('should return stats with all required fields', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue(mockStats)

      const result = await adminStatsService.getSummary()

      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('pending')
      expect(result).toHaveProperty('approved')
      expect(result).toHaveProperty('published')
      expect(result).toHaveProperty('rejected')
    })

    it('should handle zero counts', async () => {
      const emptyStats = {
        total: 0,
        pending: 0,
        approved: 0,
        published: 0,
        rejected: 0,
      }
      ;(apiClient.get as jest.Mock).mockResolvedValue(emptyStats)

      const result = await adminStatsService.getSummary()

      expect(result.total).toBe(0)
      expect(result.pending).toBe(0)
    })

    it('should handle large counts', async () => {
      const largeStats = {
        total: 999999,
        pending: 100000,
        approved: 500000,
        published: 300000,
        rejected: 99999,
      }
      ;(apiClient.get as jest.Mock).mockResolvedValue(largeStats)

      const result = await adminStatsService.getSummary()

      expect(result.total).toBe(999999)
    })

    it('should propagate API errors', async () => {
      const error = new Error('Server Error')
      ;(apiClient.get as jest.Mock).mockRejectedValue(error)

      await expect(adminStatsService.getSummary()).rejects.toThrow('Server Error')
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout')
      ;(apiClient.get as jest.Mock).mockRejectedValue(timeoutError)

      await expect(adminStatsService.getSummary()).rejects.toThrow('Network timeout')
    })
  })
})
