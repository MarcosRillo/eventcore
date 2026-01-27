/**
 * Cached Public Events Service
 *
 * Server-side cached versions of public events service methods.
 * Uses React.cache for request deduplication during server render.
 * Use these in Server Components for better performance.
 */

import { cache } from 'react'

import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

/**
 * Cached version of getEventTypes
 * Deduplicates requests within a single server render
 */
export const getEventTypes = cache(async () => {
  return publicEventsService.getEventTypes()
})

/**
 * Cached version of getFeatured
 * Deduplicates requests within a single server render
 */
export const getFeatured = cache(async () => {
  return publicEventsService.getFeatured()
})

/**
 * Cached version of getStats
 * Deduplicates requests within a single server render
 */
export const getStats = cache(async () => {
  return publicEventsService.getStats()
})

/**
 * Cached version of getLocations
 * Deduplicates requests within a single server render
 */
export const getLocations = cache(async () => {
  return publicEventsService.getLocations()
})

/**
 * Cached version of getById
 * Deduplicates requests within a single server render
 */
export const getEventById = cache(async (id: number) => {
  return publicEventsService.getById(id)
})
