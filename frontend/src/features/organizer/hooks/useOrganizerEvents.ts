import { useState, useEffect } from 'react'
import { getEvents, deleteEvent } from '../services/organizer-event.service'
import { OrganizerEvent, EventListParams } from '../types/event.types'

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const perPage = 10

  const fetchEvents = async (page = currentPage, status = statusFilter) => {
    setLoading(true)
    setError(null)

    try {
      const params: EventListParams = {
        page,
        per_page: perPage,
        status
      }

      const response = await getEvents(params)
      setEvents(response.data)
      setCurrentPage(response.pagination.current_page)
      setTotalPages(response.pagination.last_page || 1)
      setTotal(response.pagination.total)
    } catch (err) {
      setError('Error loading events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchEvents(page)
  }

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to page 1
    fetchEvents(1, status)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(id)
      fetchEvents() // Refresh list
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Error deleting event')
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    events,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    statusFilter,
    isDeleting,
    handlePageChange,
    handleStatusFilter,
    handleDelete,
    retry: fetchEvents
  }
}
