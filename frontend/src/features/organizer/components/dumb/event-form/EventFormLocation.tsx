import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { AsyncSearchableMultiSelect, AsyncSelectOption, Checkbox, Input } from '@/shared/components/form'

type FormFieldValue = string | number | boolean | null | number[]

interface EventFormLocationProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  onSearchLocations: (query: string) => Promise<AsyncSelectOption[]>
  selectedLocations: AsyncSelectOption[]
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
  handleCustomLocationToggle: (checked: boolean) => void
}

/**
 * Location section: locations multi-select, custom location fields, venues
 */
export const EventFormLocation = ({
  formData,
  errors,
  loading,
  onSearchLocations,
  selectedLocations,
  handleChange,
  handleCustomLocationToggle
}: EventFormLocationProps) => {
  return (
    <EventFormSection number={2} title="Ubicación">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ubicaciones (selección múltiple con búsqueda async) */}
        <div className="md:col-span-2">
          <AsyncSearchableMultiSelect
            label="Ubicaciones"
            onSearch={onSearchLocations}
            selected={formData.location_ids}
            selectedOptions={selectedLocations}
            onChange={(ids) => handleChange('location_ids', ids)}
            placeholder="Escribe para buscar ubicación…"
            error={errors.location_ids}
            disabled={loading}
            required={!formData.has_custom_location}
          />
        </div>

        {/* Checkbox "Otro" - Ubicación Personalizada */}
        <div className="md:col-span-2">
          <Checkbox
            checked={formData.has_custom_location}
            onChange={handleCustomLocationToggle}
            disabled={loading}
            label="Agregar ubicación personalizada (Otro)"
          />
        </div>

        {/* Campos de ubicación personalizada */}
        {formData.has_custom_location && (
          <>
            <Input
              type="text"
              label="Nombre del Lugar"
              value={formData.custom_location_name}
              onChange={(e) => handleChange('custom_location_name', e.target.value)}
              disabled={loading}
              required
              error={errors.custom_location_name}
              placeholder="Ej: Salón de Eventos El Jardín"
              autoComplete="off"
              fullWidth
            />

            <Input
              type="url"
              label="URL de Google Maps"
              value={formData.maps_url}
              onChange={(e) => handleChange('maps_url', e.target.value)}
              disabled={loading}
              placeholder="https://maps.google.com/…"
              spellCheck={false}
              autoComplete="off"
              fullWidth
            />
          </>
        )}

        {/* Última Sede */}
        <Input
          type="text"
          label="Última Sede (Anterior)"
          value={formData.previous_venue}
          onChange={(e) => handleChange('previous_venue', e.target.value)}
          disabled={loading}
          placeholder="Ej: Buenos Aires 2024"
          autoComplete="off"
          fullWidth
        />

        {/* Próxima Sede */}
        <Input
          type="text"
          label="Próxima Sede"
          value={formData.next_venue}
          onChange={(e) => handleChange('next_venue', e.target.value)}
          disabled={loading}
          placeholder="Ej: Córdoba 2026"
          autoComplete="off"
          fullWidth
        />
      </div>
    </EventFormSection>
  )
}
