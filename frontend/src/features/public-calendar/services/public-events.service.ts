/**
 * Public Events Service
 *
 * Handles API calls for public calendar (no auth required).
 */

import apiClient from '@/services/apiClient'
import {
  EventsResponse,
  PublicEvent,
  EventType,
  EventSubtype,
  Location,
  PublicStats
} from '@/features/public-calendar/types/public-calendar.types'

interface FetchEventsParams {
  event_type_id?: number | null
  event_subtype_id?: number | null
  location_id?: number | null
  start_date?: string | null
  end_date?: string | null
  page?: number
}

export const publicEventsService = {
  /**
   * Get all published events
   */
  getAll: async (params: FetchEventsParams = {}): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams()

    if (params.event_type_id) {
      queryParams.append('event_type_id', params.event_type_id.toString())
    }
    if (params.event_subtype_id) {
      queryParams.append('event_subtype_id', params.event_subtype_id.toString())
    }
    if (params.location_id) {
      queryParams.append('location_id', params.location_id.toString())
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date)
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString
      ? `/public/events?${queryString}`
      : '/public/events'

    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Get event by ID
   */
  getById: async (id: number): Promise<{ data: PublicEvent }> => {
    const response = await apiClient.get(`/public/events/${id}`)
    return response.data
  },

  /**
   * Get upcoming events
   */
  getUpcoming: async (): Promise<EventsResponse> => {
    const response = await apiClient.get('/public/events/upcoming')
    return response.data
  },

  /**
   * Get featured events
   */
  getFeatured: async (): Promise<EventsResponse> => {
    const response = await apiClient.get('/public/events/featured')
    return response.data
  },

  /**
   * Get active event types
   */
  getEventTypes: async (): Promise<{ data: EventType[] }> => {
    const response = await apiClient.get('/public/event-types')
    return response.data
  },

  /**
   * Get active event subtypes for a specific event type
   */
  getEventSubtypes: async (eventTypeId: number): Promise<{ data: EventSubtype[] }> => {
    const response = await apiClient.get(`/public/event-types/${eventTypeId}/subtypes`)
    return response.data
  },

  /**
   * Get active locations
   */
  getLocations: async (): Promise<{ data: Location[] }> => {
    const response = await apiClient.get('/public/locations/active')
    return response.data
  },

  /**
   * Get public stats (total events, categories, events this month)
   */
  getStats: async (): Promise<{ data: PublicStats }> => {
    const response = await apiClient.get('/public/stats')
    return response.data
  }
}
