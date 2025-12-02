'use client'

/**
 * RequestStatusBadge - Dumb Component
 * Displays the status of a registration request with appropriate styling
 *
 * Display statuses:
 * - pending: Yellow - Request awaiting review
 * - approved/active: Green - User and org created and active
 * - suspended: Gray - User/org suspended
 * - rejected: Red - Request was rejected
 * - deleted: Dark red - User/org soft deleted
 */

import {
  RegistrationRequest,
  isRequestPending,
  isRequestApproved,
  isRequestRejected,
  isRequestSuspended,
} from '../../types/registration-request.types'

interface RequestStatusBadgeProps {
  request: RegistrationRequest
}

type DisplayStatus = 'pending' | 'active' | 'suspended' | 'rejected' | 'deleted'

interface StatusConfig {
  label: string
  className: string
}

const statusConfig: Record<DisplayStatus, StatusConfig> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-warning-100 text-warning-800',
  },
  active: {
    label: 'Activo',
    className: 'bg-success-100 text-success-800',
  },
  suspended: {
    label: 'Suspendido',
    className: 'bg-neutral-100 text-neutral-800',
  },
  rejected: {
    label: 'Rechazado',
    className: 'bg-error-100 text-error-800',
  },
  deleted: {
    label: 'Eliminado',
    className: 'bg-error-200 text-error-900',
  },
}

/**
 * Get the display status for a registration request
 * Consolidates request status + user status into a single display status
 */
const getDisplayStatus = (request: RegistrationRequest): DisplayStatus => {
  // Check for deleted first (highest priority)
  if (request.is_deleted) {
    return 'deleted'
  }

  // Check for suspended (only for approved requests)
  if (isRequestSuspended(request)) {
    return 'suspended'
  }

  // Check pending
  if (isRequestPending(request)) {
    return 'pending'
  }

  // Check approved (active)
  if (isRequestApproved(request)) {
    return 'active'
  }

  // Check rejected
  if (isRequestRejected(request)) {
    return 'rejected'
  }

  // Default to pending
  return 'pending'
}

export const RequestStatusBadge = ({ request }: RequestStatusBadgeProps) => {
  const displayStatus = getDisplayStatus(request)
  const config = statusConfig[displayStatus]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      data-testid="request-status-badge"
      data-status={displayStatus}
    >
      {config.label}
    </span>
  )
}

export default RequestStatusBadge
