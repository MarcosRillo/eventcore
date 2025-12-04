/**
 * Organizer Dashboard Container (Smart)
 *
 * Connects dashboard with data hooks and manages state.
 */

'use client'

import { useRouter } from 'next/navigation'
import { OrganizerDashboard } from '@/features/organizer-dashboard/components/dumb/OrganizerDashboard'
import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats'
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'

export const OrganizerDashboardContainer = () => {
  const router = useRouter()
  // Fetch stats
  const { stats, refetch: refetchStats } = useOrganizerStats()

  // Fetch events (includes filter management and pagination)
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    statusFilter,
    showPast,
    currentPage,
    totalPages,
    handlePageChange,
    handleStatusFilter,
    handleShowPastToggle,
    retry
  } = useOrganizerEvents()

  // Refresh data after actions
  function handleRefresh(): void {
    refetchStats()
    retry()
  }

  // Handle filter change
  function handleFilterChange(status: string | null): void {
    handleStatusFilter(status)
  }

  // Navigation handlers
  function handleEdit(id: number): void {
    router.push(`/organizer/${id}/edit`)
  }

  function handleView(id: number): void {
    router.push(`/organizer/${id}`)
  }

  return (
    <OrganizerDashboard
      stats={stats}
      events={events}
      loading={eventsLoading}
      error={eventsError}
      activeFilter={statusFilter}
      showPast={showPast}
      currentPage={currentPage}
      totalPages={totalPages}
      onFilterChange={handleFilterChange}
      onShowPastChange={handleShowPastToggle}
      onPageChange={handlePageChange}
      onSuccess={handleRefresh}
      onEdit={handleEdit}
      onView={handleView}
    />
  )
}
