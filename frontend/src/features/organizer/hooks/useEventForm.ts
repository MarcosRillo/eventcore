'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getEvent, createEvent, updateEvent } from '@/features/organizer/services/organizer-event.service'
import { getCategories } from '@/features/categories/services/category.service'
import { getLocations } from '@/features/locations/services/location.service'
import { validateEventForm, hasErrors } from '@/features/organizer/utils/eventFormValidation'
import { EventFormData, EventFormErrors, AsynchronousDate } from '@/features/organizer/types/event.types'

interface UseEventFormProps {
  eventId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export const useEventForm = ({ eventId, onSuccess, onCancel }: UseEventFormProps = {}) => {
  const router = useRouter()
  const isEditMode = !!eventId

  const [formData, setFormData] = useState<EventFormData>({
    // Información Básica
    title: '',
    edition_number: '',
    description: '',
    event_type: '',
    event_subtype: '',
    origin: '',
    theme: '',
    frequency: '',
    rotation_type: '',

    // Servicios y Catering
    coffee_break: false,
    lunch_catering: false,
    dinner_catering: false,
    pre_event_package: false,
    post_event_package: false,

    // Ubicación
    venue: '',
    city: '',
    rooms_used: '',
    maps_url: '',
    previous_venue: '',
    next_venue: '',

    // Fechas y Horarios
    event_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    asynchronous_dates: [],

    // Asistencia
    local_attendance: '',
    national_attendance: '',
    international_attendance: '',
    virtual_transmission: false,

    // Información Adicional
    producer: '',
    event_website: '',

    // Imágenes
    logo_url: '',
    image_url: '',
    responsive_image_url: '',

    // Campos legacy
    category_id: null,
    location_id: null
  })

  const [errors, setErrors] = useState<EventFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])

  // Load categories and locations on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, locationsRes] = await Promise.all([
          getCategories(),
          getLocations()
        ])

        // Categories: apiClient returns { data: Category[], meta, links } directly
        // Locations: Backend wraps in { success, message, data: { data: Location[], ... } }
        const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : []

        // Handle both possible response structures for locations
        let locationsData: { id: number; name: string }[] = []
        if (locationsRes && typeof locationsRes === 'object') {
          // Case 1: { success, message, data: { data: Location[] } }
          if ('data' in locationsRes && locationsRes.data && typeof locationsRes.data === 'object') {
            if ('data' in locationsRes.data && Array.isArray(locationsRes.data.data)) {
              locationsData = locationsRes.data.data
            } else if (Array.isArray(locationsRes.data)) {
              // Case 2: { data: Location[] }
              locationsData = locationsRes.data
            }
          }
        }

        setCategories(categoriesData)
        setLocations(locationsData)
      } catch {
        setErrors({ general: 'Error loading form options' })
      }
    }

    loadOptions()
  }, [])

  // Load event data in edit mode
  useEffect(() => {
    if (!eventId) return

    const loadEvent = async () => {
      setInitialLoading(true)
      try {
        const response = await getEvent(eventId)
        const event = response.data

        setFormData({
          // Información Básica
          title: event.title,
          edition_number: '',
          description: event.description || '',
          event_type: '',
          event_subtype: '',
          origin: '',
          theme: '',
          frequency: '',
          rotation_type: '',

          // Servicios y Catering
          coffee_break: false,
          lunch_catering: false,
          dinner_catering: false,
          pre_event_package: false,
          post_event_package: false,

          // Ubicación
          venue: '',
          city: '',
          rooms_used: '',
          maps_url: '',
          previous_venue: '',
          next_venue: '',

          // Fechas y Horarios
          event_date: event.start_date || event.event_date || '',
          end_date: event.end_date || '',
          start_time: event.start_time || '',
          end_time: event.end_time || '',
          asynchronous_dates: [],

          // Asistencia
          local_attendance: '',
          national_attendance: '',
          international_attendance: '',
          virtual_transmission: false,

          // Información Adicional
          producer: '',
          event_website: '',

          // Imágenes
          logo_url: '',
          image_url: event.image_url || '',
          responsive_image_url: '',

          // Campos legacy
          category_id: event.category_id || null,
          location_id: event.location_id || null
        })
      } catch {
        setErrors({ general: 'Error loading event data' })
      } finally {
        setInitialLoading(false)
      }
    }

    loadEvent()
  }, [eventId])

  const handleChange = (field: keyof EventFormData, value: string | number | boolean | null | AsynchronousDate[]) => {
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
      // Combine date + time into ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
      // Laravel expects timestamps in this format for the database
      const startDateTime = `${formData.event_date}T${formData.start_time}:00`
      const endDateTime = `${formData.end_date || formData.event_date}T${formData.end_time}:00`

      // Prepare asynchronous dates if they exist
      const asyncDates = formData.asynchronous_dates.length > 0
        ? formData.asynchronous_dates.map(d => ({
            date: d.date,
            start_time: d.start_time,
            end_time: d.end_time
          }))
        : undefined

      const payload = {
        // Campos básicos requeridos
        title: formData.title,
        description: formData.description,
        start_date: startDateTime,
        end_date: endDateTime,
        category_id: formData.category_id!,
        location_ids: [formData.location_id!],

        // Información Básica
        edition_number: formData.edition_number || undefined,
        event_type: formData.event_type || undefined,
        event_subtype: formData.event_subtype || undefined,
        origin: formData.origin || undefined,
        theme: formData.theme || undefined,
        frequency: formData.frequency || undefined,
        rotation_type: formData.rotation_type || undefined,

        // Servicios y Catering
        coffee_break: formData.coffee_break,
        lunch_catering: formData.lunch_catering,
        dinner_catering: formData.dinner_catering,
        pre_event_package: formData.pre_event_package,
        post_event_package: formData.post_event_package,

        // Ubicación
        venue: formData.venue || undefined,
        city: formData.city || undefined,
        rooms_used: formData.rooms_used || undefined,
        maps_url: formData.maps_url || undefined,
        previous_venue: formData.previous_venue || undefined,
        next_venue: formData.next_venue || undefined,

        // Fechas Asincrónicas
        asynchronous_dates: asyncDates,

        // Asistencia
        local_attendance: formData.local_attendance ? parseInt(formData.local_attendance) : undefined,
        national_attendance: formData.national_attendance ? parseInt(formData.national_attendance) : undefined,
        international_attendance: formData.international_attendance ? parseInt(formData.international_attendance) : undefined,
        virtual_transmission: formData.virtual_transmission,

        // Información Adicional
        producer: formData.producer || undefined,
        event_website: formData.event_website || undefined,

        // Imágenes
        logo_url: formData.logo_url || undefined,
        featured_image: formData.image_url || undefined,
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
    categories,
    locations,
    isEditMode,
    handleChange,
    handleSubmit,
    handleCancel
  }
}
