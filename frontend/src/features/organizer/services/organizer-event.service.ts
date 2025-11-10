import apiClient from '@/services/apiClient'
import { EventListParams, EventListResponse, CreateEventDto, UpdateEventDto, OrganizerEvent } from '@/features/organizer/types/event.types'

export const getEvents = async (params: EventListParams): Promise<EventListResponse> => {
  const response = await apiClient.get<{data: EventListResponse}>('/organizer/events', { params })
  return response.data.data
}

export const getEvent = async (id: number): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.get(`/organizer/events/${id}`)
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

export const publishEvent = async (id: number): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.post(`/organizer/events/${id}/publish`)
  return response.data
}

export const duplicateEvent = async (id: number): Promise<{ data: OrganizerEvent }> => {
  const response = await apiClient.post(`/organizer/events/${id}/duplicate`)
  return response.data
}
