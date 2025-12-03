'use client';

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getEvent, createEvent, updateEvent } from '@/features/organizer/services/organizer-event.service'
import { getActiveEventTypes } from '@/features/event-types/services/eventType.service'
import { getActiveEventSubtypes } from '@/features/event-types/services/eventSubtype.service'
import { searchLocations } from '@/features/locations/services/location.service'
import { validateEventForm, hasErrors } from '@/features/organizer/utils/eventFormValidation'
import { EventFormData, EventFormErrors, AsynchronousDate } from '@/features/organizer/types/event.types'
import { EventType, EventSubtype } from '@/types/eventType.types'

interface UseEventFormProps {
  eventId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export const useEventForm = ({ eventId, onSuccess, onCancel }: UseEventFormProps = {}) => {
  const router = useRouter()
  const isEditMode = !!eventId

  // State for new async date input (used by OrganizerEventForm)
  const [newAsyncDate, setNewAsyncDate] = useState({ date: '', notes: '' })

  const [formData, setFormData] = useState<EventFormData>({
    // Basic information
    title: '',
    description: '',
    edition_number: '',

    // Event Type/Subtype (hierarchical categorization - Dec 2, 2025)
    event_type_id: null,
    event_subtype_id: null,

    // FK references (IDs)
    type_id: null,
    subtype_id: null,
    origin_id: null,
    theme_id: null,
    frequency_id: null,
    rotation_type_id: null,
    producer_id: null,

    // Services and Rooms (arrays of IDs)
    service_ids: [],
    room_ids: [],

    // Location info
    location_ids: [],
    has_custom_location: false,
    custom_location_name: '',
    maps_url: '',
    previous_venue: '',
    next_venue: '',

    // Dates
    start_date: '',
    end_date: '',
    async_dates: [],

    // Attendance
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,

    // Additional info
    event_website: '',

    // Images
    logo_url: '',
    featured_image: '',
    responsive_image_url: ''
  })

  const [errors, setErrors] = useState<EventFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [eventSubtypes, setEventSubtypes] = useState<EventSubtype[]>([])
  const [selectedLocations, setSelectedLocations] = useState<{ id: number; name: string }[]>([])

  // Load event types on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const eventTypesRes = await getActiveEventTypes()

        // Event Types (Dec 2, 2025)
        setEventTypes(eventTypesRes || [])
      } catch {
        setErrors({ general: 'Error loading form options' })
      }
    }

    loadOptions()
  }, [])

  // Load subtypes when event type changes
  useEffect(() => {
    const loadSubtypes = async () => {
      if (!formData.event_type_id) {
        setEventSubtypes([])
        return
      }

      try {
        const subtypes = await getActiveEventSubtypes(formData.event_type_id)
        setEventSubtypes(subtypes || [])
      } catch {
        setEventSubtypes([])
      }
    }

    loadSubtypes()
  }, [formData.event_type_id])

  // Load event data in edit mode
  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      setInitialLoading(true)
      try {
        const response = await getEvent(eventId)
        const event = response.data

        setFormData({
          // Basic information
          title: event.title,
          description: event.description || '',
          edition_number: event.edition_number || '',

          // Event Type/Subtype (hierarchical categorization - Dec 2, 2025)
          event_type_id: event.event_type_id || event.event_type?.id || null,
          event_subtype_id: event.event_subtype_id || event.event_subtype?.id || null,

          // FK references (IDs)
          type_id: event.type_id || null,
          subtype_id: event.subtype_id || null,
          origin_id: event.origin_id || null,
          theme_id: event.theme_id || null,
          frequency_id: event.frequency_id || null,
          rotation_type_id: event.rotation_type_id || null,
          producer_id: event.producer_id || null,

          // Services and Rooms (arrays of IDs)
          service_ids: event.services?.map((s: { id: number }) => s.id) || [],
          room_ids: event.rooms?.map((r: { id: number }) => r.id) || [],

          // Location info
          location_ids: event.locations?.map((l: { id: number }) => l.id) || [],
          has_custom_location: !!event.custom_location_name,
          custom_location_name: event.custom_location_name || '',
          maps_url: event.maps_url || '',
          previous_venue: event.previous_venue || '',
          next_venue: event.next_venue || '',

          // Dates
          start_date: event.start_date || '',
          end_date: event.end_date || '',
          async_dates: event.async_dates?.map((d: { date_value?: string; date?: string; notes?: string }) => ({
            date: d.date_value || d.date || '',
            notes: d.notes
          })) || [],

          // Attendance
          local_attendance: event.local_attendance?.toString() || '',
          national_attendance: event.national_attendance?.toString() || '',
          international_attendance: event.international_attendance?.toString() || '',
          virtual_transmission: event.virtual_transmission || false,

          // Additional info
          event_website: event.event_website || '',

          // Images
          logo_url: event.logo_url || '',
          featured_image: event.featured_image || '',
          responsive_image_url: event.responsive_image_url || ''
        })

        // Store locations with names for the async select chips
        if (event.locations && Array.isArray(event.locations)) {
          setSelectedLocations(event.locations.map((l: { id: number; name: string }) => ({
            id: l.id,
            name: l.name
          })))
        }
      } catch {
        setErrors({ general: 'Error loading event data' })
      } finally {
        setInitialLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleChange = (field: keyof EventFormData, value: string | number | boolean | null | number[] | AsynchronousDate[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear field error on change (if it exists)
    if (field in errors) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as keyof EventFormErrors]
        return newErrors
      })
    }
  }

  const addAsynchronousDate = () => {
    if (!newAsyncDate.date) return

    const newDate: AsynchronousDate = {
      date: newAsyncDate.date,
      notes: newAsyncDate.notes || undefined,
    }

    setFormData(prev => ({
      ...prev,
      async_dates: [...prev.async_dates, newDate]
    }))
    setNewAsyncDate({ date: '', notes: '' })
  }

  const removeAsynchronousDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      async_dates: prev.async_dates.filter((_, i) => i !== index)
    }))
  }

  const handleLocationChange = (locationId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        location_ids: [...prev.location_ids, locationId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        location_ids: prev.location_ids.filter(id => id !== locationId)
      }))
    }
  }

  const handleCustomLocationToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      has_custom_location: checked,
      // Clear custom fields if unchecked
      ...(checked ? {} : { custom_location_name: '', maps_url: '' })
    }))
  }

  // Wrapped search function for AsyncSearchableMultiSelect
  const handleSearchLocations = useCallback(async (query: string) => {
    return searchLocations(query)
  }, [])

  // Handle location IDs change from AsyncSearchableMultiSelect
  const handleLocationIdsChange = useCallback((ids: number[]) => {
    setFormData(prev => ({
      ...prev,
      location_ids: ids
    }))
  }, [])

  // Update selected locations cache when a new option is selected
  const updateSelectedLocations = useCallback((option: { id: number; name: string }) => {
    setSelectedLocations(prev => {
      if (prev.find(l => l.id === option.id)) {
        return prev
      }
      return [...prev, option]
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateEventForm(formData)

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Prepare async dates if they exist
      const asyncDates = formData.async_dates.length > 0
        ? formData.async_dates.map(d => ({
            date: d.date,
            notes: d.notes
          }))
        : undefined

      const payload = {
        // Required fields
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        location_ids: formData.location_ids,

        // Event Type/Subtype (hierarchical categorization - Dec 2, 2025) - REQUIRED
        event_type_id: formData.event_type_id!,
        event_subtype_id: formData.event_subtype_id!,

        // FK references (IDs)
        type_id: formData.type_id || undefined,
        edition_number: formData.edition_number || undefined,
        subtype_id: formData.subtype_id || undefined,
        origin_id: formData.origin_id || undefined,
        theme_id: formData.theme_id || undefined,
        frequency_id: formData.frequency_id || undefined,
        rotation_type_id: formData.rotation_type_id || undefined,
        producer_id: formData.producer_id || undefined,

        // Services and Rooms
        service_ids: formData.service_ids.length > 0 ? formData.service_ids : undefined,
        room_ids: formData.room_ids.length > 0 ? formData.room_ids : undefined,

        // Location info
        custom_location_name: formData.has_custom_location ? formData.custom_location_name || undefined : undefined,
        maps_url: formData.has_custom_location ? formData.maps_url || undefined : undefined,
        previous_venue: formData.previous_venue || undefined,
        next_venue: formData.next_venue || undefined,

        // Async dates
        async_dates: asyncDates,

        // Attendance
        local_attendance: formData.local_attendance ? parseInt(formData.local_attendance) : undefined,
        national_attendance: formData.national_attendance ? parseInt(formData.national_attendance) : undefined,
        international_attendance: formData.international_attendance ? parseInt(formData.international_attendance) : undefined,
        virtual_transmission: formData.virtual_transmission,

        // Additional info
        event_website: formData.event_website || undefined,

        // Images
        logo_url: formData.logo_url || undefined,
        featured_image: formData.featured_image || undefined,
        responsive_image_url: formData.responsive_image_url || undefined,
      }

      if (isEditMode) {
        await updateEvent(eventId, { ...payload, id: eventId })
      } else {
        await createEvent(payload)
      }

      // Call onSuccess callback or navigate
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/organizer/events')
      }
    } catch {
      setErrors({
        general: isEditMode ? 'Error updating event' : 'Error creating event'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return {
    formData,
    errors,
    loading,
    initialLoading,
    eventTypes,
    eventSubtypes,
    selectedLocations,
    isEditMode,
    newAsyncDate,
    setNewAsyncDate,
    handleChange,
    handleSubmit,
    handleCancel,
    addAsynchronousDate,
    removeAsynchronousDate,
    handleLocationChange,
    handleCustomLocationToggle,
    handleSearchLocations,
    handleLocationIdsChange,
    updateSelectedLocations
  }
}
