/**
 * Public Events Service
 *
 * Handles API calls for public calendar (no auth required).
 */

import apiClient from '@/services/apiClient'
import {
  EventsResponse,
  PublicEvent,
  Category,
  Location
} from '@/features/public-calendar/types/public-calendar.types'

interface FetchEventsParams {
  category_id?: number | null
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

    if (params.category_id) {
      queryParams.append('category_id', params.category_id.toString())
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
   * Get active categories
   */
  getCategories: async (): Promise<{ data: Category[] }> => {
    const response = await apiClient.get('/public/categories/active')
    return response.data
  },

  /**
   * Get active locations
   */
  getLocations: async (): Promise<{ data: Location[] }> => {
    const response = await apiClient.get('/public/locations/active')
    return response.data
  }
}
