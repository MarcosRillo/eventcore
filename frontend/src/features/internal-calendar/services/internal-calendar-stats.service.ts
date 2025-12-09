/**
 * Internal Calendar Stats Service
 *
 * Service for fetching internal calendar statistics.
 * Communicates with /api/v1/internal-calendar/stats endpoint.
 *
 * Created following TDD methodology.
 */

import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * API response wrapper for stats endpoint
 */
interface StatsApiResponse {
  data: InternalStats
}

/**
 * Fetches internal calendar statistics
 *
 * @param token - JWT authentication token
 * @returns Promise with internal calendar stats
 * @throws Error if API call fails
 */
export async function getInternalStats(token: string): Promise<InternalStats> {
  const response = await fetch(`${API_BASE_URL}/api/v1/internal-calendar/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch internal stats: ${response.status} ${response.statusText}`)
  }

  const data: StatsApiResponse = await response.json()
  return data.data
}
