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
} from '../types/public-calendar.types'

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

    return apiClient.get(url)
  },

  /**
   * Get event by ID
   */
  getById: async (id: number): Promise<{ data: PublicEvent }> => {
    return apiClient.get(`/public/events/${id}`)
  },

  /**
   * Get upcoming events
   */
  getUpcoming: async (): Promise<EventsResponse> => {
    return apiClient.get('/public/events/upcoming')
  },

  /**
   * Get featured events
   */
  getFeatured: async (): Promise<EventsResponse> => {
    return apiClient.get('/public/events/featured')
  },

  /**
   * Get active categories
   */
  getCategories: async (): Promise<{ data: Category[] }> => {
    return apiClient.get('/public/categories/active')
  },

  /**
   * Get active locations
   */
  getLocations: async (): Promise<{ data: Location[] }> => {
    return apiClient.get('/public/locations/active')
  }
}
