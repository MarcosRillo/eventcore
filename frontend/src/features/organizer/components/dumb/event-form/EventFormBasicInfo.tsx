import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { EventSubtype,EventType } from '@/types/eventType.types'

type FormFieldValue = string | number | boolean | null | number[]

interface EventFormBasicInfoProps {
  formData: EventFormData
  errors: EventFormErrors
  loading: boolean
  eventTypes: EventType[]
  eventSubtypes: EventSubtype[]
  handleChange: (field: keyof EventFormData, value: FormFieldValue) => void
}

/**
 * Basic information section: title, edition, type, subtype, description
 */
export const EventFormBasicInfo = ({
  formData,
  errors,
  loading,
  eventTypes,
  eventSubtypes,
  handleChange
}: EventFormBasicInfoProps) => {
  return (
    <EventFormSection number={1} title="Información Básica">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Evento */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-neutral-600">
            Nombre del Evento *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Ej: Congreso Internacional de Turismo 2025"
          />
          {errors.title && (
            <p id="title-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.title}</p>
          )}
        </div>

        {/* Número de Edición */}
        <div>
          <label htmlFor="edition_number" className="block text-sm font-medium text-neutral-600">
            Número de Edición
          </label>
          <input
            type="text"
            id="edition_number"
            value={formData.edition_number}
            onChange={(e) => handleChange('edition_number', e.target.value)}
            disabled={loading}
            aria-invalid={!!errors.edition_number}
            aria-describedby={errors.edition_number ? 'edition-number-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Ej: 10ma Edición"
          />
          {errors.edition_number && (
            <p id="edition-number-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.edition_number}</p>
          )}
        </div>

        {/* Tipo de Evento */}
        <div>
          <label htmlFor="event_type_id" className="block text-sm font-medium text-neutral-600">
            Tipo de Evento *
          </label>
          <select
            id="event_type_id"
            value={formData.event_type_id || ''}
            onChange={(e) => {
              const newTypeId = e.target.value ? parseInt(e.target.value) : null
              handleChange('event_type_id', newTypeId)
              handleChange('event_subtype_id', null)
            }}
            disabled={loading}
            aria-required="true"
            aria-invalid={!!errors.event_type_id}
            aria-describedby={errors.event_type_id ? 'event-type-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">Seleccionar tipo de evento</option>
            {Array.isArray(eventTypes) && eventTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          {errors.event_type_id && (
            <p id="event-type-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.event_type_id}</p>
          )}
        </div>

        {/* Subtipo de Evento */}
        <div>
          <label htmlFor="event_subtype_id" className="block text-sm font-medium text-neutral-600">
            Subtipo de Evento *
          </label>
          <select
            id="event_subtype_id"
            value={formData.event_subtype_id || ''}
            onChange={(e) => handleChange('event_subtype_id', e.target.value ? parseInt(e.target.value) : null)}
            disabled={loading || !formData.event_type_id}
            aria-required="true"
            aria-invalid={!!errors.event_subtype_id}
            aria-describedby={errors.event_subtype_id ? 'event-subtype-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">
              {!formData.event_type_id ? 'Primero selecciona un tipo' : 'Seleccionar subtipo'}
            </option>
            {Array.isArray(eventSubtypes) && eventSubtypes.map(subtype => (
              <option key={subtype.id} value={subtype.id}>{subtype.name}</option>
            ))}
          </select>
          {errors.event_subtype_id && (
            <p id="event-subtype-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.event_subtype_id}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-neutral-600">
            Descripción *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={loading}
            rows={4}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            className="mt-1 block w-full rounded-sm border border-neutral-300 bg-neutral-50 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="Descripción detallada del evento..."
          />
          {errors.description && (
            <p id="description-error" role="alert" className="mt-1 text-sm text-error-600 font-medium">{errors.description}</p>
          )}
        </div>
      </div>
    </EventFormSection>
  )
}
