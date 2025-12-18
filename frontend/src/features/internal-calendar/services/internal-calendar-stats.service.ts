/**
 * Internal Calendar Stats Service
 *
 * Service for fetching internal calendar statistics.
 * Communicates with /internal-calendar/stats endpoint.
 *
 * Created following TDD methodology.
 * Refactored to use apiClient for consistency (Dec 10, 2025).
 */

import apiClient from '@/services/apiClient'
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'

/**
 * API response wrapper for stats endpoint
 */
interface StatsApiResponse {
  data: InternalStats
}

/**
 * Fetches internal calendar statistics
 *
 * Uses apiClient for consistency with other services.
 * Authentication token is handled automatically by apiClient.
 *
 * @param token - JWT authentication token (optional, apiClient handles it)
 * @returns Promise with internal calendar stats
 * @throws Error if API call fails or response is malformed
 */
export async function getInternalStats(token?: string): Promise<InternalStats> {
  try {
    const response = await apiClient.get<StatsApiResponse>(
      '/internal-calendar/stats',
      token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      } : undefined
    )

    // Validate response structure
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response structure from stats endpoint')
    }

    return response.data.data
  } catch (error) {
    // Re-throw error for handling by caller
    if (error instanceof Error) {
      throw new Error(`Failed to fetch internal stats: ${error.message}`)
    }
    throw new Error('Failed to fetch internal stats: Unknown error')
  }
}
