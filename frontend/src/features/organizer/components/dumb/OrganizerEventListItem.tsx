import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { EventActionButtonsContainer } from '../smart/EventActionButtonsContainer'

interface OrganizerEventListItemProps {
  event: OrganizerEvent
  onEdit: () => void
  onView: () => void
  onSuccess?: () => void
  disabled?: boolean
}

export const OrganizerEventListItem = ({
  event,
  onEdit,
  onView,
  onSuccess,
  disabled = false
}: OrganizerEventListItemProps) => {
  const statusColors = {
    draft: 'bg-gray-200 text-gray-700',
    pending: 'bg-yellow-200 text-yellow-800',
    approved: 'bg-green-200 text-green-800',
    rejected: 'bg-red-200 text-red-800',
    published: 'bg-blue-200 text-blue-800'
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <div className="mt-1 space-y-1 text-sm text-gray-600">
          <p>Date: {new Date(event.event_date).toLocaleDateString()}</p>
          <p>Location: {event.location}</p>
        </div>
        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          disabled={disabled}
          aria-label={`View ${event.title}`}
          className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          View
        </button>

        <button
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Edit ${event.title}`}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Edit
        </button>

        <EventActionButtonsContainer
          event={event}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  )
}
