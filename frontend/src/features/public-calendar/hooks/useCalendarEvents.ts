/**
 * Custom hook for calendar events
 * Fetches events for calendar view with date range filtering
 * Supports server-side initial data to avoid waterfall fetching
 */

import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import useSWR, { preload } from 'swr'

import {
  CalendarEvent,
  CalendarView,
  EventsResponse,
  EventSubtype,
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
  eventSubtypes: EventSubtype[]
  locations: Location[]
  loading: boolean
  error: string | null
  currentDate: Date
  currentView: CalendarView
  handleNavigate: (date: Date) => void
  handleViewChange: (view: CalendarView) => void
  handleEventTypeFilter: (eventTypeId: number | null) => void
  handleEventSubtypeFilter: (eventSubtypeId: number | null) => void
  handleLocationFilter: (locationId: number | null) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  selectedEventType: number | null
  selectedEventSubtype: number | null
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
  const [currentView, setCurrentView] = useState<CalendarView>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'agenda'
    return 'month'
  })
  const [selectedEventType, setSelectedEventType] = useState<number | null>(null)
  const [selectedEventSubtype, setSelectedEventSubtype] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // SWR: Event types (quasi-static, 60s dedup)
  const { data: eventTypesData } = useSWR<{ data: EventType[] }>(
    publicEventKeys.types,
    publicFetcher,
    { fallbackData: initialEventTypes ? { data: initialEventTypes } : undefined, dedupingInterval: 60000, revalidateOnMount: !initialEventTypes }
  )

  // SWR: Locations (quasi-static, 60s dedup)
  const { data: locationsData } = useSWR<{ data: Location[] }>(
    publicEventKeys.locations,
    publicFetcher,
    { fallbackData: initialLocations ? { data: initialLocations } : undefined, dedupingInterval: 60000, revalidateOnMount: !initialLocations }
  )

  // SWR: Subtypes (conditional on selected event type)
  const { data: subtypesData } = useSWR<{ data: EventSubtype[] }>(
    selectedEventType ? publicEventKeys.subtypes(selectedEventType) : null,
    publicFetcher
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
    if (selectedEventSubtype) params.set('event_subtype_id', String(selectedEventSubtype))
    if (selectedLocation) params.set('location_id', String(selectedLocation))
    return publicEventKeys.list(params.toString())
  }, [currentDate, selectedEventType, selectedEventSubtype, selectedLocation])

  const { data: eventsData, error: eventsError, isLoading } = useSWR<EventsResponse>(
    eventsKey,
    publicFetcher,
    { fallbackData: initialEvents ? { data: initialEvents, meta: { current_page: 1, total: initialEvents.length, per_page: 100 } } : undefined, revalidateOnMount: !initialEvents, dedupingInterval: 30000 }
  )

  const eventTypes = eventTypesData?.data ?? []
  const eventSubtypes = selectedEventType ? (subtypesData?.data ?? []) : []
  const locations = locationsData?.data ?? []
  const hasActiveFilters = selectedEventType !== null || selectedEventSubtype !== null || selectedLocation !== null

  // Transform events to calendar format
  const calendarEvents = useMemo(
    () => (eventsData?.data ?? []).map(transformToCalendarEvent),
    [eventsData]
  )

  // Build events key for a given date (used for preloading)
  const buildEventsKey = useCallback((date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const params = new URLSearchParams()
    params.set('start_date', format(start, 'yyyy-MM-dd'))
    params.set('end_date', format(end, 'yyyy-MM-dd'))
    params.set('page', '1')
    params.set('per_page', '100')
    if (selectedEventType) params.set('event_type_id', String(selectedEventType))
    if (selectedEventSubtype) params.set('event_subtype_id', String(selectedEventSubtype))
    if (selectedLocation) params.set('location_id', String(selectedLocation))
    return publicEventKeys.list(params.toString())
  }, [selectedEventType, selectedEventSubtype, selectedLocation])

  // Handle date navigation — preload adjacent months
  const handleNavigate = useCallback((date: Date): void => {
    setCurrentDate(date)
    preload(buildEventsKey(addMonths(date, 1)), publicFetcher)
    preload(buildEventsKey(subMonths(date, 1)), publicFetcher)
  }, [buildEventsKey])

  // Handle view change
  const handleViewChange = useCallback((view: CalendarView): void => {
    setCurrentView(view)
  }, [])

  // Handle event type filter (cascading: reset subtype)
  const handleEventTypeFilter = useCallback((eventTypeId: number | null): void => {
    setSelectedEventType(eventTypeId)
    setSelectedEventSubtype(null)
  }, [])

  // Handle event subtype filter
  const handleEventSubtypeFilter = useCallback((eventSubtypeId: number | null): void => {
    setSelectedEventSubtype(eventSubtypeId)
  }, [])

  // Handle location filter
  const handleLocationFilter = useCallback((locationId: number | null): void => {
    setSelectedLocation(locationId)
  }, [])

  // Clear all filters
  const clearFilters = useCallback((): void => {
    setSelectedEventType(null)
    setSelectedEventSubtype(null)
    setSelectedLocation(null)
  }, [])

  return {
    calendarEvents,
    eventTypes,
    eventSubtypes,
    locations,
    loading: isLoading,
    error: eventsError?.message ?? null,
    currentDate,
    currentView,
    handleNavigate,
    handleViewChange,
    handleEventTypeFilter,
    handleEventSubtypeFilter,
    handleLocationFilter,
    clearFilters,
    hasActiveFilters,
    selectedEventType,
    selectedEventSubtype,
    selectedLocation,
  }
}
