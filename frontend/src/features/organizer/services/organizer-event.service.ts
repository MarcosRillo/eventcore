import { CreateEventDto, EventListParams, EventListResponse, OrganizerEvent, SubmitEventResponse,UpdateEventDto } from '@/features/organizer/types/event.types'
import apiClient from '@/services/apiClient'

export const getEvents = async (params: EventListParams): Promise<EventListResponse> => {
  const response = await apiClient.get<EventListResponse>('/organizer/events', { params })
  return response.data
}

export const getEvent = async (id: number): Promise<OrganizerEvent> => {
  const response = await apiClient.get<OrganizerEvent>(`/organizer/events/${id}`)
  return response.data
}

export const createEvent = async (data: CreateEventDto): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.post('/organizer/events', data)
  return response.data
}

export const updateEvent = async (id: number, data: UpdateEventDto): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.put(`/organizer/events/${id}`, data)
  return response.data
}

interface ImageFiles {
  featured_image_file?: File
}

/**
 * Helper to build FormData from event data and files
 */
const buildFormData = (data: CreateEventDto | UpdateEventDto, files: ImageFiles): FormData => {
  const formData = new FormData()

  // Add all non-undefined scalar fields
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (key === 'location_ids' && Array.isArray(value)) {
      // Arrays need special handling for Laravel
      value.forEach((id, index) => {
        formData.append(`location_ids[${index}]`, String(id))
      })
    } else if (key === 'service_ids' && Array.isArray(value)) {
      value.forEach((id, index) => {
        formData.append(`service_ids[${index}]`, String(id))
      })
    } else if (key === 'room_ids' && Array.isArray(value)) {
      value.forEach((id, index) => {
        formData.append(`room_ids[${index}]`, String(id))
      })
    } else if (key === 'async_dates' && Array.isArray(value)) {
      value.forEach((dateObj, index) => {
        formData.append(`async_dates[${index}][date]`, dateObj.date)
        if (dateObj.notes) {
          formData.append(`async_dates[${index}][notes]`, dateObj.notes)
        }
      })
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')
    } else if (typeof value === 'number') {
      formData.append(key, String(value))
    } else if (typeof value === 'string') {
      formData.append(key, value)
    }
  })

  // Add files
  if (files.featured_image_file) {
    formData.append('featured_image_file', files.featured_image_file)
  }

  return formData
}

/**
 * Create event with file uploads (multipart/form-data)
 */
export const createEventWithFiles = async (
  data: CreateEventDto,
  files: ImageFiles
): Promise<{ data: OrganizerEvent }> => {
  const formData = buildFormData(data, files)

  const response = await apiClient.post('/organizer/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Update event with file uploads (multipart/form-data)
 * Uses POST with _method=PUT for Laravel compatibility with FormData
 */
export const updateEventWithFiles = async (
  id: number,
  data: UpdateEventDto,
  files: ImageFiles
): Promise<{ data: OrganizerEvent }> => {
  const formData = buildFormData(data, files)

  // Laravel requires _method=PUT for form data updates
  formData.append('_method', 'PUT')

  const response = await apiClient.post(`/organizer/events/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteEvent = async (id: number): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/organizer/events/${id}`)
  return response.data
}

/**
 * Submit event for internal review
 * Changes status from draft/requires_changes to pending_internal_approval
 * @param id
 */
export const submitForReview = async (id: number): Promise<SubmitEventResponse> => {
  const response = await apiClient.post(`/organizer/events/${id}/submit`)
  return response.data
}

export const duplicateEvent = async (id: number): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.post(`/organizer/events/${id}/duplicate`)
  return response.data
}
