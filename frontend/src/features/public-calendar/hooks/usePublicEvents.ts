/**
 * Custom hook for public events
 *
 * Fetches and manages public events with filtering support.
 */

import { useState, useEffect, useCallback } from 'react'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  PublicEvent,
  Category,
  Location,
  EventFilters
} from '@/features/public-calendar/types/public-calendar.types'

interface UsePublicEventsReturn {
  events: PublicEvent[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  filters: EventFilters
  handleCategoryFilter: (categoryId: number | null) => void
  handleLocationFilter: (locationId: number | null) => void
  handleDateRangeFilter: (startDate: string | null, endDate: string | null) => void
  retry: () => void
}

export const usePublicEvents = (): UsePublicEventsReturn => {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EventFilters>({
    category_id: null,
    location_id: null,
    start_date: null,
    end_date: null
  })

  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await publicEventsService.getAll({
        category_id: filters.category_id,
        location_id: filters.location_id,
        start_date: filters.start_date,
        end_date: filters.end_date
      })
      setEvents(data.data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchCategoriesAndLocations = async (): Promise<void> => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        publicEventsService.getCategories(),
        publicEventsService.getLocations()
      ])
      setCategories(categoriesRes.data)
      setLocations(locationsRes.data)
    } catch {
      // Silently fail - not critical
    }
  }

  useEffect(() => {
    fetchCategoriesAndLocations()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleCategoryFilter = (categoryId: number | null): void => {
    setFilters(prev => ({ ...prev, category_id: categoryId }))
  }

  const handleLocationFilter = (locationId: number | null): void => {
    setFilters(prev => ({ ...prev, location_id: locationId }))
  }

  const handleDateRangeFilter = (
    startDate: string | null,
    endDate: string | null
  ): void => {
    setFilters(prev => ({ ...prev, start_date: startDate, end_date: endDate }))
  }

  return {
    events,
    categories,
    locations,
    loading,
    error,
    filters,
    handleCategoryFilter,
    handleLocationFilter,
    handleDateRangeFilter,
    retry: fetchEvents
  }
}
