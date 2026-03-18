/**
 * AdminDashboard Component
 *
 * Presentational component that composes the admin dashboard layout.
 * Dumb component - receives data via props, no business logic.
 *
 * Layout:
 * 1. Stats Summary Bar (compact, horizontal)
 * 2. Header with title
 * 3. Filters (status pills + time scope toggle)
 * 4. Event List (cards or loading/empty states)
 * 5. Pagination
 */

'use client'

import type { ReactNode } from 'react'

import { AdminEventFilters, type AdminStatusCounts } from '@/features/entity-admin/components/dumb/AdminEventFilters'
import { AdminEventList } from '@/features/entity-admin/components/dumb/AdminEventList'
import { AdminStatsSummary } from '@/features/entity-admin/components/dumb/AdminStatsSummary'
import type { AdminApprovalStats } from '@/features/entity-admin/types'
import { Pagination } from '@/shared/components/tables'
import type { Event, EventStatusCode, EventTypeInfo } from '@/types/event.types'

interface PaginationData {
  current_page: number
  last_page: number
  total: number
  from: number | null
  to: number | null
}

interface AdminDashboardProps {
  // Stats
  stats: AdminApprovalStats | null
  statsLoading: boolean

  // Events
  events: Event[]
  eventsLoading: boolean
  eventsError: string | null

  // Filters
  activeStatusFilter: EventStatusCode | null
  timeScope: 'upcoming' | 'past'
  statusCounts: AdminStatusCounts | null

  // Pagination
  pagination: PaginationData | null

  // Search & type filter
  searchValue?: string
  onSearchChange?: (value: string) => void
  eventTypes?: EventTypeInfo[]
  selectedEventTypeId?: number | null
  onEventTypeChange?: (eventTypeId: number | null) => void

  // Handlers
  onStatClick: (status: EventStatusCode | null) => void
  onStatusFilterChange: (status: EventStatusCode | null) => void
  onTimeScopeChange: (scope: 'upcoming' | 'past') => void
  onPageChange: (page: number) => void
  onManageEvent: (event: Event) => void
  onRetry?: () => void
  onClearFilters?: () => void

  // Modal slot
  children?: ReactNode
}

export const AdminDashboard = ({
  // Stats
  stats,
  statsLoading,

  // Events
  events,
  eventsLoading,
  eventsError,

  // Filters
  activeStatusFilter,
  timeScope,
  statusCounts,

  // Pagination
  pagination,

  // Search & type filter
  searchValue,
  onSearchChange,
  eventTypes,
  selectedEventTypeId,
  onEventTypeChange,

  // Handlers
  onStatClick,
  onStatusFilterChange,
  onTimeScopeChange,
  onPageChange,
  onManageEvent,
  onRetry,
  onClearFilters,

  // Modal slot
  children,
}: AdminDashboardProps) => {
  const hasActiveFilter = activeStatusFilter !== null || timeScope === 'past' || !!searchValue || selectedEventTypeId != null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Stats Summary Bar */}
      <AdminStatsSummary
        stats={stats}
        activeFilter={activeStatusFilter}
        onStatClick={onStatClick}
        isLoading={statsLoading}
      />

      {/* Main Content */}
      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gestión de Eventos</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona y aprueba eventos del calendario
          </p>
        </div>

        {/* Filters */}
        <AdminEventFilters
          activeStatus={activeStatusFilter}
          timeScope={timeScope}
          onStatusChange={onStatusFilterChange}
          onTimeScopeChange={onTimeScopeChange}
          statusCounts={statusCounts}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          eventTypes={eventTypes}
          selectedEventTypeId={selectedEventTypeId}
          onEventTypeChange={onEventTypeChange}
        />

        {/* Event List */}
        <AdminEventList
          events={events}
          isLoading={eventsLoading}
          error={eventsError}
          hasActiveFilter={hasActiveFilter}
          onManage={onManageEvent}
          onRetry={onRetry}
          onClearFilters={onClearFilters}
        />

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && !eventsError && (
          <div className={`bg-white rounded-lg shadow-sm border-t border-neutral-200 px-4 sm:px-6 transition-opacity duration-200 ${eventsLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={onPageChange}
              showInfo={true}
              totalItems={pagination.total}
              itemsFrom={pagination.from ?? undefined}
              itemsTo={pagination.to ?? undefined}
            />
          </div>
        )}
      </main>

      {/* Modal slot for EventManagementModal */}
      {children}
    </div>
  )
}

export default AdminDashboard
