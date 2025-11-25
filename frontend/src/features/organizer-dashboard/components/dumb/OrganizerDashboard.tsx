/**
 * Organizer Dashboard Component (Presentational)
 *
 * Main dashboard UI integrating stats, filters, and event list.
 */

import { OrganizerQuickFilters } from '@/features/organizer/components/dumb/OrganizerQuickFilters'
import { OrganizerEventListItem } from '@/features/organizer/components/dumb/OrganizerEventListItem'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types'

interface OrganizerDashboardProps {
  stats: OrganizerStats | null
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  activeFilter: string | null
  createModalOpen: boolean
  onFilterChange: (status: string | null) => void
  onOpenCreateModal: () => void
  onCloseCreateModal: () => void
  onCreateSuccess: () => void
}

export const OrganizerDashboard = ({
  stats,
  events,
  loading,
  error,
  activeFilter,
  createModalOpen,
  onFilterChange,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateSuccess
}: OrganizerDashboardProps) => {
  return (
    <main className="container mx-auto px-4 max-w-7xl" role="main">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Manage your event submissions</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onOpenCreateModal}
          aria-label="Create new event"
        >
          + Create New Event
        </Button>
      </div>

      {/* Stats Section */}
      {stats && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          data-testid="stats-grid"
        >
          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_events}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending_internal}</p>
            </div>
          </div>

          <div role="article">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved_internal}</p>
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
              <h3 className="text-sm font-medium text-gray-500">Requires Changes</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.requires_changes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <OrganizerQuickFilters
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
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No events found</p>
            <Button
              variant="primary"
              onClick={onOpenCreateModal}
              aria-label="Create your first event"
            >
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {events.map((event) => (
              <OrganizerEventListItem
                key={event.id}
                event={event}
                onEdit={() => {}}
                onView={() => {}}
                onSuccess={onCreateSuccess}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={onCloseCreateModal}
          title="Create New Event"
          size="xl"
        >
          <OrganizerEventFormContainer
            mode="create"
            onSuccess={() => {
              onCreateSuccess()
              onCloseCreateModal()
            }}
            onCancel={onCloseCreateModal}
          />
        </Modal>
      )}
    </main>
  )
}
