import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { AsyncSearchableMultiSelect, SelectOption } from '@/shared/components/form'

type FormFieldValue = string | number | boolean | null | number[]

interface EventFormLocationProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  onSearchLocations: (query: string) => Promise<SelectOption[]>
  selectedLocations: SelectOption[]
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
            placeholder="Escribe para buscar ubicación..."
            error={errors.location_ids}
            disabled={loading}
            required={!formData.has_custom_location}
          />
        </div>

        {/* Checkbox "Otro" - Ubicación Personalizada */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.has_custom_location}
              onChange={(e) => handleCustomLocationToggle(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <span className="text-sm text-neutral-700">Agregar ubicación personalizada (Otro)</span>
          </label>
        </div>

        {/* Campos de ubicación personalizada */}
        {formData.has_custom_location && (
          <>
            <div>
              <label htmlFor="custom_location_name" className="block text-sm font-medium text-neutral-600">
                Nombre del Lugar *
              </label>
              <input
                type="text"
                id="custom_location_name"
                value={formData.custom_location_name}
                onChange={(e) => handleChange('custom_location_name', e.target.value)}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!errors.custom_location_name}
                aria-describedby={errors.custom_location_name ? 'custom-location-error' : undefined}
                className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                placeholder="Ej: Salón de Eventos El Jardín"
              />
              {errors.custom_location_name && (
                <p id="custom-location-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.custom_location_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="maps_url" className="block text-sm font-medium text-neutral-600">
                URL de Google Maps
              </label>
              <input
                type="text"
                id="maps_url"
                value={formData.maps_url}
                onChange={(e) => handleChange('maps_url', e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </>
        )}

        {/* Última Sede */}
        <div>
          <label htmlFor="previous_venue" className="block text-sm font-medium text-neutral-600">
            Última Sede (Anterior)
          </label>
          <input
            type="text"
            id="previous_venue"
            value={formData.previous_venue}
            onChange={(e) => handleChange('previous_venue', e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Ej: Buenos Aires 2024"
          />
        </div>

        {/* Próxima Sede */}
        <div>
          <label htmlFor="next_venue" className="block text-sm font-medium text-neutral-600">
            Próxima Sede
          </label>
          <input
            type="text"
            id="next_venue"
            value={formData.next_venue}
            onChange={(e) => handleChange('next_venue', e.target.value)}
            disabled={loading}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Ej: Córdoba 2026"
          />
        </div>
      </div>
    </EventFormSection>
  )
}
