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
