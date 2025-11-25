/**
 * Admin Dashboard Container (Smart)
 *
 * Connects dashboard with data hooks, manages state, and handles approval modals.
 */

'use client'

import { AdminDashboard } from '../dumb/AdminDashboard'
import { useAdminStats } from '@/features/approval/hooks/useAdminStats'
import { useAdminEvents } from '@/features/approval/hooks/useAdminEvents'
import { useApprovalActions } from '@/features/approval/hooks/useApprovalActions'
import { ApproveConfirmModal } from '../dumb/ApproveConfirmModal'
import { RejectConfirmModal } from '../dumb/RejectConfirmModal'
import { RequestChangesModal } from '../dumb/RequestChangesModal'
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
      <ApproveConfirmModal
        isOpen={approveModalOpen}
        onClose={closeApproveModal}
        onConfirm={() => selectedEventId && approveEvent(selectedEventId)}
        loading={actionLoading}
        eventTitle={selectedEventTitle}
      />

      {/* Reject Modal */}
      <RejectConfirmModal
        isOpen={rejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={(reason) => selectedEventId && rejectEvent(selectedEventId, reason)}
        loading={actionLoading}
        eventTitle={selectedEventTitle}
      />

      {/* Request Changes Modal */}
      <RequestChangesModal
        isOpen={requestChangesModalOpen}
        onClose={closeRequestChangesModal}
        onConfirm={(comments) => selectedEventId && requestChanges(selectedEventId, comments)}
        loading={actionLoading}
        eventTitle={selectedEventTitle}
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
