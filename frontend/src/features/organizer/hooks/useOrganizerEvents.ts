'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import useSWR from 'swr'

import { deleteEvent } from '@/features/organizer/services/organizer-event.service'
import { EventListResponse, OrganizerEvent } from '@/features/organizer/types/event.types'
import { apiFetcher, organizerEventKeys } from '@/lib/swr'

const perPage = 10

export const useOrganizerEvents = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)

  // React 19 transition for non-blocking delete UI
  const [, startDeleteTransition] = useTransition()
  const [isDeletingState, setIsDeletingState] = useState(false)

  // SWR key built from current filter/pagination state
  const swrKey = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage))
    params.set('per_page', String(perPage))
    if (statusFilter) params.set('status', statusFilter)
    if (showPast) params.set('show_past', '1')
    return organizerEventKeys.list(params.toString())
  }, [currentPage, statusFilter, showPast])

  const { data, error, isLoading, mutate } = useSWR<EventListResponse>(
    swrKey,
    apiFetcher,
  )

  // Memoize events array to maintain referential stability
  const events: OrganizerEvent[] = useMemo(() => data?.data ?? [], [data?.data])
  const totalPages = data?.last_page ?? 1
  const total = data?.total ?? 0

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleStatusFilter = useCallback((status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }, [])

  const handleShowPastToggle = useCallback((isPast: boolean) => {
    setShowPast(isPast)
    setCurrentPage(1)
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsDeletingState(true)
    startDeleteTransition(async () => {
      try {
        await deleteEvent(id)
        mutate()
      } catch {
        // Error is surfaced via SWR on next revalidation
      } finally {
        setIsDeletingState(false)
      }
    })
  }, [mutate])

  const retry = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    events,
    loading: isLoading,
    error: error?.message ?? null,
    currentPage: data?.current_page ?? currentPage,
    totalPages,
    total,
    statusFilter,
    showPast,
    isDeleting: isDeletingState,
    handlePageChange,
    handleStatusFilter,
    handleShowPastToggle,
    handleDelete,
    setShowPast,
    retry,
  }
}
