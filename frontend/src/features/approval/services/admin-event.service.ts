/**
 * Admin Event Service
 *
 * Fetches events for admin dashboard.
 */

import apiClient from '@/services/apiClient'
import { EventsResponse } from '@/features/approval/types/approval.types'

interface FetchEventsParams {
  status?: string | null
  page?: number
}

export const adminEventService = {
  /**
   * Get all events (admin view)
   */
  getAll: async (params: FetchEventsParams = {}): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams()

    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/dashboard/events?${queryString}` : '/dashboard/events'

    return apiClient.get(url)
  }
}
