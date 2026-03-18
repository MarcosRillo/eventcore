/**
 * Custom hook for calendar events
 * Fetches events for calendar view with date range filtering
 * Supports server-side initial data to avoid waterfall fetching
 */

import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'

import {
  CalendarEvent,
  CalendarView,
  EventsResponse,
  EventType,
  Location,
  PublicEvent,
} from '@/features/public-calendar/types/public-calendar.types'
import { publicEventKeys, publicFetcher } from '@/lib/swr'

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

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>('month')
  const [selectedEventType, setSelectedEventType] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // SWR: Event types (static)
  const { data: eventTypesData } = useSWR<{ data: EventType[] }>(
    publicEventKeys.types,
    publicFetcher,
    { fallbackData: initialEventTypes ? { data: initialEventTypes } : undefined }
  )

  // SWR: Locations (static)
  const { data: locationsData } = useSWR<{ data: Location[] }>(
    publicEventKeys.locations,
    publicFetcher,
    { fallbackData: initialLocations ? { data: initialLocations } : undefined }
  )

  // SWR: Events (dynamic key based on date range + filters)
  const eventsKey = useMemo(() => {
    const startDate = startOfMonth(currentDate)
    const endDate = endOfMonth(currentDate)
    const params = new URLSearchParams()
    params.set('start_date', format(startDate, 'yyyy-MM-dd'))
    params.set('end_date', format(endDate, 'yyyy-MM-dd'))
    params.set('page', '1')
    params.set('per_page', '100')
    if (selectedEventType) params.set('event_type_id', String(selectedEventType))
    if (selectedLocation) params.set('location_id', String(selectedLocation))
    return publicEventKeys.list(params.toString())
  }, [currentDate, selectedEventType, selectedLocation])

  const { data: eventsData, error: eventsError, isLoading } = useSWR<EventsResponse>(
    eventsKey,
    publicFetcher,
    { fallbackData: initialEvents ? { data: initialEvents, meta: { current_page: 1, total: initialEvents.length, per_page: 100 } } : undefined }
  )

  const eventTypes = eventTypesData?.data ?? []
  const locations = locationsData?.data ?? []

  // Transform events to calendar format
  const calendarEvents = useMemo(
    () => (eventsData?.data ?? []).map(transformToCalendarEvent),
    [eventsData]
  )

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

  return {
    calendarEvents,
    eventTypes,
    locations,
    loading: isLoading,
    error: eventsError?.message ?? null,
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
