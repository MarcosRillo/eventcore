/**
 * Admin Event List Component
 *
 * Displays events in a table format with organizer information.
 */

import { ApprovalActionButtons } from '@/features/approval/components/dumb/ApprovalActionButtons'
import { Event } from '@/features/approval/types/approval.types'

interface AdminEventListProps {
  events: Event[]
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
  onRequestChanges: (eventId: number) => void
  onPublish: (eventId: number) => void
  loading?: boolean
}

export const AdminEventList = ({
  events,
  onApprove,
  onReject,
  onRequestChanges,
  onPublish,
  loading = false
}: AdminEventListProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadgeClass = (status: string): string => {
    const baseClass = 'px-2 py-1 text-xs font-medium rounded-full'
    switch (status) {
      case 'pending_internal':
        return `${baseClass} bg-yellow-100 text-yellow-800`
      case 'approved_internal':
        return `${baseClass} bg-green-100 text-green-800`
      case 'published':
        return `${baseClass} bg-blue-100 text-blue-800`
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`
      case 'requires_changes':
        return `${baseClass} bg-orange-100 text-orange-800`
      default:
        return `${baseClass} bg-gray-100 text-gray-800`
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending_internal':
        return 'Pending'
      case 'approved_internal':
        return 'Approved'
      case 'published':
        return 'Published'
      case 'rejected':
        return 'Rejected'
      case 'requires_changes':
        return 'Changes Needed'
      default:
        return status
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organizer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{event.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{event.organizer}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">Category {event.category_id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatDate(event.start_date)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadgeClass(event.status)}>
                  {getStatusLabel(event.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ApprovalActionButtons
                  event={event}
                  onApprove={onApprove}
                  onReject={onReject}
                  onRequestChanges={onRequestChanges}
                  onPublish={onPublish}
                  loading={loading}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
