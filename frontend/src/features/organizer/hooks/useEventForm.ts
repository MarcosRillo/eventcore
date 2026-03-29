'use client';

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import useSWR from 'swr'

import { createEvent, createEventWithFiles, updateEvent, updateEventWithFiles } from '@/features/organizer/services/organizer-event.service'
import { AsynchronousDate, EventFormData, EventFormErrors, OrganizerEvent } from '@/features/organizer/types/event.types'
import { hasErrors,validateEventForm } from '@/features/organizer/utils/eventFormValidation'
import { apiFetcher, eventKeys, locationKeys } from '@/lib/swr'
import { ApiResponse } from '@/types/api-response.types'
import { EventSubtype,EventType } from '@/types/eventType.types'
import { Location } from '@/types/location.types'

interface UseEventFormProps {
  eventId?: number
  onSuccess?: () => void
  onError?: (message: string) => void
  onCancel?: () => void
}

export const useEventForm = ({ eventId, onSuccess, onError, onCancel }: UseEventFormProps = {}) => {
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
    featured_image: '',
    featured_image_file: null
  })

  const [errors, setErrors] = useState<EventFormErrors>({})
  const [isSubmitting, startSubmitTransition] = useTransition()
  const [selectedLocations, setSelectedLocations] = useState<{ id: number; name: string }[]>([])

  // SWR: Load event types
  const { data: eventTypesData } = useSWR<ApiResponse<EventType[]>>(
    eventKeys.types.active,
    apiFetcher
  )

  // SWR: Load locations
  const { data: locationsData } = useSWR<{ data: Location[] }>(
    locationKeys.active,
    apiFetcher
  )

  // SWR: Load subtypes when event type changes
  const { data: subtypesData } = useSWR<ApiResponse<EventSubtype[]>>(
    formData.event_type_id ? eventKeys.subtypes.active(formData.event_type_id) : null,
    apiFetcher
  )

  // SWR: Load event data in edit mode
  const { data: existingEvent, isLoading: isLoadingEvent } = useSWR<OrganizerEvent>(
    eventId ? eventKeys.organizerDetail(eventId) : null,
    apiFetcher
  )

  // Derive options from SWR data
  const eventTypes = useMemo(() => {
    if (!eventTypesData) return []
    return Array.isArray(eventTypesData) ? eventTypesData : eventTypesData.data
  }, [eventTypesData])

  const allLocations = useMemo(() => {
    if (!locationsData) return []
    const locations = Array.isArray(locationsData) ? locationsData : locationsData.data
    return locations?.map(loc => ({ id: loc.id, name: loc.name })) || []
  }, [locationsData])

  const eventSubtypes = useMemo(() => {
    if (!subtypesData) return []
    return Array.isArray(subtypesData) ? subtypesData : subtypesData.data
  }, [subtypesData])

  // Track if we've already populated form data from existing event
  const hasPopulatedRef = useRef(false)

  // Populate form data when existing event loads (edit mode)
  useEffect(() => {
    if (!existingEvent || hasPopulatedRef.current) return
    hasPopulatedRef.current = true

    setFormData({
      // Basic information
      title: existingEvent.title,
      description: existingEvent.description || '',
      edition_number: existingEvent.edition_number || '',

      // Event Type/Subtype (hierarchical categorization - Dec 2, 2025)
      event_type_id: existingEvent.event_type_id || existingEvent.event_type?.id || null,
      event_subtype_id: existingEvent.event_subtype_id || existingEvent.event_subtype?.id || null,

      // FK references (IDs)
      type_id: existingEvent.type_id || null,
      subtype_id: existingEvent.subtype_id || null,
      origin_id: existingEvent.origin_id || null,
      frequency_id: existingEvent.frequency_id || null,
      rotation_type_id: existingEvent.rotation_type_id || null,
      producer_id: existingEvent.producer_id || null,

      // Services and Rooms (arrays of IDs)
      service_ids: existingEvent.services?.map((s: { id: number }) => s.id) || [],
      room_ids: existingEvent.rooms?.map((r: { id: number }) => r.id) || [],

      // Location info
      location_ids: existingEvent.locations?.map((l: { id: number }) => l.id) || [],
      has_custom_location: !!existingEvent.custom_location_name,
      custom_location_name: existingEvent.custom_location_name || '',
      maps_url: existingEvent.maps_url || '',
      previous_venue: existingEvent.previous_venue || '',
      next_venue: existingEvent.next_venue || '',

      // Dates
      start_date: existingEvent.start_date || '',
      end_date: existingEvent.end_date || '',
      async_dates: existingEvent.async_dates?.map((d: { date_value?: string; date?: string; notes?: string }) => ({
        date: d.date_value || d.date || '',
        notes: d.notes
      })) || [],

      // Attendance
      local_attendance: existingEvent.local_attendance?.toString() || '',
      national_attendance: existingEvent.national_attendance?.toString() || '',
      international_attendance: existingEvent.international_attendance?.toString() || '',
      virtual_transmission: existingEvent.virtual_transmission || false,

      // Additional info
      event_website: existingEvent.event_website || '',

      // Images
      featured_image: existingEvent.featured_image || '',
      featured_image_file: null
    })

    // Store locations with names for the async select chips
    if (existingEvent.locations && Array.isArray(existingEvent.locations)) {
      setSelectedLocations(existingEvent.locations.map((l: { id: number; name: string }) => ({
        id: l.id,
        name: l.name
      })))
    }
  }, [existingEvent])

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

  const handleFileChange = (field: keyof EventFormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))

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

      // Scroll to first error field for better UX
      // Order matches visual layout of the form
      const fieldOrder = [
        'title',
        'event_type_id',
        'event_subtype_id',
        'description',
        'location_ids',
        'custom_location_name',
        'start_date',
        'end_date'
      ]

      const firstErrorField = fieldOrder.find(field => field in validationErrors)

      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element instanceof HTMLElement) {
          // scrollIntoView may not be available in test environments (JSDOM)
          element.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
          element.focus()
        }
      }

      return
    }

    setErrors({})

    startSubmitTransition(async () => {
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

          // Images (URL - only include if no file is being uploaded)
          featured_image: !formData.featured_image_file ? (formData.featured_image || undefined) : undefined,
        }

        // Check if we have any files to upload
        const hasFiles = !!formData.featured_image_file

        // Collect files if present
        const files: { featured_image_file?: File } = {}
        if (formData.featured_image_file) files.featured_image_file = formData.featured_image_file

        if (isEditMode) {
          if (hasFiles) {
            await updateEventWithFiles(eventId, { ...payload, id: eventId }, files)
          } else {
            await updateEvent(eventId, { ...payload, id: eventId })
          }
        } else {
          if (hasFiles) {
            await createEventWithFiles(payload, files)
          } else {
            await createEvent(payload)
          }
        }

        // Call onSuccess callback or navigate
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/organizer/events')
        }
      } catch {
        const errorMessage = isEditMode ? 'Error al actualizar el evento' : 'Error al crear el evento'
        setErrors({ general: errorMessage })
        onError?.(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Backward compatibility: compute loading states
  const loading = isSubmitting
  const initialLoading = isEditMode && isLoadingEvent

  return {
    formData,
    errors,
    loading,
    initialLoading,
    eventTypes,
    eventSubtypes,
    allLocations,
    selectedLocations,
    isEditMode,
    newAsyncDate,
    setNewAsyncDate,
    handleChange,
    handleFileChange,
    handleSubmit,
    handleCancel,
    addAsynchronousDate,
    removeAsynchronousDate,
    handleLocationChange,
    handleCustomLocationToggle,
    handleLocationIdsChange,
    updateSelectedLocations
  }
}
