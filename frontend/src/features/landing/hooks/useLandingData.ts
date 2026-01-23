/**
 * Custom hook for landing page data
 * Fetches featured events and event types
 */

import { useEffect,useState } from 'react'

import { LandingData } from '@/features/landing/types/landing.types'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

export const useLandingData = (): LandingData => {
  const [featuredEvents, setFeaturedEvents] = useState<LandingData['featuredEvents']>([])
  const [eventTypes, setEventTypes] = useState<LandingData['eventTypes']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLandingData = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        // Fetch featured events and event types in parallel
        const [eventsResponse, eventTypesResponse] = await Promise.all([
          publicEventsService.getFeatured(),
          publicEventsService.getEventTypes()
        ])

        setFeaturedEvents(eventsResponse.data)
        setEventTypes(eventTypesResponse.data)
      } catch {
        setError('Failed to load landing data')
        setFeaturedEvents([])
        setEventTypes([])
      } finally {
        setLoading(false)
      }
    }

    fetchLandingData()
  }, [])

  return {
    featuredEvents,
    eventTypes,
    loading,
    error
  }
}
