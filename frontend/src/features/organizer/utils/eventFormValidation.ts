import { EventFormData, EventFormErrors } from '@/features/organizer/types/event.types'

export const validateEventForm = (data: EventFormData): EventFormErrors => {
  const errors: EventFormErrors = {}

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Title is required'
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters'
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Description is required'
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be less than 2000 characters'
  }

  // Date validation
  if (!data.event_date) {
    errors.event_date = 'Event date is required'
  } else {
    // Compare date strings directly to avoid timezone issues
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]

    if (data.event_date <= todayString) {
      errors.event_date = 'Date must be in the future'
    }
  }

  // Time validation
  if (!data.start_time) {
    errors.start_time = 'Start time is required'
  }

  if (!data.end_time) {
    errors.end_time = 'End time is required'
  }

  // End time must be after start time
  if (data.start_time && data.end_time) {
    if (data.end_time <= data.start_time) {
      errors.end_time = 'End time must be after start time'
    }
  }

  // Category validation
  if (!data.category_id) {
    errors.category_id = 'Category is required'
  }

  // Location validation
  if (!data.location_id) {
    errors.location_id = 'Location is required'
  }

  return errors
}

export const hasErrors = (errors: EventFormErrors): boolean => {
  return Object.keys(errors).length > 0
}
