import { useState, useEffect, useRef, useTransition } from 'react'

import { getEvents, deleteEvent } from '@/features/organizer/services/organizer-event.service'
import { OrganizerEvent, EventListParams } from '@/features/organizer/types/event.types'

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // React 19 transitions for non-blocking UI
  const [, startLoadingTransition] = useTransition()
  const [, startDeleteTransition] = useTransition()

  // Manual loading states for reliable test behavior
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingState, setIsDeletingState] = useState(false)

  // Use refs to access current state values in refetch
  const currentPageRef = useRef(currentPage)
  const statusFilterRef = useRef(statusFilter)
  const showPastRef = useRef(showPast)
  currentPageRef.current = currentPage
  statusFilterRef.current = statusFilter
  showPastRef.current = showPast

  const perPage = 10

  const fetchEvents = async (page = currentPage, status = statusFilter, isPast = showPast) => {
    setIsLoading(true)
    setError(null)

    startLoadingTransition(async () => {
      try {
        const params: EventListParams = {
          page,
          per_page: perPage,
          status,
          show_past: isPast ? '1' : undefined
        }

        const response = await getEvents(params)
        setEvents(response.data)
        setCurrentPage(response.current_page)
        setTotalPages(response.last_page || 1)
        setTotal(response.total)
      } catch {
        setError('Error loading events')
      } finally {
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect to refetch when refreshKey changes (triggered by refetch())
  useEffect(() => {
    if (refreshKey > 0) {
      fetchEvents(currentPageRef.current, statusFilterRef.current, showPastRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  // Function to force a re-fetch of current page/filter
  const refetch = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchEvents(page, statusFilter, showPast)
  }

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to page 1
    fetchEvents(1, status, showPast)
  }

  const handleShowPastToggle = (isPast: boolean) => {
    setShowPast(isPast)
    setCurrentPage(1) // Reset to page 1
    fetchEvents(1, statusFilter, isPast)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsDeletingState(true)
    startDeleteTransition(async () => {
      try {
        await deleteEvent(id)
        fetchEvents(currentPage, statusFilter, showPast) // Refresh list
      } catch {
        setError('Error deleting event')
      } finally {
        setIsDeletingState(false)
      }
    })
  }

  // Backward compatibility: map states to original names
  const loading = isLoading
  const isDeleting = isDeletingState

  return {
    events,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    statusFilter,
    showPast,
    isDeleting,
    handlePageChange,
    handleStatusFilter,
    handleShowPastToggle,
    handleDelete,
    setShowPast,
    retry: refetch
  }
}
