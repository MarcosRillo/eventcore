import { Button } from '@/shared/components/form'

interface EventFormActionsProps {
  loading: boolean
  isEditMode: boolean
  onCancel: () => void
}

/**
 * Form action buttons: submit and cancel
 */
export const EventFormActions = ({
  loading,
  isEditMode,
  onCancel
}: EventFormActionsProps) => {
  return (
    <div className="flex gap-4 pt-4 border-t border-neutral-200">
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        fullWidth
      >
        {isEditMode ? 'Actualizar Evento' : 'Crear Evento'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
        fullWidth
      >
        Cancelar
      </Button>
    </div>
  )
}
