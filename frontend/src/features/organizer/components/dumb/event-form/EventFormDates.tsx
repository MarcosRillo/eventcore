import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { AsynchronousDate,EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

type FormFieldValue = string | number | boolean | null | number[] | AsynchronousDate[]

interface EventFormDatesProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  newAsyncDate: { date: string; notes: string }
  setNewAsyncDate: (value: { date: string; notes: string }) => void
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
  addAsynchronousDate: () => void
  removeAsynchronousDate: (index: number) => void
}

/**
 * Dates section: start/end dates, asynchronous dates list
 */
export const EventFormDates = ({
  formData,
  errors,
  loading,
  newAsyncDate,
  setNewAsyncDate,
  handleChange,
  addAsynchronousDate,
  removeAsynchronousDate
}: EventFormDatesProps) => {
  return (
    <EventFormSection number={3} title="Fechas">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha Inicio */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-neutral-600">
            Fecha Inicio *
          </label>
          <input
            type="datetime-local"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.start_date}
            aria-describedby={errors.start_date ? 'start-date-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
          {errors.start_date && (
            <p id="start-date-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.start_date}</p>
          )}
        </div>

        {/* Fecha Fin */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-neutral-600">
            Fecha Fin
          </label>
          <input
            type="datetime-local"
            id="end_date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.end_date}
            aria-describedby={errors.end_date ? 'end-date-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
          {errors.end_date && (
            <p id="end-date-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Fechas Asincrónicas */}
      <div className="pt-4 border-t border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Fechas Adicionales (Opcional)
        </h3>
        <p className="text-xs text-neutral-500 mb-3">
          Agrega fechas adicionales para eventos que ocurren en días no consecutivos
        </p>

        {/* Lista de fechas asincrónicas */}
        {formData.async_dates.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.async_dates.map((asyncDate, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-sm p-3"
              >
                <div className="flex-1 text-sm text-neutral-900">
                  <span className="font-medium">{asyncDate.date}</span>
                  {asyncDate.notes && (
                    <>
                      {' • '}
                      <span className="text-neutral-500">{asyncDate.notes}</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAsynchronousDate(index)}
                  disabled={loading}
                  className="text-error-600 hover:text-error-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nueva fecha asincrónica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <input
              type="date"
              value={newAsyncDate.date}
              onChange={(e) => setNewAsyncDate({ ...newAsyncDate, date: e.target.value })}
              disabled={loading}
              placeholder="Fecha"
              className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <input
              type="text"
              value={newAsyncDate.notes}
              onChange={(e) => setNewAsyncDate({ ...newAsyncDate, notes: e.target.value })}
              disabled={loading}
              placeholder="Notas (opcional)"
              className="block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            onClick={addAsynchronousDate}
            disabled={loading || !newAsyncDate.date}
            className="bg-secondary-500 text-white px-4 py-2 rounded-sm font-medium shadow-sm hover:bg-secondary-600 active:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agregar
          </button>
        </div>
      </div>
    </EventFormSection>
  )
}
