/**
 * Organizer Dashboard Container (Smart)
 *
 * Connects dashboard with data hooks and manages state.
 */

'use client'

import { useState } from 'react'
import { OrganizerDashboard } from '@/features/organizer-dashboard/components/dumb/OrganizerDashboard'
import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats'
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'

export const OrganizerDashboardContainer = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Fetch stats
  const { stats, refetch: refetchStats } = useOrganizerStats()

  // Fetch events (includes filter management)
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    statusFilter,
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

  // Handle create modal
  function handleOpenCreateModal(): void {
    setCreateModalOpen(true)
  }

  function handleCloseCreateModal(): void {
    setCreateModalOpen(false)
  }

  function handleCreateSuccess(): void {
    handleRefresh()
  }

  return (
    <OrganizerDashboard
      stats={stats}
      events={events}
      loading={eventsLoading}
      error={eventsError}
      activeFilter={statusFilter}
      createModalOpen={createModalOpen}
      onFilterChange={handleFilterChange}
      onOpenCreateModal={handleOpenCreateModal}
      onCloseCreateModal={handleCloseCreateModal}
      onCreateSuccess={handleCreateSuccess}
    />
  )
}
