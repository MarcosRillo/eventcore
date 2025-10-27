import apiClient from '@/services/apiClient'
import { EventListParams, EventListResponse } from '../types/event.types'

export const getEvents = async (params: EventListParams): Promise<EventListResponse> => {
  const response = await apiClient.get<{data: EventListResponse}>('/organizer/events', { params })
  return response.data.data
}

export const deleteEvent = async (id: number): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/organizer/events/${id}`)
  return response.data
}
