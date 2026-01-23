/**
 * Custom hook for public events
 *
 * Fetches and manages public events with filtering support.
 * Implements cascading filter logic for EventType → EventSubtype.
 * Supports server-side initial data to avoid waterfall fetching.
 */

import { useCallback, useEffect, useRef,useState } from 'react'

import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  EventFilters,
  EventSubtype,
  EventType,
  Location,
  PublicEvent} from '@/features/public-calendar/types/public-calendar.types'

/**
 * Options for usePublicEvents hook
 * All properties are optional for backward compatibility
 */
export interface UsePublicEventsOptions {
  initialEvents?: PublicEvent[]
  initialEventTypes?: EventType[]
  initialLocations?: Location[]
}

interface UsePublicEventsReturn {
  events: PublicEvent[]
  eventTypes: EventType[]
  eventSubtypes: EventSubtype[]
  locations: Location[]
  loading: boolean
  error: string | null
  filters: EventFilters
  hasActiveFilters: boolean
  handleEventTypeFilter: (eventTypeId: number | null) => void
  handleEventSubtypeFilter: (eventSubtypeId: number | null) => void
  handleLocationFilter: (locationId: number | null) => void
  handleDateRangeFilter: (startDate: string | null, endDate: string | null) => void
  clearFilters: () => void
  retry: () => void
}

export const usePublicEvents = (
  options: UsePublicEventsOptions = {}
): UsePublicEventsReturn => {
  const { initialEvents, initialEventTypes, initialLocations } = options

  // Track if this is the initial render (for skipping first fetch when we have initial data)
  const isInitialRender = useRef(true)
  const hasInitialEvents = useRef(!!initialEvents)

  // Initialize state with server-side data if available
  const [events, setEvents] = useState<PublicEvent[]>(initialEvents ?? [])
  const [eventTypes, setEventTypes] = useState<EventType[]>(initialEventTypes ?? [])
  const [eventSubtypes, setEventSubtypes] = useState<EventSubtype[]>([])
  const [locations, setLocations] = useState<Location[]>(initialLocations ?? [])
  const [loading, setLoading] = useState(!initialEvents)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EventFilters>({
    event_type_id: null,
    event_subtype_id: null,
    location_id: null,
    start_date: null,
    end_date: null
  })

  const fetchEvents = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await publicEventsService.getAll({
        event_type_id: filters.event_type_id,
        event_subtype_id: filters.event_subtype_id,
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

  const fetchEventTypesAndLocations = async (): Promise<void> => {
    try {
      const [eventTypesRes, locationsRes] = await Promise.all([
        publicEventsService.getEventTypes(),
        publicEventsService.getLocations()
      ])
      setEventTypes(eventTypesRes.data)
      setLocations(locationsRes.data)
    } catch {
      // Silently fail - not critical
    }
  }

  const fetchEventSubtypes = async (eventTypeId: number | null): Promise<void> => {
    if (!eventTypeId) {
      setEventSubtypes([])
      return
    }
    try {
      const subtypesRes = await publicEventsService.getEventSubtypes(eventTypeId)
      setEventSubtypes(subtypesRes.data)
    } catch {
      setEventSubtypes([])
    }
  }

  // Fetch event types and locations on mount (skip if initial data provided)
  useEffect(() => {
    if (initialEventTypes && initialLocations) {
      return
    }
    fetchEventTypesAndLocations()
  }, [initialEventTypes, initialLocations])

  // Fetch events when filters change (skip initial if we have server data)
  useEffect(() => {
    // On first render, skip fetch if we have initial data from server
    if (isInitialRender.current && hasInitialEvents.current) {
      isInitialRender.current = false
      return
    }
    isInitialRender.current = false

    fetchEvents()
  }, [fetchEvents])

  const handleEventTypeFilter = (eventTypeId: number | null): void => {
    setFilters(prev => ({
      ...prev,
      event_type_id: eventTypeId,
      event_subtype_id: null // Reset subtype when type changes
    }))
    fetchEventSubtypes(eventTypeId)
  }

  const handleEventSubtypeFilter = (eventSubtypeId: number | null): void => {
    setFilters(prev => ({ ...prev, event_subtype_id: eventSubtypeId }))
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

  const clearFilters = (): void => {
    setFilters({
      event_type_id: null,
      event_subtype_id: null,
      location_id: null,
      start_date: null,
      end_date: null
    })
    setEventSubtypes([])
  }

  const hasActiveFilters =
    filters.event_type_id !== null ||
    filters.event_subtype_id !== null ||
    filters.location_id !== null ||
    filters.start_date !== null ||
    filters.end_date !== null

  return {
    events,
    eventTypes,
    eventSubtypes,
    locations,
    loading,
    error,
    filters,
    hasActiveFilters,
    handleEventTypeFilter,
    handleEventSubtypeFilter,
    handleLocationFilter,
    handleDateRangeFilter,
    clearFilters,
    retry: fetchEvents
  }
}
