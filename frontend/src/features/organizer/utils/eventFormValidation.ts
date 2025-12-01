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

  // Category validation
  if (!data.category_id) {
    errors.category_id = 'La categoría es requerida'
  }

  // Location validation (at least one location required)
  if (!data.location_ids || data.location_ids.length === 0) {
    errors.location_ids = 'Al menos una ubicación es requerida'
  }

  return errors
}

export const hasErrors = (errors: EventFormErrors): boolean => {
  return Object.keys(errors).length > 0
}
