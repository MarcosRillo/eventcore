/**
 * Admin Stats Service
 *
 * Fetches approval statistics for admin dashboard.
 */

import { AdminStats } from '@/features/approval/types/approval.types'
import apiClient from '@/services/apiClient'

export const adminStatsService = {
  /**
   * Get approval stats summary
   */
  getSummary: async (): Promise<AdminStats> => {
    return apiClient.get('/dashboard/events/summary')
  }
}
