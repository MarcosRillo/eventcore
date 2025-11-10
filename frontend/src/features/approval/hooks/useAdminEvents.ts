/**
 * Custom hook for admin events
 *
 * Fetches and manages events for admin dashboard with filtering.
 */

import { useState, useEffect, useCallback } from 'react'
import { adminEventService } from '../services/admin-event.service'
import { EventsResponse } from '../types/approval.types'

interface UseAdminEventsReturn {
  events: EventsResponse
  loading: boolean
  error: string | null
  statusFilter: string | null
  handleStatusFilter: (status: string | null) => void
  retry: () => void
}

export const useAdminEvents = (): UseAdminEventsReturn => {
  const [events, setEvents] = useState<EventsResponse>({
    data: [],
    meta: { current_page: 1, total: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminEventService.getAll({ status: statusFilter })
      setEvents(data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleStatusFilter = (status: string | null): void => {
    setStatusFilter(status)
  }

  return {
    events,
    loading,
    error,
    statusFilter,
    handleStatusFilter,
    retry: fetchEvents
  }
}
