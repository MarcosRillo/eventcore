/**
 * Custom hook for calendar events
 * Fetches events for calendar view with date range filtering
 */

import { useState, useEffect, useCallback } from 'react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  PublicEvent,
  CalendarEvent,
  CalendarView,
  Category,
  Location,
} from '@/features/public-calendar/types/public-calendar.types'

interface UseCalendarEventsReturn {
  calendarEvents: CalendarEvent[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  currentDate: Date
  currentView: CalendarView
  handleNavigate: (date: Date) => void
  handleViewChange: (view: CalendarView) => void
  handleCategoryFilter: (categoryId: number | null) => void
  handleLocationFilter: (locationId: number | null) => void
  selectedCategory: number | null
  selectedLocation: number | null
}

/**
 * Transform PublicEvent to CalendarEvent format
 */
const transformToCalendarEvent = (event: PublicEvent): CalendarEvent => {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event,
  }
}

export const useCalendarEvents = (): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>('month')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // Fetch categories and locations on mount
  useEffect(() => {
    const fetchFilters = async (): Promise<void> => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          publicEventsService.getCategories(),
          publicEventsService.getLocations(),
        ])
        setCategories(categoriesRes.data)
        setLocations(locationsRes.data)
      } catch {
        // Silently fail - not critical for calendar functionality
      }
    }

    fetchFilters()
  }, [])

  // Fetch events based on current date and filters
  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Calculate date range based on current view and date
      const startDate = startOfMonth(currentDate)
      const endDate = endOfMonth(currentDate)

      const response = await publicEventsService.getAll({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        category_id: selectedCategory,
        location_id: selectedLocation,
        page: 1,
      })

      setEvents(response.data)
    } catch {
      setError('Failed to load calendar events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentDate, selectedCategory, selectedLocation])

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Handle date navigation
  const handleNavigate = useCallback((date: Date): void => {
    setCurrentDate(date)
  }, [])

  // Handle view change
  const handleViewChange = useCallback((view: CalendarView): void => {
    setCurrentView(view)
  }, [])

  // Handle category filter
  const handleCategoryFilter = useCallback((categoryId: number | null): void => {
    setSelectedCategory(categoryId)
  }, [])

  // Handle location filter
  const handleLocationFilter = useCallback((locationId: number | null): void => {
    setSelectedLocation(locationId)
  }, [])

  // Transform events to calendar format
  const calendarEvents = events.map(transformToCalendarEvent)

  return {
    calendarEvents,
    categories,
    locations,
    loading,
    error,
    currentDate,
    currentView,
    handleNavigate,
    handleViewChange,
    handleCategoryFilter,
    handleLocationFilter,
    selectedCategory,
    selectedLocation,
  }
}
