/**
 * EventActionButtons Container (Smart Component)
 *
 * Connects EventActionButtons presentational component
 * with useEventActions hook for business logic.
 */

import { EventActionButtons } from '@/features/organizer/components/dumb/EventActionButtons'
import { useEventActions } from '@/features/organizer/hooks/useEventActions'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { DeleteConfirmModal, PublishConfirmModal } from '@/shared/components/modals'

interface EventActionButtonsContainerProps {
  event: OrganizerEvent
  onSuccess?: (deletedEventId?: number) => void
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
    deleteEvent
  } = useEventActions(onSuccess)

  const handleSubmit = (): void => {
    openSubmitModal(event.id)
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
        variant={validationErrors ? 'warning' : 'info'}
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
