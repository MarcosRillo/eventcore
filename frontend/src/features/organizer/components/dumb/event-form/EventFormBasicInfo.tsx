import { useMemo } from 'react'

import { EventFormSection } from '@/features/organizer/components/dumb/event-form/EventFormSection'
import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'
import { Input, Select, Textarea } from '@/shared/components/form'
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
  // Convert event types to Select options format
  const eventTypeOptions = useMemo(() => {
    if (!Array.isArray(eventTypes)) return []
    return eventTypes.map(type => ({
      value: type.id,
      label: type.name
    }))
  }, [eventTypes])

  // Convert event subtypes to Select options format
  const eventSubtypeOptions = useMemo(() => {
    if (!Array.isArray(eventSubtypes)) return []
    return eventSubtypes.map(subtype => ({
      value: subtype.id,
      label: subtype.name
    }))
  }, [eventSubtypes])

  const handleTypeChange = (value: string | number) => {
    handleChange('event_type_id', value as number)
    handleChange('event_subtype_id', null)
  }

  const handleSubtypeChange = (value: string | number) => {
    handleChange('event_subtype_id', value as number)
  }

  return (
    <EventFormSection number={1} title="Información Básica">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Evento */}
        <div className="md:col-span-2">
          <Input
            type="text"
            name="title"
            label="Nombre del Evento"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={loading}
            required
            error={errors.title}
            placeholder="Ej: Congreso Internacional de Turismo 2025"
            autoComplete="off"
            fullWidth
          />
        </div>

        {/* Número de Edición */}
        <Input
          type="text"
          label="Número de Edición"
          value={formData.edition_number}
          onChange={(e) => handleChange('edition_number', e.target.value)}
          disabled={loading}
          error={errors.edition_number}
          placeholder="Ej: 10ma Edición"
          autoComplete="off"
          fullWidth
        />

        {/* Tipo de Evento */}
        <Select
          name="event_type_id"
          label="Tipo de Evento"
          value={formData.event_type_id}
          onChange={handleTypeChange}
          options={eventTypeOptions}
          placeholder="Seleccionar tipo de evento…"
          disabled={loading}
          required
          error={errors.event_type_id}
          fullWidth
        />

        {/* Subtipo de Evento */}
        <Select
          name="event_subtype_id"
          label="Subtipo de Evento"
          value={formData.event_subtype_id}
          onChange={handleSubtypeChange}
          options={eventSubtypeOptions}
          placeholder={!formData.event_type_id ? 'Primero selecciona un tipo…' : 'Seleccionar subtipo…'}
          disabled={loading || !formData.event_type_id}
          required
          error={errors.event_subtype_id}
          fullWidth
        />

        {/* Descripción */}
        <div className="md:col-span-2">
          <Textarea
            name="description"
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={loading}
            required
            error={errors.description}
            placeholder="Descripción detallada del evento…"
            rows={4}
            autoComplete="off"
            fullWidth
          />
        </div>
      </div>
    </EventFormSection>
  )
}
