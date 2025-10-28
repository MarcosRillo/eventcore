import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerEventListItem } from './OrganizerEventListItem'

interface OrganizerEventListProps {
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  statusFilter: string | null
  isDeleting: boolean
  onPageChange: (page: number) => void
  onStatusFilter: (status: string | null) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onView: (id: number) => void
  onRetry: () => void
}

export const OrganizerEventList = ({
  events,
  loading,
  error,
  currentPage,
  totalPages,
  total,
  statusFilter,
  isDeleting,
  onPageChange,
  onStatusFilter,
  onEdit,
  onDelete,
  onView,
  onRetry
}: OrganizerEventListProps) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading events...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state - no events at all
  if (events.length === 0 && !statusFilter) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No events yet
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first event to get started
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Event
        </button>
      </div>
    )
  }

  // Empty state - no matching filter
  if (events.length === 0 && statusFilter) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No events found
        </h3>
        <p className="text-gray-500 mb-4">
          Try a different filter or create a new event
        </p>
        <button
          onClick={() => onStatusFilter(null)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter || ''}
            onChange={(e) => onStatusFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Total: {total} events
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {events.map((event) => (
          <OrganizerEventListItem
            key={event.id}
            event={event}
            onEdit={() => onEdit(event.id)}
            onDelete={() => onDelete(event.id)}
            onView={() => onView(event.id)}
            disabled={isDeleting}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Deleting event...</p>
          </div>
        </div>
      )}
    </div>
  )
}
