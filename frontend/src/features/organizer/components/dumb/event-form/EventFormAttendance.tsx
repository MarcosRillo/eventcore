import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { Checkbox, Input } from '@/shared/components/form'

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
        <Input
          type="number"
          label="Asistencia Locales"
          value={formData.local_attendance}
          onChange={(e) => handleChange('local_attendance', e.target.value)}
          disabled={loading}
          min={0}
          inputMode="numeric"
          error={errors.local_attendance}
          placeholder="0"
          autoComplete="off"
          fullWidth
        />

        {/* Asistencia Nacionales */}
        <Input
          type="number"
          label="Asistencia Nacionales"
          value={formData.national_attendance}
          onChange={(e) => handleChange('national_attendance', e.target.value)}
          disabled={loading}
          min={0}
          inputMode="numeric"
          error={errors.national_attendance}
          placeholder="0"
          autoComplete="off"
          fullWidth
        />

        {/* Asistencia Extranjeros */}
        <Input
          type="number"
          label="Asistencia Extranjeros"
          value={formData.international_attendance}
          onChange={(e) => handleChange('international_attendance', e.target.value)}
          disabled={loading}
          min={0}
          inputMode="numeric"
          error={errors.international_attendance}
          placeholder="0"
          autoComplete="off"
          fullWidth
        />
      </div>

      {/* Transmisión Virtual */}
      <div className="pt-2">
        <Checkbox
          checked={formData.virtual_transmission}
          onChange={(checked) => handleChange('virtual_transmission', checked)}
          disabled={loading}
          label="Transmisión Virtual"
        />
      </div>
    </EventFormSection>
  )
}
