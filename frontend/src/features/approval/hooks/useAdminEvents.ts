/**
 * Custom hook for admin events
 *
 * Fetches and manages events for admin dashboard with filtering.
 * Accepts optional initial data from server-side fetch to avoid waterfall.
 * Uses URL searchParams for filter state persistence.
 */

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

import { adminEventService } from '@/features/approval/services/admin-event.service'
import { EventsResponse } from '@/features/approval/types/approval.types'

interface UseAdminEventsOptions {
  initialEvents?: EventsResponse
  initialStatusFilter?: string | null
}

interface UseAdminEventsReturn {
  events: EventsResponse
  loading: boolean
  error: string | null
  statusFilter: string | null
  handleStatusFilter: (status: string | null) => void
  retry: () => void
}

const DEFAULT_EVENTS: EventsResponse = {
  data: [],
  meta: { current_page: 1, total: 0 }
}

export const useAdminEvents = (options: UseAdminEventsOptions = {}): UseAdminEventsReturn => {
  const { initialEvents, initialStatusFilter } = options
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use URL param as source of truth, fallback to initial
  const statusFilter = searchParams.get('status') ?? initialStatusFilter ?? null

  const [events, setEvents] = useState<EventsResponse>(initialEvents ?? DEFAULT_EVENTS)
  const [loading, setLoading] = useState(!initialEvents)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async (status: string | null): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminEventService.getAll({ status })
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleStatusFilter = useCallback((status: string | null): void => {
    // Update URL with new filter
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`?${params.toString()}`)

    // Fetch new data
    fetchEvents(status)
  }, [router, searchParams, fetchEvents])

  // Fetch on mount if no initial data provided (fallback for client-only usage)
  useEffect(() => {
    if (!initialEvents) {
      fetchEvents(statusFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const retry = useCallback((): void => {
    fetchEvents(statusFilter)
  }, [fetchEvents, statusFilter])

  return {
    events,
    loading,
    error,
    statusFilter,
    handleStatusFilter,
    retry
  }
}
