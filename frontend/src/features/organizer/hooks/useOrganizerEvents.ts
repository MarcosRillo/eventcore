'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState, useTransition } from 'react'
import useSWR from 'swr'

import { deleteEvent } from '@/features/organizer/services/organizer-event.service'
import { EventListResponse, OrganizerEvent } from '@/features/organizer/types/event.types'
import { apiFetcher, organizerEventKeys } from '@/lib/swr'

const perPage = 10

export const useOrganizerEvents = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Read initial values from URL
  const initialStatus = searchParams.get('status') || null
  const initialScope = searchParams.get('scope') === 'past'
  const initialPage = Number(searchParams.get('page')) || 1

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitialStatus = useMemo(() => initialStatus, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitialScope = useMemo(() => initialScope, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitialPage = useMemo(() => initialPage, [])

  const [currentPage, setCurrentPage] = useState(stableInitialPage)
  const [statusFilter, setStatusFilter] = useState<string | null>(stableInitialStatus)
  const [showPast, setShowPast] = useState(stableInitialScope)

  // React 19 transition for non-blocking delete UI
  const [, startDeleteTransition] = useTransition()
  const [isDeletingState, setIsDeletingState] = useState(false)

  // Sync state to URL
  const syncUrl = useCallback((status: string | null, past: boolean, page: number) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (past) params.set('scope', 'past')
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [pathname, router])

  // SWR key built from current filter/pagination state
  const swrKey = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage))
    params.set('per_page', String(perPage))
    if (statusFilter) params.set('status', statusFilter)
    if (showPast) params.set('show_past', '1')
    return organizerEventKeys.list(params.toString())
  }, [currentPage, statusFilter, showPast])

  const { data, error, isLoading, isValidating, mutate } = useSWR<EventListResponse>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true },
  )

  // Memoize events array to maintain referential stability
  const events: OrganizerEvent[] = useMemo(() => data?.data ?? [], [data?.data])
  const totalPages = data?.last_page ?? 1
  const total = data?.total ?? 0

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    syncUrl(statusFilter, showPast, page)
  }, [syncUrl, statusFilter, showPast])

  const handleStatusFilter = useCallback((status: string | null) => {
    setStatusFilter(status)
    setCurrentPage(1)
    syncUrl(status, showPast, 1)
  }, [syncUrl, showPast])

  const handleShowPastToggle = useCallback((isPast: boolean) => {
    setShowPast(isPast)
    setCurrentPage(1)
    syncUrl(statusFilter, isPast, 1)
  }, [syncUrl, statusFilter])

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

  const optimisticRemove = useCallback((eventId: number) => {
    mutate(
      (current) => current ? {
        ...current,
        data: current.data.filter(e => e.id !== eventId),
        total: current.total - 1,
      } : current,
      { revalidate: true }
    )
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
    isValidating,
    handlePageChange,
    handleStatusFilter,
    handleShowPastToggle,
    handleDelete,
    setShowPast,
    optimisticRemove,
    retry,
  }
}
