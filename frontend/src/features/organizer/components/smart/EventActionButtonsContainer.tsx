/**
 * EventActionButtons Container (Smart Component)
 *
 * Connects EventActionButtons presentational component
 * with useEventActions hook for business logic.
 */

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { useEventActions } from '@/features/organizer/hooks/useEventActions'
import { EventActionButtons } from '@/features/organizer/components/dumb/EventActionButtons'
import { DeleteConfirmModal, PublishConfirmModal } from '@/shared/components/modals'

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
    submitModalOpen,
    deleteModalOpen,
    selectedEventId,
    validationErrors,
    openSubmitModal,
    closeSubmitModal,
    openDeleteModal,
    closeDeleteModal,
    submitForReview,
    duplicateEvent,
    deleteEvent
  } = useEventActions(onSuccess)

  const handleSubmit = (): void => {
    openSubmitModal(event.id)
  }

  const handleDuplicate = async (): Promise<void> => {
    await duplicateEvent(event.id)
  }

  const handleDelete = (): void => {
    openDeleteModal(event.id)
  }

  const confirmSubmit = async (): Promise<void> => {
    if (selectedEventId) {
      await submitForReview(selectedEventId)
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
        onSubmit={handleSubmit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        loading={loading}
      />

      <PublishConfirmModal
        isOpen={submitModalOpen}
        onClose={closeSubmitModal}
        onConfirm={confirmSubmit}
        title="Enviar a revisión"
        message={
          validationErrors
            ? `Faltan los siguientes campos: ${Object.keys(validationErrors).join(', ')}`
            : `¿Está seguro que desea enviar "${event.title}" a revisión? Una vez enviado, no podrá editarlo hasta recibir una respuesta.`
        }
        confirmLabel="Enviar"
        loading={loading}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        loading={loading}
        title="Eliminar evento"
        itemName={event.title}
      />
    </>
  )
}
