/**
 * EventActionButtons Container (Smart Component)
 *
 * Connects EventActionButtons presentational component
 * with useEventActions hook for business logic.
 */

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { useEventActions } from '@/features/organizer/hooks/useEventActions'
import { EventActionButtons } from '@/features/organizer/components/dumb/EventActionButtons'
import { PublishConfirmModal, DeleteConfirmModal } from '@/shared/components/modals'

interface EventActionButtonsContainerProps {
  event: OrganizerEvent
  onSuccess?: () => void
}

export const EventActionButtonsContainer = ({
  event,
  onSuccess
}: EventActionButtonsContainerProps) => {
  const {
    loading,
    publishModalOpen,
    deleteModalOpen,
    selectedEventId,
    openPublishModal,
    closePublishModal,
    openDeleteModal,
    closeDeleteModal,
    publishEvent,
    duplicateEvent,
    deleteEvent
  } = useEventActions(onSuccess)

  const handlePublish = (): void => {
    openPublishModal(event.id)
  }

  const handleDuplicate = async (): Promise<void> => {
    await duplicateEvent(event.id)
  }

  const handleDelete = (): void => {
    openDeleteModal(event.id)
  }

  const confirmPublish = async (): Promise<void> => {
    if (selectedEventId) {
      await publishEvent(selectedEventId)
    }
  }

  const confirmDelete = async (): Promise<void> => {
    if (selectedEventId) {
      await deleteEvent(selectedEventId)
    }
  }

  return (
    <>
      <EventActionButtons
        event={event}
        onPublish={handlePublish}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        loading={loading}
      />

      <PublishConfirmModal
        isOpen={publishModalOpen}
        onClose={closePublishModal}
        onConfirm={confirmPublish}
        loading={loading}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete Event"
        itemName={event.title}
      />
    </>
  )
}
