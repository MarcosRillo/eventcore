/**
 * Shared hook for fetching active event types.
 *
 * Used across AdminDashboardContainer and other components
 * that need the event types dropdown. Uses a 60s deduping
 * interval since event types change rarely.
 */

import useSWR from 'swr'

import { apiFetcher, eventKeys } from '@/lib/swr'
import type { EventTypeInfo } from '@/types/event.types'

export function useActiveEventTypes() {
  const { data, error, isLoading } = useSWR<{ data: EventTypeInfo[] }>(
    eventKeys.types.active,
    apiFetcher,
    { dedupingInterval: 60000 },
  )

  return {
    eventTypes: data?.data ?? [],
    error,
    isLoading,
  }
}
