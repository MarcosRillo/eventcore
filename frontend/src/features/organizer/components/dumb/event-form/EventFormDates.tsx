import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { AsynchronousDate,EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { Button, DateTimePicker, Input } from '@/shared/components/form'

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
        <DateTimePicker
          name="start_date"
          label="Fecha Inicio"
          value={formData.start_date}
          onChange={(value) => handleChange('start_date', value)}
          minDate={new Date()}
          disabled={loading}
          required
          error={errors.start_date}
          fullWidth
        />

        {/* Fecha Fin */}
        <DateTimePicker
          name="end_date"
          label="Fecha Fin"
          value={formData.end_date}
          onChange={(value) => handleChange('end_date', value)}
          minDate={formData.start_date ? new Date(formData.start_date) : new Date()}
          disabled={loading}
          error={errors.end_date}
          fullWidth
        />
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAsynchronousDate(index)}
                  disabled={loading}
                  aria-label={`Eliminar fecha ${asyncDate.date}`}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nueva fecha asincrónica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <DateTimePicker
            label="Fecha adicional"
            value={newAsyncDate.date}
            onChange={(value) => setNewAsyncDate({ ...newAsyncDate, date: value })}
            showTime={false}
            disabled={loading}
            name="async-date"
            fullWidth
          />
          <Input
            type="text"
            value={newAsyncDate.notes}
            onChange={(e) => setNewAsyncDate({ ...newAsyncDate, notes: e.target.value })}
            disabled={loading}
            placeholder="Notas (opcional)"
            aria-label="Notas de la fecha adicional"
            autoComplete="off"
            fullWidth
          />
          <Button
            type="button"
            variant="success"
            onClick={addAsynchronousDate}
            disabled={loading || !newAsyncDate.date}
            fullWidth
          >
            Agregar
          </Button>
        </div>
      </div>
    </EventFormSection>
  )
}
