import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

export const validateEventForm = (data: EventFormData): EventFormErrors => {
  const errors: EventFormErrors = {}

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'El título es requerido'
  } else if (data.title.length > 200) {
    errors.title = 'El título debe tener menos de 200 caracteres'
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'La descripción es requerida'
  } else if (data.description.length > 2000) {
    errors.description = 'La descripción debe tener menos de 2000 caracteres'
  }

  // Start date validation
  if (!data.start_date) {
    errors.start_date = 'La fecha de inicio es requerida'
  } else {
    // Extract date portion for comparison
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    const startDateString = data.start_date.split('T')[0]

    if (startDateString < todayString) {
      errors.start_date = 'La fecha de inicio debe ser en el futuro'
    }
  }

  // End date validation (if provided)
  if (data.end_date && data.start_date) {
    const startDateString = data.start_date.split('T')[0]
    const endDateString = data.end_date.split('T')[0]

    if (endDateString < startDateString) {
      errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  }

  // Event Type validation (required since Dec 2, 2025)
  if (!data.event_type_id) {
    errors.event_type_id = 'El tipo de evento es requerido'
  }

  // Event Subtype validation (required since Dec 2, 2025)
  if (!data.event_subtype_id) {
    errors.event_subtype_id = 'El subtipo de evento es requerido'
  }

  // Category validation (now optional - Dec 2, 2025)
  // category_id is no longer required

  // Location validation
  // Require at least one location OR a custom location with name
  const hasExistingLocations = data.location_ids && data.location_ids.length > 0
  const hasValidCustomLocation = data.has_custom_location && data.custom_location_name.trim()

  if (!hasExistingLocations && !hasValidCustomLocation) {
    if (data.has_custom_location) {
      errors.custom_location_name = 'El nombre del lugar es requerido'
    } else {
      errors.location_ids = 'Selecciona al menos una ubicación o agrega una personalizada'
    }
  }

  // If has_custom_location is checked but name is empty, show specific error
  if (data.has_custom_location && !data.custom_location_name.trim()) {
    errors.custom_location_name = 'El nombre del lugar es requerido'
  }

  return errors
}

export const hasErrors = (errors: EventFormErrors): boolean => {
  return Object.keys(errors).length > 0
}
