/**
 * Admin Dashboard Container (Smart)
 *
 * Connects dashboard with data hooks, manages state, and handles approval modals.
 */

'use client'

import { ConfirmDialog, PromptDialog } from '@/components/ui'
import { AdminDashboard } from '@/features/approval/components/dumb/AdminDashboard'
import { useAdminEvents } from '@/features/approval/hooks/useAdminEvents'
import { useAdminStats } from '@/features/approval/hooks/useAdminStats'
import { useApprovalActions } from '@/features/approval/hooks/useApprovalActions'
import { PublishConfirmModal } from '@/shared/components/modals'

export const AdminDashboardContainer = () => {
  // Fetch stats and events
  const { stats, refetch: refetchStats } = useAdminStats()
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    statusFilter,
    handleStatusFilter,
    retry
  } = useAdminEvents()

  // Approval actions and modal state
  const {
    loading: actionLoading,
    approveModalOpen,
    rejectModalOpen,
    requestChangesModalOpen,
    publishModalOpen,
    selectedEventId,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    openRequestChangesModal,
    closeRequestChangesModal,
    openPublishModal,
    closePublishModal,
    approveEvent,
    rejectEvent,
    requestChanges,
    publishEvent
  } = useApprovalActions(() => {
    refetchStats()
    retry()
  })

  // Handle filter change
  const handleFilterChange = (status: string | null): void => {
    handleStatusFilter(status)
  }

  // Get selected event title for modals
  const selectedEvent = events.data.find(e => e.id === selectedEventId)
  const selectedEventTitle = selectedEvent?.title

  return (
    <>
      {stats && (
        <AdminDashboard
          stats={stats}
          events={events}
          loading={eventsLoading}
          error={eventsError}
          activeFilter={statusFilter}
          onFilterChange={handleFilterChange}
          onApprove={openApproveModal}
          onReject={openRejectModal}
          onRequestChanges={openRequestChangesModal}
          onPublish={openPublishModal}
        />
      )}

      {/* Approve Modal */}
      <ConfirmDialog
        isOpen={approveModalOpen}
        title="Approve Event"
        message={`Are you sure you want to approve "${selectedEventTitle || ''}"? The event will be marked as approved and can be published.`}
        confirmText="Approve"
        variant="success"
        onConfirm={() => selectedEventId && approveEvent(selectedEventId)}
        onCancel={closeApproveModal}
        loading={actionLoading}
      />

      {/* Reject Modal */}
      <PromptDialog
        isOpen={rejectModalOpen}
        title="Reject Event"
        message={`Please provide a reason for rejecting "${selectedEventTitle || ''}":`}
        label="Rejection Reason"
        placeholder="Enter reason for rejection..."
        multiline
        required
        confirmText="Reject Event"
        variant="danger"
        onConfirm={(reason) => selectedEventId && rejectEvent(selectedEventId, reason)}
        onCancel={closeRejectModal}
        loading={actionLoading}
      />

      {/* Request Changes Modal */}
      <PromptDialog
        isOpen={requestChangesModalOpen}
        title="Request Changes"
        message={`Request changes to "${selectedEventTitle || ''}":`}
        placeholder="Describe what changes are needed..."
        multiline
        required
        confirmText="Request Changes"
        variant="warning"
        onConfirm={(comments) => selectedEventId && requestChanges(selectedEventId, comments)}
        onCancel={closeRequestChangesModal}
        loading={actionLoading}
      />

      {/* Publish Modal */}
      <PublishConfirmModal
        isOpen={publishModalOpen}
        onClose={closePublishModal}
        onConfirm={() => selectedEventId && publishEvent(selectedEventId)}
        loading={actionLoading}
        title="Publish Event"
      />
    </>
  )
}
