import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

type FormFieldValue = string | number | boolean | null

interface EventFormAttendanceProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
}

/**
 * Attendance section: local/national/international attendance, virtual transmission
 */
export const EventFormAttendance = ({
  formData,
  errors,
  loading,
  handleChange
}: EventFormAttendanceProps) => {
  return (
    <EventFormSection number={4} title="Asistencia">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Asistencia Locales */}
        <div>
          <label htmlFor="local_attendance" className="block text-sm font-medium text-neutral-600">
            Asistencia Locales
          </label>
          <input
            type="number"
            id="local_attendance"
            value={formData.local_attendance}
            onChange={(e) => handleChange('local_attendance', e.target.value)}
            disabled={loading}
            min="0"
            aria-invalid={!!errors.local_attendance}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="0"
          />
        </div>

        {/* Asistencia Nacionales */}
        <div>
          <label htmlFor="national_attendance" className="block text-sm font-medium text-neutral-600">
            Asistencia Nacionales
          </label>
          <input
            type="number"
            id="national_attendance"
            value={formData.national_attendance}
            onChange={(e) => handleChange('national_attendance', e.target.value)}
            disabled={loading}
            min="0"
            aria-invalid={!!errors.national_attendance}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="0"
          />
        </div>

        {/* Asistencia Extranjeros */}
        <div>
          <label htmlFor="international_attendance" className="block text-sm font-medium text-neutral-600">
            Asistencia Extranjeros
          </label>
          <input
            type="number"
            id="international_attendance"
            value={formData.international_attendance}
            onChange={(e) => handleChange('international_attendance', e.target.value)}
            disabled={loading}
            min="0"
            aria-invalid={!!errors.international_attendance}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="0"
          />
        </div>
      </div>

      {/* Transmisión Virtual */}
      <div className="flex items-center pt-2">
        <input
          type="checkbox"
          id="virtual_transmission"
          checked={formData.virtual_transmission}
          onChange={(e) => handleChange('virtual_transmission', e.target.checked)}
          disabled={loading}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
        />
        <label htmlFor="virtual_transmission" className="ml-2 block text-sm text-neutral-900">
          Transmisión Virtual
        </label>
      </div>
    </EventFormSection>
  )
}
