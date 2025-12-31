/**
 * Custom hook for calendar events
 * Fetches events for calendar view with date range filtering
 * Supports server-side initial data to avoid waterfall fetching
 */

import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useState, useEffect, useCallback, useRef } from 'react'

import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  PublicEvent,
  CalendarEvent,
  CalendarView,
  EventType,
  Location,
} from '@/features/public-calendar/types/public-calendar.types'

/**
 * Options for useCalendarEvents hook
 * All properties are optional for backward compatibility
 */
export interface UseCalendarEventsOptions {
  initialEvents?: PublicEvent[]
  initialEventTypes?: EventType[]
  initialLocations?: Location[]
}

interface UseCalendarEventsReturn {
  calendarEvents: CalendarEvent[]
  eventTypes: EventType[]
  locations: Location[]
  loading: boolean
  error: string | null
  currentDate: Date
  currentView: CalendarView
  handleNavigate: (date: Date) => void
  handleViewChange: (view: CalendarView) => void
  handleEventTypeFilter: (eventTypeId: number | null) => void
  handleLocationFilter: (locationId: number | null) => void
  selectedEventType: number | null
  selectedLocation: number | null
}

/**
 * Transform PublicEvent to CalendarEvent format
 * @param event
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

export const useCalendarEvents = (
  options: UseCalendarEventsOptions = {}
): UseCalendarEventsReturn => {
  const { initialEvents, initialEventTypes, initialLocations } = options

  // Track if this is the initial render (for skipping first fetch when we have initial data)
  const isInitialRender = useRef(true)
  const hasInitialEvents = useRef(!!initialEvents)

  // Initialize state with server-side data if available
  const [events, setEvents] = useState<PublicEvent[]>(initialEvents ?? [])
  const [eventTypes, setEventTypes] = useState<EventType[]>(initialEventTypes ?? [])
  const [locations, setLocations] = useState<Location[]>(initialLocations ?? [])
  const [loading, setLoading] = useState(!initialEvents)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>('month')
  const [selectedEventType, setSelectedEventType] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // Fetch event types and locations on mount (skip if initial data provided)
  useEffect(() => {
    // Skip if we already have initial data from server
    if (initialEventTypes && initialLocations) {
      return
    }

    const fetchFilters = async (): Promise<void> => {
      try {
        const [eventTypesRes, locationsRes] = await Promise.all([
          publicEventsService.getEventTypes(),
          publicEventsService.getLocations(),
        ])
        setEventTypes(eventTypesRes.data)
        setLocations(locationsRes.data)
      } catch {
        // Silently fail - not critical for calendar functionality
      }
    }

    fetchFilters()
  }, [initialEventTypes, initialLocations])

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
        event_type_id: selectedEventType,
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
  }, [currentDate, selectedEventType, selectedLocation])

  // Fetch events when dependencies change (skip initial if we have server data)
  useEffect(() => {
    // On first render, skip fetch if we have initial data from server
    if (isInitialRender.current && hasInitialEvents.current) {
      isInitialRender.current = false
      return
    }
    isInitialRender.current = false

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

  // Handle event type filter
  const handleEventTypeFilter = useCallback((eventTypeId: number | null): void => {
    setSelectedEventType(eventTypeId)
  }, [])

  // Handle location filter
  const handleLocationFilter = useCallback((locationId: number | null): void => {
    setSelectedLocation(locationId)
  }, [])

  // Transform events to calendar format
  const calendarEvents = events.map(transformToCalendarEvent)

  return {
    calendarEvents,
    eventTypes,
    locations,
    loading,
    error,
    currentDate,
    currentView,
    handleNavigate,
    handleViewChange,
    handleEventTypeFilter,
    handleLocationFilter,
    selectedEventType,
    selectedLocation,
  }
}
