/**
 * Organizer Dashboard Container (Smart)
 *
 * Connects dashboard with data hooks and manages state.
 */

'use client'

import { OrganizerDashboard } from '@/features/organizer-dashboard/components/dumb/OrganizerDashboard'
import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats'
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'

export const OrganizerDashboardContainer = () => {
  // Fetch stats
  const { stats, refetch: refetchStats } = useOrganizerStats()

  // Fetch events (includes filter management and pagination)
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    statusFilter,
    currentPage,
    totalPages,
    handlePageChange,
    handleStatusFilter,
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

  return (
    <OrganizerDashboard
      stats={stats}
      events={events}
      loading={eventsLoading}
      error={eventsError}
      activeFilter={statusFilter}
      currentPage={currentPage}
      totalPages={totalPages}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      onSuccess={handleRefresh}
    />
  )
}
