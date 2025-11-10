/**
 * Admin Dashboard Component (Presentational)
 *
 * Main admin dashboard UI integrating stats, filters, and event list.
 */

import { AdminQuickFilters } from './AdminQuickFilters'
import { AdminEventList } from './AdminEventList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { AdminStats, EventsResponse } from '@/features/approval/types/approval.types'

interface AdminDashboardProps {
  stats: AdminStats
  events: EventsResponse
  loading: boolean
  error: string | null
  activeFilter: string | null
  onFilterChange: (status: string | null) => void
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
  onRequestChanges: (eventId: number) => void
  onPublish: (eventId: number) => void
}

export const AdminDashboard = ({
  stats,
  events,
  loading,
  error,
  activeFilter,
  onFilterChange,
  onApprove,
  onReject,
  onRequestChanges,
  onPublish
}: AdminDashboardProps) => {
  return (
    <main className="container mx-auto px-4 max-w-7xl" role="main">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Approvals</h1>
        <p className="text-gray-600 mt-1">Review and manage event submissions</p>
      </div>

      {/* Stats Section */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        data-testid="admin-stats-grid"
      >
        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Published</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.published}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminQuickFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* Event List Section */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 flex justify-center" role="status" aria-label="Loading events">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : events.data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No events to review</p>
          </div>
        ) : (
          <AdminEventList
            events={events.data}
            onApprove={onApprove}
            onReject={onReject}
            onRequestChanges={onRequestChanges}
            onPublish={onPublish}
          />
        )}
      </div>
    </main>
  )
}
