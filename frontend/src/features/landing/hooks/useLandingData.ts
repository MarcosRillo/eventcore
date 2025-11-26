/**
 * Custom hook for landing page data
 * Fetches featured events and categories
 */

import { useState, useEffect } from 'react'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import { LandingData } from '@/features/landing/types/landing.types'

export const useLandingData = (): LandingData => {
  const [featuredEvents, setFeaturedEvents] = useState<LandingData['featuredEvents']>([])
  const [categories, setCategories] = useState<LandingData['categories']>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLandingData = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        // Fetch featured events and categories in parallel
        const [eventsResponse, categoriesResponse] = await Promise.all([
          publicEventsService.getFeatured(),
          publicEventsService.getCategories()
        ])

        setFeaturedEvents(eventsResponse.data)
        setCategories(categoriesResponse.data)
      } catch {
        setError('Failed to load landing data')
        setFeaturedEvents([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchLandingData()
  }, [])

  return {
    featuredEvents,
    categories,
    loading,
    error
  }
}
