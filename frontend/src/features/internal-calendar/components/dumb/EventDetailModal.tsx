/**
 * EventDetailModal Component (Dumb)
 *
 * Modal for displaying detailed event information.
 * Uses the base Modal component with event-specific content.
 * Created following TDD methodology (tests written first).
 */

'use client'

import Modal from '@/components/ui/Modal'
import { format } from 'date-fns'
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

/**
 * EventDetailModal Props
 */
export interface EventDetailModalProps {
  event: BigCalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

/**
 * EventDetailModal Component
 *
 * Displays comprehensive event information in a modal.
 *
 * @param props - EventDetailModal props
 * @returns React component
 */
export function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  if (!event) return null

  const { resource } = event

  // Format dates
  const startDate = format(event.start, 'MMMM dd, yyyy')
  const startTime = format(event.start, 'HH:mm')
  const endTime = format(event.end, 'HH:mm')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title} size="lg">
      <div className="space-y-4">
        {/* Description */}
        {resource.description && (
          <div>
            <p className="text-sm text-gray-700">{resource.description}</p>
          </div>
        )}

        {/* Date & Time */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Date & Time
          </h3>
          <p className="text-sm text-gray-600">
            {startDate}
          </p>
          <p className="text-sm text-gray-600">
            {startTime} - {endTime}
          </p>
        </div>

        {/* Event Type */}
        {resource.eventType && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Event Type
            </h3>
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: resource.eventType.color }}
              />
              <span className="text-sm text-gray-600">
                {resource.eventType.name}
              </span>
            </div>
          </div>
        )}

        {/* Organization */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Organization
          </h3>
          <p className="text-sm text-gray-600">{resource.organization.name}</p>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Status</h3>
          <p className="text-sm text-gray-600">{resource.status.name}</p>
        </div>

        {/* Locations */}
        {resource.locations && resource.locations.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Location{resource.locations.length > 1 ? 's' : ''}
            </h3>
            <ul className="space-y-1">
              {resource.locations.map((location) => (
                <li key={location.id} className="text-sm text-gray-600">
                  {location.name} - {location.city}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
