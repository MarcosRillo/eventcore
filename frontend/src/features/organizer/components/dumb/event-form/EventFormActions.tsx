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
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-sm font-semibold shadow-sm hover:bg-primary-600 hover:shadow-md active:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (isEditMode ? 'Actualizando...' : 'Creando...') : (isEditMode ? 'Actualizar Evento' : 'Crear Evento')}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex-1 bg-neutral-50 text-neutral-700 py-3 px-6 rounded-sm font-medium border border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancelar
      </button>
    </div>
  )
}
