/**
 * Custom hook for public events
 *
 * Fetches and manages public events with filtering support.
 * Implements cascading filter logic for EventType → EventSubtype.
 * Supports server-side initial data to avoid waterfall fetching.
 */

import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'

import {
  EventFilters,
  EventsResponse,
  EventSubtype,
  EventType,
  Location,
  PublicEvent,
} from '@/features/public-calendar/types/public-calendar.types'
import { publicEventKeys, publicFetcher } from '@/lib/swr'

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

  const [filters, setFilters] = useState<EventFilters>({
    event_type_id: null,
    event_subtype_id: null,
    location_id: null,
    start_date: null,
    end_date: null
  })

  // SWR: Event types (quasi-static, 60s dedup)
  const { data: eventTypesData } = useSWR<{ data: EventType[] }>(
    publicEventKeys.types,
    publicFetcher,
    { fallbackData: initialEventTypes ? { data: initialEventTypes } : undefined, dedupingInterval: 60000 }
  )

  // SWR: Subtypes (conditional on event_type_id)
  const { data: subtypesData } = useSWR<{ data: EventSubtype[] }>(
    filters.event_type_id ? publicEventKeys.subtypes(filters.event_type_id) : null,
    publicFetcher
  )

  // SWR: Locations (quasi-static, 60s dedup)
  const { data: locationsData } = useSWR<{ data: Location[] }>(
    publicEventKeys.locations,
    publicFetcher,
    { fallbackData: initialLocations ? { data: initialLocations } : undefined, dedupingInterval: 60000 }
  )

  // SWR: Events (dynamic key with filters)
  const eventsKey = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.event_type_id) params.set('event_type_id', String(filters.event_type_id))
    if (filters.event_subtype_id) params.set('event_subtype_id', String(filters.event_subtype_id))
    if (filters.location_id) params.set('location_id', String(filters.location_id))
    if (filters.start_date) params.set('start_date', filters.start_date)
    if (filters.end_date) params.set('end_date', filters.end_date)
    return publicEventKeys.list(params.toString())
  }, [filters])

  const { data: eventsData, error: eventsError, isLoading, mutate } = useSWR<EventsResponse>(
    eventsKey,
    publicFetcher,
    { fallbackData: initialEvents ? { data: initialEvents, meta: { current_page: 1, total: initialEvents.length, per_page: 100 } } : undefined }
  )

  const eventTypes = eventTypesData?.data ?? []
  const eventSubtypes = filters.event_type_id ? (subtypesData?.data ?? []) : []
  const locations = locationsData?.data ?? []
  const events = eventsData?.data ?? []

  const handleEventTypeFilter = useCallback((eventTypeId: number | null): void => {
    setFilters(prev => ({
      ...prev,
      event_type_id: eventTypeId,
      event_subtype_id: null // Reset subtype when type changes
    }))
  }, [])

  const handleEventSubtypeFilter = useCallback((eventSubtypeId: number | null): void => {
    setFilters(prev => ({ ...prev, event_subtype_id: eventSubtypeId }))
  }, [])

  const handleLocationFilter = useCallback((locationId: number | null): void => {
    setFilters(prev => ({ ...prev, location_id: locationId }))
  }, [])

  const handleDateRangeFilter = useCallback((
    startDate: string | null,
    endDate: string | null
  ): void => {
    setFilters(prev => ({ ...prev, start_date: startDate, end_date: endDate }))
  }, [])

  const clearFilters = useCallback((): void => {
    setFilters({
      event_type_id: null,
      event_subtype_id: null,
      location_id: null,
      start_date: null,
      end_date: null
    })
  }, [])

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
    loading: isLoading,
    error: eventsError?.message ?? null,
    filters,
    hasActiveFilters,
    handleEventTypeFilter,
    handleEventSubtypeFilter,
    handleLocationFilter,
    handleDateRangeFilter,
    clearFilters,
    retry: () => { mutate() }
  }
}
